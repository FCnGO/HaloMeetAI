import React, { useState, useEffect, useRef } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isFading, setIsFading] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Start fade-out at 1600ms, complete transition at 1950ms
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 1600);

    const completeTimer = setTimeout(() => {
      onCompleteRef.current();
    }, 1950);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, []);

  return (
    <div
      onClick={() => {
        setIsFading(true);
        setTimeout(() => onCompleteRef.current(), 200);
      }}
      className={`fixed inset-0 z-[70] bg-[#F6F6F3] flex items-center justify-center cursor-pointer transition-opacity duration-300 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle Warm Minimal Ambient Background */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
        <div className="w-96 h-96 rounded-full bg-white/40 blur-3xl"></div>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 space-y-4">
        
        {/* Clean Forthcode Diamond Glyph in Near-Black */}
        <div className="relative mb-2">
          <div className="w-12 h-12 bg-[#16171A] rounded-xl flex items-center justify-center shadow-md transition-transform hover:scale-105">
            <div className="w-3.5 h-3.5 bg-[#F6F6F3] rotate-45 rounded-[1px]"></div>
          </div>
        </div>

        {/* Brand Wordmark */}
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#16171A] font-sans flex items-center justify-center gap-2">
            <span>HoloMeet</span>
            <span className="px-2 py-0.5 rounded-full bg-[#16171A] text-[#F6F6F3] text-sm font-semibold tracking-normal">
              AI
            </span>
          </h1>
          <p className="text-xs text-[#5A5C63] font-medium tracking-wide">
            The Avatar Discovery Layer for Physical Spaces
          </p>
        </div>

        {/* Powered by Forthcode */}
        <div className="pt-8 flex items-center gap-2.5 text-xs text-[#8E9097] font-medium">
          <span className="w-5 h-px bg-[#D8D8D3]"></span>
          <span>Powered by Forthcode</span>
          <span className="w-5 h-px bg-[#D8D8D3]"></span>
        </div>

      </div>
    </div>
  );
};
