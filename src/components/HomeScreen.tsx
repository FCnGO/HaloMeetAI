import React from 'react';
import { UserProfile, Venue } from '../types';
import {
  Compass,
  Sliders,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  Users,
  ArrowRight
} from 'lucide-react';
import { getPastelTheme } from '../utils/pastel';

interface HomeScreenProps {
  currentPersona: UserProfile;
  selectedVenue: Venue;
  onNavigateToDiscovery: () => void;
  onNavigateToProfile: () => void;
  onNavigateToMatches: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentPersona,
  selectedVenue,
  onNavigateToDiscovery,
  onNavigateToProfile,
  onNavigateToMatches
}) => {
  const currentPastel = getPastelTheme(currentPersona.id);

  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-[430px] mx-auto pb-24">
      
      {/* 1. Introduction Hero Card */}
      <div className="clean-card p-5 sm:p-6 space-y-4 relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] text-[11px] font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Avatar Physical Presence</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#16171A] leading-snug">
          Your AI avatar, discoverable anywhere
        </h1>

        <p className="text-[13px] text-[#5A5C63] leading-relaxed">
          Millions pass through transit hubs with high-value intent and products, yet miss relevant peers. HoloMeet AI lets you deploy a personal Gemini avatar that autonomously discovers attendees, qualifies mutual synergy, and coordinates introductions inside your own permission boundaries.
        </p>

        {/* Primary & Secondary Action CTAs */}
        <div className="pt-2 space-y-2.5">
          <button
            type="button"
            onClick={onNavigateToDiscovery}
            className="btn-primary-pill w-full h-12 text-sm shadow-sm"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Attendees at {selectedVenue.code} →</span>
          </button>

          <button
            type="button"
            onClick={onNavigateToProfile}
            className="btn-secondary-pill w-full h-11 text-xs"
          >
            <Sliders className="w-3.5 h-3.5 text-[#5A5C63]" />
            <span>Configure Avatar & Permission Rules</span>
          </button>
        </div>
      </div>

      {/* 2. Current Active Persona Status Card */}
      <div className="clean-card p-5 space-y-4">
        
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-[#8E9097] uppercase tracking-wider text-[10px]">
            Your Active Presence
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
            <span>Broadcasting Online</span>
          </span>
        </div>

        {/* Persona Info */}
        <div className="flex items-start gap-3.5 pt-1">
          <div className="relative shrink-0">
            <img
              src={currentPersona.avatar}
              alt={currentPersona.name}
              className="w-14 h-14 rounded-full object-cover ring-2 shadow-xs"
              style={{ borderColor: currentPastel.border }}
            />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#10B981] border-2 border-white"></span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-[#16171A] truncate">
              {currentPersona.name}
            </h3>
            <div className="text-xs text-[#5A5C63] font-medium truncate">
              {currentPersona.role}
            </div>
            <div className="text-[11px] text-[#8E9097] font-medium truncate mt-0.5">
              {currentPersona.company}
            </div>
          </div>
        </div>

        {/* Venue Location & Dwell Window */}
        <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
          <div className="p-3 rounded-2xl bg-[#F6F6F3] border border-[#E2E2DC] flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 border border-[#D8D8D3]">
              <MapPin className="w-3.5 h-3.5 text-[#16171A]" />
            </div>
            <div className="truncate">
              <div className="text-[10px] text-[#8E9097] uppercase font-semibold">Venue Zone</div>
              <div className="font-semibold text-[#16171A] truncate">{currentPersona.zone}</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#F6F6F3] border border-[#E2E2DC] flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 border border-[#D8D8D3]">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
            </div>
            <div className="truncate">
              <div className="text-[10px] text-[#8E9097] uppercase font-semibold">Availability</div>
              <div className="font-semibold text-[#16171A]">{currentPersona.availabilityMinutes}m Left</div>
            </div>
          </div>
        </div>

        {/* One-Line Value Prop */}
        <div className="p-3.5 bg-[#F6F6F3] rounded-2xl text-xs leading-relaxed text-[#16171A] border border-[#E2E2DC]">
          <div className="text-[10px] font-semibold text-[#5A5C63] uppercase tracking-wider mb-1">
            Avatar Authorized Pitch
          </div>
          <span className="italic">"{currentPersona.agentSpec.oneLinePitch}"</span>
        </div>

        {/* Security Matrix Snapshot */}
        <div className="flex items-center justify-between text-xs text-[#5A5C63] pt-2 border-t border-[#E2E2DC]">
          <span className="flex items-center gap-1.5 text-[#166534] font-medium text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Strict Permissions Enforced</span>
          </span>
          <span className="flex items-center gap-1.5 text-[#5A5C63] font-medium text-[11px]">
            <Users className="w-3.5 h-3.5 text-[#16171A]" />
            <span>{selectedVenue.activeAttendeesCount} peers nearby</span>
          </span>
        </div>

      </div>

      {/* 3. Autonomous Matchmaking Teaser Card */}
      <div
        onClick={onNavigateToMatches}
        className="clean-card p-4 hover:border-[#16171A] flex items-center justify-between cursor-pointer transition-colors group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#F6F6F3] border border-[#D8D8D3] text-[#16171A] flex items-center justify-center shrink-0 group-hover:bg-[#16171A] group-hover:text-white transition-colors">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#16171A]">
              Avatar-to-Avatar Matchmaking
            </div>
            <div className="text-xs text-[#5A5C63]">
              Autonomous negotiations & synergy rankings
            </div>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#F6F6F3] flex items-center justify-center group-hover:bg-[#16171A] group-hover:text-white transition-colors">
          <ArrowRight className="w-4 h-4 text-[#5A5C63] group-hover:text-white" />
        </div>
      </div>

    </div>
  );
};
