import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ChevronDown } from 'lucide-react';
import { getPastelTheme } from '../utils/pastel';

interface MobileHeaderProps {
  currentPersona: UserProfile;
  allHeroPersonas: UserProfile[];
  onSwitchPersona: (personaId: string) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onResetDemo?: () => void;
  onReplaySplash?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  currentPersona,
  allHeroPersonas,
  onSwitchPersona,
  onReplaySplash
}) => {
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const currentPastel = getPastelTheme(currentPersona.id);

  return (
    <header className="sticky top-0 z-30 bg-[#F6F6F3] text-[#16171A] border-b border-[#D8D8D3] px-4 h-14 flex items-center justify-between transition-colors duration-200">
      
      {/* 1. HoloMeet AI Brand Wordmark (Clickable to Replay Splash) */}
      <button
        type="button"
        onClick={onReplaySplash}
        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity cursor-pointer text-left"
        title="Replay HoloMeet AI Splash Screen"
      >
        <div className="w-5 h-5 rounded-md bg-[#16171A] flex items-center justify-center shrink-0 shadow-xs">
          <div className="w-2 h-2 bg-[#F6F6F3] rotate-45 rounded-[1px]"></div>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-semibold text-[15px] tracking-tight text-[#16171A] font-sans">
            HoloMeet
          </span>
          <span className="px-1.5 py-0.5 rounded-full bg-[#16171A] text-[#F6F6F3] text-[9px] font-semibold tracking-wider">
            AI
          </span>
        </div>
      </button>

      {/* 2. Persona Switcher (Pill with Avatar + Name + Dropdown) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowPersonaMenu(!showPersonaMenu)}
          className="btn-secondary-pill px-3 py-1.5 text-xs shadow-xs group"
          title="Switch demo persona"
        >
          <div className="relative">
            <img
              src={currentPersona.avatar}
              alt={currentPersona.name}
              className="w-5 h-5 rounded-full object-cover ring-2"
              style={{ borderColor: currentPastel.border }}
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 border border-white"></span>
          </div>
          <span className="font-semibold text-xs tracking-tight text-[#16171A]">
            {currentPersona.name.split(' ')[0]}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-[#5A5C63] group-hover:text-[#16171A] transition-transform" />
        </button>

        {showPersonaMenu && (
          <div className="absolute right-0 mt-2 w-68 bg-white border border-[#D8D8D3] rounded-2xl shadow-xl py-2 z-50 animate-fade-in">
            <div className="px-4 py-1.5 text-[10px] font-medium text-[#8E9097] uppercase tracking-wider border-b border-[#E2E2DC] flex items-center justify-between">
              <span>Switch Demo Persona</span>
              <span className="text-[#16171A] font-semibold">2-Window Demo</span>
            </div>
            {allHeroPersonas.map((persona) => {
              const isSelected = persona.id === currentPersona.id;
              const personaPastel = getPastelTheme(persona.id);
              return (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => {
                    onSwitchPersona(persona.id);
                    setShowPersonaMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-[#F6F6F3] transition-colors cursor-pointer ${
                    isSelected ? 'bg-[#F6F6F3] font-medium' : ''
                  }`}
                >
                  <img
                    src={persona.avatar}
                    alt={persona.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0 ring-2"
                    style={{ borderColor: personaPastel.border }}
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-xs font-semibold text-[#16171A] truncate flex items-center justify-between">
                      <span>{persona.name}</span>
                      {isSelected && (
                        <span className="text-[9px] px-2 py-0.5 bg-[#16171A] text-[#F6F6F3] rounded-full font-medium">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#5A5C63] truncate">
                      {persona.role}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

    </header>
  );
};
