import React from 'react';
import { UserProfile, Venue } from '../types';
import {
  Users,
  Radio,
  Sparkles,
  Inbox,
  UserCheck,
  Moon,
  Sun,
  MapPin,
  ChevronDown,
  RefreshCw
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentPersona: UserProfile;
  allHeroPersonas: UserProfile[];
  onSwitchPersona: (personaId: string) => void;
  selectedVenue: Venue;
  allVenues: Venue[];
  onSwitchVenue: (venueId: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  pendingCount: number;
  onResetDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentPersona,
  allHeroPersonas,
  onSwitchPersona,
  selectedVenue,
  allVenues,
  onSwitchVenue,
  isDarkMode,
  onToggleDarkMode,
  pendingCount,
  onResetDemo
}) => {
  const [personaMenuOpen, setPersonaMenuOpen] = React.useState(false);
  const [venueMenuOpen, setVenueMenuOpen] = React.useState(false);

  const tabs = [
    { id: 'discovery', label: 'Venue Discovery', icon: Radio },
    { id: 'matchmaking', label: 'Avatar Matchmaking', icon: Sparkles },
    { id: 'chat', label: 'Avatar Chat', icon: Users },
    { id: 'inbox', label: 'Opportunity Inbox', icon: Inbox, badge: pendingCount },
    { id: 'studio', label: 'Profile & Avatar Studio', icon: UserCheck }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#F6F6F3] text-[#16171A] border-b border-[#D8D8D3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left Brand Zone matching ANiX / forthcode screenshot */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2">
              {/* Forthcode Diamond glyph */}
              <div className="w-6 h-6 border-2 border-white rotate-45 flex items-center justify-center transform transition-transform hover:rotate-90">
                <div className="w-1.5 h-1.5 bg-[#0066FF]"></div>
              </div>
              <span className="font-mono text-base font-semibold tracking-tight text-white">
                forthc&lt;&gt;de
              </span>
            </div>

            <div className="h-4 w-px bg-zinc-700 hidden sm:block"></div>

            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-wide text-zinc-100 flex items-center gap-1.5">
                HoloMeet AI
                <span className="inline-block w-2 h-2 rounded-full bg-[#0066FF] animate-pulse"></span>
              </span>
              <span className="text-[10px] text-zinc-400 hidden md:inline">
                Avatar Physical Layer
              </span>
            </div>
          </div>

          {/* Center Tabs Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 relative ${
                    isActive
                      ? 'text-white bg-zinc-900 border-b-2 border-[#0066FF]'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] font-semibold bg-[#0066FF] text-white rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Zone: Venue + Persona Switcher + Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Venue Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setVenueMenuOpen(!venueMenuOpen);
                  setPersonaMenuOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-md transition-colors"
                title="Current Venue"
              >
                <MapPin className="w-3.5 h-3.5 text-[#0066FF]" />
                <span className="font-mono font-medium hidden sm:inline">{selectedVenue.code}</span>
                <span className="text-zinc-400 hidden xl:inline text-[11px] truncate max-w-[120px]">
                  {selectedVenue.terminal}
                </span>
                <ChevronDown className="w-3 h-3 text-zinc-500" />
              </button>

              {venueMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-700 rounded-md shadow-2xl py-1 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                    Physical Venues
                  </div>
                  {allVenues.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        onSwitchVenue(v.id);
                        setVenueMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-zinc-800 transition-colors ${
                        v.id === selectedVenue.id ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-300'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{v.city} ({v.code})</div>
                        <div className="text-[11px] text-zinc-400">{v.terminal}</div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-300">
                        {v.activeAttendeesCount} present
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Persona Switcher (Live Demo Hero Control) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setPersonaMenuOpen(!personaMenuOpen);
                  setVenueMenuOpen(false);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 text-xs bg-zinc-900 hover:bg-zinc-800 border border-[#0066FF]/60 hover:border-[#0066FF] rounded-md transition-all group"
                title="Switch Demo Persona"
              >
                <img
                  src={currentPersona.avatar}
                  alt={currentPersona.name}
                  className="w-5 h-5 rounded-full object-cover border border-white/20"
                />
                <div className="text-left hidden md:block">
                  <div className="font-semibold text-white leading-tight flex items-center gap-1">
                    {currentPersona.name}
                    <span className="text-[9px] text-[#0066FF] uppercase font-mono">DEMO</span>
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-zinc-400 group-hover:text-white" />
              </button>

              {personaMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-zinc-900 border border-zinc-700 rounded-md shadow-2xl py-1 z-50">
                  <div className="px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Switch Demo Persona
                    </span>
                    <span className="text-[10px] text-[#0066FF] font-mono">2-Window Demo</span>
                  </div>
                  {allHeroPersonas.map((persona) => {
                    const isSelected = persona.id === currentPersona.id;
                    return (
                      <button
                        key={persona.id}
                        type="button"
                        onClick={() => {
                          onSwitchPersona(persona.id);
                          setPersonaMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 flex items-start gap-2.5 hover:bg-zinc-800 transition-colors border-b border-zinc-800/40 last:border-b-0 ${
                          isSelected ? 'bg-zinc-800/90 text-white' : 'text-zinc-300'
                        }`}
                      >
                        <img
                          src={persona.avatar}
                          alt={persona.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 border border-zinc-600"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-white truncate">
                              {persona.name}
                            </span>
                            {isSelected && (
                              <span className="text-[9px] bg-[#0066FF] text-white px-1.5 py-0.2 rounded font-mono">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-400 truncate">
                            {persona.role}
                          </div>
                          <div className="text-[10px] text-zinc-500 font-mono truncate">
                            {persona.company} · {persona.zone}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Reset Demo State Button */}
            <button
              type="button"
              onClick={onResetDemo}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors"
              title="Reset Demo Data to Seed"
              aria-label="Reset demo state"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex items-center justify-around py-2 border-t border-zinc-800 overflow-x-auto gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  isActive ? 'bg-zinc-800 text-white border-b-2 border-[#0066FF]' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-1 text-[9px] font-semibold bg-[#0066FF] text-white rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
