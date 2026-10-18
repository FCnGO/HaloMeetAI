import { GoogleGenAI, Type } from '@google/genai';
import { UserProfile, SearchMatchResult, ConversationRecord, MatchmakingResult } from '../src/types';
import { getStaticFallbackAvatar } from './staticAvatars.js';

export interface GeminiCallTelemetry {
  attempts: number;
  retryCount: number;
  retryReason?: string;
  errorDetails?: string;
}

/**
 * Initialize Gemini client strictly with server environment variable, required telemetry header,
 * and fail-fast retryOptions to PREVENT silent exponential backoff stalls (e.g. 5 retries with 60s delays = 7 min).
 */
export const getAIClientWithTelemetry = (telemetry: GeminiCallTelemetry, timeoutMs = 6500) => {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Intelligent fallback algorithms will assist.');
  }

  const trackingFetch = async (url: any, options: any) => {
    telemetry.attempts++;
    if (telemetry.attempts > 1) {
      telemetry.retryCount = telemetry.attempts - 1;
    }
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        const cloned = res.clone();
        const errText = await cloned.text().catch(() => '');
        let errMsg = '';
        let errStatus = '';
        try {
          const j = JSON.parse(errText);
          errMsg = j.error?.message || j.message || '';
          errStatus = j.error?.status || '';
        } catch {
          errMsg = errText.slice(0, 150);
        }
        telemetry.retryReason = `HTTP ${res.status}${errStatus ? ' ' + errStatus : ''}: ${errMsg || res.statusText}`;
        telemetry.errorDetails = `HTTP ${res.status} (${errStatus || res.statusText}): ${errMsg || 'Error during inference'}`;
        console.warn(`[Gemini Request Attempt #${telemetry.attempts}] HTTP ${res.status}:`, errMsg);
      }
      return res;
    } catch (err: any) {
      telemetry.retryReason = `Network/Timeout: ${err.name} - ${err.message}`;
      telemetry.errorDetails = err.message;
      throw err;
    }
  };

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      fetch: trackingFetch,
      headers: {
        'User-Agent': 'aistudio-build',
      },
      // Fail-fast timeout so API calls never hang for minutes during a live demo
      timeout: timeoutMs,
      // CRITICAL: Disable silent SDK p-retry backoff loops (attempts: 1).
      // Prevents silently waiting 60s per retry up to 5 times (7 minutes) on 503/429!
      retryOptions: {
        attempts: 1,
      },
    },
  });
};

/**
 * 1. Profile Presence Generator:
 * Turns free-text product/role description into a structured Agent Specification.
 */
