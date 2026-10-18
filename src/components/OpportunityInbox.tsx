import React, { useState } from 'react';
import { OpportunityRecord, UserProfile, ConversationRecord, MatchmakingResult } from '../types';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  Lock,
  Unlock,
  MessageSquare,
  Sparkles,
  X,
  AlertCircle,
  RotateCw,
  ChevronLeft,
  Send
} from 'lucide-react';
import { getPastelTheme } from '../utils/pastel';

interface OpportunityInboxProps {
  currentPersona: UserProfile;
  opportunities: OpportunityRecord[];
  allProfiles: UserProfile[];
  conversations: ConversationRecord[];
  onApproveOpportunity: (oppId: string) => Promise<void>;
  onDeclineOpportunity: (oppId: string) => Promise<void>;
  onOpenChatWithProfile: (profile: UserProfile) => void;
  onSwitchPersona: (personaId: string) => void;
  onRefresh?: (viewerId?: string) => Promise<any> | void;
  matchmakingResult?: MatchmakingResult | null;
  onRequestIntroduction?: (targetProfileId: string, initialNote: string, conversationId?: string) => Promise<void>;
}

const StarRating: React.FC<{ score: number; size?: string }> = ({ score, size = 'w-3 h-3' }) => {
  const stars = Math.max(1, Math.min(5, Math.round(score / 20)));
  return (
    <div className="flex items-center gap-0.5" aria-label={`${stars} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={`${size} ${i < stars ? 'fill-[#5558E8] text-[#5558E8]' : 'fill-none text-[#D8D8D3]'}`}
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

export const OpportunityInbox: React.FC<OpportunityInboxProps> = ({
  currentPersona,
  opportunities,
  allProfiles,
  conversations,
  onApproveOpportunity,
  onDeclineOpportunity,
  onOpenChatWithProfile,
  onSwitchPersona,
  onRefresh,
  matchmakingResult,
  onRequestIntroduction
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'incoming' | 'outgoing' | 'connected'>('all');
  const [viewMode, setViewMode] = useState<'opportunities' | 'history'>('opportunities');
  const [selectedConversationForModal, setSelectedConversationForModal] = useState<ConversationRecord | null>(null);
  const [selectedReportConv, setSelectedReportConv] = useState<ConversationRecord | null>(null);
  const [isRequestingIntro, setIsRequestingIntro] = useState(false);

  const myConversations = conversations
    .filter(c => c.participantAId === currentPersona.id || c.participantBId === currentPersona.id)
    .slice()
    .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [inboxError, setInboxError] = useState<string | null>(null);
  const [lastFailedAction, setLastFailedAction] = useState<{ type: 'approve' | 'decline'; oppId: string } | null>(null);

  // Always refresh latest opportunities when mounted or when current persona changes
  React.useEffect(() => {
    onRefresh?.();
  }, [currentPersona.id]);

  const myOpportunities = opportunities.filter(
    opp => opp.senderId === currentPersona.id || opp.receiverId === currentPersona.id
  );

  const displayedOpportunities = myOpportunities.filter(opp => {
    const isIncoming = opp.receiverId === currentPersona.id;
    const isOutgoing = opp.senderId === currentPersona.id;
    const isConnected = opp.status === 'connected';

    if (filterTab === 'incoming') return isIncoming;
    if (filterTab === 'outgoing') return isOutgoing;
    if (filterTab === 'connected') return isConnected;
    return true;
  });

  const handleApprove = async (oppId: string, e?: React.MouseEvent) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setProcessingId(oppId);
    setInboxError(null);
    setLastFailedAction(null);
    try {
      await onApproveOpportunity(oppId);
    } catch (err: any) {
      console.error('Approve failed:', err);
      setLastFailedAction({ type: 'approve', oppId });
      setInboxError(err?.message || 'Failed to approve introduction. Please retry.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (oppId: string, e?: React.MouseEvent) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setProcessingId(oppId);
    setInboxError(null);
    setLastFailedAction(null);
    try {
      await onDeclineOpportunity(oppId);
    } catch (err: any) {
      console.error('Decline failed:', err);
      setLastFailedAction({ type: 'decline', oppId });
      setInboxError(err?.message || 'Failed to decline opportunity. Please retry.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-[430px] w-full mx-auto pb-24 overflow-x-hidden">
      
      {/* Live Demo 2-Window Switcher Banner */}
      <div className="clean-card p-4 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-[#16171A]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>2-Window Live Demo</span>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                type="button"
                onClick={() => onRefresh()}
                className="btn-secondary-pill px-2.5 py-1 text-[10px]"
                title="Refresh Opportunities"
              >
                <RotateCw className="w-2.5 h-2.5 text-[#16171A]" />
                <span>Sync</span>
              </button>
            )}
            <span className="text-[10px] text-[#5A5C63] font-medium">Shared Server</span>
          </div>
        </div>
        <p className="text-[12px] text-[#5A5C63] leading-relaxed">
          To test mutual contact unlocking, approve on this side, then tap below to switch persona and approve from the other side:
        </p>
        <div className="pt-0.5">
          {currentPersona.id === 'priya-shah' ? (
            <button
              type="button"
              onClick={() => {
                setInboxError(null);
                setLastFailedAction(null);
                onSwitchPersona('tom-reyes');
              }}
              className="btn-primary-pill w-full h-10 text-xs shadow-xs"
            >
              <span>Swap view to Tom Reyes →</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setInboxError(null);
                setLastFailedAction(null);
                onSwitchPersona('priya-shah');
              }}
              className="btn-primary-pill w-full h-10 text-xs shadow-xs"
            >
              <span>Swap view to Priya Shah →</span>
            </button>
          )}
        </div>
      </div>

      {/* Opportunities / Avatar History View Toggle */}
      <div className="flex items-center gap-1 p-1 bg-[#F6F6F3] border border-[#E2E2DC] rounded-full">
        {([
          { id: 'opportunities', label: 'Opportunities' },
          { id: 'history', label: 'Avatar History' }
        ] as const).map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setViewMode(v.id)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              viewMode === v.id ? 'bg-[#16171A] text-[#F6F6F3] shadow-xs' : 'text-[#5A5C63] hover:text-[#16171A]'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {viewMode === 'history' && (
        <div className="space-y-1">
          <h2 className="font-semibold text-[#16171A] text-[28px] tracking-tight">Avatar history</h2>
          <p className="text-sm text-[#5A5C63] mb-2">Every conversation your avatar had on your behalf</p>
          {myConversations.length === 0 ? (
            <div className="clean-card p-8 text-center space-y-2">
              <Clock className="w-6 h-6 text-[#8E9097] mx-auto" />
              <div className="text-xs font-semibold text-[#16171A]">No avatar conversations yet</div>
              <p className="text-[11px] text-[#5A5C63]">Search, chat, or run matchmaking to start building history.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {myConversations.map((conv) => {
                const counterpartyId = conv.participantAId === currentPersona.id ? conv.participantBId : conv.participantAId;
                const counterparty = allProfiles.find(p => p.id === counterpartyId);
                const hasIntro = opportunities.some(o => o.conversationId === conv.id);
                const lastMsg = conv.messages[conv.messages.length - 1];
                const summaryText = conv.summary || lastMsg?.text || 'No summary available.';
                const timeLabel = new Date(conv.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => setSelectedReportConv(conv)}
                    className="clean-card p-4 w-full text-left space-y-1.5 hover:border-[#16171A] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[#8E9097] font-medium shrink-0">{timeLabel}</span>
                      {hasIntro && (
                        <span className="text-[11px] font-semibold text-[#5558E8] shrink-0">Intro suggested</span>
                      )}
                    </div>
                    <div className="font-semibold text-sm text-[#16171A]">
                      You ↔ {counterparty?.name || 'Unknown'}'s avatar
                    </div>
                    <p className="text-xs text-[#5A5C63] leading-relaxed line-clamp-3">
                      {summaryText}
                    </p>
                    <div className="text-[11px] text-[#8E9097] pt-0.5">{conv.messages.length} turns</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {viewMode === 'opportunities' && (
      <>
      {/* Visible Error State Display with Retry */}
      {inboxError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2.5 animate-fade-in shadow-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-rose-900">
                Action Failed
              </div>
              <div className="text-[11px] text-rose-700 mt-0.5 leading-relaxed break-words">
                {inboxError}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-0.5">
            {lastFailedAction && (
              <button
                type="button"
                onClick={() => {
                  if (lastFailedAction.type === 'approve') {
                    handleApprove(lastFailedAction.oppId);
                  } else {
                    handleDecline(lastFailedAction.oppId);
                  }
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-full flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <RotateCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setInboxError(null);
                setLastFailedAction(null);
              }}
              className="px-3.5 py-1.5 text-xs font-medium text-rose-800 bg-white border border-rose-200 rounded-full cursor-pointer hover:bg-rose-50"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Segmented Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'All', count: myOpportunities.length },
          { id: 'incoming', label: 'Incoming', count: myOpportunities.filter(o => o.receiverId === currentPersona.id).length },
          { id: 'outgoing', label: 'Outgoing', count: myOpportunities.filter(o => o.senderId === currentPersona.id).length },
          { id: 'connected', label: 'Unlocked', count: myOpportunities.filter(o => o.status === 'connected').length }
        ].map((tab) => {
          const isSelected = filterTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setInboxError(null);
                setFilterTab(tab.id as any);
              }}
              className={`py-1.5 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-[#16171A] text-[#F6F6F3] font-semibold shadow-xs'
                  : 'bg-white text-[#16171A] border border-[#D8D8D3] hover:bg-[#F6F6F3]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-[#E6E6E2] text-[#5A5C63]'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Opportunities List */}
      <div className="space-y-3.5">
        {displayedOpportunities.length === 0 ? (
          <div className="clean-card p-8 text-center space-y-2">
            <Inbox className="w-6 h-6 text-[#8E9097] mx-auto" />
            <div className="text-xs font-semibold text-[#16171A]">
              No Opportunities in this Tab
            </div>
            <p className="text-[11px] text-[#5A5C63]">
              Request introductions via Venue Discovery or Avatar Matchmaking.
            </p>
          </div>
        ) : (
          displayedOpportunities.map((opp) => {
            const isSender = opp.senderId === currentPersona.id;
            const counterpartyId = isSender ? opp.receiverId : opp.senderId;
            const counterparty = allProfiles.find(p => p.id === counterpartyId);

            const isPendingMyApproval = (isSender && !opp.senderApproved) || (!isSender && !opp.receiverApproved);
            const isConnected = opp.status === 'connected';

            if (!counterparty) return null;
            const pastel = getPastelTheme(counterparty.id);

            return (
              <div
                key={opp.id}
                className={`clean-card p-5 space-y-3.5 transition-all ${
                  isConnected ? 'ring-2 ring-[#BBF7D0]' : ''
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <img
                      src={counterparty.avatar}
                      alt={counterparty.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 shrink-0 shadow-xs"
                      style={{ borderColor: pastel.border }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-sm text-[#16171A] truncate">
                          {counterparty.name}
                        </span>
                        {isSender ? (
                          <span className="text-[10px] px-2 py-0.5 bg-[#F6F6F3] text-[#5A5C63] border border-[#D8D8D3] rounded-full font-medium shrink-0">
                            Outbound
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] font-semibold rounded-full shrink-0">
                            Incoming
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#5A5C63] font-medium truncate mt-0.5">
                        {counterparty.role} · {counterparty.company}
                      </div>
                    </div>
                  </div>

                  {/* Status pill */}
                  <div className="shrink-0">
                    {isConnected ? (
                      <span className="px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] text-[11px] font-semibold flex items-center gap-1 shadow-xs">
                        <Unlock className="w-3 h-3 text-[#166534] shrink-0" />
                        <span>Connected</span>
                      </span>
                    ) : isPendingMyApproval ? (
                      <span className="px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-[11px] font-semibold flex items-center gap-1 shadow-xs animate-pulse">
                        <Clock className="w-3 h-3 text-[#92400E] shrink-0" />
                        <span>Action Needed</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-[#F6F6F3] text-[#5A5C63] border border-[#D8D8D3] text-[10px] font-medium flex items-center gap-1">
                        <span>Pending Counterparty</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Note */}
                <div className="text-xs text-[#16171A] bg-[#F6F6F3] p-3 rounded-2xl border border-[#E2E2DC] leading-relaxed break-words">
                  {opp.initialNote}
                </div>

                {/* Contact Info Box: Masked vs Revealed */}
                <div className={`p-3.5 rounded-2xl border text-xs space-y-2 min-w-0 overflow-hidden ${
                  isConnected
                    ? 'bg-[#DCFCE7] border-[#BBF7D0] text-[#166534]'
                    : 'bg-[#F6F6F3] border-[#E2E2DC] text-[#5A5C63]'
                }`}>
                  <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider min-w-0">
                    {isConnected ? (
                      <span className="text-[#166534] flex items-center gap-1.5 truncate">
                        <Unlock className="w-3.5 h-3.5 shrink-0" /> Verified Contact Unlocked
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[#16171A] truncate">
                        <Lock className="w-3.5 h-3.5 shrink-0" /> Contact Details Locked
                      </span>
                    )}
                    {!isConnected && (
                      <span className="text-[10px] text-[#8E9097] lowercase font-normal shrink-0 ml-1">
                        mutual approval unlocks
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs min-w-0 overflow-hidden">
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="w-3.5 h-3.5 text-[#8E9097] shrink-0" />
                      <span className={`truncate min-w-0 flex-1 ${isConnected ? 'text-[#16171A] font-semibold' : 'text-[#8E9097]'}`}>
                        {counterparty.contactInfo.email}
                      </span>
                    </div>

                    {counterparty.contactInfo.phone && (
                      <div className="flex items-center gap-2 min-w-0">
                        <Phone className="w-3.5 h-3.5 text-[#8E9097] shrink-0" />
                        <span className={`truncate min-w-0 flex-1 ${isConnected ? 'text-[#16171A] font-semibold' : 'text-[#8E9097]'}`}>
                          {counterparty.contactInfo.phone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pill Actions */}
                <div className="space-y-2 pt-1">
                  {isPendingMyApproval && opp.status !== 'declined' && (
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={(e) => handleDecline(opp.id, e)}
                        disabled={processingId === opp.id}
                        className="btn-secondary-pill h-10 w-full text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
                      >
                        {processingId === opp.id ? (
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        <span>Decline</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleApprove(opp.id, e)}
                        disabled={processingId === opp.id}
                        className="btn-primary-pill h-10 w-full text-xs shadow-xs"
                      >
                        {processingId === opp.id ? (
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>{processingId === opp.id ? 'Approving...' : 'Approve Intro'}</span>
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => onOpenChatWithProfile(counterparty)}
                      className="btn-secondary-pill flex-1 h-9.5 text-xs font-medium"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#16171A]" />
                      <span>Chat Avatar</span>
                    </button>

                    {opp.conversationId && (
                      <button
                        type="button"
                        onClick={() => {
                          const conv = conversations.find(c => c.id === opp.conversationId);
                          if (conv) setSelectedConversationForModal(conv);
                        }}
                        className="btn-secondary-pill flex-1 h-9.5 text-xs font-medium text-[#16171A]"
                      >
                        <span>View Transcript</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
      </>
      )}

      {/* Avatar Report Modal */}
      {selectedReportConv && (() => {
        const conv = selectedReportConv;
        const counterpartyId = conv.participantAId === currentPersona.id ? conv.participantBId : conv.participantAId;
        const counterparty = allProfiles.find(p => p.id === counterpartyId);
        if (!counterparty) return null;
        const pastel = getPastelTheme(counterparty.id);
        const liveMatch = matchmakingResult?.topMatchConversation?.id === conv.id
          ? matchmakingResult?.matches.find(m => m.profile.id === counterparty.id)
          : undefined;
        const hasIntro = opportunities.some(o => o.conversationId === conv.id);
        const summaryText = conv.summary || conv.messages[conv.messages.length - 1]?.text || 'No summary available.';

        return (
          <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
            <div className="bg-white border-t sm:border border-[#D8D8D3] rounded-t-3xl sm:rounded-3xl max-w-[430px] w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto space-y-4">
              <div className="flex items-center gap-2 -mt-1 -ml-1">
                <button
                  type="button"
                  onClick={() => setSelectedReportConv(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#5A5C63] hover:text-[#16171A] cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-[#8E9097] uppercase tracking-wider">Avatar report</span>
              </div>

              <div className="text-center space-y-2">
                <img
                  src={counterparty.avatar}
                  alt={counterparty.name}
                  className="w-16 h-16 rounded-full object-cover ring-2 mx-auto"
                  style={{ borderColor: pastel.border }}
                />
                <div>
                  <div className="font-semibold text-base text-[#16171A]">{counterparty.name}</div>
                  <div className="text-xs text-[#5A5C63]">{counterparty.role}, {counterparty.company}</div>
                </div>
                {liveMatch && (
                  <div className="flex items-center justify-center gap-2">
                    <StarRating score={liveMatch.synergyScore} size="w-3.5 h-3.5" />
                    <span className="text-[10px] font-semibold text-[#5558E8] bg-[#EEF0FD] px-2 py-0.5 rounded-full">Must-see</span>
                  </div>
                )}
              </div>

              {liveMatch && (
                <div className="p-3.5 bg-white rounded-2xl border border-[#D8D8D3] space-y-2">
                  <div className="text-[10px] font-semibold text-[#8E9097] uppercase tracking-wider">
                    Why {counterparty.name.split(' ')[0]}
                  </div>
                  <p className="text-xs text-[#16171A] leading-relaxed">
                    {liveMatch.synergyReason}
                  </p>
                  {liveMatch.tags && liveMatch.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {liveMatch.tags.map((tag, idx) => (
                        <span key={idx} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F6F6F3] border border-[#E2E2DC] text-[#16171A]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="p-3.5 bg-white rounded-2xl border border-[#D8D8D3] space-y-2">
                <div className="text-[10px] font-semibold text-[#8E9097] uppercase tracking-wider">
                  Conversation summary
                </div>
                <p className="text-xs text-[#16171A] leading-relaxed">
                  {summaryText}
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedConversationForModal(conv)}
                  className="text-xs font-semibold text-[#5558E8] hover:underline cursor-pointer"
                >
                  Read full avatar transcript ({conv.messages.length} turns)
                </button>
              </div>

              {hasIntro ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedReportConv(null);
                    setViewMode('opportunities');
                  }}
                  className="btn-secondary-pill w-full h-11 text-xs font-semibold"
                >
                  <span>View in Opportunities</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isRequestingIntro || !onRequestIntroduction}
                  onClick={async () => {
                    if (!onRequestIntroduction) return;
                    setIsRequestingIntro(true);
                    try {
                      await onRequestIntroduction(
                        counterparty.id,
                        liveMatch ? `Autonomous Avatar Match: ${liveMatch.synergyReason}` : summaryText,
                        conv.id
                      );
                      setSelectedReportConv(null);
                      setViewMode('opportunities');
                    } finally {
                      setIsRequestingIntro(false);
                    }
                  }}
                  className="btn-primary-pill w-full h-11 text-xs font-semibold shadow-xs disabled:opacity-60"
                >
                  {isRequestingIntro ? (
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Request introduction</span>
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* Origin Transcript Modal */}
      {selectedConversationForModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white border-t sm:border border-[#D8D8D3] rounded-t-3xl sm:rounded-3xl max-w-[430px] w-full p-5 shadow-2xl relative max-h-[85vh] flex flex-col space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E2DC]">
              <span className="font-semibold text-sm text-[#16171A]">
                Avatar Conversation Transcript
              </span>
              <button
                type="button"
                onClick={() => setSelectedConversationForModal(null)}
                className="w-8 h-8 rounded-full bg-[#F6F6F3] flex items-center justify-center text-[#5A5C63] hover:text-[#16171A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 py-1">
              {selectedConversationForModal.messages.map((m, i) => (
                <div key={m.id || i} className="p-3.5 rounded-2xl bg-[#F6F6F3] border border-[#E2E2DC] text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-[#8E9097] font-medium mb-1">
                    <span className="font-semibold text-[#16171A]">{m.senderName}</span>
                    <span>{m.timestamp}</span>
                  </div>
                  <div className="text-[#16171A] leading-relaxed">
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setSelectedConversationForModal(null)}
              className="btn-primary-pill w-full h-11 text-xs font-semibold shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
