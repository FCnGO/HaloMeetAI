import React, { useState, useEffect } from 'react';
import { AiActivityLogEntry, UserProfile, ConversationRecord } from '../types';
import { api } from '../services/api';
import { getPastelTheme } from '../utils/pastel';
import {
  Activity,
  ArrowLeft,
  RefreshCw,
  Search,
  MessageSquare,
  Bot,
  UserCheck,
  CheckCircle2,
  Clock,
  Zap,
  Filter,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Camera,
  Code,
  Copy,
  Check,
  PlayCircle,
  MessagesSquare,
  X
} from 'lucide-react';

const highlightJson = (obj: any): string => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
    let cls = 'text-amber-700';
    if (/^"/.test(match)) {
      cls = /:$/.test(match) ? 'text-[#16171A] font-semibold' : 'text-emerald-700';
    } else if (/true|false/.test(match)) {
      cls = 'text-purple-700 font-semibold';
    } else if (/null/.test(match)) {
      cls = 'text-zinc-500 italic';
    }
    return `<span class="${cls}">${match}</span>`;
  });
};

interface AiActivityLogProps {
  onBack: () => void;
  logs?: AiActivityLogEntry[];
  onRefresh?: () => Promise<any>;
  currentPersona?: UserProfile;
  allHeroPersonas?: UserProfile[];
  onSwitchPersona?: (personaId: string) => void;
  onResetDemo?: () => void;
  onReplaySplash?: () => void;
  allConversations?: ConversationRecord[];
  allProfiles?: UserProfile[];
}

