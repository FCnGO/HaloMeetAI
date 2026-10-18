import React, { useState } from 'react';
import { UserProfile, ConversationRecord, OpportunityRecord, PersonMessage, MatchmakingResult } from '../types';
import { getPastelTheme } from '../utils/pastel';

interface ChatsListScreenProps {
  currentPersona: UserProfile;
  allProfiles: UserProfile[];
  conversations: ConversationRecord[];
  personConversations: Record<string, PersonMessage[]>;
  opportunities: OpportunityRecord[];
  matchmakingResult?: MatchmakingResult | null;
  onOpenChat: (profile: UserProfile, initialTab: 'agent' | 'person') => void;
  onNavigateToDiscovery: () => void;
  onApproveOpportunity: (oppId: string) => Promise<void>;
  onDeclineOpportunity: (oppId: string) => Promise<void>;
  onRequestIntroduction?: (targetProfileId: string, initialNote: string, conversationId?: string) => Promise<void>;
}

const StarRating: React.FC<{ score: number }> = ({ score }) => {
  const stars = Math.max(1, Math.min(5, Math.round(score / 20)));
  return (
    <div className="flex items-center gap-0.5" aria-label={`${stars} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={`w-3 h-3 ${i < stars ? 'fill-[#5558E8] text-[#5558E8]' : 'fill-none text-[#D8D8D3]'}`}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        >
          <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
        </svg>
      ))}
    </div>
  );
};

export const ChatsListScreen: React.FC<ChatsListScreenProps> = ({
  currentPersona,
  allProfiles,
  conversations,
  personConversations,
  opportunities,
  matchmakingResult,
  onOpenChat,
  onNavigateToDiscovery,
  onApproveOpportunity,
  onDeclineOpportunity,
  onRequestIntroduction
}) => {
  const [subTab, setSubTab] = useState<'messages' | 'requests'>('messages');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedTranscript, setSelectedTranscript] = useState<ConversationRecord | null>(null);
  const [isRequestingIntro, setIsRequestingIntro] = useState(false);

  const personKeyPrefix = `${currentPersona.id}:`;
  const peopleThreads = Object.entries(personConversations)
    .filter(([key]) => key.startsWith(personKeyPrefix))
    .map(([key, msgs]) => {
      const profileId = key.slice(personKeyPrefix.length);
      const profile = allProfiles.find(p => p.id === profileId);
      const lastMsg = msgs[msgs.length - 1];
      return profile && lastMsg ? { profile, lastMsg } : null;
    })
    .filter((x): x is { profile: UserProfile; lastMsg: PersonMessage } => x !== null)
    .sort((a, b) => b.lastMsg.timestamp.localeCompare(a.lastMsg.timestamp));

  const matchScoreById: Record<string, number> = {};
  (matchmakingResult?.matches || []).forEach(m => {
    matchScoreById[m.profile.id] = m.synergyScore;
  });

  const agentThreads = conversations
    .filter(c => (c.kind === 'visitor_chat' || c.kind === 'agent_match') && (c.participantAId === currentPersona.id || c.participantBId === currentPersona.id))
    .map(c => {
      const counterpartyId = c.participantAId === currentPersona.id ? c.participantBId : c.participantAId;
      const profile = allProfiles.find(p => p.id === counterpartyId);
      const lastMsg = c.messages[c.messages.length - 1];
      return profile && lastMsg ? { profile, lastMsg, conv: c, score: matchScoreById[counterpartyId] } : null;
    })
    .filter((x): x is { profile: UserProfile; lastMsg: ConversationRecord['messages'][number]; conv: ConversationRecord; score: number } => x !== null)
    .sort((a, b) => {
      // Best avatar-to-avatar match surfaces first; everything else falls back to recency.
      const scoreA = a.conv.kind === 'agent_match' ? (a.score ?? -1) : -1;
      const scoreB = b.conv.kind === 'agent_match' ? (b.score ?? -1) : -1;
      if (scoreA !== scoreB) return scoreB - scoreA;
      return new Date(b.conv.generatedAt).getTime() - new Date(a.conv.generatedAt).getTime();
    });

  const pendingRequests = opportunities
    .filter(o => o.receiverId === currentPersona.id && !o.receiverApproved && o.status !== 'declined')
    .map(o => {
      const sender = allProfiles.find(p => p.id === o.senderId);
      const match = matchmakingResult?.matches.find(m => m.profile.id === o.senderId);
      return sender ? { opp: o, sender, score: match?.synergyScore } : null;
    })
    .filter((x): x is { opp: OpportunityRecord; sender: UserProfile; score: number | undefined } => x !== null);

  const handleAccept = async (oppId: string) => {
    setProcessingId(oppId);
    try {
      await onApproveOpportunity(oppId);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (oppId: string) => {
    setProcessingId(oppId);
    try {
      await onDeclineOpportunity(oppId);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRequestIntroFromTranscript = async (counterpartyId: string, note: string, conversationId?: string) => {
    if (!onRequestIntroduction) return;
    setIsRequestingIntro(true);
    try {
      await onRequestIntroduction(counterpartyId, note, conversationId);
      setSelectedTranscript(null);
    } finally {
      setIsRequestingIntro(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-[430px] mx-auto pb-24">
      <h1 className="font-semibold text-[#16171A] text-[28px] tracking-tight">Chats</h1>

      {/* Messages / Requests Toggle */}
      <div className="inline-flex items-center p-1 bg-[#E6E6E2] rounded-full w-full">
        {([
          { id: 'messages' as const, label: 'Messages', count: 0 },
          { id: 'requests' as const, label: 'Requests', count: pendingRequests.length }
        ]).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSubTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
              subTab === t.id ? 'bg-white text-[#16171A] shadow-xs' : 'text-[#5A5C63]'
            }`}
          >
            <span>{t.label}</span>
            {t.count > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#5558E8] text-white text-[11px] font-semibold flex items-center justify-center">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {subTab === 'messages' ? (
        <>
          {/* PEOPLE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#8E9097] uppercase tracking-wider">People</span>
              <span className="text-xs text-[#8E9097]">Direct messages</span>
            </div>
            {peopleThreads.length === 0 ? (
              <div className="clean-card p-4 text-xs text-[#8E9097]">
                No direct messages yet.
              </div>
            ) : (
              <div className="space-y-2">
                {peopleThreads.map(({ profile, lastMsg }) => {
                  const pastel = getPastelTheme(profile.id);
                  return (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => onOpenChat(profile, 'person')}
                      className="clean-card w-full p-3 flex items-center gap-3 text-left cursor-pointer hover:border-[#16171A] transition-colors"
                    >
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="w-11 h-11 rounded-full object-cover ring-2 shrink-0"
                        style={{ borderColor: pastel.border }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-[15px] text-[#16171A] truncate">{profile.name}</span>
                          <span className="text-[11px] text-[#8E9097] shrink-0">{lastMsg.timestamp}</span>
                        </div>
                        <p className="text-[13px] text-[#8E9097] truncate">{lastMsg.text}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* AGENTS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#8E9097] uppercase tracking-wider">Avatars</span>
              <span className="text-xs text-[#8E9097]">Answers from approved knowledge</span>
            </div>
            {agentThreads.length === 0 ? (
              <div className="clean-card p-4 text-xs text-[#8E9097]">
                No avatar conversations yet.
              </div>
            ) : (
              <div className="space-y-2">
                {agentThreads.map(({ profile, lastMsg, conv, score }, idx) => {
                  const pastel = getPastelTheme(profile.id);
                  const isMatch = conv.kind === 'agent_match';
                  const isTopMatch = isMatch && idx === 0 && typeof score === 'number';
                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => isMatch ? setSelectedTranscript(conv) : onOpenChat(profile, 'agent')}
                      className={`clean-card w-full p-3 flex items-center gap-3 text-left cursor-pointer hover:border-[#16171A] transition-colors ${isTopMatch ? 'ring-1 ring-[#5558E8]' : ''}`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={profile.avatar}
                          alt={profile.name}
                          className="w-11 h-11 rounded-full object-cover ring-2"
                          style={{ borderColor: pastel.border }}
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 text-[8px] font-bold text-white bg-[#5558E8] px-1 py-0.1 rounded-full border border-white">
                          AI
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-[15px] text-[#16171A] truncate">
                            {isMatch ? `My avatar ↔ ${profile.name}'s avatar` : `${profile.name}'s avatar`}
                          </span>
                          {isMatch && typeof score === 'number' ? (
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${isTopMatch ? 'bg-[#5558E8] text-white' : 'bg-[#EEF0FD] text-[#5558E8]'}`}>
                              {isTopMatch ? `#1 · ${score}%` : `${score}%`}
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#8E9097] shrink-0">{isMatch ? 'Autonomous match' : 'AI avatar'}</span>
                          )}
                        </div>
                        <p className="text-[13px] text-[#8E9097] truncate">{conv.summary || lastMsg.text}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <p className="text-xs text-[#8E9097] text-center leading-relaxed pt-2">
            Tap anyone on the{' '}
            <button type="button" onClick={onNavigateToDiscovery} className="underline text-[#5558E8] font-medium cursor-pointer">
              radar
            </button>{' '}
            to message them or ask their avatar.
          </p>
        </>
      ) : (
        <div className="space-y-3">
          {pendingRequests.length === 0 ? (
            <div className="clean-card p-8 text-center space-y-2">
              <div className="text-xs font-semibold text-[#16171A]">No pending requests</div>
              <p className="text-[11px] text-[#8E9097]">Introduction requests from other avatars will show up here.</p>
            </div>
          ) : (
            pendingRequests.map(({ opp, sender, score }) => {
              const pastel = getPastelTheme(sender.id);
              const isProcessing = processingId === opp.id;
              return (
                <div key={opp.id} className="clean-card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={sender.avatar}
                        alt={sender.name}
                        className="w-11 h-11 rounded-full object-cover ring-2 shrink-0"
                        style={{ borderColor: pastel.border }}
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-[15px] text-[#16171A] truncate">{sender.name}</div>
                        <div className="text-[13px] text-[#8E9097] truncate">{sender.role}, {sender.company}</div>
                      </div>
                    </div>
                    {typeof score === 'number' && <StarRating score={score} />}
                  </div>

                  <p className="text-sm text-[#16171A] leading-relaxed">
                    <span className="text-[#5558E8] font-semibold">{sender.name.split(' ')[0]}'s avatar:</span> {opp.initialNote}
                  </p>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleDecline(opp.id)}
                      className="btn-secondary-pill h-10 w-full text-sm font-semibold disabled:opacity-50"
                    >
                      <span>Decline</span>
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleAccept(opp.id)}
                      className="btn-primary-pill h-10 w-full text-sm font-semibold shadow-xs disabled:opacity-50"
                    >
                      <span>Accept</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {selectedTranscript && (() => {
        const conv = selectedTranscript;
        const counterpartyId = conv.participantAId === currentPersona.id ? conv.participantBId : conv.participantAId;
        const counterparty = allProfiles.find(p => p.id === counterpartyId);
        if (!counterparty) return null;
        const pastel = getPastelTheme(counterparty.id);
        const score = matchScoreById[counterparty.id];
        const alreadyRequested = opportunities.some(o => o.conversationId === conv.id);
        return (
          <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
            <div className="bg-white border-t sm:border border-[#D8D8D3] rounded-t-3xl sm:rounded-3xl max-w-[430px] w-full p-5 shadow-2xl relative max-h-[85vh] flex flex-col space-y-3.5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E2DC]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={counterparty.avatar}
                    alt={counterparty.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 shrink-0"
                    style={{ borderColor: pastel.border }}
                  />
                  <div className="min-w-0">
                    <span className="font-semibold text-sm text-[#16171A] block truncate">
                      My avatar ↔ {counterparty.name}'s avatar
                    </span>
                    <span className="text-[11px] text-[#8E9097]">
                      {typeof score === 'number' ? `${score}% synergy · ` : ''}{conv.messages.length} turns
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTranscript(null)}
                  className="w-8 h-8 rounded-full bg-[#F6F6F3] flex items-center justify-center text-[#5A5C63] hover:text-[#16171A] cursor-pointer shrink-0"
                >
                  <span className="text-lg leading-none">&times;</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
                {conv.messages.map((msg) => {
                  const isMyConv = conv.participantAId === currentPersona.id;
                  const isMine = isMyConv ? msg.role === 'agent_a' : msg.role === 'agent_b';
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMine ? 'items-start' : 'items-end'}`}>
                      <span className="text-[10px] text-[#8E9097] font-medium mb-0.5 px-1">{msg.senderName}</span>
                      <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                        isMine ? 'bg-[#F6F6F3] text-[#16171A] rounded-tl-sm' : 'bg-[#5558E8] text-white rounded-tr-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-1 space-y-2">
                {alreadyRequested ? (
                  <div className="text-xs text-center text-[#8E9097] py-1.5">Introduction already requested</div>
                ) : (
                  <button
                    type="button"
                    disabled={isRequestingIntro || !onRequestIntroduction}
                    onClick={() => handleRequestIntroFromTranscript(counterparty.id, conv.summary || conv.messages[conv.messages.length - 1]?.text || '', conv.id)}
                    className="btn-primary-pill w-full h-11 text-sm font-semibold shadow-xs disabled:opacity-60"
                  >
                    <span>{isRequestingIntro ? 'Sending...' : 'Request introduction'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTranscript(null);
                    onOpenChat(counterparty, 'person');
                  }}
                  className="btn-secondary-pill w-full h-11 text-sm font-semibold"
                >
                  <span>Message {counterparty.name.split(' ')[0]} directly</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