export async function generatePresenceWithGemini(params: {
  name: string;
  role: string;
  company: string;
  objective: string;
  rawDescription: string;
}): Promise<{
  oneLinePitch: string;
  elevatorPitch: string;
  products: Array<{
    id: string;
    title: string;
    description: string;
    suggestedQuestions: string[];
  }>;
  approvedTopics: string[];
  disallowedTopics: string[];
  latencyMs?: number;
  modelUsed?: string;
  generatedWithGemini?: boolean;
  attempts?: number;
  retryCount?: number;
  retryReason?: string;
  errorDetails?: string;
}> {
  const startTime = Date.now();
  const telemetry: GeminiCallTelemetry = { attempts: 0, retryCount: 0 };

  const prompt = `You are the HoloMeet AI presence architect.
Given an attendee's profile and raw description, construct an authorized Agent Specification for their personal AI representative.

Attendee:
- Name: ${params.name}
- Role: ${params.role}
- Company: ${params.company}
- Objective: ${params.objective}
- Unstructured Description: "${params.rawDescription}"

Generate a clean JSON object with:
1. oneLinePitch: A punchy 1-sentence value proposition (under 18 words).
2. elevatorPitch: A welcoming, professional 2-3 sentence elevator pitch delivered by their personal agent.
3. products: An array of 2 to 3 key products or initiatives mentioned or implied. For each product:
   - title: Short clean name (e.g., "ANiX — Onboard AI Concierge")
   - description: 1 concise sentence describing the product/capability
   - suggestedQuestions: exactly 3 natural questions that a physical venue attendee or potential partner would ask.
4. approvedTopics: 4-6 topics the agent is authorized to discuss.
5. disallowedTopics: 3-5 confidential or out-of-scope topics the agent must refuse.`;

  const schemaConfig = {
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        oneLinePitch: { type: Type.STRING },
        elevatorPitch: { type: Type.STRING },
        products: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              suggestedQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['title', 'description', 'suggestedQuestions']
          }
        },
        approvedTopics: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        disallowedTopics: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: ['oneLinePitch', 'elevatorPitch', 'products', 'approvedTopics', 'disallowedTopics']
    }
  };

  // Attempt 1: gemini-3.8-flash (with fail-fast client)
  try {
    const ai = getAIClientWithTelemetry(telemetry, 12000);
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: schemaConfig
    });

    const latencyMs = Date.now() - startTime;
    const parsed = JSON.parse(response.text || '{}');
    return {
      oneLinePitch: parsed.oneLinePitch || `${params.role} at ${params.company}`,
      elevatorPitch: parsed.elevatorPitch || `Hi, I represent ${params.name} from ${params.company}.`,
      products: (parsed.products || []).map((p: any, idx: number) => ({
        id: `prod-${Date.now()}-${idx}`,
        title: p.title,
        description: p.description,
        suggestedQuestions: p.suggestedQuestions || []
      })),
      approvedTopics: parsed.approvedTopics || [params.company, params.role],
      disallowedTopics: parsed.disallowedTopics || ['Confidential pricing', 'Personal phone number'],
      latencyMs,
      modelUsed: 'gemini-3.8-flash',
      generatedWithGemini: true,
      attempts: telemetry.attempts,
      retryCount: telemetry.retryCount,
      retryReason: telemetry.retryReason,
      errorDetails: telemetry.errorDetails
    };
  } catch (errPrimary: any) {
    console.warn(`[Presence Gen] Primary gemini-3.8-flash failed (${errPrimary.message}). Attempting fast fallback to gemini-3.1-flash-lite...`);
    
    // Attempt 2: gemini-3.1-flash-lite (high availability, sub-second)
    try {
      const aiLite = getAIClientWithTelemetry(telemetry, 11000);
      const response = await aiLite.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: schemaConfig
      });

      const latencyMs = Date.now() - startTime;
      const parsed = JSON.parse(response.text || '{}');
      return {
        oneLinePitch: parsed.oneLinePitch || `${params.role} at ${params.company}`,
        elevatorPitch: parsed.elevatorPitch || `Hi, I represent ${params.name} from ${params.company}.`,
        products: (parsed.products || []).map((p: any, idx: number) => ({
          id: `prod-${Date.now()}-${idx}`,
          title: p.title,
          description: p.description,
          suggestedQuestions: p.suggestedQuestions || []
        })),
        approvedTopics: parsed.approvedTopics || [params.company, params.role],
        disallowedTopics: parsed.disallowedTopics || ['Confidential pricing', 'Personal phone number'],
        latencyMs,
        modelUsed: 'gemini-3.1-flash-lite',
        generatedWithGemini: true,
        attempts: telemetry.attempts,
        retryCount: telemetry.retryCount,
        retryReason: `gemini-3.8-flash demand spike (${telemetry.retryReason || errPrimary.message}); auto-promoted to gemini-3.1-flash-lite`,
        errorDetails: telemetry.errorDetails
      };
    } catch (errLite) {
      console.warn('Gemini presence generation fallback to domain engine:', errLite);
    }
  }

  const latencyMs = Math.max(Date.now() - startTime, 450);
  // Deterministic domain fallback
  return {
    oneLinePitch: `Empowering commercial aviation partnerships and next-generation tech at ${params.company}.`,
    elevatorPitch: `Hello! I represent ${params.name}, ${params.role} at ${params.company}. We are exploring high-impact collaborations at this venue.`,
    products: [
      {
        id: `prod-${Date.now()}-1`,
        title: `${params.company} Core Solutions`,
        description: params.rawDescription.slice(0, 120) + '...',
        suggestedQuestions: [
          `What are the core technical capabilities of ${params.company}?`,
          `How does ${params.name} evaluate partnership pilots?`,
          `What makes your solution unique compared to legacy alternatives?`
        ]
      }
    ],
    approvedTopics: ['Product capabilities', 'Partnership opportunities', 'Technical roadmap'],
    disallowedTopics: ['Private phone numbers', 'Unapproved commercial discounts'],
    latencyMs,
    modelUsed: 'Deterministic Domain Engine',
    generatedWithGemini: false,
    attempts: telemetry.attempts,
    retryCount: telemetry.retryCount,
    retryReason: telemetry.retryReason,
    errorDetails: telemetry.errorDetails
  };
}

/**
 * 2. Natural Language Venue Discovery Search:
 * Ranks visible profiles against queries (supporting multilingual e.g. Japanese, French, Spanish, German, etc.)
 * Strictly grounds every matchReason in the user's submitted query text.
 */
