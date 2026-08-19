'use client';

import React from 'react';

interface MountainValleyProps {
  offsetX?: number;
}

export const MountainValley: React.FC<MountainValleyProps> = ({ offsetX = 0 }) => {
  return (
    <div
      className="absolute bottom-[16%] sm:bottom-[13%] left-0 w-full h-[22%] sm:h-[28%] pointer-events-none select-none transition-transform duration-300 ease-out"
      style={{
        transform: `translate3d(${offsetX}px, 0, 0)`,
      }}
    >
      <svg
        className="w-[120%] -left-[10%] relative h-full object-cover opacity-90"
        viewBox="0 0 1600 280"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="riverGlint" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284C7" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.5" />
          </linearGradient>

          <linearGradient id="valleyBase" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#13332D" />
            <stop offset="100%" stopColor="#0A1D1A" />
          </linearGradient>
        </defs>

        {/* Valley Foothill Slopes */}
        <path
          d="M0,120 Q300,180 600,110 Q900,190 1200,100 Q1450,170 1600,110 L1600,280 L0,280 Z"
          fill="url(#valleyBase)"
        />

        {/* Serpentine Himalayan River (Ganges / Alaknanda glint in sunset) */}
        <path
          d="M320,165 Q480,185 640,155 Q820,135 980,170 Q1180,180 1380,140"
          stroke="url(#riverGlint)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          className="blur-[1px]"
        />
        <path
          d="M580,160 Q760,140 940,168 Q1120,175 1300,142"
          stroke="#BAE6FD"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />

        {/* Distant Mountain Settlement Warm Lights */}
        <circle cx="510" cy="148" r="2" fill="#FBBF24" opacity="0.9" className="animate-pulse" />
        <circle cx="522" cy="145" r="2.5" fill="#F59E0B" opacity="0.8" />
        <circle cx="538" cy="150" r="1.5" fill="#FEF08A" opacity="0.9" />

        <circle cx="860" cy="138" r="2" fill="#FBBF24" opacity="0.85" />
        <circle cx="875" cy="142" r="2.5" fill="#F59E0B" opacity="0.9" className="animate-pulse" />
        <circle cx="890" cy="136" r="1.5" fill="#FEF08A" opacity="0.75" />

        <circle cx="1220" cy="128" r="2" fill="#FBBF24" opacity="0.9" />
        <circle cx="1235" cy="132" r="2.5" fill="#F59E0B" opacity="0.8" className="animate-pulse" />
      </svg>
    </div>
  );
};

export default MountainValley;
