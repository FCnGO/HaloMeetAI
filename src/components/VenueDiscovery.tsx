import React, { useState, useRef } from 'react';
import { UserProfile, Venue, SearchMatchResult, MatchmakingResult } from '../types';
import { api } from '../services/api';
import {
  Circle,
  Sparkles,
  MessageSquare,
  X,
  Eye,
  ChevronDown,
  AlertCircle,
  RotateCw,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { getPastelTheme } from '../utils/pastel';
import { RadarView } from './RadarView';

interface VenueDiscoveryProps {
  currentPersona: UserProfile;
  selectedVenue: Venue;
  allVenues: Venue[];
  onSwitchVenue: (venueId: string) => void;
  allProfiles: UserProfile[];
  onOpenChatWithProfile: (profile: UserProfile, initialTab?: 'agent' | 'person') => void;
  onRequestIntro: (profile: UserProfile) => void;
  onProfileUpdated?: (profile: UserProfile) => void;
  onNavigateToMatches?: () => void;
  matchmakingResult?: MatchmakingResult | null;
  matchmakingLoading?: boolean;
  onRunAgentNetwork?: () => void | Promise<void>;
}

export const VenueDiscovery: React.FC<VenueDiscoveryProps> = ({
  currentPersona,
  selectedVenue,
  allVenues,
  onSwitchVenue,
  allProfiles,
  onOpenChatWithProfile,
  onRequestIntro,
  onProfileUpdated,
  onNavigateToMatches,
  matchmakingResult,
  matchmakingLoading,
  onRunAgentNetwork
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchMatchResult[] | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedZone] = useState<string>('all');
  const [selectedProfileForModal, setSelectedProfileForModal] = useState<UserProfile | null>(null);
  const [showVenueSelector, setShowVenueSelector] = useState(false);
  const [visibilityDuration, setVisibilityDuration] = useState<'30m' | '1h' | '2h' | 'all'>('2h');
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const [durationPickerExpanded, setDurationPickerExpanded] = useState(true);

  const isVisible = currentPersona.permissions.showPresence;

  const DURATION_OPTIONS = [
    { id: '30m', label: '30m' },
    { id: '1h', label: '1h' },
    { id: '2h', label: '2h' },
    { id: 'all', label: 'All day' }
  ] as const;
  const selectedDurationLabel = DURATION_OPTIONS.find(d => d.id === visibilityDuration)?.label || '2h';

  const handleToggleVisibility = async () => {
    setIsTogglingVisibility(true);
    try {
      const updated = {
        ...currentPersona,
        permissions: { ...currentPersona.permissions, showPresence: !isVisible }
      };
      const res = await api.saveProfile(updated);
      onProfileUpdated?.(res.profile);
    } catch (err) {
      console.error('Failed to toggle visibility:', err);
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  // References to guarantee 100% accurate, live DOM input values and cancellation of in-flight requests
  const searchInputRef = useRef<HTMLInputElement>(null);
  const activeAbortCtrlRef = useRef<AbortController | null>(null);
  const isSearchingRef = useRef(false);

  // Exclude current persona strictly from the venue attendee pool
  const venueProfiles = allProfiles.filter(
    p => p.venueId === selectedVenue.id && p.permissions.showPresence && p.id !== currentPersona.id
  );

  const filteredProfiles = venueProfiles.filter(p => {
    if (selectedZone !== 'all' && p.zone !== selectedZone) return false;
    return true;
  });

  const matchScoreById: Record<string, number> = {};
  (matchmakingResult?.matches || []).forEach((m) => {
    if (m.profile.id !== currentPersona.id) {
      matchScoreById[m.profile.id] = m.synergyScore;
    }
  });
  const matchCount = Object.keys(matchScoreById).length;

  const handleSearch = async (queryText?: string) => {
    // 1. Determine target query: prioritize explicit queryText, then live DOM input value, then React state
    const rawInput = typeof queryText === 'string'
      ? queryText
      : (searchInputRef.current ? searchInputRef.current.value : searchQuery);

    const q = (rawInput || '').trim();
    if (!q) {
      setSearchResults(null);
      setSearchError(null);
      return;
    }

    // Synchronize both state and DOM element cleanly without character corruption
    setSearchQuery(q);
    if (searchInputRef.current && searchInputRef.current.value !== q) {
      searchInputRef.current.value = q;
    }

    // Cancel any previous in-flight search so earlier requests cannot overwrite newer ones
    if (activeAbortCtrlRef.current) {
      activeAbortCtrlRef.current.abort();
    }
    const abortController = new AbortController();
    activeAbortCtrlRef.current = abortController;

    setIsSearching(true);
    isSearchingRef.current = true;
    setSearchError(null);

    try {
      const res = await api.searchDiscovery({
        query: q,
        viewerId: currentPersona.id,
        venueId: selectedVenue.id
      }, abortController.signal);

      // Guard against race condition if aborted
      if (abortController.signal.aborted) return;

      // Exclude current persona from search matches as well
      const sanitized = (res.matches || []).filter(m => m.profile.id !== currentPersona.id);
      setSearchResults(sanitized);
      setSearchError(null);
    } catch (err: any) {
      if (err?.name === 'AbortError' || abortController.signal.aborted) {
        return;
      }
      console.error('Search failed:', err);
      setSearchError(err?.message || 'Search request failed. Please check connection and retry.');
    } finally {
      if (activeAbortCtrlRef.current === abortController) {
        setIsSearching(false);
        isSearchingRef.current = false;
        activeAbortCtrlRef.current = null;
      }
    }
  };

  const handleClearSearch = () => {
    if (activeAbortCtrlRef.current) {
      activeAbortCtrlRef.current.abort();
      activeAbortCtrlRef.current = null;
    }
    setIsSearching(false);
    isSearchingRef.current = false;
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
    setSearchResults(null);
    setSearchError(null);
  };

  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-[430px] mx-auto pb-24">

      {/* Status + Venue Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 relative">
          <div className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${isVisible ? 'text-[#166534]' : 'text-[#8E9097]'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isVisible ? 'bg-[#10B981]' : 'bg-[#8E9097]'}`}></span>
            <span>{isVisible ? 'LIVE · VISIBLE' : 'NOT VISIBLE'}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowVenueSelector(!showVenueSelector)}
            className="flex items-center gap-1 font-semibold text-[#16171A] text-[22px] tracking-tight cursor-pointer mt-0.5 min-w-0 max-w-full"
          >
            <span className="truncate">{selectedVenue.name}</span>
            <ChevronDown className="w-4 h-4 text-[#5A5C63] shrink-0" />
          </button>

          {showVenueSelector && (
            <div className="absolute left-0 mt-2 w-68 bg-white border border-[#D8D8D3] rounded-2xl shadow-xl py-2 z-50 animate-fade-in">
              <div className="px-4 py-1.5 text-[10px] font-medium text-[#8E9097] uppercase tracking-wider border-b border-[#E2E2DC]">
                Switch Venue Hub
              </div>
              {allVenues.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    onSwitchVenue(v.id);
                    setShowVenueSelector(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between hover:bg-[#F6F6F3] transition-colors cursor-pointer ${
                    v.id === selectedVenue.id ? 'bg-[#F6F6F3] text-[#16171A] font-semibold' : 'text-[#5A5C63]'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-[#16171A]">{v.city} ({v.code})</div>
                    <div className="text-[11px] text-[#8E9097]">{v.terminal}</div>
                  </div>
                  <span className="text-[10px] font-medium text-[#16171A] px-2 py-0.5 rounded-full bg-[#E6E6E2]">
                    {v.activeAttendeesCount}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Visible/Hidden Toggle Switch */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-normal text-[#5A5C63]">{isVisible ? 'Visible' : 'Hidden'}</span>
          <button
            type="button"
            onClick={handleToggleVisibility}
            disabled={isTogglingVisibility}
            aria-pressed={isVisible}
            aria-label="Toggle venue visibility"
            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 cursor-pointer disabled:opacity-60 ${isVisible ? 'bg-[#5558E8]' : 'bg-[#D8D8D3]'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${isVisible ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      {!isVisible && (
        <div className="clean-card p-6 text-center space-y-4">
          <div className="relative w-40 h-40 mx-auto rounded-full border border-[#D8D8D3] flex items-center justify-center">
            <div className="absolute inset-4 rounded-full border border-[#E2E2DC]" />
            <div className="w-14 h-14 rounded-full bg-[#5558E8] flex items-center justify-center text-white font-semibold text-xs shadow-md z-10">
              {currentPersona.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          </div>
          <p className="text-xs text-[#5A5C63] leading-relaxed max-w-[260px] mx-auto">
            Turn on visibility to find your event and the people at it.
          </p>
          <button
            type="button"
            onClick={handleToggleVisibility}
            disabled={isTogglingVisibility}
            className="btn-primary-pill w-full h-12 text-base font-semibold shadow-sm"
          >
            <Eye className="w-4 h-4" />
            <span>Turn on visibility</span>
          </button>
          <p className="text-[11px] text-[#8E9097] leading-relaxed px-2">
            Attendees nearby can discover you, and we'll scan for events at this venue.
          </p>

          <div className="pt-1 text-left space-y-2">
            {!durationPickerExpanded ? (
              <button
                type="button"
                onClick={() => setDurationPickerExpanded(true)}
                className="w-full flex items-center justify-between cursor-pointer"
              >
                <span className="text-xs font-semibold text-[#16171A]">Stay visible for {selectedDurationLabel}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8E9097] shrink-0" />
              </button>
            ) : (
            <>
            <div className="flex items-center justify-between text-xs font-semibold text-[#16171A]">
              <span>Stay visible for</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {DURATION_OPTIONS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    setVisibilityDuration(d.id);
                    setDurationPickerExpanded(false);
                  }}
                  className={`py-1.5 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${
                    visibilityDuration === d.id
                      ? 'bg-[#EEF0FD] text-[#5558E8] border-[#5558E8]'
                      : 'bg-[#F6F6F3] text-[#16171A] border-[#E2E2DC] hover:bg-white'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            </>
            )}
          </div>
        </div>
      )}

      {isVisible && (
        <div className="clean-card p-3.5 space-y-2">
          {durationPickerExpanded ? (
            <>
              <div className="flex items-center justify-between text-xs font-semibold text-[#16171A]">
                <span>Stay visible for</span>
                <span className="text-[11px] font-medium text-[#8E9097]">Until {currentPersona.availableUntil ? new Date(currentPersona.availableUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `${currentPersona.availabilityMinutes}m`}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {DURATION_OPTIONS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setVisibilityDuration(d.id);
                      setDurationPickerExpanded(false);
                    }}
                    className={`py-1.5 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${
                      visibilityDuration === d.id
                        ? 'bg-[#EEF0FD] text-[#5558E8] border-[#5558E8]'
                        : 'bg-[#F6F6F3] text-[#16171A] border-[#E2E2DC] hover:bg-white'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setDurationPickerExpanded(true)}
              className="w-full flex items-center justify-between cursor-pointer"
            >
              <span className="text-xs font-semibold text-[#16171A]">
                Visible for {selectedDurationLabel} · Until {currentPersona.availableUntil ? new Date(currentPersona.availableUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `${currentPersona.availabilityMinutes}m`}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8E9097] shrink-0" />
            </button>
          )}
        </div>
      )}

      {isVisible && (
      <>
      {/* Simplified Venue-Wide Search Bar */}
      <div
        role="search"
        aria-label="Venue Discovery Search"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="relative flex items-center"
      >
        <button
          type="button"
          aria-label="Run search"
          disabled={isSearching || !searchQuery.trim()}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const text = (searchInputRef.current ? searchInputRef.current.value : searchQuery).trim();
            if (text && !isSearchingRef.current) {
              handleSearch(text);
            }
          }}
          className="absolute left-3 w-6 h-6 rounded-full flex items-center justify-center text-[#8E9097] hover:text-[#16171A] transition-colors cursor-pointer disabled:cursor-default disabled:hover:text-[#8E9097]"
        >
          {isSearching ? (
            <Sparkles className="w-4 h-4 animate-spin" />
          ) : (
            <Circle className="w-4 h-4" />
          )}
        </button>
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (searchError) setSearchError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.stopPropagation();
              if (e.nativeEvent.isComposing) return;
              const text = (searchInputRef.current ? searchInputRef.current.value : searchQuery).trim();
              if (text && !isSearchingRef.current) {
                handleSearch(text);
              }
            }
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          placeholder="Ask the venue... who works on cargo AI?"
          className="w-full pl-11 pr-9 py-3.5 text-xs border border-[#D8D8D3] rounded-full bg-white text-[#16171A] placeholder:text-[#8E9097] focus:outline-hidden focus:border-[#16171A] shadow-xs transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClearSearch();
            }}
            aria-label="Clear search"
            className="absolute right-3 p-1 text-[#8E9097] hover:text-[#16171A] transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Loading state indicator */}
      {isSearching && (
        <div className="p-3.5 bg-white rounded-2xl border border-[#D8D8D3] flex items-center gap-2.5 text-xs text-[#16171A] shadow-xs">
          <Sparkles className="w-4 h-4 text-[#16171A] animate-spin" />
          <span className="font-medium">Gemini analyzing intent across profiles...</span>
        </div>
      )}

      {/* Visible Error State Display */}
      {searchError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2.5 animate-fade-in shadow-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-rose-900">
                Discovery Search Failed
              </div>
              <div className="text-[11px] text-rose-700 mt-0.5 leading-relaxed break-words">
                {searchError}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const textToRetry = (searchInputRef.current ? searchInputRef.current.value : searchQuery).trim();
                if (textToRetry && !isSearchingRef.current) {
                  handleSearch(textToRetry);
                }
              }}
              disabled={isSearching}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-full flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
              <span>Retry Search</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleClearSearch();
              }}
              className="px-3.5 py-1.5 text-xs font-medium text-rose-800 bg-white border border-rose-200 hover:bg-rose-100 rounded-full cursor-pointer"
            >
              Dismiss & Show Nearby
            </button>
          </div>
        </div>
      )}

      {/* Fallback Warning Notice when AI is unavailable */}
      {searchResults && searchResults.some(m => m.isFallback) && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 shadow-xs animate-fade-in">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1 min-w-0">
            <div className="font-semibold flex items-center gap-1.5 text-xs">
              <span>AI Search Offline — Basic Mode</span>
              <span className="text-[10px] px-2 py-0.5 bg-amber-200 rounded-full font-semibold text-amber-900">
                basic match
              </span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed font-sans">
              The Gemini semantic engine encountered a timeout or rate limit. Below results are fallback keyword approximations, not genuine Gemini AI semantic reasoning.
            </p>
          </div>
        </div>
      )}

      {/* Radar Visualization */}
      <RadarView
        currentPersona={currentPersona}
        profiles={searchResults ? searchResults.map(m => m.profile) : filteredProfiles}
        selectedVenue={selectedVenue}
        onSelectProfile={setSelectedProfileForModal}
        onOpenChatWithProfile={onOpenChatWithProfile}
        onRequestIntro={onRequestIntro}
        matchScores={matchScoreById}
      />

      {/* Agent Networking CTA / Match Summary */}
      {matchmakingResult && matchCount > 0 ? (
        <button
          type="button"
          onClick={onNavigateToMatches}
          className="clean-card w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-white transition-colors"
        >
          <div className="min-w-0">
            <div className="font-semibold text-sm text-[#16171A]">
              {matchCount} {matchCount === 1 ? 'person' : 'people'} worth meeting
            </div>
            <div className="text-[11px] text-[#8E9097] mt-0.5">
              Ranked by your avatar
            </div>
          </div>
          <span className="btn-primary-pill px-3.5 py-1.5 text-xs font-semibold shadow-xs shrink-0">
            <span>View</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </button>
      ) : (
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={onRunAgentNetwork}
            disabled={matchmakingLoading}
            className="btn-primary-pill w-full h-12 text-base font-semibold shadow-sm disabled:opacity-70"
          >
            {matchmakingLoading ? (
              <Sparkles className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{matchmakingLoading ? 'Avatar is networking...' : 'Let my avatar network'}</span>
          </button>
          <p className="text-[11px] text-[#8E9097] text-center leading-relaxed px-2">
            Your avatar talks with every discoverable avatar here and ranks who's worth meeting.
          </p>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[17px] tracking-tight font-semibold text-[#16171A] flex items-center gap-1.5">
          {searchResults ? (
            searchResults.some(m => m.isFallback) ? (
              <>
                <span className="text-amber-800">Keyword Fallback Matches</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  basic match
                </span>
              </>
            ) : (
              'Ranked Matches'
            )
          ) : (
            'Present nearby'
          )}
        </span>
        {searchResults ? (
          <button
            type="button"
            onClick={handleClearSearch}
            className="text-xs text-[#16171A] font-semibold hover:underline cursor-pointer"
          >
            Reset
          </button>
        ) : (
          <span className="text-[13px] text-[#8E9097] font-normal">
            {filteredProfiles.length} discoverable
          </span>
        )}
      </div>

      {/* Single-Column List of Full-Width Mobile Cards */}
      <div className="space-y-3.5">
        {searchResults ? (
          searchResults.map((match) => {
            const p = match.profile;
            const pastel = getPastelTheme(p.id);

            return (
              <button
                type="button"
                key={p.id}
                onClick={() => setSelectedProfileForModal(p)}
                className="clean-card p-5 space-y-3 transition-all w-full text-left cursor-pointer hover:border-[#16171A]"
              >
                {/* Match Banner: Genuine Gemini vs Keyword Fallback */}
                {match.isFallback ? (
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-amber-800">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px]">
                        <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                        basic match — AI unavailable
                      </span>
                      <span className="font-mono text-amber-700">
                        Keyword Match: ~{match.relevanceScore}%
                      </span>
                    </div>
                    <div className="text-xs text-amber-950 font-medium leading-snug">
                      "{match.matchReason}"
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-[#E0F2FE] border border-[#BAE6FD] space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#0369A1]">
                      <span className="inline-flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#0369A1]" />
                        <span>Gemini Relevance: {match.relevanceScore}%</span>
                      </span>
                      {match.matchedQueryLanguage && match.matchedQueryLanguage !== 'English' && (
                        <span className="px-2 py-0.5 bg-[#BAE6FD] text-[#0369A1] rounded-full text-[10px] font-semibold">
                          {match.matchedQueryLanguage}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#0F172A] font-medium leading-snug">
                      "{match.matchReason}"
                    </div>
                    <div className="pt-1.5 border-t border-[#BAE6FD] flex items-center justify-between text-[10px] text-[#5A5C63]">
                      <span className="inline-flex items-center gap-1 text-[#0369A1] font-semibold">
                        <span>⚡</span>
                        <span>Generated by {match.modelUsed || 'Gemini 3.8 Flash'}</span>
                      </span>
                      <span>
                        Generated in {((match.latencyMs || 1200) / 1000).toFixed(1)}s
                      </span>
                    </div>
                  </div>
                )}

                {/* Profile Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-11 h-11 rounded-full object-cover ring-2 shadow-xs shrink-0"
                      style={{ borderColor: pastel.border }}
                    />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base tracking-tight text-[#16171A] truncate">
                        {p.name}
                      </h3>
                      <div className="text-[13px] text-[#5A5C63] font-normal truncate">
                        {p.role} · {p.company}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 text-xs text-[#5A5C63] font-normal pt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                    <span>{p.availabilityMinutes} m</span>
                  </div>
                </div>

                {/* Pitch */}
                <div className="text-sm text-[#16171A] font-normal leading-relaxed bg-[#F6F6F3] border border-black/8 rounded-2xl px-3.5 py-3">
                  "{p.agentSpec.oneLinePitch}"
                </div>
              </button>
            );
          })
        ) : (
          filteredProfiles.map((p) => {
            const pastel = getPastelTheme(p.id);

            return (
              <button
                type="button"
                key={p.id}
                onClick={() => setSelectedProfileForModal(p)}
                className="clean-card p-5 space-y-3 transition-all w-full text-left cursor-pointer hover:border-[#16171A]"
              >
                {/* Profile Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-11 h-11 rounded-full object-cover ring-2 shadow-xs shrink-0"
                      style={{ borderColor: pastel.border }}
                    />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base tracking-tight text-[#16171A] truncate">
                        {p.name}
                      </h3>
                      <div className="text-[13px] text-[#5A5C63] font-normal truncate">
                        {p.role} · {p.company}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 text-xs text-[#5A5C63] font-normal pt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                    <span>{p.availabilityMinutes} m</span>
                  </div>
                </div>

                {/* Pitch */}
                <div className="text-sm text-[#16171A] font-normal leading-relaxed bg-[#F6F6F3] border border-black/8 rounded-2xl px-3.5 py-3">
                  "{p.agentSpec.oneLinePitch}"
                </div>
              </button>
            );
          })
        )}
      </div>
      </>
      )}

      {/* Public Profile Modal / Bottom Sheet */}
      {selectedProfileForModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white border-t sm:border border-[#D8D8D3] rounded-t-3xl sm:rounded-3xl max-w-[430px] w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto space-y-4">
            
            <div className="w-12 h-1 bg-[#D8D8D3] rounded-full mx-auto -mt-2 sm:hidden"></div>

            <div className="flex items-start justify-between pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedProfileForModal.avatar}
                  alt={selectedProfileForModal.name}
                  className="w-16 h-16 rounded-full object-cover ring-2"
                  style={{ borderColor: getPastelTheme(selectedProfileForModal.id).border }}
                />
                <div>
                  <h3 className="font-semibold text-[22px] tracking-tight text-[#16171A]">
                    {selectedProfileForModal.name}
                  </h3>
                  <div className="text-sm text-[#5A5C63] font-normal">
                    {selectedProfileForModal.role}
                  </div>
                  <div className="text-sm text-[#5A5C63] font-normal">
                    {selectedProfileForModal.company}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProfileForModal(null)}
                className="w-8 h-8 rounded-full bg-[#F6F6F3] flex items-center justify-center text-[#5A5C63] hover:text-[#16171A] cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#5A5C63] font-normal -mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
              <span>Discoverable · {selectedProfileForModal.availabilityMinutes}m away</span>
            </div>

            <p className="text-[15px] text-[#16171A] font-normal leading-relaxed">
              {selectedProfileForModal.agentSpec.oneLinePitch}
            </p>

            {selectedProfileForModal.agentSpec.products.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-normal text-[#5A5C63]">
                  Interests
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProfileForModal.agentSpec.products.map((prod, idx) => (
                    <span
                      key={idx}
                      className="text-[13px] font-normal px-2.5 py-1 rounded-full bg-[#F6F6F3] border border-[#E2E2DC] text-[#16171A]"
                    >
                      {prod.title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedProfileForModal.agentSpec.approvedTopics.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-normal text-[#5A5C63]">
                  Their avatar can discuss
                </div>
                <p className="text-sm text-[#16171A] font-normal leading-relaxed">
                  {selectedProfileForModal.agentSpec.approvedTopics.join(', ')}
                </p>
              </div>
            )}

            <div className="pt-2 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const prof = selectedProfileForModal;
                    setSelectedProfileForModal(null);
                    onOpenChatWithProfile(prof, 'person');
                  }}
                  className="btn-secondary-pill flex-1 h-11 text-[15px] font-semibold"
                >
                  <span>Message</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const prof = selectedProfileForModal;
                    setSelectedProfileForModal(null);
                    onOpenChatWithProfile(prof, 'agent');
                  }}
                  className="btn-secondary-pill flex-1 h-11 text-[15px] font-semibold bg-[#EEF0FD] text-[#5558E8] border-[#5558E8]"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask their avatar</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  onRequestIntro(selectedProfileForModal);
                  setSelectedProfileForModal(null);
                }}
                className="btn-primary-pill w-full h-11 text-[15px] font-semibold shadow-xs"
              >
                <span>Request introduction</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