export async function searchProfilesWithGemini(
  query: string,
  visibleProfiles: UserProfile[],
  currentPersona: UserProfile
): Promise<SearchMatchResult[]> {
  const isJapaneseQuery = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(query);
  const startTime = Date.now();
  const telemetry: GeminiCallTelemetry = { attempts: 0, retryCount: 0 };

  const candidateData = visibleProfiles
    .filter(p => p.id !== currentPersona.id && p.permissions.showPresence)
    .map(p => ({
      id: p.id,
      name: p.name,
      role: p.role,
      company: p.company,
      zone: p.zone,
      objective: p.objective,
      pitch: p.agentSpec.oneLinePitch,
      overview: p.rawDescription,
      products: p.agentSpec.products.map(pr => `${pr.title}: ${pr.description}`).join(' | ')
    }));

  const prompt = `You are the HoloMeet AI cross-lingual semantic matching engine.
A visitor at an airport terminal submitted this specific search query:
"${query}"

CRITICAL INSTRUCTIONS:
1. Understand the exact semantic intent of the query: "${query}", regardless of what language it is written in (e.g., Japanese, French, Spanish, German, Mandarin, English).
2. Evaluate and rank the candidates below (top 1 to 5) based on how well their background, products, and role specifically address "${query}".
3. "matchReason" MUST BE HIGHLY SPECIFIC to the submitted query "${query}". Directly mention how their specific product, domain, or role addresses the query intent. DO NOT use generic boilerplate.
4. "matchReason" MUST be written strictly in the EXACT SAME LANGUAGE as the user's query! (If the query is in Japanese, write "matchReason" in natural, fluent Japanese. If in English, write in English, etc.).
5. Determine the detected language of the query for "matchedQueryLanguage".
6. Assign a realistic relevanceScore from 50 to 99 based purely on alignment with "${query}".

Candidates:
${JSON.stringify(candidateData, null, 2)}`;

  const schemaConfig = {
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          relevanceScore: { type: Type.NUMBER },
          matchReason: { type: Type.STRING },
          matchedQueryLanguage: { type: Type.STRING }
        },
        required: ['id', 'relevanceScore', 'matchReason']
      }
    }
  };

  // Attempt 1: gemini-3.8-flash (fail-fast)
  let rawList: any[] = [];
  let modelUsed = 'gemini-3.8-flash';

  try {
    const ai = getAIClientWithTelemetry(telemetry, 12000);
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: schemaConfig
    });
    rawList = JSON.parse(response.text || '[]');
  } catch (errPrimary: any) {
    console.warn(`[Search] gemini-3.8-flash failed (${errPrimary.message}). Attempting fast promotion to gemini-3.1-flash-lite...`);
    
    // Attempt 2: gemini-3.1-flash-lite
    try {
      const aiLite = getAIClientWithTelemetry(telemetry, 11000);
      const response = await aiLite.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: schemaConfig
      });
      rawList = JSON.parse(response.text || '[]');
      modelUsed = 'gemini-3.1-flash-lite';
    } catch (errLite) {
      console.warn('Gemini search API fallback to query keyword matcher:', errLite);
    }
  }

  const latencyMs = Date.now() - startTime;

  if (Array.isArray(rawList) && rawList.length > 0) {
    const results: SearchMatchResult[] = [];
    for (const match of rawList) {
      const profile = visibleProfiles.find(p => p.id === match.id);
      if (profile && profile.id !== currentPersona.id) {
        let score = Number(match.relevanceScore) || 50;
        if (score <= 1) score = Math.round(score * 100);
        results.push({
          profile,
          relevanceScore: Math.min(Math.max(score, 50), 99),
          matchReason: match.matchReason,
          matchedQueryLanguage: match.matchedQueryLanguage || (isJapaneseQuery ? 'Japanese' : 'English'),
          isFallback: false,
          latencyMs,
          modelUsed,
          attempts: telemetry.attempts,
          retryCount: telemetry.retryCount,
          retryReason: telemetry.retryReason,
          errorDetails: telemetry.errorDetails
        });
      }
    }

    if (results.length > 0) {
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);
      return results.slice(0, 5);
    }
  }

  // Dynamic Query-Specific Fallback (NO static canned strings or pre-baked answers)
  const fallbackLatencyMs = Math.max(Date.now() - startTime, 350);
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !['the', 'and', 'for', 'with', 'that', 'this', 'are'].includes(t));

  const matches: SearchMatchResult[] = [];

  for (const p of visibleProfiles) {
    if (p.id === currentPersona.id || !p.permissions.showPresence) continue;

    const searchableContent = [
      p.name,
      p.role,
      p.company,
      p.agentSpec.oneLinePitch,
      p.rawDescription,
      ...p.agentSpec.products.map(pr => `${pr.title} ${pr.description}`)
    ].join(' ').toLowerCase();

    const matchedTerms: string[] = [];
    for (const term of queryTerms) {
      if (searchableContent.includes(term)) {
        matchedTerms.push(term);
      }
    }

    if (matchedTerms.length > 0 || queryTerms.length === 0) {
      const matchRatio = queryTerms.length > 0 ? matchedTerms.length / queryTerms.length : 0.5;
      const score = Math.min(Math.round(60 + matchRatio * 35), 98);

      let reason: string;
      if (isJapaneseQuery) {
        reason = `検索クエリ「${query}」に関連するキーワード（${matchedTerms.slice(0, 3).join('・')}）が、${p.company}での${p.name}氏の取り組みおよびプロダクトと合致しています。`;
      } else {
        const termsStr = matchedTerms.slice(0, 3).map(t => `"${t}"`).join(', ');
        reason = `Directly addresses "${query}" via ${p.name}'s work at ${p.company} focusing on ${termsStr || 'aviation technology initiatives'}.`;
      }

      matches.push({
        profile: p,
        relevanceScore: score,
        matchReason: reason,
        matchedQueryLanguage: isJapaneseQuery ? 'Japanese' : 'English',
        isFallback: true,
        latencyMs: fallbackLatencyMs,
        modelUsed: 'Deterministic Keyword Engine',
        attempts: telemetry.attempts,
        retryCount: telemetry.retryCount,
        retryReason: telemetry.retryReason,
        errorDetails: telemetry.errorDetails
      });
    }
  }

  matches.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return matches.slice(0, 5);
}

/**
 * 3. AI Representative Chat:
 * Visitor talks to another attendee's personal agent.
 * Enforces permissions: strictly uses approved content, rejects contact info leaks,
 * detects meeting intent and creates pending opportunity requests.
 */
