import { Router, Request, Response } from 'express';
import { db } from './db';
import {
  generatePresenceWithGemini,
  searchProfilesWithGemini,
  executeAgentChat,
  runAgentMatchmaking,
  generateAvatarWithGemini
} from './gemini';
import { ConversationRecord, ChatMessage } from '../src/types';

export const apiRouter = Router();

// 1. Get full application state for current viewer
apiRouter.get('/state', (req: Request, res: Response) => {
  const viewerId = (req.query.viewerId as string) || undefined;
  const state = db.getState(viewerId);
  res.json(state);
});

// 2. Switch active persona
apiRouter.post('/persona/switch', (req: Request, res: Response) => {
  const { personaId } = req.body;
  if (!personaId) {
    return res.status(400).json({ error: 'personaId required' });
  }
  const current = db.setPersona(personaId);
  const state = db.getState(current);
  res.json({ success: true, currentPersonaId: current, state });
});

// 3. Switch selected venue
apiRouter.post('/venue/switch', (req: Request, res: Response) => {
  const { venueId } = req.body;
  if (!venueId) {
    return res.status(400).json({ error: 'venueId required' });
  }
  const selected = db.setVenue(venueId);
  res.json({ success: true, selectedVenueId: selected });
});

// 4. Save/update user profile & permissions
apiRouter.post('/profile/save', (req: Request, res: Response) => {
  const { profile } = req.body;
  if (!profile || !profile.id) {
    return res.status(400).json({ error: 'valid profile required' });
  }
  const saved = db.saveProfile(profile);
  res.json({ success: true, profile: saved });
});

// 5. Generate presence using Gemini
apiRouter.post('/presence/generate', async (req: Request, res: Response) => {
  const { name, role, company, objective, rawDescription } = req.body;
  if (!rawDescription) {
    return res.status(400).json({ error: 'rawDescription required' });
  }

  try {
    const spec = await generatePresenceWithGemini({
      name: name || 'Physical Attendee',
      role: role || 'Professional',
      company: company || 'Enterprise',
      objective: objective || 'find_partners',
      rawDescription
    });

    const activeState = db.getState();
    const persona = activeState.profiles.find(p => p.name.toLowerCase() === (name || '').toLowerCase()) || activeState.profiles.find(p => p.id === activeState.currentPersonaId);

    db.logAiActivity({
      feature: 'Profile Generation',
      personaId: persona?.id || 'profile-gen',
      personaName: name || persona?.name || 'Attendee',
      input: `Presence prompt: ${name} (${role} at ${company}) - "${rawDescription.slice(0, 100)}"`,
      latencyMs: spec.latencyMs || 1500,
      model: spec.modelUsed || 'gemini-3.8-flash',
      outputExcerpt: spec.oneLinePitch || spec.elevatorPitch || 'Synthesized profile specification',
      status: spec.generatedWithGemini !== false ? 'success' : 'fallback',
      attempts: spec.attempts !== undefined ? spec.attempts : 1,
      retryCount: spec.retryCount !== undefined ? spec.retryCount : 0,
      retryReason: spec.retryReason,
      errorDetails: spec.errorDetails
    });

    res.json({ success: true, agentSpec: spec, latencyMs: spec.latencyMs, modelUsed: spec.modelUsed, attempts: spec.attempts, retryCount: spec.retryCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Generation failed' });
  }
});

// 6. Semantic Venue Search (supports POST body & GET query)
const executeDiscoverySearch = async (
  query: string | undefined,
  viewerId: string | undefined,
  venueId: string | undefined,
  res: Response
) => {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ success: false, error: 'query string required' });
  }

  const trimmedQuery = query.trim();
  const rawState = db.getState(viewerId);
  const currentPersona = rawState.profiles.find(p => p.id === (viewerId || rawState.currentPersonaId)) || rawState.profiles[0];
  const targetVenueId = venueId || rawState.selectedVenueId;

  const candidateProfiles = rawState.profiles.filter(p => p.venueId === targetVenueId);

  try {
    const matches = await searchProfilesWithGemini(trimmedQuery, candidateProfiles, currentPersona);
    const isFallback = matches.some(m => m.isFallback === true);
    const latency = matches[0]?.latencyMs || 1200;
    const modelUsed = matches[0]?.modelUsed || 'gemini-3.8-flash';

    db.logAiActivity({
      feature: 'Venue Discovery Search',
      personaId: currentPersona.id,
      personaName: currentPersona.name,
      input: `Search query: "${trimmedQuery}" across ${candidateProfiles.length} venue attendees`,
      latencyMs: latency,
      model: isFallback ? 'Deterministic Keyword Engine' : modelUsed,
      outputExcerpt: matches[0] ? `#1 ${matches[0].profile.name} (${matches[0].relevanceScore}%): "${matches[0].matchReason}"` : 'No matches found',
      status: isFallback ? 'fallback' : 'success',
      attempts: matches[0]?.attempts !== undefined ? matches[0].attempts : 1,
      retryCount: matches[0]?.retryCount !== undefined ? matches[0].retryCount : 0,
      retryReason: matches[0]?.retryReason,
      errorDetails: matches[0]?.errorDetails
    });

    res.json({ success: true, matches, isFallback, latencyMs: latency, modelUsed });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Search failed' });
  }
};

