import React from 'react';
import { PASTEL_PALETTE } from '../utils/pastel';

interface LoginGateScreenProps {
  onContinue: () => void;
  onCreateAccount: () => void;
}

// Fixed colors matching the reference design exactly (not hash-derived)
const radarDots = [
  { id: 'PN', pastel: PASTEL_PALETTE[0], x: 0, y: -98 },    // Soft Yellow
  { id: 'LH', pastel: PASTEL_PALETTE[2], x: 78, y: -62 },   // Light Blue
  { id: 'DO', pastel: PASTEL_PALETTE[3], x: 108, y: 10 },   // Lavender
  { id: 'ON', pastel: PASTEL_PALETTE[6], x: 78, y: 82 },    // Peach
  { id: 'HC', pastel: PASTEL_PALETTE[3], x: 0, y: 112 },    // Lavender
  { id: 'SM', pastel: PASTEL_PALETTE[5], x: -78, y: 82 },   // Pink
  { id: 'KW', pastel: PASTEL_PALETTE[4], x: -108, y: 10 },  // Teal
  { id: 'AM', pastel: PASTEL_PALETTE[1], x: -78, y: -62 },  // Mint
];

export const LoginGateScreen: React.FC<LoginGateScreenProps> = ({ onContinue, onCreateAccount }) => {
  return (
    <div className="fixed inset-0 z-[60] bg-[#F6F6F3] flex flex-col overflow-y-auto">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-6 max-w-[430px] mx-auto w-full">
        {/* Mini radar visualization */}
        <div className="relative w-64 h-64 mb-8 shrink-0">
          <div className="absolute inset-0 rounded-full border border-[#D8D8D3]"></div>
          <div className="absolute inset-6 rounded-full border border-[#D8D8D3]"></div>
          <div className="absolute inset-12 rounded-full border border-[#D8D8D3]"></div>

          {/* Animated radar sweep, tinted to match the indigo accent */}
          <div
            className="absolute top-1/2 left-1/2 w-[94%] h-[94%] rounded-full pointer-events-none animate-radar-sweep"
            style={{
              background: 'conic-gradient(from 0deg, rgba(85, 88, 232, 0.35) 0deg, rgba(85, 88, 232, 0.12) 45deg, transparent 80deg, transparent 360deg)'
            }}
          />

          <div className="absolute top-1/2 left-1/2 w-20 h-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5558E8] flex items-center justify-center text-white font-semibold text-sm shadow-lg z-10">
            TR
          </div>
          {radarDots.map((dot) => (
            <div
              key={dot.id}
              className="absolute top-1/2 left-1/2 w-11 h-11 rounded-full flex items-center justify-center text-[11px] font-semibold shadow-xs z-10"
              style={{
                transform: `translate(calc(-50% + ${dot.x * 0.78}px), calc(-50% + ${dot.y * 0.78}px))`,
                backgroundColor: dot.pastel.bg,
                color: dot.pastel.text
              }}
            >
              {dot.id}
            </div>
          ))}
        </div>

        <h1 className="text-4xl font-semibold tracking-tight text-[#16171A] mb-3">HoloMeet</h1>
        <p className="text-base text-[#5A5C63] text-center leading-relaxed mb-10 max-w-[320px]">
          Your AI avatar works the room, so you meet the people who matter.
        </p>

        <div className="w-full space-y-2.5">
          <button
            type="button"
            onClick={onCreateAccount}
            className="btn-primary-pill w-full h-13 text-base shadow-sm"
          >
            Create an account
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="btn-secondary-pill w-full h-13 text-base"
          >
            I already have an account
          </button>
        </div>

        <p className="text-xs text-[#A4A7AE] text-center mt-5 leading-relaxed">
          Your profile is only visible at events you join.
        </p>
      </div>
    </div>
  );
};