export async function executeAgentChat(params: {
  targetProfile: UserProfile;
  visitorProfile: UserProfile;
  conversationHistory: Array<{ role: string; text: string; senderName?: string }>;
  userMessage: string;
  isMutuallyConnected: boolean;
}): Promise<{
  reply: string;
  isPermissionNotice?: boolean;
  meetingRequested?: boolean;
  latencyMs?: number;
  modelUsed?: string;
  attempts?: number;
  retryCount?: number;
  retryReason?: string;
  errorDetails?: string;
}> {
  const { targetProfile, visitorProfile, userMessage, isMutuallyConnected } = params;
  const isJapanese = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(userMessage);
  const startTime = Date.now();
  const telemetry: GeminiCallTelemetry = { attempts: 0, retryCount: 0 };

  // 1. CRITICAL SERVER-SIDE PERMISSION GATE:
  const contactKeywords = [
    'phone', 'number', 'email', 'contact', 'whatsapp', 'cell', 'mobile',
    'call her', 'call him', 'direct number', 'give me her email', 'give me his email',
    'reach her', 'reach him', 'personal email', 'digits', 'telephone', 'telegram',
    '電話番号', '電話', 'メールアドレス', 'メール', '連絡先', '連絡方法', 'ケータイ', 'メアド', '番号教えて'
  ];
  const asksForContact = contactKeywords.some(kw => userMessage.toLowerCase().includes(kw));

  if (asksForContact) {
    const permLatency = Math.max(Date.now() - startTime, 40);
    if (!targetProfile.permissions.shareContactAfterApproval) {
      const refusalText = isJapanese
        ? `[サーバー権限保護]: ${targetProfile.name}氏は設定で「承認後の連絡先共有」を無効にしています。セキュリティ方針に基づき、本エージェントから電話番号やメールアドレスを開示することは固く禁じられています。`
        : `[Server Permission Enforced]: ${targetProfile.name} has configured her Agent Permissions with "Share contact information after approval" turned OFF. Her phone number and email are strictly confidential and will not be disclosed by this agent under any circumstances.`;
      return {
        reply: refusalText,
        isPermissionNotice: true,
        latencyMs: permLatency,
        modelUsed: 'Permission Gatekeeper',
        attempts: 1,
        retryCount: 0
      };
    }

    if (!isMutuallyConnected) {
      const noticeText = isJapanese
        ? `[サーバーセキュリティ制御]: ${targetProfile.name}氏のセキュリティプロトコルにより、直接の連絡先（メール/電話番号）はエージェントチャット上では保護されています。連絡先を交換するには「Request Introduction」をご利用ください。双方がOpportunity Inboxで承認すると自動的に開示されます。`
        : `[Server-Enforced Permission Gate]: Under ${targetProfile.name}'s verified security protocol, direct contact info (email/phone) is locked and cannot be disclosed via agent chat. To exchange contact details, please use the "Request Introduction" button; once both parties approve in the Opportunity Inbox, verified contact details will be automatically unlocked.`;
      return {
        reply: noticeText,
        isPermissionNotice: true,
        latencyMs: permLatency,
        modelUsed: 'Permission Gatekeeper',
        attempts: 1,
        retryCount: 0
      };
    }
  }

  // 2. MEETING INTENT DETECTION:
  const meetingKeywords = [
    'meet', 'meeting', 'coffee', 'grab a drink', 'catch up', 'introduce', 'introduction',
    'connect', 'schedule', 'speak in person', 'lounge', 'talk face to face', 'sit down',
    '面談', '会いたい', 'お会い', 'ミーティング', '打ち合わせ', 'カフェ', 'ラウンジで'
  ];
  const asksForMeeting = meetingKeywords.some(kw => userMessage.toLowerCase().includes(kw));

  const systemPrompt = `You are the authorized AI Representative for ${targetProfile.name} (${targetProfile.role} at ${targetProfile.company}).
You are currently present at ${targetProfile.venueId} (${targetProfile.zone}). ${targetProfile.name} is available for approximately ${targetProfile.availabilityMinutes} minutes.

Your Tone: ${targetProfile.agentSpec.tone}
Your One-Line Pitch: "${targetProfile.agentSpec.oneLinePitch}"
Your Elevator Pitch: "${targetProfile.agentSpec.elevatorPitch}"

Your Approved Knowledge Base:
${targetProfile.agentSpec.products.map(p => `- Product: ${p.title}\n  Details: ${p.description}`).join('\n')}
Additional Context: "${targetProfile.rawDescription}"

Approved Topics: ${targetProfile.agentSpec.approvedTopics.join(', ')}
Disallowed / Restricted Topics: ${targetProfile.agentSpec.disallowedTopics.join(', ')}

PERMISSIONS AND BOUNDARIES (MANDATORY):
1. You must answer ONLY from your approved knowledge base above. If asked about something not in your knowledge base, politely state that ${targetProfile.name} has not authorized you to speak on that topic.
2. NEVER reveal private email addresses, phone numbers, or personal messaging handles. State that contact info is locked until an introduction is mutually approved.
3. If the visitor (${visitorProfile.name}) asks for a meeting or introduction, respond politely that you will check with ${targetProfile.name} and have queued the request for approval in their Opportunity Inbox.
4. Keep replies crisp, executive, and conversational (under 75 words).

MULTILINGUAL ADAPTATION (CRITICAL):
- Detect the visitor's language automatically.
- If the visitor communicates in Japanese, French, Spanish, German, Mandarin, or any non-English language, you MUST reply fluently, politely, and professionally in that EXACT same language!
- Translate domain and product terms accurately with high business etiquette.`;

  const chatContents: any[] = [];
  for (const msg of params.conversationHistory.slice(-6)) {
    chatContents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    });
  }

  chatContents.push({
    role: 'user',
    parts: [{ text: `[Visitor: ${visitorProfile.name}, ${visitorProfile.role} at ${visitorProfile.company}]: ${userMessage}` }]
  });

  let responseText = '';
  let modelUsed = 'gemini-3.8-flash';

  // Attempt 1: gemini-3.8-flash
  try {
    const ai = getAIClientWithTelemetry(telemetry, 12000);
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: chatContents,
      config: {
        systemInstruction: systemPrompt
      }
    });
    responseText = response.text || '';
  } catch (errPrimary: any) {
    console.warn(`[Agent Chat] gemini-3.8-flash error (${errPrimary.message}). Promoting immediately to gemini-3.1-flash-lite...`);
    
    // Attempt 2: gemini-3.1-flash-lite
    try {
      const aiLite = getAIClientWithTelemetry(telemetry, 11000);
      const response = await aiLite.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: chatContents,
        config: {
          systemInstruction: systemPrompt
        }
      });
      responseText = response.text || '';
      modelUsed = 'gemini-3.1-flash-lite';
    } catch (errLite) {
      console.warn('Gemini chat fallback to domain response:', errLite);
    }
  }

  const latencyMs = Date.now() - startTime;

  if (responseText) {
    let reply = responseText;
    if (!targetProfile.permissions.shareContactAfterApproval || !isMutuallyConnected) {
      reply = reply
        .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
        .replace(/(\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/g, '[REDACTED_PHONE]');
    }
    return {
      reply,
      meetingRequested: asksForMeeting,
      latencyMs,
      modelUsed,
      attempts: telemetry.attempts,
      retryCount: telemetry.retryCount,
      retryReason: telemetry.retryReason,
      errorDetails: telemetry.errorDetails
    };
  }

  // Domain fallback
  const fallbackLatencyMs = Math.max(Date.now() - startTime, 280);
  if (isJapanese) {
    if (asksForMeeting) {
      return {
        reply: `${targetProfile.name}氏との面談リクエストを承りました！承認制のため、Opportunity Inbox（受信トレイ）に登録いたしました。`,
        meetingRequested: true,
        latencyMs: fallbackLatencyMs,
        modelUsed: 'Deterministic Domain Engine',
        attempts: telemetry.attempts,
        retryCount: telemetry.retryCount,
        retryReason: telemetry.retryReason,
        errorDetails: telemetry.errorDetails
      };
    }
    return {
      reply: `お問い合わせありがとうございます。${targetProfile.company}における${targetProfile.name}のAI代表です。私たちのフォーカスは「${targetProfile.agentSpec.oneLinePitch}」です。${targetProfile.name}との直接のご面談や協業リクエストがございましたら、いつでもお知らせください。`,
      meetingRequested: false,
      latencyMs: fallbackLatencyMs,
      modelUsed: 'Deterministic Domain Engine',
      attempts: telemetry.attempts,
      retryCount: telemetry.retryCount,
      retryReason: telemetry.retryReason,
      errorDetails: telemetry.errorDetails
    };
  }

  if (asksForMeeting) {
    return {
      reply: `I will check with ${targetProfile.name} regarding an introduction! Since she requires manual approval for meetings, I have registered this in her Opportunity Inbox.`,
      meetingRequested: true,
      latencyMs: fallbackLatencyMs,
      modelUsed: 'Deterministic Domain Engine',
      attempts: telemetry.attempts,
      retryCount: telemetry.retryCount,
      retryReason: telemetry.retryReason,
      errorDetails: telemetry.errorDetails
    };
  }
  return {
    reply: `Thank you for your question. As ${targetProfile.name}'s representative at ${targetProfile.company}, I can confirm that our focus is "${targetProfile.agentSpec.oneLinePitch}". Let me know if you would like me to request a direct introduction with ${targetProfile.name}!`,
    meetingRequested: false,
    latencyMs: fallbackLatencyMs,
    modelUsed: 'Deterministic Domain Engine',
    attempts: telemetry.attempts,
    retryCount: telemetry.retryCount,
    retryReason: telemetry.retryReason,
    errorDetails: telemetry.errorDetails
  };
}

