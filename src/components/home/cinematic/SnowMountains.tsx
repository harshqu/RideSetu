'use client';

import React from 'react';

interface SnowMountainsProps {
  offsetX?: number;
}

export const SnowMountains: React.FC<SnowMountainsProps> = ({ offsetX = 0 }) => {
  return (
    <div
      className="absolute bottom-[30%] sm:bottom-[28%] left-0 w-full h-[40%] sm:h-[48%] pointer-events-none select-none transition-transform duration-300 ease-out"
      style={{
        transform: `translate3d(${offsetX}px, 0, 0)`,
      }}
    >
      <svg
        className="w-[120%] -left-[10%] relative h-full object-cover opacity-90 drop-shadow-[0_12px_24px_rgba(11,19,43,0.35)]"
        viewBox="0 0 1600 500"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="snowPeakGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="40%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>

          <linearGradient id="snowCapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>

          <linearGradient id="sunsetRimLight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#FBBF24" stopOpacity="0.6" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* --- Back Mountain Ridge Silhouette --- */}
        <polygon
          points="0,320 180,240 340,300 520,160 680,280 880,120 1060,260 1260,150 1440,270 1600,200 1600,500 0,500"
          fill="#1E293B"
          opacity="0.8"
        />

        {/* --- Main High Snow Peak (Left - Trishul silhouette) --- */}
        <polygon
          points="200,480 460,110 720,480"
          fill="url(#snowPeakGrad1)"
        />
        {/* Trishul Snow Cap & Glaciers */}
        <polygon
          points="460,110 400,210 430,200 460,230 490,195 530,220"
          fill="url(#snowCapGrad)"
        />
        <polygon
          points="460,110 490,195 530,220 720,480 460,480"
          fill="#0F172A"
          opacity="0.4"
        />

        {/* --- Center Dominant Peak (Nanda Devi inspired silhouette) --- */}
        <polygon
          points="620,500 920,60 1240,500"
          fill="url(#snowPeakGrad1)"
        />
        {/* Nanda Devi Snow Cap */}
        <polygon
          points="920,60 840,170 875,160 920,200 965,155 1010,185"
          fill="url(#snowCapGrad)"
        />
        {/* Snow Glaciers descending */}
        <polygon
          points="920,60 965,155 1010,185 1240,500 920,500"
          fill="#0F172A"
          opacity="0.45"
        />
        {/* Golden Sun Rim Light on Nanda Devi Ridge */}
        <path
          d="M920,60 L1240,500"
          stroke="url(#sunsetRimLight)"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.75"
        />

        {/* --- Right Peak (Shivling silhouette) --- */}
        <polygon
          points="1140,500 1380,130 1600,480"
          fill="url(#snowPeakGrad1)"
        />
        <polygon
          points="1380,130 1310,230 1350,215 1380,245 1430,210 1470,235"
          fill="url(#snowCapGrad)"
        />
        <polygon
          points="1380,130 1430,210 1470,235 1600,480 1380,480"
          fill="#0F172A"
          opacity="0.4"
        />
      </svg>
    </div>
  );
};

export default SnowMountains;
