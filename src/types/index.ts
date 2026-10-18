export interface ProductItem {
  id: string;
  title: string;
  description: string;
  suggestedQuestions: string[];
}

export interface AgentSpec {
  oneLinePitch: string;
  elevatorPitch: string;
  products: ProductItem[];
  approvedTopics: string[];
  disallowedTopics: string[];
  tone: string;
  latencyMs?: number;
  modelUsed?: string;
  generatedWithGemini?: boolean;
}

export interface AgentPermissions {
  autoAnswerProducts: boolean;
  requireApprovalForMeetings: boolean;
  shareContactAfterApproval: boolean;
  showPresence: boolean;
}

export interface ContactInfo {
  email: string;
  phone?: string;
  linkedin?: string;
  title?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  venueId: string;
  zone: string;
  availabilityMinutes: number;
  availableUntil: string;
  rawDescription: string;
  objective: 'find_partners' | 'sell_products' | 'invest' | 'network';
  contactInfo: ContactInfo;
  agentSpec: AgentSpec;
  permissions: AgentPermissions;
  isHero?: boolean;
}

export interface Venue {
  id: string;
  name: string;
  code: string;
  city: string;
  terminal: string;
  zones: string[];
  activeAttendeesCount: number;
}

export interface PersonMessage {
  id: string;
  fromMe: boolean;
  text: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'agent_a' | 'agent_b' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  isPermissionNotice?: boolean;
  latencyMs?: number;
  modelUsed?: string;
  attempts?: number;
  retryCount?: number;
}

export interface ConversationRecord {
  id: string;
  participantAId: string;
  participantBId: string;
  kind: 'visitor_chat' | 'agent_match';
  messages: ChatMessage[];
  generatedAt: string;
  summary?: string;
  latencyMs?: number;
  modelUsed?: string;
  attempts?: number;
  retryCount?: number;
}

export interface OpportunityRecord {
  id: string;
  senderId: string;
  receiverId: string;
  senderApproved: boolean;
  receiverApproved: boolean;
  status: 'pending' | 'connected' | 'declined';
  initialNote: string;
  conversationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchMatchResult {
  profile: UserProfile;
  relevanceScore: number;
  matchReason: string;
  matchedQueryLanguage?: string;
  isFallback?: boolean;
  latencyMs?: number;
  modelUsed?: string;
  attempts?: number;
  retryCount?: number;
  retryReason?: string;
  errorDetails?: string;
}

export interface MatchmakingSynergy {
  profile: UserProfile;
  synergyScore: number;
  synergyReason: string;
  potentialBenefit: string;
  tags?: string[];
}

export interface MatchmakingResult {
  matches: MatchmakingSynergy[];
  topMatchConversation: ConversationRecord;
  matchConversations?: ConversationRecord[];
  latencyMs?: number;
  modelUsed?: string;
  attempts?: number;
  retryCount?: number;
  retryReason?: string;
  errorDetails?: string;
}

export interface AiActivityLogEntry {
  id: string;
  timestamp: string;
  timeFormatted: string;
  feature: 'Venue Discovery Search' | 'Avatar Chat Reply' | 'Matchmaking Transcript' | 'Profile Generation' | 'Avatar Generation';
  personaId: string;
  personaName: string;
  input: string;
  latencyMs: number;
  model: string;
  outputExcerpt: string;
  status: 'success' | 'fallback';
  attempts?: number;
  retryCount?: number;
  retryReason?: string;
  errorDetails?: string;
}

export interface AppState {
  currentPersonaId: string;
  selectedVenueId: string;
  profiles: UserProfile[];
  venues: Venue[];
  opportunities: OpportunityRecord[];
  conversations: ConversationRecord[];
  aiActivityLogs?: AiActivityLogEntry[];
}