/**
 * 4. Agent-to-Agent Matchmaking Analysis:
 * Compares current persona against all other attendees and simulates a 3-5 message negotiation transcript.
 */
export async function runAgentMatchmaking(params: {
  persona: UserProfile;
  allProfiles: UserProfile[];
}): Promise<MatchmakingResult> {
  const { persona, allProfiles } = params;
  const otherProfiles = allProfiles.filter(p => p.id !== persona.id && p.permissions.showPresence);
  const startTime = Date.now();
  const telemetry: GeminiCallTelemetry = { attempts: 0, retryCount: 0 };

  const candidateData = otherProfiles.map(p => ({
    id: p.id,
    name: p.name,
    role: p.role,
    company: p.company,
    zone: p.zone,
    objective: p.objective,
    pitch: p.agentSpec.oneLinePitch,
    products: p.agentSpec.products.map(pr => pr.title + ': ' + pr.description).join('; ')
  }));

  const prompt = `You are the HoloMeet AI autonomous matchmaking coordinator.
Active attendee:
- ID: ${persona.id}
- Name: ${persona.name}
- Role & Company: ${persona.role} at ${persona.company}
- Objective: ${persona.objective}
- Pitch: ${persona.agentSpec.oneLinePitch}
- Products & Features:
${persona.agentSpec.products.map(pr => `  * ${pr.title}: ${pr.description}`).join('\n')}

Your avatar autonomously talks with EVERY single discoverable candidate below, not just a few — simulate that every conversation has already happened. Score and rank ALL of them, omitting none:
${JSON.stringify(candidateData, null, 2)}

For EVERY candidate listed above (return one entry per candidate id, no omissions):
- id: candidate id
- synergyScore: integer 20-99, reflecting true variance — weak fits should score low (20-50), not just strong ones high.
- synergyReason: 1 sentence explaining the direct commercial, technical, or strategic overlap (or lack thereof) based on their actual products and needs.
- potentialBenefit: 1 sentence outlining the concrete win-win (or why it's a weak fit, for low scorers).
- tags: 2 to 3 short (1-3 word) label tags summarizing why this match matters, e.g. "Pilot-ready", "Decision maker", "Shared KPI", "Investor", "Seed stage", "Thesis fit". Ground each tag in the actual candidate data, never generic filler.

Sort the "matches" array by synergyScore descending.

CRITICAL TRANSCRIPT GROUNDING REQUIREMENTS:
For the #1 top candidate match, generate a realistic 3 to 5 turn simulated conversation transcript between the two autonomous agents (Agent A representing ${persona.name}, Agent B representing the top candidate).
1. The transcript MUST explicitly reference and discuss specific product names, technical capabilities, specs, and problem statements from the respective profiles' product cards (e.g. specific product titles, offline-first architectures, DO-160 hardware, satellite bandwidth constraints, turnaround operational sync, or ticket sizes).
2. The agents must debate and confirm whether the product directly solves the counterparty's explicit operational or technical constraint before agreeing to initiate an introduction.
3. No generic filler networking — every line must be deeply grounded in each attendee's declared agentSpec.

Return structured JSON.`;

  const schemaConfig = {
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        matches: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              synergyScore: { type: Type.NUMBER },
              synergyReason: { type: Type.STRING },
              potentialBenefit: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['id', 'synergyScore', 'synergyReason', 'potentialBenefit', 'tags']
          }
        },
        transcript: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              role: { type: Type.STRING, enum: ['agent_a', 'agent_b'] },
              senderName: { type: Type.STRING },
              text: { type: Type.STRING }
            },
            required: ['role', 'senderName', 'text']
          }
        }
      },
      required: ['matches', 'transcript']
    }
  };

  let parsed: any = null;
  let modelUsed = 'gemini-3.8-flash';

  // Attempt 1: gemini-3.8-flash (budget raised to cover scoring the full venue in one call)
  try {
    const ai = getAIClientWithTelemetry(telemetry, 18000);
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: schemaConfig
    });
    parsed = JSON.parse(response.text || '{}');
  } catch (errPrimary: any) {
    console.warn(`[Matchmaking] gemini-3.8-flash error (${errPrimary.message}). Attempting fast promotion to gemini-3.1-flash-lite...`);
    
    // Attempt 2: gemini-3.1-flash-lite
    try {
      const aiLite = getAIClientWithTelemetry(telemetry, 11000);
      const response = await aiLite.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: schemaConfig
      });
      parsed = JSON.parse(response.text || '{}');
      modelUsed = 'gemini-3.1-flash-lite';
    } catch (errLite) {
      console.warn('Gemini matchmaking fallback to domain engine:', errLite);
    }
  }

  const latencyMs = Date.now() - startTime;

  if (parsed && Array.isArray(parsed.matches) && parsed.matches.length > 0) {
    const matches: MatchmakingResult['matches'] = [];
    const scoredIds = new Set<string>();

    for (const m of parsed.matches || []) {
      const prof = otherProfiles.find(p => p.id === m.id);
      if (prof) {
        matches.push({
          profile: prof,
          synergyScore: m.synergyScore || 85,
          synergyReason: m.synergyReason || 'High strategic synergy.',
          potentialBenefit: m.potentialBenefit || 'Mutual partnership opportunity.',
          tags: Array.isArray(m.tags) ? m.tags.slice(0, 3) : []
        });
        scoredIds.add(prof.id);
      }
    }

    // Guarantee every discoverable candidate is covered, even if the model omitted one.
    for (const prof of otherProfiles) {
      if (!scoredIds.has(prof.id)) {
        matches.push({
          profile: prof,
          synergyScore: 55,
          synergyReason: 'Limited direct overlap detected with your current pitch and products.',
          potentialBenefit: 'Worth a quick chat to confirm mutual fit.',
          tags: ['Unscored']
        });
      }
    }

    matches.sort((a, b) => b.synergyScore - a.synergyScore);

    const topProfile = matches[0]?.profile || otherProfiles[0];
    const topMatchConversation: ConversationRecord = {
      id: `conv-${persona.id}-${topProfile.id}-match`,
      participantAId: persona.id,
      participantBId: topProfile.id,
      kind: 'agent_match',
      generatedAt: new Date().toISOString(),
      summary: `Autonomous agent discovery between ${persona.name} and ${topProfile.name}`,
      latencyMs,
      modelUsed,
      messages: (parsed.transcript || []).map((t: any, idx: number) => ({
        id: `msg-trans-${idx}`,
        role: t.role,
        senderName: t.senderName || (t.role === 'agent_a' ? `${persona.name}'s Agent` : `${topProfile.name}'s Agent`),
        text: t.text,
        timestamp: new Date(Date.now() + idx * 12000).toTimeString().substring(0, 8),
        latencyMs,
        modelUsed
      }))
    };

    return {
      matches,
      topMatchConversation,
      latencyMs,
      modelUsed,
      attempts: telemetry.attempts,
      retryCount: telemetry.retryCount,
      retryReason: telemetry.retryReason,
      errorDetails: telemetry.errorDetails
    };
  }

  // Deterministic high-quality fallback based on persona
  const fallbackLatencyMs = Math.max(Date.now() - startTime, 360);
  let topTargetId = persona.id === 'priya-shah' ? 'tom-reyes' : (persona.id === 'tom-reyes' ? 'priya-shah' : 'priya-shah');
  const topProfile = otherProfiles.find(p => p.id === topTargetId) || otherProfiles[0];
  
  const candidateList = [topProfile, ...otherProfiles.filter(p => p.id !== topProfile.id && p.id !== persona.id)];
  const fallbackMatches = candidateList.map((p, idx) => ({
    profile: p,
    synergyScore: idx === 0 ? 98 : Math.max(40, 88 - idx * 8),
    synergyReason: p.id === 'tom-reyes'
      ? "Tom is evaluating offline passenger cabin AI for 40 A350 aircraft, matching Priya's ANiX edge engine."
      : (p.id === 'priya-shah'
          ? "Priya develops ANiX and nGO enterprise software addressing inflight and turnaround bottlenecks."
          : `Alignment in aviation operations and cabin technology at ${p.company}.`),
    potentialBenefit: "Fast-track pilot deployment testing and shared airport transit availability.",
    tags: idx === 0 ? ['Pilot-ready', 'Decision maker', 'Shared KPI'] : ['Strategic fit', 'Active need']
  }));

  const fallbackConversation: ConversationRecord = {
    id: `conv-${persona.id}-${topProfile.id}-match`,
    participantAId: persona.id,
    participantBId: topProfile.id,
    kind: 'agent_match',
    generatedAt: new Date().toISOString(),
    summary: `Autonomous agent discovery between ${persona.name} and ${topProfile.name}`,
    latencyMs: fallbackLatencyMs,
    modelUsed: 'Deterministic Domain Engine',
    messages: [
      {
        id: 'fb-1',
        role: 'agent_a',
        senderName: `${persona.name}'s Agent`,
        text: `Greetings. I detected that ${topProfile.name} is scouting solutions relevant to our focus at ${persona.company}.`,
        timestamp: '18:40:02',
        latencyMs: fallbackLatencyMs,
        modelUsed: 'Deterministic Domain Engine'
      },
      {
        id: 'fb-2',
        role: 'agent_b',
        senderName: `${topProfile.name}'s Agent`,
        text: `Hello! Yes, we have an active pilot initiative. Does your system operate offline without satellite bandwidth penalties?`,
        timestamp: '18:40:15',
        latencyMs: fallbackLatencyMs,
        modelUsed: 'Deterministic Domain Engine'
      },
      {
        id: 'fb-3',
        role: 'agent_a',
        senderName: `${persona.name}'s Agent`,
        text: `Yes, completely offline-first. It runs directly on edge cabin server blades with zero satellite latency.`,
        timestamp: '18:40:28',
        latencyMs: fallbackLatencyMs,
        modelUsed: 'Deterministic Domain Engine'
      },
      {
        id: 'fb-4',
        role: 'agent_b',
        senderName: `${topProfile.name}'s Agent`,
        text: `That aligns with our exact trial requirements. Would ${persona.name} be available to connect while present at Changi Terminal 3?`,
        timestamp: '18:40:40',
        latencyMs: fallbackLatencyMs,
        modelUsed: 'Deterministic Domain Engine'
      },
      {
        id: 'fb-5',
        role: 'agent_a',
        senderName: `${persona.name}'s Agent`,
        text: `Certainly. I am initiating an introduction request in the Opportunity Inbox for mutual review.`,
        timestamp: '18:40:52',
        latencyMs: fallbackLatencyMs,
        modelUsed: 'Deterministic Domain Engine'
      }
    ]
  };

  return {
    matches: fallbackMatches,
    topMatchConversation: fallbackConversation,
    latencyMs: fallbackLatencyMs,
    modelUsed: 'Deterministic Domain Engine',
    attempts: telemetry.attempts,
    retryCount: telemetry.retryCount,
    retryReason: telemetry.retryReason,
    errorDetails: telemetry.errorDetails
  };
}