apiRouter.post('/discovery/search', async (req: Request, res: Response) => {
  const { query, viewerId, venueId } = req.body || {};
  await executeDiscoverySearch(query, viewerId, venueId, res);
});

apiRouter.get('/discovery/search', async (req: Request, res: Response) => {
  const query = (req.query.query || req.query.q || req.query.search) as string | undefined;
  const viewerId = (req.query.viewerId || req.query.viewer || req.query.personaId) as string | undefined;
  const venueId = (req.query.venueId || req.query.venue) as string | undefined;
  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.json({ success: true, matches: [], isFallback: false });
  }
  await executeDiscoverySearch(query, viewerId, venueId, res);
});

// 7. Get or initialize visitor chat history (supports POST body & GET query)
const handleChatHistory = (req: Request, res: Response) => {
  const targetProfileId = (req.body?.targetProfileId || req.query?.targetProfileId || req.query?.targetId) as string | undefined;
  const visitorProfileId = (req.body?.visitorProfileId || req.query?.visitorProfileId || req.query?.visitorId || req.query?.viewerId) as string | undefined;

  if (targetProfileId && visitorProfileId) {
    let conv = db.findConversation(targetProfileId, visitorProfileId, 'visitor_chat');
    const target = db.getRawProfile(targetProfileId);

    if (!conv && target) {
      // Seed initial greeting message from the agent
      conv = {
        id: `conv-${visitorProfileId}-${targetProfileId}-chat`,
        participantAId: visitorProfileId,
        participantBId: targetProfileId,
        kind: 'visitor_chat',
        generatedAt: new Date().toISOString(),
        summary: `Chat with ${target.name}'s AI Agent`,
        messages: [
          {
            id: `msg-welcome-${Date.now()}`,
            role: 'agent',
            senderName: `${target.name}'s Agent`,
            text: `Hello! I am ${target.name}'s authorized representative. ${target.agentSpec.elevatorPitch} Feel free to ask about our solutions or explore a partnership introduction.`,
            timestamp: new Date().toTimeString().substring(0, 5)
          }
        ]
      };
      db.saveConversation(conv);
    }

    return res.json({ success: true, conversation: conv });
  }

  // Check if conversationId was supplied
  const conversationId = (req.query?.conversationId || req.body?.conversationId) as string | undefined;
  if (conversationId) {
    const conv = db.getConversation(conversationId);
    if (conv) {
      return res.json({ success: true, conversation: conv });
    }
  }

  // Fallback: return existing conversations
  const allConvs = db.getState().conversations;
  return res.json({
    success: true,
    conversations: allConvs,
    conversation: allConvs[0] || null
  });
};

apiRouter.post('/chat/history', handleChatHistory);
apiRouter.get('/chat/history', handleChatHistory);

