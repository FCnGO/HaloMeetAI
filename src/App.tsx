import React, { useState, useEffect } from 'react';
import { AppState, UserProfile, Venue, MatchmakingResult, PersonMessage } from './types';
import { api } from './services/api';
import { SplashScreen } from './components/SplashScreen';
import { LoginGateScreen } from './components/LoginGateScreen';
import { OnboardingWizard } from './components/OnboardingWizard';
import { HomeScreen } from './components/HomeScreen';
import { BottomTabBar } from './components/BottomTabBar';
import { VenueDiscovery } from './components/VenueDiscovery';
import { ProfileStudio } from './components/ProfileStudio';
import { AgentChatWidget } from './components/AgentChatWidget';
import { MatchmakingView } from './components/MatchmakingView';
import { OpportunityInbox } from './components/OpportunityInbox';
import { ChatsListScreen } from './components/ChatsListScreen';
import { AiActivityLog } from './components/AiActivityLog';

import { SEED_PROFILES, SEED_VENUES, INITIAL_CONVERSATIONS, INITIAL_OPPORTUNITIES } from '../server/seedData';

const DEFAULT_INITIAL_STATE: AppState = {
  currentPersonaId: 'priya-shah',
  selectedVenueId: 'sin-t3',
  profiles: SEED_PROFILES,
  venues: SEED_VENUES,
  conversations: INITIAL_CONVERSATIONS,
  opportunities: INITIAL_OPPORTUNITIES
};

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [showLoginGate, setShowLoginGate] = useState<boolean>(true);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [appState, setAppState] = useState<AppState>(DEFAULT_INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<string>('discovery');
  const [chatTargetProfile, setChatTargetProfile] = useState<UserProfile | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('holomeet_theme_v2') === 'dark';
    } catch {
      return false;
    }
  });
  const [notification, setNotification] = useState<{ message: string; type?: 'info' | 'success' | 'error' } | null>(null);
  const [chatInitialTab, setChatInitialTab] = useState<'agent' | 'person'>('agent');
  const [personConversations, setPersonConversations] = useState<Record<string, PersonMessage[]>>({});
  const [matchmakingResult, setMatchmakingResult] = useState<MatchmakingResult | null>(null);
  const [matchmakingCached, setMatchmakingCached] = useState(false);
  const [matchmakingLoading, setMatchmakingLoading] = useState(false);
  const [matchmakingError, setMatchmakingError] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const theme = isDarkMode ? 'dark' : 'light';
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
    root.setAttribute('data-theme', theme);
    const shellBg = isDarkMode ? '#0B0B0E' : '#E6E6E2';
    const textColor = isDarkMode ? '#F6F6F3' : '#16171A';
    root.style.backgroundColor = shellBg;
    if (document.body) {
      document.body.style.backgroundColor = shellBg;
      document.body.style.color = textColor;
    }
    try {
      localStorage.setItem('holomeet_theme_v2', theme);
    } catch {}
  }, [isDarkMode]);

  const showNotification = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchState = async () => {
      try {
        const state = await api.getState();
        if (isMounted && state && state.profiles) {
          setAppState(state);
          const otherHero = state.profiles.find(
            p => p.id !== state.currentPersonaId && p.isHero
          );
          if (otherHero) {
            setChatTargetProfile(otherHero);
          }
        }
      } catch (err) {
        console.warn('Initial server state fetch, using seeded cache:', err);
      }
    };
    fetchState();
    return () => {
      isMounted = false;
    };
  }, []);

  const currentPersona =
    appState.profiles.find(p => p.id === appState.currentPersonaId) || appState.profiles[0];

  const heroPersonas = appState.profiles.filter(p => p.isHero);

  const selectedVenue =
    appState.venues.find(v => v.id === appState.selectedVenueId) || appState.venues[0];

  const pendingOpportunitiesCount = appState.opportunities.filter(
    o => o.receiverId === currentPersona.id && !o.receiverApproved && o.status !== 'declined'
  ).length;

  const handleSwitchPersona = async (personaId: string) => {
    try {
      const res = await api.switchPersona(personaId);
      setAppState(res.state);

      const nextTarget = res.state.profiles.find(
        p => p.id !== personaId && p.isHero
      );
      if (nextTarget) {
        setChatTargetProfile(nextTarget);
      }

      setMatchmakingResult(null);
      setMatchmakingCached(false);
      setMatchmakingError(null);

      showNotification(`Switched to ${res.state.profiles.find(p => p.id === personaId)?.name}`, 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSwitchVenue = async (venueId: string) => {
    try {
      await api.switchVenue(venueId);
      const state = await api.getState(currentPersona.id);
      setAppState(state);
      showNotification(`Venue updated to ${state.venues.find(v => v.id === venueId)?.name}`, 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileUpdated = (updatedProfile: UserProfile) => {
    setAppState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        profiles: prev.profiles.map(p => (p.id === updatedProfile.id ? updatedProfile : p))
      };
    });
    showNotification('Avatar presence & rules updated', 'success');
  };

  const handleContinueAsExistingUser = async () => {
    setShowLoginGate(false);
    try {
      const updated: UserProfile = {
        ...currentPersona,
        permissions: { ...currentPersona.permissions, showPresence: false }
      };
      const res = await api.saveProfile(updated);
      setAppState(prev => ({
        ...prev,
        profiles: prev.profiles.map(p => (p.id === res.profile.id ? res.profile : p))
      }));
    } catch (err) {
      console.error('Failed to set initial hidden visibility:', err);
    }
  };

  const handleOpenChatWithProfile = (profile: UserProfile, initialTab: 'agent' | 'person' = 'agent') => {
    setChatTargetProfile(profile);
    setChatInitialTab(initialTab);
    setActiveTab('chat');
  };

  const handleTabSelect = (tabId: string) => {
    if (tabId === 'chat') {
      setChatTargetProfile(null);
    }
    setActiveTab(tabId);
  };

  const personKey = (profileId: string) => `${currentPersona.id}:${profileId}`;

  const makePersonOpener = (profile: UserProfile): PersonMessage => ({
    id: `person-opener-${profile.id}`,
    fromMe: true,
    text: `Hi ${profile.name.split(' ')[0]}, my avatar flagged you — would you like to connect for coffee at ${profile.zone}?`,
    timestamp: new Date().toTimeString().substring(0, 5)
  });

  const getPersonMessages = (profile: UserProfile): PersonMessage[] => {
    return personConversations[personKey(profile.id)] || [makePersonOpener(profile)];
  };

  useEffect(() => {
    if (!chatTargetProfile) return;
    const key = personKey(chatTargetProfile.id);
    setPersonConversations(prev => {
      if (prev[key]) return prev;
      return { ...prev, [key]: [makePersonOpener(chatTargetProfile)] };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatTargetProfile]);

  const handleSendPersonMessage = (profile: UserProfile, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const key = personKey(profile.id);
    setPersonConversations(prev => {
      const existing = prev[key] || [makePersonOpener(profile)];
      return {
        ...prev,
        [key]: [...existing, { id: `person-${Date.now()}`, fromMe: true, text: trimmed, timestamp: new Date().toTimeString().substring(0, 5) }]
      };
    });
  };

  const handleRunMatchmaking = async (force = false, announce = false) => {
    setMatchmakingLoading(true);
    setMatchmakingError(null);
    try {
      const res = await api.runMatchmaking(currentPersona.id, force);
      setMatchmakingResult(res);
      setMatchmakingCached(res.cached);
      // Pull the freshly-saved avatar-to-avatar transcripts into appState so they show up in Chats immediately.
      refreshState();
      if (announce) {
        const count = res.matches?.length || 0;
        showNotification(`Your avatar finished networking the room — ${count} ${count === 1 ? 'match' : 'matches'} ranked. Check Matches →`, 'success');
      }
    } catch (err: any) {
      console.error('Matchmaking error:', err);
      setMatchmakingError(err?.message || 'Failed to analyze matchmaking. Please retry.');
      if (announce) {
        showNotification('Your avatar could not finish networking the room. Try Re-match from the Matches tab.', 'error');
      }
    } finally {
      setMatchmakingLoading(false);
    }
  };

  const handleRunAgentNetwork = async (announce = false) => {
    await handleRunMatchmaking(false, announce);
  };

  // Catch-all: if the current persona is already visible (e.g. inherited from a prior
  // session, or visible on a fresh page load) and no ranked matches exist yet, start
  // networking automatically instead of waiting on an explicit OFF->ON toggle.
  useEffect(() => {
    if (showSplash || showLoginGate || showOnboarding) return;
    if (!currentPersona.permissions.showPresence) return;
    if (matchmakingResult || matchmakingLoading) return;
    handleRunMatchmaking(false, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPersona.id, currentPersona.permissions.showPresence, showSplash, showLoginGate, showOnboarding]);

  const handleRequestIntroduction = async (targetProfileId: string, initialNote: string, conversationId?: string) => {
    try {
      const res = await api.requestOpportunity({
        senderId: currentPersona.id,
        receiverId: targetProfileId,
        initialNote,
        conversationId
      });
      setAppState(res.state);
      showNotification('Intro request sent to counterparty inbox!', 'success');
    } catch (err: any) {
      console.error(err);
      showNotification(err?.message || 'Failed to send introduction request', 'error');
      throw err;
    }
  };

  const handleApproveOpportunity = async (oppId: string) => {
    try {
      const res = await api.approveOpportunity(oppId, currentPersona.id);
      setAppState(res.state);
      showNotification('Introduction approved! Contact details unlocked upon mutual confirmation.', 'success');
    } catch (err: any) {
      console.error(err);
      showNotification(err?.message || 'Failed to approve introduction', 'error');
      throw err;
    }
  };

  const handleDeclineOpportunity = async (oppId: string) => {
    try {
      const res = await api.declineOpportunity(oppId, currentPersona.id);
      setAppState(res.state);
      showNotification('Opportunity declined.', 'info');
    } catch (err: any) {
      console.error(err);
      showNotification(err?.message || 'Failed to decline opportunity', 'error');
      throw err;
    }
  };

  const handleResetDemo = async () => {
    try {
      const res = await api.resetState();
      setAppState(res.state);
      showNotification('Demo state reset to initial seed data.', 'info');
    } catch (err: any) {
      console.error(err);
      showNotification(err?.message || 'Failed to reset demo state', 'error');
    }
  };

  const refreshState = async (viewerId?: string) => {
    try {
      const state = await api.getState(viewerId || currentPersona.id);
      setAppState(state);
      return state;
    } catch (err) {
      console.error('Error refreshing state:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'inbox' || activeTab === 'matchmaking') {
      refreshState();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#E6E6E2] w-full overflow-clip selection:bg-[#16171A] selection:text-white transition-colors duration-200">
      
      {/* Login gate mounts first (underneath splash via z-index) so the splash's
          fade-out reveals the login gate, not the raw app content behind it. */}
      {showLoginGate && (
        <LoginGateScreen
          onContinue={handleContinueAsExistingUser}
          onCreateAccount={() => { setShowLoginGate(false); setShowOnboarding(true); }}
        />
      )}

      {showOnboarding && (
        <OnboardingWizard
          currentPersona={currentPersona}
          onProfileUpdated={handleProfileUpdated}
          onComplete={() => setShowOnboarding(false)}
        />
      )}

      {/* 1.5-2s Full-Screen Splash Screen with Warm Light Palette */}
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}

      {/* 390px-430px Native Mobile App Container — not rendered at all while the login
          gate or onboarding wizard is active, so there's nothing underneath for clicks
          or scroll/clip quirks to ever reach. */}
      {!showLoginGate && !showOnboarding && (
      <div className="w-full max-w-[430px] min-h-screen mx-auto bg-[#F6F6F3] text-[#16171A] flex flex-col relative shadow-xl border-x border-[#D8D8D3] transition-colors duration-200 overflow-clip">

        {/* Floating Toast Notification */}
        {notification && (
          <div
            className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-32px)] w-[360px] px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2.5 text-xs font-sans transition-all ${
              notification.type === 'error'
                ? 'bg-rose-900 text-white border border-rose-800'
                : notification.type === 'success'
                ? 'bg-[#16171A] text-[#F6F6F3] border border-zinc-700'
                : 'bg-[#16171A] text-[#F6F6F3] border border-zinc-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                notification.type === 'error'
                  ? 'bg-rose-400'
                  : 'bg-emerald-400'
              }`}
            ></span>
            <span className="truncate min-w-0 flex-1 font-medium">{notification.message}</span>
          </div>
        )}

        {/* Single Scrollable View Body with bottom padding for pinned navigation */}
        <main className="flex-1 overflow-x-hidden pb-20">
          {activeTab === 'home' && (
            <HomeScreen
              currentPersona={currentPersona}
              selectedVenue={selectedVenue}
              onNavigateToDiscovery={() => setActiveTab('discovery')}
              onNavigateToProfile={() => setActiveTab('profile')}
              onNavigateToMatches={() => setActiveTab('matchmaking')}
            />
          )}

          {activeTab === 'discovery' && (
            <VenueDiscovery
              currentPersona={currentPersona}
              selectedVenue={selectedVenue}
              allVenues={appState.venues}
              onSwitchVenue={handleSwitchVenue}
              allProfiles={appState.profiles}
              onOpenChatWithProfile={handleOpenChatWithProfile}
              onRequestIntro={(target) =>
                handleRequestIntroduction(target.id, `Discovery intro request at ${target.zone}`)
              }
              onProfileUpdated={handleProfileUpdated}
              onNavigateToMatches={() => setActiveTab('matchmaking')}
              matchmakingResult={matchmakingResult}
              matchmakingLoading={matchmakingLoading}
              onRunAgentNetwork={handleRunAgentNetwork}
            />
          )}

          {activeTab === 'matchmaking' && (
            <MatchmakingView
              currentPersona={currentPersona}
              onRequestIntroduction={handleRequestIntroduction}
              onNavigateToInbox={() => setActiveTab('inbox')}
              existingOpportunities={appState.opportunities}
              matchResult={matchmakingResult}
              isCached={matchmakingCached}
              isLoading={matchmakingLoading}
              matchmakingError={matchmakingError}
              onRunMatchmaking={handleRunMatchmaking}
              onOpenChatWithProfile={handleOpenChatWithProfile}
            />
          )}

          {activeTab === 'chat' && (
            chatTargetProfile ? (
              <AgentChatWidget
                targetProfile={chatTargetProfile}
                currentPersona={currentPersona}
                onNavigateToInbox={() => setActiveTab('inbox')}
                onSelectDifferentProfile={() => setChatTargetProfile(null)}
                onOpportunityCreated={() => refreshState()}
                onStateRefreshed={(newState) => setAppState(newState)}
                existingOpportunities={appState.opportunities}
                initialTab={chatInitialTab}
                personMessages={getPersonMessages(chatTargetProfile)}
                onSendPersonMessage={(text) => handleSendPersonMessage(chatTargetProfile, text)}
              />
            ) : (
              <ChatsListScreen
                currentPersona={currentPersona}
                allProfiles={appState.profiles}
                conversations={appState.conversations}
                personConversations={personConversations}
                opportunities={appState.opportunities}
                matchmakingResult={matchmakingResult}
                onOpenChat={handleOpenChatWithProfile}
                onNavigateToDiscovery={() => setActiveTab('discovery')}
                onApproveOpportunity={handleApproveOpportunity}
                onDeclineOpportunity={handleDeclineOpportunity}
                onRequestIntroduction={handleRequestIntroduction}
              />
            )
          )}

          {activeTab === 'inbox' && (
            <OpportunityInbox
              currentPersona={currentPersona}
              opportunities={appState.opportunities}
              allProfiles={appState.profiles}
              conversations={appState.conversations}
              onApproveOpportunity={handleApproveOpportunity}
              onDeclineOpportunity={handleDeclineOpportunity}
              onOpenChatWithProfile={handleOpenChatWithProfile}
              onSwitchPersona={handleSwitchPersona}
              onRefresh={refreshState}
              matchmakingResult={matchmakingResult}
              onRequestIntroduction={handleRequestIntroduction}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileStudio
              currentPersona={currentPersona}
              allHeroPersonas={heroPersonas}
              onSwitchPersona={handleSwitchPersona}
              onProfileUpdated={handleProfileUpdated}
              isDarkMode={isDarkMode}
              onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
              onResetDemo={handleResetDemo}
              onOpenActivityLog={() => setActiveTab('activity-log')}
              onReplaySplash={() => { setShowSplash(true); setShowLoginGate(true); }}
              onLogout={() => { setChatTargetProfile(null); setActiveTab('discovery'); setShowLoginGate(true); }}
            />
          )}

          {activeTab === 'activity-log' && (
            <AiActivityLog
              onBack={() => setActiveTab('profile')}
              logs={appState.aiActivityLogs}
              onRefresh={refreshState}
              currentPersona={currentPersona}
              allHeroPersonas={heroPersonas}
              onSwitchPersona={handleSwitchPersona}
              onResetDemo={handleResetDemo}
              onReplaySplash={() => { setShowSplash(true); setShowLoginGate(true); }}
              allConversations={appState.conversations}
              allProfiles={appState.profiles}
            />
          )}
        </main>

        {/* Fixed Native Mobile Bottom Tab Bar with Holographic Active Glow */}
        <BottomTabBar
          activeTab={activeTab}
          setActiveTab={handleTabSelect}
          pendingInboxCount={pendingOpportunitiesCount}
          pendingChatsCount={pendingOpportunitiesCount}
        />

      </div>
      )}
    </div>
  );
}
