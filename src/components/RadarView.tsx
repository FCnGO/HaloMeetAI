import React, { useState, useMemo } from 'react';
import { UserProfile, Venue } from '../types';
import { getPastelTheme } from '../utils/pastel';
import { Sparkles, MessageSquare, UserCheck, MapPin } from 'lucide-react';

export const RadarIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className={className}
  >
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

interface RadarViewProps {
  currentPersona: UserProfile;
  profiles: UserProfile[];
  selectedVenue: Venue;
  onSelectProfile: (profile: UserProfile) => void;
  onOpenChatWithProfile: (profile: UserProfile) => void;
  onRequestIntro: (profile: UserProfile) => void;
  matchScores?: Record<string, number>;
}

interface RadarPosition {
  profile: UserProfile;
  xPct: number;
  yPct: number;
  radiusPct: number;
  angleDeg: number;
}

export const RadarView: React.FC<RadarViewProps> = ({
  currentPersona,
  profiles,
  selectedVenue,
  onSelectProfile,
  onOpenChatWithProfile,
  onRequestIntro,
  matchScores
}) => {
  const [activeBubbleId, setActiveBubbleId] = useState<string | null>(null);

  // Compute deterministic, nicely distributed positions for attendees around the center (50%, 50%)
  const attendeesWithPositions: RadarPosition[] = useMemo(() => {
    const count = profiles.length;
    if (count === 0) return [];

    // Ring tiers: inner (22%), middle (31%), outer (40%)
    const ringTiers = [22, 31, 40];

    return profiles.map((p, idx) => {
      // Deterministic hash from ID for organic variation without layout jitter
      let hash = 0;
      for (let i = 0; i < p.id.length; i++) {
        hash = (hash << 5) - hash + p.id.charCodeAt(i);
        hash |= 0;
      }
      const absHash = Math.abs(hash);

      // Angle distribution: evenly spaced base angle with slight controlled offset
      const baseAngle = (idx * (2 * Math.PI / count)) - (Math.PI / 3);
      const angleJitter = ((absHash % 16) - 8) * (Math.PI / 180); // +/- 8 deg
      const finalAngle = baseAngle + angleJitter;

      // Stagger radius across the 3 concentric guide rings
      const tierIndex = idx % ringTiers.length;
      const baseRadius = ringTiers[tierIndex];
      const radiusJitter = ((absHash % 4) - 2); // +/- 2%
      const finalRadius = Math.max(18, Math.min(42, baseRadius + radiusJitter));

      const xPct = 50 + finalRadius * Math.cos(finalAngle);
      const yPct = 50 + finalRadius * Math.sin(finalAngle);
      const angleDeg = (finalAngle * 180) / Math.PI;

      return {
        profile: p,
        xPct,
        yPct,
        radiusPct: finalRadius,
        angleDeg
      };
    });
  }, [profiles]);

  const activeProfile = useMemo(() => {
    if (!activeBubbleId) return null;
    return profiles.find(p => p.id === activeBubbleId) || null;
  }, [activeBubbleId, profiles]);

  // Small decorative ambient dots scattered between attendee bubbles, purely cosmetic
  const ambientDots = useMemo(() => [
    { x: 14, y: 30 }, { x: 86, y: 32 }, { x: 20, y: 72 }, { x: 80, y: 70 }
  ], []);

  return (
    <div className="space-y-4 animate-fade-in">
      
      {/* Radar Main Card */}
      <div className="clean-card p-4 space-y-3 relative overflow-hidden bg-white border border-[#D8D8D3]">
        
        {/* Radar Header Status */}
        <div className="flex items-center justify-between text-xs pb-1 border-b border-[#F0F0EC]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            <span className="font-semibold text-[#16171A]">360° Proximity Radar</span>
          </div>
          <div className="text-[11px] font-medium text-[#5A5C63]">
            {profiles.length} Attendees Live
          </div>
        </div>

        {/* Circular Radar Canvas Container */}
        <div
          role="region"
          aria-label="Spatial Radar View"
          className="relative w-full aspect-square max-w-[370px] mx-auto rounded-full bg-[#FBFBFA] border border-[#D8D8D3] flex items-center justify-center overflow-hidden select-none shadow-inner"
        >
          {/* Subtle Concentric Guide Rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[86%] h-[86%] rounded-full border border-[#D8D8D3]/80 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[62%] h-[62%] rounded-full border border-[#D8D8D3]/70 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[38%] h-[38%] rounded-full border border-[#D8D8D3]/60 pointer-events-none" />

          {/* Crosshairs & Compass Guideline Axes */}
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#E2E2DC]/80 pointer-events-none" />
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#E2E2DC]/80 pointer-events-none" />

          {/* Metric Distance Marks */}
          <span className="absolute top-1/2 left-[8%] -translate-y-3.5 text-[8.5px] font-mono text-[#8E9097] pointer-events-none">
            50m
          </span>
          <span className="absolute top-1/2 left-[20%] -translate-y-3.5 text-[8.5px] font-mono text-[#8E9097] pointer-events-none">
            25m
          </span>
          <span className="absolute top-1/2 left-[32%] -translate-y-3.5 text-[8.5px] font-mono text-[#8E9097] pointer-events-none">
            10m
          </span>
          <span className="absolute top-1/2 right-[8%] -translate-y-3.5 text-[8.5px] font-mono text-[#8E9097] pointer-events-none">
            50m
          </span>

          {/* SVG Connector Lines from Center to Each Attendee Bubble */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {attendeesWithPositions.map((pos) => {
              const isSelected = activeBubbleId === pos.profile.id;
              return (
                <line
                  key={`line-${pos.profile.id}`}
                  x1="50"
                  y1="50"
                  x2={pos.xPct}
                  y2={pos.yPct}
                  stroke={isSelected ? '#16171A' : '#D0D0CA'}
                  strokeWidth={isSelected ? '0.9' : '0.6'}
                  strokeDasharray="2 1.6"
                  vectorEffect="non-scaling-stroke"
                  opacity={isSelected ? 0.9 : 0.45}
                />
              );
            })}
          </svg>

          {/* Decorative ambient dots for visual texture */}
          {ambientDots.map((d, i) => (
            <span
              key={`ambient-${i}`}
              className="absolute w-1.5 h-1.5 rounded-full bg-[#D0D0CA] pointer-events-none"
              style={{ left: `${d.x}%`, top: `${d.y}%`, transform: 'translate(-50%, -50%)' }}
            />
          ))}

          {/* CSS Radar Sweep: Translucent gradient rotating 360° continuously */}
          <div
            className="absolute top-1/2 left-1/2 w-[88%] h-[88%] rounded-full pointer-events-none animate-radar-sweep"
            style={{
              background: 'conic-gradient(from 0deg, rgba(22, 23, 26, 0.18) 0deg, rgba(22, 23, 26, 0.05) 45deg, transparent 75deg, transparent 360deg)'
            }}
          />

          {/* Center Hub: Active Persona (You) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none">
            <div className="relative flex items-center justify-center">
              {/* Outer soft pulse ring */}
              <div className="absolute inset-0 rounded-full bg-[#16171A]/10 scale-125 animate-ping opacity-30" />
              <div className="w-13 h-13 rounded-full border-2 border-[#16171A] bg-white shadow-md p-0.5 flex items-center justify-center overflow-hidden">
                <img
                  src={currentPersona.avatar}
                  alt={currentPersona.name}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <span className="absolute -bottom-1 bg-[#16171A] text-white text-[8.5px] font-semibold px-1.5 py-0.2 rounded-full uppercase tracking-wider shadow-xs">
                You
              </span>
            </div>
          </div>

          {/* Surrounding Attendee Bubbles */}
          {attendeesWithPositions.map((pos) => {
            const p = pos.profile;
            const pastel = getPastelTheme(p.id);
            const isSelected = activeBubbleId === p.id;

            return (
              <div
                key={p.id}
                style={{
                  position: 'absolute',
                  left: `${pos.xPct}%`,
                  top: `${pos.yPct}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: isSelected ? 30 : 25
                }}
                className="flex flex-col items-center"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveBubbleId(p.id);
                    onSelectProfile(p);
                  }}
                  onMouseEnter={() => setActiveBubbleId(p.id)}
                  aria-label={`View attendee ${p.name}`}
                  className={`relative w-11 h-11 rounded-full p-0.5 transition-all duration-200 cursor-pointer shadow-md flex items-center justify-center group ${
                    isSelected
                      ? 'scale-115 ring-2 ring-[#16171A] ring-offset-2 bg-white'
                      : 'hover:scale-110 bg-white hover:ring-1 hover:ring-[#16171A]'
                  }`}
                  style={{
                    borderColor: pastel.border
                  }}
                >
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {/* Presence indicator dot */}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-white shadow-xs" />
                  {/* Synergy Star Badge (after matchmaking has run) */}
                  {typeof matchScores?.[p.id] === 'number' && (
                    <span className="absolute -top-1 -right-1 bg-[#5558E8] text-white text-[8px] font-semibold px-1.5 py-0.2 rounded-full shadow-xs flex items-center gap-0.5">
                      <span>{Math.max(1, Math.min(5, Math.round(matchScores[p.id] / 20)))}★</span>
                    </span>
                  )}
                </button>

                {/* Attendee Name Chip */}
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveBubbleId(p.id);
                    onSelectProfile(p);
                  }}
                  className={`mt-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap truncate max-w-[72px] transition-all cursor-pointer shadow-xs ${
                    isSelected
                      ? 'bg-[#16171A] text-white'
                      : 'bg-white/90 text-[#16171A] border border-[#D8D8D3] hover:bg-white'
                  }`}
                >
                  {p.name.split(' ')[0]}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tip text */}
        <div className="text-center pt-1">
          <p className="text-[11px] text-[#8E9097]">
            Tap any avatar bubble on the radar to inspect their profile or chat.
          </p>
        </div>
      </div>

      {/* Quick Inspection Card for the highlighted attendee */}
      {activeProfile && (
        <div className="clean-card p-4 space-y-3 bg-white border border-[#D8D8D3] animate-fade-in shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full p-0.5 border-2 shadow-xs shrink-0"
                style={{ borderColor: getPastelTheme(activeProfile.id).border }}
              >
                <img
                  src={activeProfile.avatar}
                  alt={activeProfile.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm text-[#16171A] truncate">
                  {activeProfile.name}
                </div>
                <div className="text-xs text-[#5A5C63] truncate">
                  {activeProfile.role} · {activeProfile.company}
                </div>
                <div className="flex items-center gap-1 mt-0.5 text-[10.5px] text-[#8E9097]">
                  <MapPin className="w-3 h-3 text-[#16171A] shrink-0" />
                  <span>{activeProfile.zone} ({selectedVenue.code})</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelectProfile(activeProfile);
              }}
              className="text-xs font-semibold text-[#16171A] hover:underline cursor-pointer shrink-0 pt-1"
            >
              Full Profile
            </button>
          </div>

          {/* Avatar One-Line Pitch */}
          <div className="p-2.5 rounded-xl bg-[#F6F6F3] border border-[#E2E2DC] text-xs text-[#16171A] italic leading-relaxed">
            "{activeProfile.agentSpec.oneLinePitch}"
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenChatWithProfile(activeProfile);
              }}
              className="btn-primary-pill py-2 text-xs font-semibold shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat Avatar</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRequestIntro(activeProfile);
              }}
              className="btn-secondary-pill py-2 text-xs font-semibold shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Request Intro</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
