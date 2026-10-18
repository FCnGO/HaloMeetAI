import fs from 'fs';
import path from 'path';
import { UserProfile, Venue, ConversationRecord, OpportunityRecord, AppState } from '../src/types';
import { SEED_PROFILES, SEED_VENUES, INITIAL_CONVERSATIONS, INITIAL_OPPORTUNITIES } from './seedData';

const DB_FILE = path.resolve(process.cwd(), 'server', 'db_store.json');

class DatabaseStore {
  private state: AppState;

  constructor() {
    this.state = this.loadInitialState();
  }

  private loadInitialState(): AppState {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.profiles && parsed.profiles.length > 0) {
          if (!parsed.aiActivityLogs || parsed.aiActivityLogs.length === 0) {
            parsed.aiActivityLogs = this.createSeedAiLogs();
            this.persist(parsed);
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read existing db_store.json, using seed data:', e);
    }

    const defaultState: AppState = {
      currentPersonaId: 'priya-shah',
      selectedVenueId: 'sin-t3',
      profiles: JSON.parse(JSON.stringify(SEED_PROFILES)),
      venues: JSON.parse(JSON.stringify(SEED_VENUES)),
      conversations: JSON.parse(JSON.stringify(INITIAL_CONVERSATIONS)),
      opportunities: JSON.parse(JSON.stringify(INITIAL_OPPORTUNITIES)),
      aiActivityLogs: this.createSeedAiLogs()
    };

    this.persist(defaultState);
    return defaultState;
  }

  public createSeedAiLogs(): import('../src/types').AiActivityLogEntry[] {
    return [
      {
        id: 'log-seed-1',
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        timeFormatted: new Date(Date.now() - 1000 * 60 * 12).toTimeString().substring(0, 8),
        feature: 'Matchmaking Transcript',
        personaId: 'priya-shah',
        personaName: 'Priya Shah',
        input: 'Autonomous synergy match analysis between Priya Shah (ForthCode) and Tom Reyes (SkyHorizon)',
        latencyMs: 1420,
        model: 'gemini-3.8-flash',
        outputExcerpt: 'Tom has an active fleet pilot requirement for 40 A350s directly matching Priya\'s ANiX offline cabin AI.',
        status: 'success',
        attempts: 1,
        retryCount: 0
      },
      {
        id: 'log-seed-2',
        timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        timeFormatted: new Date(Date.now() - 1000 * 60 * 8).toTimeString().substring(0, 8),
        feature: 'Venue Discovery Search',
        personaId: 'tom-reyes',
        personaName: 'Tom Reyes',
        input: 'AI for airline passenger cabin without satellite internet',
        latencyMs: 1680,
        model: 'gemini-3.8-flash',
        outputExcerpt: 'Priya Shah ranked #1 (98% match). Directly addresses offline IFE via ANiX edge engine.',
        status: 'success',
        attempts: 1,
        retryCount: 0
      },
      {
        id: 'log-seed-3',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        timeFormatted: new Date(Date.now() - 1000 * 60 * 5).toTimeString().substring(0, 8),
        feature: 'Avatar Chat Reply',
        personaId: 'priya-shah',
        personaName: 'Priya Shah',
        input: 'Does ANiX operate without satellite connectivity?',
        latencyMs: 940,
        model: 'gemini-3.8-flash',
        outputExcerpt: 'Yes, exactly. ANiX is offline-first by design. It runs locally on certified aircraft server blades...',
        status: 'success',
        attempts: 1,
        retryCount: 0
      },
      {
        id: 'log-seed-4',
        timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
        timeFormatted: new Date(Date.now() - 1000 * 60 * 3).toTimeString().substring(0, 8),
        feature: 'Profile Generation',
        personaId: 'priya-shah',
        personaName: 'Priya Shah',
        input: 'Founder of ForthCode developing ANiX, DAViX, and nGO for airlines at Changi T3',
        latencyMs: 2150,
        model: 'gemini-3.8-flash',
        outputExcerpt: 'Empowering commercial aviation with offline-first cabin AI and ground operations intelligence.',
        status: 'success',
        attempts: 1,
        retryCount: 0
      },
      {
        id: 'log-seed-5',
        timestamp: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
        timeFormatted: new Date(Date.now() - 1000 * 60 * 1).toTimeString().substring(0, 8),
        feature: 'Matchmaking Transcript',
        personaId: 'marcus-vance',
        personaName: 'Marcus Vance',
        input: 'Autonomous synergy match analysis between Marcus Vance (Horizon Aero) and Priya Shah (ForthCode)',
        latencyMs: 1530,
        model: 'gemini-3.8-flash',
        outputExcerpt: 'Marcus deploys $1M-$4M seed checks into aviation enterprise software, aligning with ForthCode expansion.',
        status: 'success',
        attempts: 1,
        retryCount: 0
      }
    ];
  }

