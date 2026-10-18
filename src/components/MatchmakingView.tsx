import React, { useState } from 'react';
import { UserProfile, MatchmakingResult, OpportunityRecord } from '../types';
import {
  Sparkles,
  Bot,
  CheckCircle2,
  RefreshCw,
  Send,
  Zap,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { getPastelTheme } from '../utils/pastel';

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

interface MatchmakingViewProps {
  currentPersona: UserProfile;
  onRequestIntroduction: (targetProfileId: string, initialNote: string, conversationId?: string) => Promise<void>;
  onNavigateToInbox: () => void;
  existingOpportunities: OpportunityRecord[];
  matchResult: MatchmakingResult | null;
  isCached: boolean;
  isLoading: boolean;
  matchmakingError: string | null;
  onRunMatchmaking: (force?: boolean) => Promise<void>;
}

export const MatchmakingView: React.FC<MatchmakingViewProps> = ({
  currentPersona,
  onRequestIntroduction,
  onNavigateToInbox,
  existingOpportunities,
  matchResult,
  isCached,
  isLoading,
  matchmakingError,
  onRunMatchmaking: handleRunMatchmaking
}) => {
  const [showFullTranscript, setShowFullTranscript] = useState(true);
  const [starFilter, setStarFilter] = useState<'all' | '5' | '4plus'>('all');
  const [introError, setIntroError] = useState<string | null>(null);

  const filteredMatches = (matchResult?.matches || []).filter(
    m => m.profile.id !== currentPersona.id
  );
  const topMatch = filteredMatches[0];
  const secondaryMatches = filteredMatches.slice(1);
  const starsOf = (score: number) => Math.max(1, Math.min(5, Math.round(score / 20)));
  const visibleSecondaryMatches = secondaryMatches.filter((m) => {
    const stars = starsOf(m.synergyScore);
    if (starFilter === '5') return stars === 5;
    if (starFilter === '4plus') return stars >= 4;
    return true;
  });
  const isOppExistingWithTop = topMatch && existingOpportunities.some(
    o => (o.senderId === currentPersona.id && o.receiverId === topMatch.profile.id) ||
         (o.senderId === topMatch.profile.id && o.receiverId === currentPersona.id)
  );

  const handleRequestIntroForTopMatch = async (e?: React.MouseEvent) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (!topMatch) return;
    setIntroError(null);
    const note = `Autonomous Avatar Match: ${topMatch.synergyReason}`;
    try {
      await onRequestIntroduction(
        topMatch.profile.id,
        note,
        matchResult?.topMatchConversation?.id
      );
    } catch (err: any) {
      console.error('Failed to request intro:', err);
      setIntroError(err?.message || 'Failed to request introduction. Please retry.');
    }
  };

  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-[430px] mx-auto pb-24">
      
      {/* Header Action Strip */}
      <div className="flex items-start justify-between gap-3 text-xs">
        <div className="min-w-0 flex-1">
          <h1 className="font-semibold text-[#16171A] text-[28px] tracking-tight">Must-sees</h1>
          <div className="text-sm text-[#5A5C63] flex items-center gap-1.5 mt-0.5">
            <Zap className="w-3 h-3 text-[#16171A] shrink-0" />
            <span>Autonomous Avatar-to-Avatar synergy for {currentPersona.name.split(' ')[0]}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleRunMatchmaking(true)}
          disabled={isLoading}
          className="btn-secondary-pill px-3 py-1.5 text-xs shadow-xs shrink-0 whitespace-nowrap"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Re-match</span>
        </button>
      </div>

      {/* Visible Error State Display */}
      {(matchmakingError || introError) && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-900 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2 truncate">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="truncate">{matchmakingError || introError}</span>
          </div>
          <button
            type="button"
            onClick={() => setIntroError(null)}
            className="text-xs font-semibold text-rose-700 hover:underline shrink-0 ml-2 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {isLoading && !matchResult && (
        <div className="clean-card p-8 text-center space-y-3">
          <Sparkles className="w-6 h-6 text-[#16171A] mx-auto animate-spin" />
          <div className="font-semibold text-sm text-[#16171A]">
            Running Autonomous Gemini Negotiation...
          </div>
          <div className="text-xs text-[#5A5C63]">
            Evaluating venue attendee synergy matrix
          </div>
        </div>
      )}

      {!isLoading && !matchResult && !matchmakingError && (
        <div className="clean-card p-8 text-center space-y-3">
          <div className="font-semibold text-[17px] text-[#16171A]">
            No matches yet
          </div>
          <div className="text-sm text-[#5A5C63] leading-relaxed max-w-[260px] mx-auto">
            Let your avatar talk with the room. It takes about a minute.
          </div>
          <button
            type="button"
            onClick={() => handleRunMatchmaking(false)}
            className="btn-primary-pill px-5 py-2.5 text-[15px] font-semibold shadow-xs mx-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Start networking</span>
          </button>
        </div>
      )}

      {matchResult && topMatch && (
        <div className="space-y-4">
          
          {/* Top Synergy Highlight Card */}
          <div className="clean-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold bg-[#16171A] text-[#F6F6F3] px-3 py-1 rounded-full uppercase tracking-wider">
                #1 Top Match · {topMatch.synergyScore}% Match
              </span>
              <StarRating score={topMatch.synergyScore} size="w-3.5 h-3.5" />
            </div>
            <div className="text-right -mt-2.5">
              <span className="text-[10px] text-[#8E9097] font-medium">
                {isCached ? 'Stored Record' : 'Fresh Synthesis'}
              </span>
            </div>

            <div className="flex items-start gap-3.5">
              <img
                src={topMatch.profile.avatar}
                alt={topMatch.profile.name}
                className="w-13 h-13 rounded-full object-cover ring-2 shrink-0 shadow-xs"
                style={{ borderColor: getPastelTheme(topMatch.profile.id).border }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-[#16171A] truncate">
                  {topMatch.profile.name}
                </h3>
                <div className="text-xs text-[#5A5C63] font-medium truncate">
                  {topMatch.profile.role} · {topMatch.profile.company}
                </div>
                <div className="text-[11px] text-[#8E9097] font-medium mt-0.5">
                  📍 {topMatch.profile.zone} · {topMatch.profile.availabilityMinutes}m available
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-[#E0F2FE] rounded-2xl border border-[#BAE6FD] text-xs text-[#0F172A] leading-relaxed">
              <strong className="font-semibold text-[#0369A1]">Synergy Rationale:</strong> {topMatch.synergyReason}
            </div>

            {topMatch.tags && topMatch.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {topMatch.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#F6F6F3] border border-[#E2E2DC] text-[#16171A]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Autonomous Avatar Transcript Box */}
            <div className="border border-[#D8D8D3] rounded-2xl overflow-hidden shadow-xs">
              <div
                onClick={() => setShowFullTranscript(!showFullTranscript)}
                className="bg-[#16171A] text-[#F6F6F3] p-3.5 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#F6F6F3]" />
                  <span className="font-semibold text-xs">
                    Autonomous Avatar Transcript
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400">
                    {matchResult.topMatchConversation?.messages.length || 0} turns
                  </span>
                  {showFullTranscript ? (
                    <ChevronUp className="w-4 h-4 text-zinc-300" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-300" />
                  )}
                </div>
              </div>

              {/* Attribution Bar */}
              <div className="px-3.5 py-1.5 bg-[#26282E] text-[#D8D8D3] border-t border-zinc-800 flex items-center justify-between text-[10px]">
                <span className="inline-flex items-center gap-1 font-semibold text-white">
                  <span>⚡</span>
                  <span>Generated by {matchResult.topMatchConversation?.modelUsed || matchResult.modelUsed || 'Gemini 3.8 Flash'}</span>
                </span>
                <span>
                  Generated in {((matchResult.topMatchConversation?.latencyMs || matchResult.latencyMs || 1550) / 1000).toFixed(1)}s
                </span>
              </div>

              {showFullTranscript && (
                <div className="p-3.5 space-y-3 bg-[#F6F6F3] max-h-72 overflow-y-auto">
                  {matchResult.topMatchConversation?.messages.map((msg, i) => {
                    const isAgentA = msg.role === 'agent_a';
                    return (
                      <div
                        key={msg.id || i}
                        className={`flex flex-col ${isAgentA ? 'items-start' : 'items-end'}`}
                      >
                        <div className="text-[10px] text-[#8E9097] mb-1 px-1 font-medium">
                          {msg.senderName} · {msg.timestamp}
                        </div>
                        <div
                          className={`max-w-[88%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                            isAgentA
                              ? 'bg-white text-[#16171A] border border-[#D8D8D3] rounded-bl-xs'
                              : 'bg-[#16171A] text-[#F6F6F3] font-medium rounded-br-xs'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action CTA */}
            <div>
              {isOppExistingWithTop ? (
                <button
                  type="button"
                  onClick={onNavigateToInbox}
                  className="btn-secondary-pill w-full h-11 text-xs font-semibold text-[#166534] bg-[#DCFCE7] border-[#BBF7D0] hover:bg-[#BBF7D0]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Introduction Queued in Inbox →</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => handleRequestIntroForTopMatch(e)}
                  className="btn-primary-pill w-full h-11 text-xs shadow-xs"
                >
                  <Send className="w-3.5 h-3.5 text-[#F6F6F3]" />
                  <span>Request Introduction with {topMatch.profile.name.split(' ')[0]}</span>
                </button>
              )}
            </div>
          </div>

          {/* Other Ranked Counterparts List */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-semibold text-[#16171A] uppercase tracking-wider">
                Secondary Match Opportunities ({visibleSecondaryMatches.length})
              </div>
            </div>

            {/* Star Filter Tabs */}
            <div className="inline-flex items-center p-0.5 bg-white border border-[#D8D8D3] rounded-full shadow-xs">
              {([
                { id: 'all', label: 'All' },
                { id: '5', label: '5★' },
                { id: '4plus', label: '4★+' }
              ] as const).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStarFilter(f.id)}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    starFilter === f.id
                      ? 'bg-[#16171A] text-white shadow-xs'
                      : 'text-[#5A5C63] hover:text-[#16171A]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {visibleSecondaryMatches.length === 0 && (
              <div className="clean-card p-5 text-center text-xs text-[#8E9097]">
                No matches in this range.
              </div>
            )}

            {visibleSecondaryMatches.map((m) => (
              <div
                key={m.profile.id}
                className="clean-card p-4 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={m.profile.avatar}
                      alt={m.profile.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 shadow-xs"
                      style={{ borderColor: getPastelTheme(m.profile.id).border }}
                    />
                    <div>
                      <div className="font-semibold text-xs text-[#16171A]">
                        {m.profile.name}
                      </div>
                      <div className="text-[11px] text-[#5A5C63]">
                        {m.profile.role} · {m.profile.company}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#0369A1]">
                      {m.synergyScore}%
                    </span>
                    <StarRating score={m.synergyScore} size="w-2.5 h-2.5" />
                  </div>
                </div>

                <p className="text-xs text-[#5A5C63] leading-relaxed">
                  {m.synergyReason}
                </p>

                {m.tags && m.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {m.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F6F6F3] border border-[#E2E2DC] text-[#16171A]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-[#8E9097] pt-1.5 border-t border-[#E2E2DC]">
                  <span>📍 {m.profile.zone}</span>
                  <span>{m.profile.availabilityMinutes}m window</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
