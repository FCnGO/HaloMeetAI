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
  onDeclineOpportunity
}) => {
  const [subTab, setSubTab] = useState<'messages' | 'requests'>('messages');
  const [processingId, setProcessingId] = useState<string | null>(null);

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

  const agentThreads = conversations
    .filter(c => c.kind === 'visitor_chat' && (c.participantAId === currentPersona.id || c.participantBId === currentPersona.id))
    .map(c => {
      const counterpartyId = c.participantAId === currentPersona.id ? c.participantBId : c.participantAId;
      const profile = allProfiles.find(p => p.id === counterpartyId);
      const lastMsg = c.messages[c.messages.length - 1];
      return profile && lastMsg ? { profile, lastMsg, conv: c } : null;
    })
    .filter((x): x is { profile: UserProfile; lastMsg: ConversationRecord['messages'][number]; conv: ConversationRecord } => x !== null)
    .sort((a, b) => new Date(b.conv.generatedAt).getTime() - new Date(a.conv.generatedAt).getTime());

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
                {agentThreads.map(({ profile, lastMsg }) => {
                  const pastel = getPastelTheme(profile.id);
                  return (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => onOpenChat(profile, 'agent')}
                      className="clean-card w-full p-3 flex items-center gap-3 text-left cursor-pointer hover:border-[#16171A] transition-colors"
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
                          <span className="font-semibold text-[15px] text-[#16171A] truncate">{profile.name}'s avatar</span>
                          <span className="text-[11px] text-[#8E9097] shrink-0">AI avatar</span>
                        </div>
                        <p className="text-[13px] text-[#8E9097] truncate">{lastMsg.text}</p>
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
    </div>
  );
};