  private persist(state: AppState) {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write db_store.json:', e);
    }
  }

  public getState(viewerId?: string): AppState {
    const activeViewer = viewerId || this.state.currentPersonaId;
    
    // Apply privacy masking to profiles based on active viewer permissions & mutual approvals
    const maskedProfiles = this.state.profiles.map(p => this.maskProfileForViewer(p, activeViewer));

    return {
      currentPersonaId: this.state.currentPersonaId,
      selectedVenueId: this.state.selectedVenueId,
      venues: this.state.venues,
      profiles: maskedProfiles,
      opportunities: this.state.opportunities,
      conversations: this.state.conversations,
      aiActivityLogs: this.state.aiActivityLogs || []
    };
  }

  public maskProfileForViewer(targetProfile: UserProfile, viewerId: string): UserProfile {
    // If the viewer is the profile owner, they see everything unmasked
    if (targetProfile.id === viewerId) {
      return { ...targetProfile };
    }

    // Check if there is an approved mutual opportunity between viewer and target
    const isMutuallyApproved = this.state.opportunities.some(opp =>
      ((opp.senderId === viewerId && opp.receiverId === targetProfile.id) ||
       (opp.senderId === targetProfile.id && opp.receiverId === viewerId)) &&
      opp.senderApproved && opp.receiverApproved &&
      opp.status === 'connected'
    );

    if (isMutuallyApproved) {
      return { ...targetProfile };
    }

    // Otherwise mask private contact info strictly
    const emailParts = targetProfile.contactInfo.email.split('@');
    const domain = emailParts[1] || 'domain.com';
    const maskedEmail = `••••••••@${domain}`;
    
    return {
      ...targetProfile,
      contactInfo: {
        email: maskedEmail,
        phone: targetProfile.contactInfo.phone ? '+•• ••• •••• (Locked until mutual approval)' : undefined,
        linkedin: targetProfile.contactInfo.linkedin ? 'linkedin.com/in/••••••••' : undefined
      }
    };
  }

  public getRawProfile(id: string): UserProfile | undefined {
    return this.state.profiles.find(p => p.id === id);
  }

  public setPersona(personaId: string) {
    if (this.state.profiles.some(p => p.id === personaId)) {
      this.state.currentPersonaId = personaId;
      this.persist(this.state);
    }
    return this.state.currentPersonaId;
  }

  public setVenue(venueId: string) {
    if (this.state.venues.some(v => v.id === venueId)) {
      this.state.selectedVenueId = venueId;
      this.persist(this.state);
    }
    return this.state.selectedVenueId;
  }

  public saveProfile(profile: UserProfile): UserProfile {
    const idx = this.state.profiles.findIndex(p => p.id === profile.id);
    if (idx >= 0) {
      this.state.profiles[idx] = { ...this.state.profiles[idx], ...profile };
    } else {
      this.state.profiles.push(profile);
    }
    this.persist(this.state);
    return this.state.profiles[idx >= 0 ? idx : this.state.profiles.length - 1];
  }

  public getConversation(id: string): ConversationRecord | undefined {
    return this.state.conversations.find(c => c.id === id);
  }

  public findConversation(participantAId: string, participantBId: string, kind: 'visitor_chat' | 'agent_match'): ConversationRecord | undefined {
    return this.state.conversations.find(c =>
      c.kind === kind &&
      ((c.participantAId === participantAId && c.participantBId === participantBId) ||
       (c.participantAId === participantBId && c.participantBId === participantAId))
    );
  }

  public saveConversation(conv: ConversationRecord): ConversationRecord {
    const idx = this.state.conversations.findIndex(c => c.id === conv.id);
    if (idx >= 0) {
      this.state.conversations[idx] = conv;
    } else {
      this.state.conversations.push(conv);
    }
    this.persist(this.state);
    return conv;
  }

  public addMessageToConversation(convId: string, message: ConversationRecord['messages'][0]): ConversationRecord {
    const conv = this.state.conversations.find(c => c.id === convId);
    if (conv) {
      conv.messages.push(message);
      this.persist(this.state);
      return conv;
    }
    throw new Error(`Conversation not found: ${convId}`);
  }

  public createOpportunity(params: {
    senderId: string;
    receiverId: string;
    initialNote: string;
    conversationId?: string;
  }): OpportunityRecord {
    // Check if an opportunity already exists between these two
    const existing = this.state.opportunities.find(o =>
      (o.senderId === params.senderId && o.receiverId === params.receiverId) ||
      (o.senderId === params.receiverId && o.receiverId === params.senderId)
    );

    if (existing) {
      return existing;
    }

    const newOpp: OpportunityRecord = {
      id: `opp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      senderId: params.senderId,
      receiverId: params.receiverId,
      senderApproved: true,
      receiverApproved: false,
      status: 'pending',
      initialNote: params.initialNote,
      conversationId: params.conversationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.state.opportunities.unshift(newOpp);
    this.persist(this.state);
    return newOpp;
  }

  public approveOpportunity(oppId: string, approverId: string): OpportunityRecord {
    const opp = this.state.opportunities.find(o => o.id === oppId);
    if (!opp) {
      throw new Error(`Opportunity not found: ${oppId}`);
    }

    if (opp.senderId === approverId) {
      opp.senderApproved = true;
    } else if (opp.receiverId === approverId) {
      opp.receiverApproved = true;
    }

    if (opp.senderApproved && opp.receiverApproved) {
      opp.status = 'connected';
    }

    opp.updatedAt = new Date().toISOString();
    this.persist(this.state);
    return opp;
  }

  public declineOpportunity(oppId: string, declinerId: string): OpportunityRecord {
    const opp = this.state.opportunities.find(o => o.id === oppId);
    if (!opp) {
      throw new Error(`Opportunity not found: ${oppId}`);
    }

    opp.status = 'declined';
    opp.updatedAt = new Date().toISOString();
    this.persist(this.state);
    return opp;
  }

  public logAiActivity(entry: Omit<import('../src/types').AiActivityLogEntry, 'id' | 'timestamp' | 'timeFormatted'> & { id?: string; timestamp?: string; timeFormatted?: string }): import('../src/types').AiActivityLogEntry {
    const now = new Date();
    const newEntry: import('../src/types').AiActivityLogEntry = {
      id: entry.id || `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: entry.timestamp || now.toISOString(),
      timeFormatted: entry.timeFormatted || now.toTimeString().substring(0, 8),
      feature: entry.feature,
      personaId: entry.personaId,
      personaName: entry.personaName,
      input: entry.input,
      latencyMs: entry.latencyMs,
      model: entry.model || 'gemini-3.8-flash',
      outputExcerpt: entry.outputExcerpt,
      status: entry.status || 'success',
      attempts: entry.attempts !== undefined ? entry.attempts : 1,
      retryCount: entry.retryCount !== undefined ? entry.retryCount : (entry.attempts ? Math.max(0, entry.attempts - 1) : 0),
      retryReason: entry.retryReason,
      errorDetails: entry.errorDetails
    };

    if (!this.state.aiActivityLogs) {
      this.state.aiActivityLogs = [];
    }
    this.state.aiActivityLogs.unshift(newEntry);
    if (this.state.aiActivityLogs.length > 100) {
      this.state.aiActivityLogs = this.state.aiActivityLogs.slice(0, 100);
    }
    this.persist(this.state);
    return newEntry;
  }

  public getAiActivityLogs(): import('../src/types').AiActivityLogEntry[] {
    return this.state.aiActivityLogs || [];
  }

  public resetToSeed(): AppState {
    this.state = {
      currentPersonaId: 'priya-shah',
      selectedVenueId: 'sin-t3',
      profiles: JSON.parse(JSON.stringify(SEED_PROFILES)),
      venues: JSON.parse(JSON.stringify(SEED_VENUES)),
      conversations: JSON.parse(JSON.stringify(INITIAL_CONVERSATIONS)),
      opportunities: JSON.parse(JSON.stringify(INITIAL_OPPORTUNITIES)),
      aiActivityLogs: this.state.aiActivityLogs || []
    };
    this.persist(this.state);
    return this.getState();
  }
}

export const db = new DatabaseStore();