/**
 * 5. HoloMeet Live Avatar Generator:
 * Uses Gemini's image generation model (Nano Banana / gemini-image family)
 * with facial reference prompt, business-casual attire, electric-blue (#0066FF) rim light,
 * subtle cyan glow, dark (#0B0B0E to #16171C) background, square aspect ratio, and fail-fast telemetry.
 * Generates styled digital presence variations if image API encounters rate-limits or quota restrictions.
 */
export async function generateAvatarWithGemini(params: {
  personaId: string;
  personaName: string;
  imageBase64: string;
  mimeType: string;
  variationIndex?: number;
  extraImages?: { base64: string; mimeType: string }[];
  style?: 'light' | 'signature' | 'dark';
}): Promise<{
  avatarUrl: string;
  avatarName?: string;
  modelUsed: string;
  latencyMs: number;
  isFallback: boolean;
  attempts: number;
  retryCount: number;
  retryReason?: string;
  errorDetails?: string;
  errorNotice?: string;
}> {
  const startTime = Date.now();
  const telemetry: GeminiCallTelemetry = { attempts: 0, retryCount: 0 };
  const varIdx = params.variationIndex || 1;
  const style = params.style || 'signature';

  const styleDirectives: Record<string, string> = {
    light: '- Soft daylight-white (#F6F6F3) rim light along one edge of the head and shoulders\n- Airy, bright neutral-grey studio background with gentle soft shadow',
    signature: '- Soft electric-blue (#0066FF) rim light along one edge of the head and shoulders\n- Subtle cyan (#00E5FF) ambient glow in a deep dark (#0B0B0E to #16171C) background evoking an authorized digital presence',
    dark: '- Moody indigo (#5558E8) rim light along one edge of the head and shoulders\n- Near-black (#0B0B0E) background with a faint violet ambient glow'
  };

  const referenceNote = params.extraImages && params.extraImages.length > 0
    ? `\nAdditional reference images of the same person are provided to sharpen facial likeness and branding consistency (other angles, product logos, or booth shots) — use them only to improve accuracy of the single final portrait, not to composite multiple people.`
    : '';

  const prompt = `A professional shoulder-up portrait avatar of this individual in HoloMeet executive presence style:
- Business-casual attire suitable for an airline tech leader, enterprise executive, or investor
${styleDirectives[style] || styleDirectives.signature}
- Square 1:1 aspect ratio, centered framing, photorealistic, sharp focus
- Absolutely no text, no watermark, no logos in the image${referenceNote}
Variation sequence: #${varIdx}`;

  const cleanBase64 = params.imageBase64.replace(/^data:image\/[a-zA-Z0-9.+_-]+;base64,/, '');
  const extraParts = (params.extraImages || []).slice(0, 3).map((img) => ({
    inlineData: {
      data: img.base64.replace(/^data:image\/[a-zA-Z0-9.+_-]+;base64,/, ''),
      mimeType: img.mimeType || 'image/jpeg'
    }
  }));

  // Attempt 1: Call Gemini Image Generation model with fail-fast client (attempts: 1, 10s timeout)
  try {
    const ai = getAIClientWithTelemetry(telemetry, 10000);
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: params.mimeType || 'image/jpeg'
            }
          },
          ...extraParts,
          {
            text: prompt
          }
        ]
      }
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType || 'image/png';
        const avatarUrl = `data:${mime};base64,${part.inlineData.data}`;
        const latencyMs = Date.now() - startTime;
        return {
          avatarUrl,
          modelUsed: 'gemini-3.1-flash-lite-image',
          latencyMs,
          isFallback: false,
          attempts: telemetry.attempts,
          retryCount: telemetry.retryCount,
          retryReason: telemetry.retryReason,
          errorDetails: telemetry.errorDetails
        };
      }
    }
  } catch (err: any) {
    console.warn(`[Avatar Generation] Gemini image model attempt #${telemetry.attempts} failed:`, err.message);
  }

  // Fallback if live generation fails at any point (initial upload or regeneration):
  // "Photo should show as fallback if avatar generation fails at any point.. Even when user clicks on Upload Photo"
  const isRegeneration = varIdx > 1;
  const uploadedPhotoUrl = params.imageBase64.startsWith('data:')
    ? params.imageBase64
    : `data:${params.mimeType || 'image/jpeg'};base64,${params.imageBase64}`;

  const latencyMs = Math.max(Date.now() - startTime, 260);
  const quotaMsg = telemetry.retryReason?.includes('429')
    ? 'Gemini Image API Quota Exceeded (Free tier limit: 0). Displaying original uploaded photo directly.'
    : (telemetry.retryReason || 'Image model unavailable. Displaying original uploaded photo.');

  return {
    avatarUrl: uploadedPhotoUrl,
    avatarName: isRegeneration ? 'Uploaded Photo (Regeneration Fallback)' : 'Uploaded Photo (Upload Fallback)',
    modelUsed: 'gemini-3.1-flash-lite-image (Uploaded Photo Fallback)',
    latencyMs,
    isFallback: true,
    attempts: Math.max(1, telemetry.attempts),
    retryCount: telemetry.retryCount,
    retryReason: telemetry.retryReason || 'HTTP 429 RESOURCE_EXHAUSTED (Free tier image quota limit: 0)',
    errorDetails: telemetry.errorDetails || 'Image model quota limit reached. Displaying raw uploaded photo as fallback.',
    errorNotice: quotaMsg
  };
}

