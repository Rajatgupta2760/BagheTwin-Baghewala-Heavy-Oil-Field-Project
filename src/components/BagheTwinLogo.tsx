import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
  theme?: 'light' | 'dark';
}

export const BagheTwinLogo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  theme = 'light',
}) => {
  const dimensions = {
    sm: { w: 34, h: 34, title: 'text-sm', sub: 'text-[9px]' },
    md: { w: 44, h: 44, title: 'text-lg', sub: 'text-[10px]' },
    lg: { w: 58, h: 58, title: 'text-2xl', sub: 'text-xs' },
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* High-Precision Industrial Emblem */}
      <div 
        className="relative flex-shrink-0 rounded-2xl overflow-hidden shadow-md transition-all duration-300 hover:scale-105 group cursor-pointer border border-orange-500/20 dark:border-orange-500/40"
        style={{ width: dimensions.w, height: dimensions.h }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Base Background Gradient */}
            <linearGradient id="logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>

            {/* Thermal Flame & Steam Core Gradient */}
            <linearGradient id="thermalCore" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="30%" stopColor="#ea580c" />
              <stop offset="70%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fde047" />
            </linearGradient>

            {/* Mechanical Lift Cyan Energy Flow */}
            <linearGradient id="liftCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>

            {/* Pumpjack Walking Beam Metallic Gradient */}
            <linearGradient id="steelBeam" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="40%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>

            {/* Subtle Glow Filter */}
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Badge with Rounded Corners */}
          <rect width="100" height="100" rx="20" fill="url(#logoBg)" />
          
          {/* Outer Industrial Accent Ring */}
          <rect width="96" height="96" x="2" y="2" rx="19" stroke="url(#thermalCore)" strokeWidth="1.5" strokeOpacity="0.7" />

          {/* Subsurface Geological Horizon Grids */}
          <line x1="15" y1="76" x2="85" y2="76" stroke="#334155" strokeWidth="1" strokeDasharray="2 3" />
          <line x1="25" y1="84" x2="75" y2="84" stroke="#334155" strokeWidth="0.8" strokeDasharray="3 2" />

          {/* Thermal Radiation Waves (CSS Steam Front) */}
          <circle cx="50" cy="50" r="38" stroke="url(#thermalCore)" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.4" />
          <circle cx="50" cy="50" r="30" stroke="url(#liftCyan)" strokeWidth="1.2" strokeDasharray="4 2" opacity="0.5" />

          {/* Coupled Orbital Rings (Digital Twin Dual Coupling) */}
          <ellipse cx="50" cy="50" rx="34" ry="14" transform="rotate(-30 50 50)" stroke="url(#liftCyan)" strokeWidth="2.2" opacity="0.85" />
          <ellipse cx="50" cy="50" rx="34" ry="14" transform="rotate(30 50 50)" stroke="url(#thermalCore)" strokeWidth="2.2" opacity="0.9" />

          {/* Thermal Plume Flare (Heat Dispersion) */}
          <path 
            d="M50 14 C56 26 62 38 58 50 C55 58 50 64 50 64 C50 64 45 58 42 50 C38 38 44 26 50 14 Z" 
            fill="url(#thermalCore)" 
            filter="url(#softGlow)"
            opacity="0.85"
          />

          {/* Sucker Rod Pumping Unit Silhouette */}
          {/* Samson Post Support Triangle */}
          <polygon points="44,72 50,48 56,72" fill="#475569" stroke="#334155" strokeWidth="1" />

          {/* Walking Beam (Tilted at Dynamic Angle) */}
          <polygon points="22,46 76,38 74,43 20,51" fill="url(#steelBeam)" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.5))" />

          {/* Horsehead Curved Arm on Left */}
          <path d="M22 47 C17 50 16 57 19 63" stroke="#f1f5f9" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* Polished Rod String Downstroke */}
          <line x1="19" y1="63" x2="19" y2="88" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
          <circle cx="19" cy="63" r="2.5" fill="#f59e0b" />

          {/* Counterweight on Right */}
          <rect x="71" y="38" width="8" height="10" rx="2" fill="#f97316" />

          {/* AI Neural Convergence Core (Center Pivot Node) */}
          <circle cx="50" cy="49" r="5" fill="#0f172a" stroke="#f97316" strokeWidth="2" />
          <circle cx="50" cy="49" r="2.5" fill="#38bdf8" />
        </svg>
      </div>

      {/* Brand Identity Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`font-black ${dimensions.title} tracking-tight font-sans text-slate-900 dark:text-white transition-colors`}>
            THERMA<span className="text-orange-600 dark:text-orange-500">LIFT</span>
          </span>
          <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-xs tracking-wider">
            AI TWIN
          </span>
        </div>

        {showSubtitle && (
          <div className="flex items-center gap-1.5 mt-0.5 text-slate-500 dark:text-slate-400">
            <span className={`font-semibold tracking-wider uppercase font-mono ${dimensions.sub}`}>
              Thermal-Lift Digital Twin
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className={`font-medium ${dimensions.sub} text-orange-700 dark:text-orange-400 hidden sm:inline font-sans`}>
              Baghewala Heavy Oil
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