// 8. Send chat message to an agent
apiRouter.post('/chat/message', async (req: Request, res: Response) => {
  const { targetProfileId, visitorProfileId, message, conversationId } = req.body;
  if (!targetProfileId || !visitorProfileId || !message) {
    return res.status(400).json({ error: 'targetProfileId, visitorProfileId, and message required' });
  }

  const target = db.getRawProfile(targetProfileId);
  const visitor = db.getRawProfile(visitorProfileId);

  if (!target || !visitor) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  // Check if mutual connection exists
  const state = db.getState();
  const isMutuallyConnected = state.opportunities.some(o =>
    ((o.senderId === visitorProfileId && o.receiverId === targetProfileId) ||
     (o.senderId === targetProfileId && o.receiverId === visitorProfileId)) &&
    o.senderApproved && o.receiverApproved && o.status === 'connected'
  );

  let conv = conversationId ? db.getConversation(conversationId) : db.findConversation(targetProfileId, visitorProfileId, 'visitor_chat');
  if (!conv) {
    conv = {
      id: conversationId || `conv-${visitorProfileId}-${targetProfileId}-chat`,
      participantAId: visitorProfileId,
      participantBId: targetProfileId,
      kind: 'visitor_chat',
      generatedAt: new Date().toISOString(),
      messages: []
    };
    db.saveConversation(conv);
  }

  // Add visitor user message
  const userMsg: ChatMessage = {
    id: `msg-${Date.now()}-u`,
    role: 'user',
    senderName: visitor.name,
    text: message,
    timestamp: new Date().toTimeString().substring(0, 5)
  };
  db.addMessageToConversation(conv.id, userMsg);

  // Execute agent response via Gemini + Server Permission Enforcement
  const agentOutput = await executeAgentChat({
    targetProfile: target,
    visitorProfile: visitor,
    conversationHistory: conv.messages,
    userMessage: message,
    isMutuallyConnected
  });

  // If meeting was requested, create pending opportunity linked to this conversation
  let opportunityCreated = false;
  if (agentOutput.meetingRequested) {
    db.createOpportunity({
      senderId: visitorProfileId,
      receiverId: targetProfileId,
      initialNote: `Meeting request initiated via agent chat: "${message.slice(0, 100)}"`,
      conversationId: conv.id
    });
    opportunityCreated = true;
  }

  // Add agent message
  const agentMsg: ChatMessage = {
    id: `msg-${Date.now()}-a`,
    role: 'agent',
    senderName: `${target.name}'s Agent`,
    text: agentOutput.reply,
    timestamp: new Date().toTimeString().substring(0, 5),
    isPermissionNotice: agentOutput.isPermissionNotice,
    latencyMs: agentOutput.latencyMs || 920,
    modelUsed: agentOutput.modelUsed || 'gemini-3.8-flash'
  };
  const updatedConv = db.addMessageToConversation(conv.id, agentMsg);

  db.logAiActivity({
    feature: 'Avatar Chat Reply',
    personaId: target.id,
    personaName: `${target.name}'s Agent (for ${visitor.name})`,
    input: `[${visitor.name}]: "${message.slice(0, 120)}"`,
    latencyMs: agentOutput.latencyMs || 920,
    model: agentOutput.modelUsed || 'gemini-3.8-flash',
    outputExcerpt: agentOutput.reply.slice(0, 140),
    status: agentOutput.modelUsed?.includes('Deterministic') ? 'fallback' : 'success',
    attempts: agentOutput.attempts !== undefined ? agentOutput.attempts : 1,
    retryCount: agentOutput.retryCount !== undefined ? agentOutput.retryCount : 0,
    retryReason: agentOutput.retryReason,
    errorDetails: agentOutput.errorDetails
  });

  res.json({
    success: true,
    message: agentMsg,
    conversation: updatedConv,
    opportunityCreated,
    state: db.getState(visitorProfileId)
  });
});