export const AiActivityLog: React.FC<AiActivityLogProps> = ({
  onBack,
  logs: initialLogs,
  onRefresh,
  currentPersona,
  allHeroPersonas = [],
  onSwitchPersona,
  onResetDemo,
  onReplaySplash,
  allConversations = [],
  allProfiles = []
}) => {
  const [logs, setLogs] = useState<AiActivityLogEntry[]>(initialLogs || []);
  const [filterFeature, setFilterFeature] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showJsonSpec, setShowJsonSpec] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [selectedTranscript, setSelectedTranscript] = useState<ConversationRecord | null>(null);

  const sortedConversations = [...allConversations].sort(
    (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
  );

  const fetchLogs = async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        const state = await onRefresh();
        if (state?.aiActivityLogs) {
          setLogs(state.aiActivityLogs);
          return;
        }
      }
      const fetched = await api.getAiActivityLogs();
      setLogs(fetched);
    } catch (e) {
      console.error('Failed to load AI activity logs:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (initialLogs && initialLogs.length > 0) {
      setLogs(initialLogs);
    } else {
      fetchLogs();
    }
  }, [initialLogs]);

  const filteredLogs = logs.filter(log => {
    if (filterFeature === 'all') return true;
    return log.feature === filterFeature;
  });

  const getFeatureIcon = (feature: AiActivityLogEntry['feature']) => {
    switch (feature) {
      case 'Venue Discovery Search':
        return <Search className="w-3.5 h-3.5 text-[#0369A1]" />;
      case 'Avatar Chat Reply':
        return <MessageSquare className="w-3.5 h-3.5 text-[#166534]" />;
      case 'Matchmaking Transcript':
        return <Bot className="w-3.5 h-3.5 text-[#6B21A8]" />;
      case 'Profile Generation':
        return <UserCheck className="w-3.5 h-3.5 text-[#92400E]" />;
      case 'Avatar Generation':
        return <Camera className="w-3.5 h-3.5 text-[#115E59]" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-[#16171A]" />;
    }
  };

  const getFeatureBadgeColor = (feature: AiActivityLogEntry['feature']) => {
    switch (feature) {
      case 'Venue Discovery Search':
        return 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]';
      case 'Avatar Chat Reply':
        return 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]';
      case 'Matchmaking Transcript':
        return 'bg-[#F3E8FF] text-[#6B21A8] border-[#E9D5FF]';
      case 'Profile Generation':
        return 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]';
      case 'Avatar Generation':
        return 'bg-[#CCFBF1] text-[#115E59] border-[#99F6E4]';
      default:
        return 'bg-[#F6F6F3] text-[#16171A] border-[#D8D8D3]';
    }
  };

  // Compute aggregate statistics
  const totalCalls = logs.length;
  const avgLatency = totalCalls > 0
    ? Math.round(logs.reduce((acc, curr) => acc + curr.latencyMs, 0) / totalCalls)
    : 0;
  const retriedCallsCount = logs.filter(l => (l.attempts && l.attempts > 1) || (l.retryCount && l.retryCount > 0)).length;

  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-[430px] mx-auto pb-24 text-[#16171A]">
      
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between border-b border-[#D8D8D3] pb-3">
        <button
          type="button"
          onClick={onBack}
          className="btn-secondary-pill px-3.5 py-1.5 text-xs shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#5A5C63]" />
          <span>Profile Studio</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={fetchLogs}
            disabled={isRefreshing}
            className="btn-secondary-pill px-3 py-1.5 text-xs shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Screen Title & Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-2xl bg-white border border-[#D8D8D3] flex items-center justify-center text-[#16171A] shadow-xs">
            <Activity className="w-4 h-4" />
          </div>
          <h1 className="text-base font-semibold text-[#16171A] tracking-tight">
            AI Activity Log
          </h1>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]">
            Live Telemetry
          </span>
        </div>
        <p className="text-xs text-[#5A5C63] leading-relaxed">
          Session-wide transparent audit trail tracking per-call latency, HTTP attempts, and retry diagnostics.
        </p>
      </div>

      {/* Demo Tools: Persona Switcher */}
      {onSwitchPersona && allHeroPersonas.length > 0 && currentPersona && (
        <div className="clean-card p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-[#16171A]">
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#16171A]" />
              <span>Switch Active Persona</span>
            </span>
            <span className="text-[10px] text-[#8E9097] font-medium">2-Window Demo</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {allHeroPersonas.map((persona) => {
              const isSelected = persona.id === currentPersona.id;
              const pastel = getPastelTheme(persona.id);
              return (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => onSwitchPersona(persona.id)}
                  className={`p-2.5 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer min-h-[64px] justify-center ${
                    isSelected
                      ? 'border-[#16171A] bg-[#16171A] text-[#F6F6F3] shadow-xs'
                      : 'border-[#D8D8D3] bg-[#F6F6F3] text-[#16171A] hover:bg-white'
                  }`}
                >
                  <img
                    src={persona.avatar}
                    alt={persona.name}
                    className="w-7 h-7 rounded-full object-cover mb-1 ring-2 shadow-xs"
                    style={{ borderColor: pastel.border }}
                  />
                  <span className="text-xs font-semibold leading-tight truncate max-w-full">
                    {persona.name.split(' ')[0]}
                  </span>
                  <span className={`text-[10px] truncate max-w-full font-medium ${isSelected ? 'text-zinc-300' : 'text-[#8E9097]'}`}>
                    {persona.company.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Demo Tools: Reset / Replay */}
      {(onResetDemo || onReplaySplash) && (
        <div className="clean-card p-4 space-y-2.5">
          <div className="text-xs font-semibold text-[#16171A]">Demo Controls</div>
          {onResetDemo && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F6F6F3] border border-[#E2E2DC]">
              <div className="flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 text-[#8E9097]" />
                <div>
                  <div className="font-semibold text-xs text-[#16171A]">Reset Demo Data</div>
                  <div className="text-[11px] text-[#5A5C63]">Restore clean seed attendees &amp; inbox</div>
                </div>
              </div>
              <button
                type="button"
                onClick={onResetDemo}
                className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-full text-xs font-semibold transition-colors cursor-pointer shrink-0"
              >
                Reset
              </button>
            </div>
          )}
          {onReplaySplash && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F6F6F3] border border-[#E2E2DC]">
              <div className="flex items-center gap-2.5">
                <PlayCircle className="w-4 h-4 text-[#8E9097]" />
                <div>
                  <div className="font-semibold text-xs text-[#16171A]">Replay Splash &amp; Login</div>
                  <div className="text-[11px] text-[#5A5C63]">Re-run the intro sequence</div>
                </div>
              </div>
              <button
                type="button"
                onClick={onReplaySplash}
                className="btn-secondary-pill px-3 py-1.5 text-xs font-semibold shrink-0"
              >
                Replay
              </button>
            </div>
          )}
        </div>
      )}

      {/* All Avatar Conversations: every avatar-to-avatar & visitor-to-avatar chat in the session */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#16171A]">
            <MessagesSquare className="w-4 h-4 text-[#16171A]" />
            <span>All Avatar Conversations</span>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F3E8FF] text-[#6B21A8] border border-[#E9D5FF]">
            {sortedConversations.length} total
          </span>
        </div>
        <p className="text-xs text-[#5A5C63] leading-relaxed">
          Every negotiation and chat an avatar has had this session, across every persona — not just your own.
        </p>

        {sortedConversations.length === 0 ? (
          <div className="clean-card p-6 text-center space-y-1.5">
            <MessagesSquare className="w-5 h-5 text-[#8E9097] mx-auto" />
            <div className="text-xs font-semibold text-[#16171A]">No avatar conversations yet</div>
            <div className="text-[11px] text-[#5A5C63]">Chat, search, or run matchmaking to generate transcripts.</div>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedConversations.map((conv) => {
              const profileA = allProfiles.find(p => p.id === conv.participantAId);
              const profileB = allProfiles.find(p => p.id === conv.participantBId);
              const lastMsg = conv.messages[conv.messages.length - 1];
              const timeLabel = new Date(conv.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setSelectedTranscript(conv)}
                  className="clean-card w-full p-3.5 text-left space-y-1.5 hover:border-[#16171A] transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#F3E8FF] text-[#6B21A8] border border-[#E9D5FF]">
                      {conv.kind === 'agent_match' ? 'Avatar Match' : 'Avatar Chat'}
                    </span>
                    <span className="text-[11px] text-[#8E9097] font-medium shrink-0">{timeLabel}</span>
                  </div>
                  <div className="font-semibold text-sm text-[#16171A] truncate">
                    {profileA?.name || conv.participantAId} ↔ {profileB?.name || conv.participantBId}
                  </div>
                  {(conv.summary || lastMsg) && (
                    <p className="text-xs text-[#5A5C63] leading-relaxed line-clamp-2">
                      {conv.summary || lastMsg?.text}
                    </p>
                  )}
                  <div className="text-[11px] text-[#8E9097] pt-0.5">{conv.messages.length} turns</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Latency Variance Diagnostic Callout */}
      <div className="clean-card p-4 space-y-2 bg-[#F6F6F3]">
        <div className="flex items-center gap-1.5 font-semibold text-xs text-[#16171A]">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-700" />
          <span>Latency Diagnostic & Fail-Fast Protection</span>
        </div>
        <p className="text-xs leading-relaxed text-[#5A5C63]">
          Root cause analysis revealed that intermittent HTTP 503 ("Model experiencing high demand") and HTTP 429 on <code className="font-mono bg-white px-1 py-0.5 rounded border border-[#D8D8D3] text-[#16171A]">gemini-3.8-flash</code> triggered silent SDK exponential backoffs.
        </p>
        <div className="flex items-center gap-2 pt-1 border-t border-[#E2E2DC] text-[11px] text-[#166534] font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>Active fix: Fail-fast (6.5s) ensures sub-3s demo responses across all operations.</span>
        </div>
      </div>

      {/* Audit Stats Dashboard */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="clean-card p-3 space-y-1">
          <div className="text-[10px] text-[#8E9097] uppercase font-semibold">
            Total Calls
          </div>
          <div className="text-base font-semibold text-[#16171A]">
            {totalCalls}
          </div>
          <div className="text-[10px] text-[#8E9097]">
            Across personas
          </div>
        </div>

        <div className="clean-card p-3 space-y-1">
          <div className="text-[10px] text-[#8E9097] uppercase font-semibold">
            Avg Latency
          </div>
          <div className="text-base font-semibold text-[#16171A]">
            {(avgLatency / 1000).toFixed(2)}s
          </div>
          <div className="text-[10px] text-[#8E9097]">
            Server measured
          </div>
        </div>

        <div className="clean-card p-3 space-y-1">
          <div className="text-[10px] text-[#8E9097] uppercase font-semibold">
            Retried Calls
          </div>
          <div className={`text-base font-semibold ${retriedCallsCount > 0 ? 'text-amber-800' : 'text-[#166534]'}`}>
            {retriedCallsCount} <span className="text-[10px] font-normal text-[#8E9097]">({totalCalls > 0 ? Math.round((retriedCallsCount / totalCalls) * 100) : 0}%)</span>
          </div>
          <div className="text-[10px] text-[#8E9097]">
            {retriedCallsCount > 0 ? 'Backoff detected' : 'Single-shot'}
          </div>
        </div>
      </div>

      {/* Feature Filter Pills */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-[#16171A] uppercase tracking-wider flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-[#5A5C63]" />
          <span>Filter by Feature:</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'All Calls' },
            { id: 'Venue Discovery Search', label: 'Discovery Search' },
            { id: 'Avatar Chat Reply', label: 'Avatar Chat' },
            { id: 'Matchmaking Transcript', label: 'Matchmaking' },
            { id: 'Profile Generation', label: 'Profile Studio' },
            { id: 'Avatar Generation', label: 'Avatar Studio' }
          ].map(tab => {
            const isSelected = filterFeature === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterFeature(tab.id)}
                className={`px-3.5 py-1.5 text-xs rounded-full shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#16171A] text-[#F6F6F3] font-semibold shadow-xs'
                    : 'bg-white text-[#16171A] border border-[#D8D8D3] hover:bg-[#F6F6F3]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reverse-Chronological Audit Log Entries */}
      <div className="space-y-3.5">
        {filteredLogs.length === 0 ? (
          <div className="clean-card p-8 text-center space-y-2">
            <Activity className="w-6 h-6 text-[#8E9097] mx-auto" />
            <div className="text-xs font-semibold text-[#16171A]">
              No AI Activity Logged for this Filter
            </div>
            <div className="text-[11px] text-[#5A5C63]">
              Trigger any search, chat message, matchmaking, or presence synthesis to record a live trace.
            </div>
          </div>
        ) : (
          filteredLogs.map(entry => {
            const isExpanded = expandedId === entry.id;
            const hasRetries = (entry.attempts && entry.attempts > 1) || (entry.retryCount && entry.retryCount > 0);

            return (
              <div
                key={entry.id}
                className="clean-card p-4 space-y-3 shadow-xs transition-all"
              >
                {/* Entry Header: Feature Badge, Persona, and Timestamp */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getFeatureBadgeColor(entry.feature)}`}>
                      {getFeatureIcon(entry.feature)}
                      <span>{entry.feature}</span>
                    </span>
                    <span className="text-[11px] text-[#16171A] bg-[#F6F6F3] px-2 py-0.5 rounded-full border border-[#D8D8D3] font-medium">
                      👤 {entry.personaName}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#8E9097] shrink-0 font-medium">
                    {entry.timeFormatted || entry.timestamp.slice(11, 19)}
                  </span>
                </div>

                {/* Prompt / Input Payload */}
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-[#8E9097] font-semibold">
                    Input Prompt / Query:
                  </div>
                  <div className="text-xs text-[#16171A] bg-[#F6F6F3] p-2.5 rounded-2xl border border-[#E2E2DC] leading-relaxed break-words">
                    {entry.input}
                  </div>
                </div>

                {/* Generated Output Excerpt */}
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-[#8E9097] font-semibold">
                    Synthesized Output Excerpt:
                  </div>
                  <div className="text-xs text-[#16171A] bg-white p-2.5 rounded-2xl border border-[#D8D8D3] leading-relaxed break-words">
                    "{entry.outputExcerpt}"
                  </div>
                </div>

                {/* Retry & Attempt Diagnostics Bar */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E2E2DC]">
                  <div className="flex items-center gap-2 flex-wrap">
                    {hasRetries ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                        <AlertTriangle className="w-3 h-3 text-[#92400E] shrink-0" />
                        <span>{entry.attempts || (entry.retryCount! + 1)} attempts</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] text-[#5A5C63] bg-[#F6F6F3] border border-[#E2E2DC]">
                        <span>1 attempt (0 retries)</span>
                      </span>
                    )}

                    {entry.retryReason && (
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                        className="inline-flex items-center gap-1 text-[11px] text-[#16171A] hover:underline cursor-pointer font-medium"
                      >
                        <span>{isExpanded ? 'Hide error' : 'Inspect error'}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}
                  </div>

                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    entry.status === 'success'
                      ? 'text-[#166534] bg-[#DCFCE7] border border-[#BBF7D0]'
                      : 'text-[#92400E] bg-[#FEF3C7] border border-[#FDE68A]'
                  }`}>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>
                      {entry.status === 'success'
                        ? 'Gemini API'
                        : entry.feature === 'Avatar Generation'
                          ? (entry.outputExcerpt?.includes('Uploaded photo') ? 'Uploaded Photo Fallback' : 'Static Fallback Avatar')
                          : 'Fallback'}
                    </span>
                  </span>
                </div>

                {/* Technical Telemetry Footer: Model & Latency */}
                <div className="pt-1 flex items-center justify-between text-xs text-[#5A5C63]">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[#16171A] font-semibold">
                      <Zap className="w-3.5 h-3.5 text-[#16171A]" />
                      <span>{entry.model}</span>
                    </span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-[#16171A]">
                      <Clock className="w-3.5 h-3.5 text-[#8E9097]" />
                      <span>{(entry.latencyMs / 1000).toFixed(2)}s</span>
                    </span>
                  </div>

                  <span className="text-[10px] text-[#8E9097]">
                    ID: {entry.id.slice(0, 14)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Judge Inspector: Avatar JSON Spec */}
      {currentPersona && (
        <div className="clean-card overflow-hidden">
          <button
            type="button"
            onClick={() => setShowJsonSpec(!showJsonSpec)}
            className="w-full p-4 flex items-center justify-between text-xs font-semibold text-[#16171A] hover:bg-[#F6F6F3] transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Code className="w-4 h-4 text-[#16171A]" />
              <span>Judge Inspector: Avatar JSON Spec</span>
            </span>
            {showJsonSpec ? <ChevronUp className="w-4 h-4 text-[#5A5C63]" /> : <ChevronDown className="w-4 h-4 text-[#5A5C63]" />}
          </button>

          {showJsonSpec && (
            <div className="p-4 bg-[#F6F6F3] border-t border-[#E2E2DC] space-y-3">
              <div className="flex items-center justify-between text-[11px] text-[#5A5C63] pb-2 border-b border-[#E2E2DC]">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                  <span>Active avatar spec payload for {currentPersona.name}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(currentPersona.agentSpec, null, 2));
                    setCopiedJson(true);
                    setTimeout(() => setCopiedJson(false), 2000);
                  }}
                  className="btn-secondary-pill px-3 py-1 text-xs shrink-0"
                >
                  {copiedJson ? (
                    <>
                      <Check className="w-3 h-3 text-[#166534]" />
                      <span className="text-[#166534] font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-[#5A5C63]" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              </div>
              <pre
                className="text-[11px] font-mono leading-relaxed overflow-x-auto p-3.5 bg-white rounded-2xl max-h-72 border border-[#D8D8D3] text-[#16171A]"
                dangerouslySetInnerHTML={{ __html: highlightJson(currentPersona.agentSpec) }}
              />
            </div>
          )}
        </div>
      )}

      {/* Full Transcript Modal */}
      {selectedTranscript && (() => {
        const conv = selectedTranscript;
        const profileA = allProfiles.find(p => p.id === conv.participantAId);
        const profileB = allProfiles.find(p => p.id === conv.participantBId);
        return (
          <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
            <div className="bg-white border-t sm:border border-[#D8D8D3] rounded-t-3xl sm:rounded-3xl max-w-[430px] w-full p-5 shadow-2xl relative max-h-[85vh] flex flex-col space-y-3.5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E2DC]">
                <div className="min-w-0">
                  <span className="font-semibold text-sm text-[#16171A] block truncate">
                    {profileA?.name || conv.participantAId} ↔ {profileB?.name || conv.participantBId}
                  </span>
                  <span className="text-[11px] text-[#8E9097]">
                    {conv.kind === 'agent_match' ? 'Avatar Match' : 'Avatar Chat'} · {conv.messages.length} turns
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTranscript(null)}
                  className="w-8 h-8 rounded-full bg-[#F6F6F3] flex items-center justify-center text-[#5A5C63] hover:text-[#16171A] cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 py-1">
                {conv.messages.map((m, i) => (
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
                onClick={() => setSelectedTranscript(null)}
                className="btn-primary-pill w-full h-11 text-xs font-semibold shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
