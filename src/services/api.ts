import { AppState, UserProfile, SearchMatchResult, ConversationRecord, MatchmakingResult, OpportunityRecord } from '../types';

export const api = {
  async getState(viewerId?: string): Promise<AppState> {
    const res = await fetch(`/api/state${viewerId ? `?viewerId=${viewerId}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch app state');
    return res.json();
  },

  async switchPersona(personaId: string): Promise<{ currentPersonaId: string; state: AppState }> {
    const res = await fetch('/api/persona/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personaId })
    });
    if (!res.ok) throw new Error('Failed to switch persona');
    return res.json();
  },

  async switchVenue(venueId: string): Promise<{ selectedVenueId: string }> {
    const res = await fetch('/api/venue/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ venueId })
    });
    if (!res.ok) throw new Error('Failed to switch venue');
    return res.json();
  },

  async saveProfile(profile: UserProfile): Promise<{ profile: UserProfile }> {
    const res = await fetch('/api/profile/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile })
    });
    if (!res.ok) throw new Error('Failed to save profile');
    return res.json();
  },

  async generatePresence(params: {
    name: string;
    role: string;
    company: string;
    objective: string;
    rawDescription: string;
  }): Promise<{ agentSpec: UserProfile['agentSpec'] }> {
    const res = await fetch('/api/presence/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Failed to generate presence');
    return res.json();
  },

  async searchDiscovery(params: {
    query: string;
    viewerId: string;
    venueId?: string;
  }, signal?: AbortSignal): Promise<{ matches: SearchMatchResult[]; isFallback?: boolean }> {
    const res = await fetch('/api/discovery/search', {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(params)
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const rawText = await res.text();
      throw new Error(`Invalid response (${res.status}): Server returned HTML instead of JSON`);
    }

    const data = await res.json();
    if (!res.ok || data?.success === false) {
      throw new Error(data?.error || `Search failed with status ${res.status}`);
    }
    return data;
  },

  async getChatHistory(targetProfileId: string, visitorProfileId: string): Promise<{ conversation: ConversationRecord }> {
    const res = await fetch('/api/chat/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetProfileId, visitorProfileId })
    });
    if (!res.ok) throw new Error('Failed to fetch chat history');
    return res.json();
  },

  async sendChatMessage(params: {
    targetProfileId: string;
    visitorProfileId: string;
    message: string;
    conversationId?: string;
  }): Promise<{
    message: ConversationRecord['messages'][0];
    conversation: ConversationRecord;
    opportunityCreated: boolean;
    state?: AppState;
  }> {
    const res = await fetch('/api/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Failed to send chat message');
    return res.json();
  },

  async runMatchmaking(personaId: string, forceRefresh = false): Promise<MatchmakingResult & { cached: boolean }> {
    const res = await fetch('/api/matchmaking/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personaId, forceRefresh })
    });
    if (!res.ok) throw new Error('Failed to run matchmaking analysis');
    return res.json();
  },

  async requestOpportunity(params: {
    senderId: string;
    receiverId: string;
    initialNote: string;
    conversationId?: string;
  }): Promise<{ opportunity: OpportunityRecord; state: AppState }> {
    const res = await fetch('/api/opportunities/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to request opportunity');
    }
    return res.json();
  },

  async approveOpportunity(oppId: string, approverId: string): Promise<{ opportunity: OpportunityRecord; state: AppState }> {
    const res = await fetch('/api/opportunities/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oppId, approverId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to approve opportunity');
    }
    return res.json();
  },

  async declineOpportunity(oppId: string, declinerId: string): Promise<{ opportunity: OpportunityRecord; state: AppState }> {
    const res = await fetch('/api/opportunities/decline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oppId, declinerId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to decline opportunity');
    }
    return res.json();
  },

  async resetState(): Promise<{ state: AppState }> {
    const res = await fetch('/api/state/reset', { method: 'POST' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to reset state');
    }
    return res.json();
  },

  async getAiActivityLogs(): Promise<import('../types').AiActivityLogEntry[]> {
    const res = await fetch('/api/activity/logs');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch AI activity logs');
    }
    const data = await res.json();
    return data.logs || [];
  },

  async generateAvatar(params: {
    personaId: string;
    imageBase64: string;
    mimeType: string;
    variationIndex?: number;
    extraImages?: { base64: string; mimeType: string }[];
    style?: 'light' | 'signature' | 'dark';
  }): Promise<{
    success: boolean;
    avatarUrl: string;
    modelUsed: string;
    isFallback: boolean;
    latencyMs: number;
    errorNotice?: string;
  }> {
    const res = await fetch('/api/avatar/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await res.json();
    if (!res.ok && !data.avatarUrl) {
      throw new Error(data.error || 'Failed to generate avatar');
    }
    return data;
  }
};
