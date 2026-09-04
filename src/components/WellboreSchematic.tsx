import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Flame, 
  Gauge, 
  Thermometer, 
  Activity, 
  Zap, 
  Sliders, 
  Info,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import { Well } from '../types';
import { calculateViscosity } from '../services/physicsEngine';

interface WellboreSchematicProps {
  well: Well;
}

export const WellboreSchematic: React.FC<WellboreSchematicProps> = ({ well }) => {
  // Animation state for the walking beam & sucker rod motion
  const [strokePhase, setStrokePhase] = useState<number>(0);
  const [interactiveTemp, setInteractiveTemp] = useState<number>(well.reservoir.nearWellboreTemp_c);
  const [interactiveSpm, setInteractiveSpm] = useState<number>(well.srp.spm || 5.0);

  // Sync when well changes
  useEffect(() => {
    setInteractiveTemp(well.reservoir.nearWellboreTemp_c);
    setInteractiveSpm(well.srp.spm || 5.0);
  }, [well.id, well.reservoir.nearWellboreTemp_c, well.srp.spm]);

  // Compute live physics based on interactive sliders
  const currentVisc = calculateViscosity(interactiveTemp);
  const isRodFloating = currentVisc > 700 && interactiveSpm > 5.2;

  // Real-time oscillation loop driven by SPM
  useEffect(() => {
    if (interactiveSpm <= 0) return;
    const intervalMs = 40;
    // Period T = 60 / SPM seconds
    const periodMs = (60 / interactiveSpm) * 1000;
    const step = (intervalMs / periodMs) * (2 * Math.PI);

    const timer = setInterval(() => {
      setStrokePhase((prev) => (prev + step) % (2 * Math.PI));
    }, intervalMs);

    return () => clearInterval(timer);
  }, [interactiveSpm]);

  // Normalized stroke offset: -1 (bottom of stroke) to +1 (top of stroke)
  const strokeOffset = Math.sin(strokePhase);
  const beamAngle = strokeOffset * 8; // degrees of walking beam tilt
  const rodYOffset = strokeOffset * 18; // px displacement of polished rod and pump plunger
  const isUpstroke = Math.cos(strokePhase) > 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-colors duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 font-mono">
              Coupled Physics Model
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Jodhpur Sandstone @ 1,148 m
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            Well-to-Surface Dynamic Schematic
            {isRodFloating && (
              <span className="text-[10px] bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded-full font-bold animate-pulse font-mono">
                ROD FLOATING DETECTED
              </span>
            )}
          </h2>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-1.5 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 block font-mono">Stroke Direction</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 font-mono">
                {isUpstroke ? (
                  <>
                    <ArrowUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> UPSTROKE (Lift)
                  </>
                ) : (
                  <>
                    <ArrowDown className={`w-3 h-3 ${isRodFloating ? 'text-rose-600 dark:text-rose-400' : 'text-sky-600 dark:text-sky-400'}`} /> 
                    {isRodFloating ? 'RETARDED DOWNSTROKE' : 'DOWNSTROKE (Fill)'}
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Cross-Section Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
        
        {/* SVG Animated Wellbore Canvas */}
        <div className="lg:col-span-8 bg-slate-950/90 border border-slate-800/90 rounded-xl p-4 relative overflow-hidden flex flex-col items-center justify-center min-h-[460px]">
          
          <svg viewBox="0 0 600 520" className="w-full h-full max-h-[460px]">
            <defs>
              {/* Radial Gradient for Near-Wellbore Steam Heating Front */}
              <radialGradient id="steamHeatFront" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
                <stop offset="35%" stopColor="#fb923c" stopOpacity="0.5" />
                <stop offset="70%" stopColor="#ea580c" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>

              {/* Linear Gradient for Heavy Oil Column */}
              <linearGradient id="heavyOilFluid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#020617" stopOpacity="0.95" />
              </linearGradient>

              {/* Steel Rod Texture */}
              <linearGradient id="steelRod" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="50%" stopColor="#f1f5f9" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>

              {/* Tubing Wall */}
              <linearGradient id="tubingGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="50%" stopColor="#475569" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
            </defs>

            {/* SURFACE LEVEL: Ground Line */}
            <line x1="20" y1="120" x2="580" y2="120" stroke="#475569" strokeWidth="2" strokeDasharray="4 4" />
            <text x="25" y="112" fill="#64748b" fontSize="10" fontFamily="monospace">SURFACE ELEVATION 0 m (RAJASTHAN DESERT)</text>

            {/* SURFACE SRP PUMPING UNIT (Walking Beam Schematic) */}
            <g transform="translate(190, 20)">
              {/* Sampson Post */}
              <polygon points="100,100 120,40 130,40 150,100" fill="#334155" stroke="#64748b" strokeWidth="2" />
              
              {/* Walking Beam Pivot Center (125, 40) with dynamic rotation */}
              <g transform={`rotate(${beamAngle}, 125, 40)`}>
                {/* Walking Beam */}
                <rect x="30" y="34" width="190" height="12" rx="3" fill="#ea580c" stroke="#fb923c" strokeWidth="1.5" />
                {/* Horsehead Arc on Left */}
                <path d="M 30,34 Q 10,40 10,75 L 22,75 Q 22,46 32,44 Z" fill="#c2410c" stroke="#f97316" strokeWidth="1" />
                {/* Counterweight & Crank on Right */}
                <rect x="205" y="28" width="22" height="24" rx="4" fill="#64748b" stroke="#94a3b8" strokeWidth="1.5" />
              </g>

              {/* Bridle wire from Horsehead to Polished Rod */}
              <line x1="200" y1="95" x2="200" y2={120 + rodYOffset} stroke="#94a3b8" strokeWidth="2" />
              
              {/* Wellhead Christmas Tree & Stuffing Box */}
              <rect x="188" y="105" width="24" height="20" rx="2" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
              <rect x="182" y="120" width="36" height="12" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
              {/* Flowline to separator */}
              <path d="M 218,115 L 260,115 L 260,135" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
              <text x="270" y="125" fill="#4ade80" fontSize="9" fontFamily="monospace">TO PRODUCTION HEADER</text>
            </g>

            {/* SUBSURFACE: CASING & ANNULUS (Depth 0 to 1,150 m) */}
            {/* Outer Casing: 9-5/8" */}
            <rect x="265" y="132" width="70" height="340" fill="#0f172a" stroke="#334155" strokeWidth="2" />
            
            {/* Annulus Fluid Level */}
            {/* Depth label */}
            <text x="140" y="240" fill="#64748b" fontSize="9" fontFamily="monospace">ANNULUS FLUID LEVEL: {well.wellbore.fluidLevel_m} m</text>
            <line x1="230" y1="238" x2="265" y2="238" stroke="#64748b" strokeWidth="1" strokeDasharray="2 2" />
            <rect x="267" y="240" width="66" height="230" fill="url(#heavyOilFluid)" />

            {/* PRODUCTION TUBING: 3-1/2" */}
            <rect x="288" y="132" width="24" height="320" fill="url(#tubingGrad)" stroke="#475569" strokeWidth="1.5" />
            
            {/* SUCKER ROD STRING (moving inside tubing with rodYOffset) */}
            <g transform={`translate(0, ${rodYOffset})`}>
              {/* Polished rod at top */}
              <rect x="298" y="115" width="4" height="320" fill="url(#steelRod)" stroke="#64748b" strokeWidth="0.5" />

              {/* DOWNHOLE PUMP (Traveling Valve + Plunger) */}
              <rect x="292" y="420" width="16" height="28" rx="2" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
              
              {/* Traveling Valve Ball: Closed on upstroke, Open on downstroke */}
              <circle cx="300" cy="434" r="3.5" fill={isUpstroke ? '#22c55e' : '#f59e0b'} />
              <text x="315" y="437" fill="#93c5fd" fontSize="8" fontFamily="monospace">
                TV: {isUpstroke ? 'CLOSED (Lifting)' : 'OPEN (Filling)'}
              </text>
            </g>

            {/* STANDING VALVE (Fixed at pump intake @ 1,080 m) */}
            <rect x="290" y="450" width="20" height="12" fill="#334155" stroke="#64748b" strokeWidth="1" />
            <circle cx="300" cy="456" r="3.5" fill={isUpstroke ? '#22c55e' : '#64748b'} />
            <text x="315" y="460" fill="#a7f3d0" fontSize="8" fontFamily="monospace">
              SV: {isUpstroke ? 'OPEN (Intake)' : 'CLOSED (Holding)'}
            </text>

            {/* RESERVOIR: JODHPUR SANDSTONE FORMATION */}
            {/* Upper Member @ 1,148 m */}
            <rect x="20" y="420" width="245" height="90" fill="#1e293b" opacity="0.6" />
            <rect x="335" y="420" width="245" height="90" fill="#1e293b" opacity="0.6" />
            <text x="30" y="435" fill="#fbbf24" fontSize="10" fontWeight="bold" fontFamily="monospace">JODHPUR SANDSTONE (1,150 m)</text>
            <text x="30" y="448" fill="#94a3b8" fontSize="8" fontFamily="monospace">Net Pay: 14.5 m | k = 480 mD | S_o = 78%</text>

            {/* Steam Injection Plume / Near-Wellbore Heated Front */}
            <ellipse cx="300" cy="465" rx={Math.min(180, Math.max(70, interactiveTemp * 1.1))} ry="42" fill="url(#steamHeatFront)" />
            
            {/* Perforations (Laser Cut Slot Liners) */}
            {[-18, -9, 0, 9, 18].map((offset) => (
              <g key={offset}>
                <line x1="262" y1={465 + offset} x2="268" y2={465 + offset} stroke="#f97316" strokeWidth="2.5" />
                <line x1="332" y1={465 + offset} x2="338" y2={465 + offset} stroke="#f97316" strokeWidth="2.5" />
                {/* Crude Inflow Arrows */}
                <path d={`M ${250},${465 + offset} L ${262},${465 + offset}`} stroke="#ea580c" strokeWidth="1.5" markerEnd="url(#arrow)" />
                <path d={`M ${350},${465 + offset} L ${338},${465 + offset}`} stroke="#ea580c" strokeWidth="1.5" markerEnd="url(#arrow)" />
              </g>
            ))}

            {/* Inflow indicator labels */}
            <text x="210" y="505" fill="#f97316" fontSize="9" fontWeight="bold" fontFamily="monospace">
              HEATED CRUDE INFLOW (μ = {currentVisc} cP)
            </text>
          </svg>

          {/* Bottom Overlay Info */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 backdrop-blur-sm">
            <span className="text-slate-400">
              Pump Intake: <strong className="text-white">1,080 m</strong>
            </span>
            <span className="text-slate-400">
              Native Temp: <strong className="text-white">48°C</strong>
            </span>
            <span className="text-slate-400">
              Active Temp: <strong className="text-orange-400">{interactiveTemp}°C</strong>
            </span>
            <span className="text-slate-400">
              Effective Viscosity: <strong className="text-amber-400">{currentVisc} cP</strong>
            </span>
          </div>

        </div>

        {/* Live Interactive Physics Telemetry & Slider Controls */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-750 rounded-xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5 font-mono">
              <Sliders className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              Interactive Physics Sliders
            </h3>
            
            {/* Temperature Slider */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-600 dark:text-slate-300">Near-Wellbore Temp (Tr):</span>
                <span className="text-orange-700 dark:text-orange-400 font-bold">{interactiveTemp}°C</span>
              </div>
              <input
                type="range"
                min="48"
                max="220"
                value={interactiveTemp}
                onChange={(e) => setInteractiveTemp(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-600"
              />
              <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                <span>Native (48°C)</span>
                <span>Steam Peak (220°C)</span>
              </div>
            </div>

            {/* SPM Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-600 dark:text-slate-300">Sucker Rod Speed (SPM):</span>
                <span className="text-sky-700 dark:text-sky-400 font-bold">{interactiveSpm} SPM</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="8.0"
                step="0.1"
                value={interactiveSpm}
                onChange={(e) => setInteractiveSpm(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
              <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                <span>2.0 SPM</span>
                <span>8.0 SPM</span>
              </div>
            </div>
          </div>

          {/* Dynamic Physics Outputs */}
          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-750 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-mono">
              <Gauge className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Computed Physics Outputs
            </h3>

            {/* Viscosity Gauge */}
            <div className="flex items-center justify-between py-1.5 border-b border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-600 dark:text-slate-300">Baghewala Crude Viscosity:</span>
              <span className={`text-xs font-mono font-bold ${
                currentVisc > 1000 ? 'text-rose-600 dark:text-rose-400' : currentVisc > 300 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'
              }`}>
                {currentVisc.toLocaleString()} cP
              </span>
            </div>

            {/* Downstroke Fluid Drag */}
            <div className="flex items-center justify-between py-1.5 border-b border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-600 dark:text-slate-300">Downstroke Fluid Drag:</span>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                {Math.round((currentVisc / 200) * (interactiveSpm / 4) * 850)} lbs
              </span>
            </div>

            {/* Rod Float Risk */}
            <div className="flex items-center justify-between py-1.5 border-b border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-600 dark:text-slate-300">Rod Compression Risk:</span>
              <span className={`text-xs font-mono font-bold ${
                isRodFloating ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-emerald-700 dark:text-emerald-400'
              }`}>
                {isRodFloating ? 'HIGH (Float Alert)' : 'SAFE'}
              </span>
            </div>

            {/* Estimated Inflow Potential */}
            <div className="flex items-center justify-between py-1.5">
              <span className="text-xs text-slate-600 dark:text-slate-300">Inflow Productivity Index:</span>
              <span className="text-xs font-mono font-bold text-sky-700 dark:text-sky-400">
                {(25 / currentVisc).toFixed(3)} b/d/psi
              </span>
            </div>
          </div>

          {/* Petroleum Engineering Insight */}
          <div className="p-3.5 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <div className="font-semibold text-orange-900 dark:text-orange-300 mb-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              Baghewala Field Observation
            </div>
            When near-wellbore temperature decays below 80°C, crude viscosity surges over 700 cP. If the SRP remains at &gt;5.5 SPM, sucker rods cannot fall fast enough under gravity, triggering <strong>rod floating, valve delayed seating, and mechanical buckling</strong>. BagheTwin automatically dials back SPM via VFD to restore tension!
          </div>

        </div>

      </div>

    </div>
  );
};