// 9. Agent-to-Agent Matchmaking (deterministic persistence)
apiRouter.post('/matchmaking/analyze', async (req: Request, res: Response) => {
  const { personaId, forceRefresh } = req.body;
  const activeId = personaId || db.getState().currentPersonaId;
  const persona = db.getRawProfile(activeId);

  if (!persona) {
    return res.status(404).json({ error: 'Persona not found' });
  }

  const allProfiles = db.getState().profiles;
  const otherProfiles = allProfiles.filter(p => p.id !== persona.id);

  // Check if there is already an existing agent_match conversation for this persona
  const existingConv = db.getState().conversations.find(c =>
    c.kind === 'agent_match' &&
    (c.participantAId === persona.id || c.participantBId === persona.id)
  );

  if (existingConv && !forceRefresh) {
    const otherParticipantId = existingConv.participantAId === persona.id
      ? existingConv.participantBId
      : existingConv.participantAId;
    const topProfile = otherProfiles.find(p => p.id === otherParticipantId);

    // Ensure candidate pool excludes current persona, and top profile is #1
    const remainingProfiles = otherProfiles.filter(p => p.id !== otherParticipantId && p.id !== persona.id);
    const candidateList = topProfile ? [topProfile, ...remainingProfiles] : remainingProfiles;

    const matches = candidateList.map((p, idx) => {
      const isTopMatch = idx === 0 && topProfile && p.id === topProfile.id;
      let reason = `Operational synergy and shared airport presence at ${p.zone}.`;
      let score = 98;

      if (isTopMatch) {
        if ((persona.id === 'priya-shah' && p.id === 'tom-reyes') || (persona.id === 'tom-reyes' && p.id === 'priya-shah')) {
          reason = `Tom has an active fleet pilot requirement for 40 A350s directly matching Priya's ANiX offline cabin AI.`;
          score = 98;
        } else if ((persona.id === 'marcus-vance' && p.id === 'priya-shah') || (persona.id === 'priya-shah' && p.id === 'marcus-vance')) {
          reason = `Marcus deploys $1M-$4M seed checks into aviation enterprise software, aligning with ForthCode's commercial expansion.`;
          score = 97;
        } else {
          reason = `${p.name} at ${p.company} has high mutual synergy with ${persona.name}'s objectives.`;
          score = 96;
        }
      } else {
        score = Math.max(35, 88 - idx * 9);
        reason = `Limited direct overlap between ${p.name}'s focus at ${p.company} and ${persona.name}'s current objectives.`;
      }

      return {
        profile: p,
        synergyScore: score,
        synergyReason: reason,
        potentialBenefit: isTopMatch
          ? `Immediate evaluation trial and strategic partnership during transit dwell time.`
          : `Worth a quick chat to confirm mutual fit.`,
        tags: isTopMatch ? ['Pilot-ready', 'Decision maker', 'Shared KPI'] : ['Unscored']
      };
    });

    return res.json({
      success: true,
      cached: true,
      matches,
      topMatchConversation: existingConv
    });
  }

  // Run Gemini analysis and simulate fresh agent negotiation
  try {
    const result = await runAgentMatchmaking({
      persona,
      allProfiles
    });

    // Store the conversation records (top 3 matches) to guarantee deterministic demo stability!
    for (const conv of result.matchConversations && result.matchConversations.length > 0 ? result.matchConversations : [result.topMatchConversation]) {
      db.saveConversation(conv);
    }

    db.logAiActivity({
      feature: 'Matchmaking Transcript',
      personaId: persona.id,
      personaName: persona.name,
      input: `Autonomous match evaluation: ${persona.name} (${persona.company}) with venue attendees`,
      latencyMs: result.latencyMs || 1600,
      model: result.modelUsed || 'gemini-3.8-flash',
      outputExcerpt: result.matches[0] ? `Top Synergy: ${result.matches[0].profile.name} (${result.matches[0].synergyScore}%): "${result.matches[0].synergyReason}"` : 'Transcript generated',
      status: result.modelUsed?.includes('Deterministic') ? 'fallback' : 'success',
      attempts: result.attempts !== undefined ? result.attempts : 1,
      retryCount: result.retryCount !== undefined ? result.retryCount : 0,
      retryReason: result.retryReason,
      errorDetails: result.errorDetails
    });

    res.json({
      success: true,
      cached: false,
      matches: result.matches,
      topMatchConversation: result.topMatchConversation,
      latencyMs: result.latencyMs,
      modelUsed: result.modelUsed
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Matchmaking analysis failed' });
  }
});

// 10. Request an introduction / meeting
apiRouter.post('/opportunities/request', (req: Request, res: Response) => {
  const { senderId, receiverId, initialNote, conversationId } = req.body;
  if (!senderId || !receiverId) {
    return res.status(400).json({ error: 'senderId and receiverId required' });
  }

  const opp = db.createOpportunity({
    senderId,
    receiverId,
    initialNote: initialNote || 'Direct introduction request from venue discovery.',
    conversationId
  });

  res.json({ success: true, opportunity: opp, state: db.getState(senderId) });
});

// 11. Approve opportunity
apiRouter.post('/opportunities/approve', (req: Request, res: Response) => {
  const { oppId, approverId } = req.body;
  if (!oppId || !approverId) {
    return res.status(400).json({ error: 'oppId and approverId required' });
  }

  try {
    const opp = db.approveOpportunity(oppId, approverId);
    res.json({ success: true, opportunity: opp, state: db.getState(approverId) });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

apiRouter.get('/opportunities/approve', (req: Request, res: Response) => {
  const oppId = (req.query.oppId as string) || (req.query.id as string);
  const approverId = req.query.approverId as string;
  if (oppId && approverId) {
    try {
      const opp = db.approveOpportunity(oppId, approverId);
      return res.json({ success: true, opportunity: opp, state: db.getState(approverId) });
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  }
  res.status(405).json({ success: false, error: 'Method Not Allowed. Use POST /api/opportunities/approve with JSON body.' });
});

// 12. Decline opportunity
apiRouter.post('/opportunities/decline', (req: Request, res: Response) => {
  const { oppId, declinerId } = req.body;
  if (!oppId || !declinerId) {
    return res.status(400).json({ error: 'oppId and declinerId required' });
  }

  try {
    const opp = db.declineOpportunity(oppId, declinerId);
    res.json({ success: true, opportunity: opp, state: db.getState(declinerId) });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

apiRouter.get('/opportunities/decline', (req: Request, res: Response) => {
  const oppId = (req.query.oppId as string) || (req.query.id as string);
  const declinerId = req.query.declinerId as string;
  if (oppId && declinerId) {
    try {
      const opp = db.declineOpportunity(oppId, declinerId);
      return res.json({ success: true, opportunity: opp, state: db.getState(declinerId) });
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  }
  res.status(405).json({ success: false, error: 'Method Not Allowed. Use POST /api/opportunities/decline with JSON body.' });
});

// 13. Reset state
apiRouter.post('/state/reset', (_req: Request, res: Response) => {
  const state = db.resetToSeed();
  res.json({ success: true, state });
});

// 14. AI Activity Log (transparent audit trail across all personas)
apiRouter.get('/activity/logs', (_req: Request, res: Response) => {
  const logs = db.getAiActivityLogs();
  res.json({ success: true, logs });
});

// 15. Generate avatar with Gemini / HoloMeet Digital Presence Styler
apiRouter.post('/avatar/generate', async (req: Request, res: Response) => {
  const { personaId, imageBase64, mimeType, variationIndex, extraImages, style } = req.body;
  if (!personaId || !imageBase64) {
    return res.status(400).json({ error: 'personaId and imageBase64 required' });
  }

  const profile = db.getRawProfile(personaId);
  if (!profile) {
    return res.status(404).json({ error: 'Persona not found' });
  }

  try {
    const result = await generateAvatarWithGemini({
      personaId: profile.id,
      personaName: profile.name,
      imageBase64,
      mimeType: mimeType || 'image/jpeg',
      variationIndex: variationIndex || 1,
      extraImages: Array.isArray(extraImages) ? extraImages.slice(0, 3) : undefined,
      style: style === 'light' || style === 'dark' ? style : 'signature'
    });

    // Save generated avatar directly to the persona profile
    profile.avatar = result.avatarUrl;
    db.saveProfile(profile);

    // Log the AI activity with full telemetry in existing audit trail
    const isRegen = (variationIndex || 1) > 1;
    db.logAiActivity({
      feature: 'Avatar Generation',
      personaId: profile.id,
      personaName: profile.name,
      input: `Photo uploaded for ${profile.name} (Variation #${variationIndex || 1}) - Brand style: shoulder-up, electric-blue rim, cyan glow, dark bg`,
      latencyMs: result.latencyMs,
      model: result.modelUsed,
      outputExcerpt: result.isFallback
        ? (isRegen
            ? 'Regeneration Fallback: Uploaded photo displayed directly (Image generation unavailable)'
            : 'Upload Fallback: Uploaded photo displayed directly (Image generation unavailable)')
        : 'Gemini 3.1 Flash Lite Image generated',
      status: result.isFallback ? 'fallback' : 'success',
      attempts: result.attempts,
      retryCount: result.retryCount,
      retryReason: result.retryReason,
      errorDetails: result.errorDetails
    });

    res.json({
      success: true,
      avatarUrl: result.avatarUrl,
      modelUsed: result.modelUsed,
      isFallback: result.isFallback,
      latencyMs: result.latencyMs,
      errorNotice: result.errorNotice,
      profile: db.getState(profile.id).profiles.find(p => p.id === profile.id)
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Avatar generation failed' });
  }
});

