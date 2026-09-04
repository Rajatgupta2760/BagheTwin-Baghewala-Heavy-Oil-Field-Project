import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowDown, 
  ArrowUp, 
  Activity, 
  Sliders, 
  Flame, 
  Thermometer, 
  ShieldCheck,
  Gauge,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { calculateViscosity } from '../services/physicsEngine';

interface JointOptimizerModelProps {
  wellId?: string;
  initialTemp?: number;
}

export const JointOptimizerModel: React.FC<JointOptimizerModelProps> = ({
  wellId = 'BGW-07',
  initialTemp = 74,
}) => {
  // Mode: Conventional (Disconnected) vs BagheTwin (Closed-Loop AI)
  const [controlMode, setControlMode] = useState<'CONVENTIONAL' | 'BAGHETWIN'>('BAGHETWIN');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [simTemp, setSimTemp] = useState<number>(initialTemp);
  const [strokePhase, setStrokePhase] = useState<number>(0);

  // Derived physics parameters based on controlMode and simTemp
  const viscosity = calculateViscosity(simTemp);

  // Operating parameters for each mode
  const isAi = controlMode === 'BAGHETWIN';
  const spm = isAi ? 4.9 : 5.8;
  const vfdHz = isAi ? 40.8 : 50.0;
  const fillagePct = isAi ? 84 : 61;
  const goodmanStressPct = isAi ? 68.2 : 88.4;
  const rodDragLbs = Math.round(viscosity * 2.8);
  const buoyantWeightLbs = 6200;
  const netDownstrokeForceLbs = buoyantWeightLbs - rodDragLbs;
  const isRodFloating = !isAi && netDownstrokeForceLbs < 1500;

  // Animation cycle driven by SPM
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = 35;
    // Period T = 60 / SPM seconds adjusted by playbackSpeed
    const periodMs = ((60 / spm) * 1000) / playbackSpeed;
    const step = (intervalMs / periodMs) * (2 * Math.PI);

    const timer = setInterval(() => {
      setStrokePhase((prev) => (prev + step) % (2 * Math.PI));
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, spm, playbackSpeed]);

  // Stroke geometry calculations
  // strokeOffset from -1 (bottom) to +1 (top)
  const strokeOffset = Math.sin(strokePhase);
  const isUpstroke = Math.cos(strokePhase) > 0;
  const beamTiltDeg = strokeOffset * 10;
  const plungerTravelPx = strokeOffset * 32;

  // Sucker rod buckling simulation for conventional mode
  const rodBuckleOffset = !isAi && !isUpstroke && isRodFloating ? Math.sin(strokePhase * 3) * 6 : 0;

  // Color mappings
  const modeColor = isAi ? 'emerald' : 'amber';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5 transition-colors duration-200">
      
      {/* Header & Mode Switcher Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 px-2.5 py-0.5 rounded-md border border-orange-200 dark:border-orange-800 font-mono">
              Kinematic & Thermodynamic Simulation
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Wellbore-to-Surface Continuum Physics Model
            </span>
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Technical Animation: Closed-Loop vs. Disconnected Control
          </h3>
        </div>

        {/* Operational Mode Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setControlMode('CONVENTIONAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              controlMode === 'CONVENTIONAL'
                ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-400 shadow-sm border border-rose-200 dark:border-rose-900/50'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            Conventional Disconnected (5.8 SPM)
          </button>

          <button
            onClick={() => setControlMode('BAGHETWIN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              controlMode === 'BAGHETWIN'
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            ThermaLift Closed-Loop AI (4.9 SPM)
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        
        {/* Left 8 Cols: Mechanical & Thermal Continuum SVG Schematic */}
        <div className="xl:col-span-8 bg-slate-950 rounded-xl p-4 relative overflow-hidden border border-slate-800 flex flex-col justify-between shadow-inner">
          
          {/* Top Floating Telemetry Overlay */}
          <div className="flex flex-wrap items-center justify-between gap-2 z-10 text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5 ${
                isAi 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
              }`}>
                {isAi ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {isAi ? 'BAGHETWIN AI GOVERNED' : 'UNCOUPLED CONVENTIONAL'}
              </span>

              <span className="text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                VFD: <strong className="text-cyan-400">{vfdHz} Hz</strong> ({spm} SPM)
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              <span>T: <strong className="text-slate-200">{simTemp}°C</strong></span>
              <span className="text-slate-600">|</span>
              <span>Viscosity: <strong className="text-orange-400">{viscosity} cP</strong></span>
            </div>
          </div>

          {/* Core Kinematic SVG Canvas */}
          <div className="w-full flex items-center justify-center my-2">
            <svg viewBox="0 0 760 420" className="w-full h-auto max-h-[380px]">
              <defs>
                {/* Thermal Gradient in Reservoir Perforations */}
                <radialGradient id="optThermalFront" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.9" />
                  <stop offset="40%" stopColor="#ea580c" stopOpacity="0.5" />
                  <stop offset="80%" stopColor="#c2410c" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                </radialGradient>

                {/* Heavy crude texture */}
                <linearGradient id="heavyCrudeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#78350f" />
                  <stop offset="50%" stopColor="#451a03" />
                  <stop offset="100%" stopColor="#1c1917" />
                </linearGradient>

                {/* Steel walking beam metallic finish */}
                <linearGradient id="optBeamSteel" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="50%" stopColor="#cbd5e1" />
                  <stop offset="100%" stopColor="#64748b" />
                </linearGradient>
              </defs>

              {/* Surface Terrain Groundline */}
              <line x1="20" y1="170" x2="740" y2="170" stroke="#475569" strokeWidth="2" strokeDasharray="4 2" />
              <text x="30" y="162" fill="#64748b" fontSize="10" fontFamily="monospace">SURFACE LEVEL (0 m) • WELLHEAD</text>

              {/* ======================================================== */}
              {/* SURFACE PUMPING UNIT (SRP) KINEMATICS                    */}
              {/* ======================================================== */}

              {/* Samson Post Support Triangle */}
              <polygon points="200,170 230,85 260,170" fill="#334155" stroke="#475569" strokeWidth="2" />
              <circle cx="230" cy="85" r="5" fill="#f8fafc" stroke="#1e293b" strokeWidth="2" />

              {/* Walking Beam (Pivoting dynamically on beamTiltDeg) */}
              <g transform={`rotate(${beamTiltDeg} 230 85)`}>
                {/* Main Walking Beam Body */}
                <rect x="100" y="77" width="260" height="16" rx="3" fill="url(#optBeamSteel)" stroke="#334155" strokeWidth="1.5" />
                
                {/* Horsehead Curved Assembly at Left */}
                <path d="M100 85 C80 80 65 105 70 145" stroke="#94a3b8" strokeWidth="10" strokeLinecap="round" fill="none" />
                <path d="M100 85 C80 80 65 105 70 145" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" fill="none" />

                {/* Counterweight & Crank on Right */}
                <rect x="330" y="70" width="30" height="30" rx="4" fill="#475569" stroke="#64748b" strokeWidth="1.5" />
                <text x="335" y="88" fill="#e2e8f0" fontSize="8" fontWeight="bold">CW</text>
              </g>

              {/* Bridle Cable hanging from Horsehead */}
              <line x1="70" y1={140 + beamTiltDeg * 1.8} x2="70" y2="180" stroke="#94a3b8" strokeWidth="2" />

              {/* Carrier Bar & Polished Rod */}
              <rect x="62" y="180" width="16" height="5" rx="2" fill="#f59e0b" />
              <line x1="70" y1="185" x2="70" y2="230" stroke="#f8fafc" strokeWidth="3" />

              {/* Stuffing Box at Wellhead */}
              <rect x="58" y="210" width="24" height="20" rx="3" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
              <text x="88" y="222" fill="#94a3b8" fontSize="9" fontFamily="monospace">Stuffing Box</text>

              {/* Surface VFD Motor & Belt Assembly */}
              <rect x="310" y="145" width="55" height="25" rx="4" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
              <text x="316" y="161" fill="#38bdf8" fontSize="9" fontFamily="monospace" fontWeight="bold">VFD MOTOR</text>
              <circle cx="355" cy="157" r="5" fill="#38bdf8" className="animate-spin" />

              {/* ======================================================== */}
              {/* SUB-SURFACE TUBING, ROD STRING & PLUNGER DYNAMICS        */}
              {/* ======================================================== */}

              {/* Production Casing & Tubing Outer Wall */}
              <rect x="52" y="230" width="36" height="180" fill="#090d16" stroke="#334155" strokeWidth="2" />
              
              {/* Crude Column inside Tubing */}
              <rect x="55" y="232" width="30" height="176" fill="url(#heavyCrudeGrad)" opacity="0.85" />

              {/* Sucker Rod String with Buckling Simulation */}
              {isRodFloating ? (
                // Buckled Sucker Rod String during harsh drag
                <path 
                  d={`M70 230 Q${70 + rodBuckleOffset} 280 70 330 T${70 - rodBuckleOffset} 370 L70 ${380 + plungerTravelPx}`} 
                  stroke="#ef4444" 
                  strokeWidth="3.5" 
                  fill="none" 
                  strokeDasharray="6 2"
                />
              ) : (
                // Straight Sucker Rod String in smooth axial tension
                <line 
                  x1="70" 
                  y1="230" 
                  x2="70" 
                  y2={370 + plungerTravelPx} 
                  stroke={isAi ? '#10b981' : '#f59e0b'} 
                  strokeWidth="3" 
                />
              )}

              {/* Downhole Plunger & Traveling Valve */}
              <g transform={`translate(0, ${plungerTravelPx})`}>
                {/* Plunger Body */}
                <rect x="57" y="360" width="26" height="24" rx="2" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
                
                {/* Traveling Valve (TV) Ball & Seat */}
                <circle cx="70" cy="372" r="3.5" fill={isUpstroke ? '#ef4444' : '#10b981'} />
                <text x="88" y="375" fill="#e2e8f0" fontSize="8" fontFamily="monospace">
                  TV: {isUpstroke ? 'CLOSED (Lift)' : 'OPEN (Fill)'}
                </text>
              </g>

              {/* Standing Valve (SV) at Bottom of Tubing */}
              <rect x="57" y="398" width="26" height="10" rx="1" fill="#1e293b" stroke="#64748b" />
              <circle cx="70" cy="403" r="3" fill={isUpstroke ? '#10b981' : '#ef4444'} />
              <text x="88" y="405" fill="#e2e8f0" fontSize="8" fontFamily="monospace">
                SV: {isUpstroke ? 'OPEN (Inflow)' : 'CLOSED (Hold)'}
              </text>

              {/* Perforations & Inflow Streamlines */}
              <line x1="45" y1="400" x2="52" y2="400" stroke="#f97316" strokeWidth="2" strokeDasharray="2 2" />
              <line x1="45" y1="406" x2="52" y2="406" stroke="#f97316" strokeWidth="2" strokeDasharray="2 2" />
              <line x1="88" y1="400" x2="95" y2="400" stroke="#f97316" strokeWidth="2" strokeDasharray="2 2" />
              <line x1="88" y1="406" x2="95" y2="406" stroke="#f97316" strokeWidth="2" strokeDasharray="2 2" />

              {/* ======================================================== */}
              {/* RIGHT SIDE: CONTINUUM COUPLING & FORCE BALANCE CALLOUTS  */}
              {/* ======================================================== */}

              {/* Continuum Coupling Data Card */}
              <rect x="410" y="30" width="330" height="175" rx="10" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
              
              <text x="425" y="52" fill="#f8fafc" fontSize="11" fontWeight="bold" fontFamily="monospace">
                CONTINUUM FORCE EQUILIBRIUM
              </text>
              <line x1="425" y1="60" x2="725" y2="60" stroke="#334155" strokeWidth="1" />

              {/* Dynamic Downstroke Force Balance */}
              <text x="425" y="80" fill="#94a3b8" fontSize="10">Buoyant Rod Weight (W_b):</text>
              <text x="660" y="80" fill="#f8fafc" fontSize="10" fontFamily="monospace" fontWeight="bold">+{buoyantWeightLbs} lbs</text>

              <text x="425" y="100" fill="#94a3b8" fontSize="10">Viscous Fluid Drag (F_drag):</text>
              <text x="660" y="100" fill="#f43f5e" fontSize="10" fontFamily="monospace" fontWeight="bold">-{rodDragLbs} lbs</text>

              <line x1="425" y1="110" x2="725" y2="110" stroke="#1e293b" strokeWidth="1" />

              <text x="425" y="128" fill="#e2e8f0" fontSize="10" fontWeight="bold">Net Downstroke Tension:</text>
              <text x="660" y="128" fill={netDownstrokeForceLbs > 1800 ? '#10b981' : '#f43f5e'} fontSize="11" fontFamily="monospace" fontWeight="bold">
                {netDownstrokeForceLbs} lbs
              </text>

              {/* Real-time Status Callout */}
              <rect 
                x="425" 
                y="142" 
                width="300" 
                height="50" 
                rx="6" 
                fill={isAi ? '#064e3b' : '#450a0a'} 
                stroke={isAi ? '#059669' : '#b91c1c'} 
              />
              <text x="435" y="162" fill={isAi ? '#6ee7b7' : '#fca5a5'} fontSize="10" fontWeight="bold">
                {isAi ? 'STATUS: STABLE LAMINAR DESCENT' : 'WARNING: CRITICAL ROD FLOATING'}
              </text>
              <text x="435" y="180" fill={isAi ? '#a7f3d0' : '#fecaca'} fontSize="9">
                {isAi 
                  ? 'VFD throttled downstroke velocity below viscous threshold.' 
                  : 'F_drag opposes rod fall; bridal cable goes slack! High fatigue risk.'}
              </text>

              {/* Near-Wellbore Thermal Halo Visualization */}
              <circle cx="580" cy="300" r="85" fill="url(#optThermalFront)" />
              <rect x="410" y="225" width="330" height="165" rx="10" fill="#0f172a" stroke="#334155" strokeWidth="1.5" opacity="0.95" />
              
              <text x="425" y="248" fill="#f8fafc" fontSize="11" fontWeight="bold" fontFamily="monospace">
                THERMAL DISSIPATION & DARCY INFLOW
              </text>
              <line x1="425" y1="256" x2="725" y2="256" stroke="#334155" strokeWidth="1" />

              <text x="425" y="276" fill="#94a3b8" fontSize="10">Steam Heat Bank Diffusion:</text>
              <text x="640" y="276" fill="#fb923c" fontSize="10" fontFamily="monospace">{simTemp}°C (Cooling)</text>

              <text x="425" y="296" fill="#94a3b8" fontSize="10">Crude Viscosity (Andrade law):</text>
              <text x="640" y="296" fill="#f59e0b" fontSize="10" fontFamily="monospace">{viscosity} cP</text>

              <text x="425" y="316" fill="#94a3b8" fontSize="10">Effective Darcy Mobility (k/μ):</text>
              <text x="640" y="316" fill="#38bdf8" fontSize="10" fontFamily="monospace">{(450 / viscosity).toFixed(2)} mD/cP</text>

              <text x="425" y="336" fill="#94a3b8" fontSize="10">Volumetric Pump Fillage:</text>
              <text x="640" y="336" fill={fillagePct >= 80 ? '#10b981' : '#f43f5e'} fontSize="10" fontFamily="monospace" fontWeight="bold">
                {fillagePct}%
              </text>

              <text x="425" y="365" fill="#cbd5e1" fontSize="9" fontStyle="italic">
                {isAi 
                  ? 'BagheTwin aligns SPM with Darcy inflow to maximize barrel filling without starving pump.' 
                  : 'Excessive SPM draws down faster than fluid mobility allows, causing 39% fluid pound.'}
              </text>
            </svg>
          </div>

          {/* Bottom Interactive Playback Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 font-bold transition-colors cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                {isPlaying ? 'Pause' : 'Play Kinematics'}
              </button>

              <button
                onClick={() => setStrokePhase(0)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="Reset Cycle Phase"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 font-mono text-[11px]">
                {[0.5, 1, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      playbackSpeed === spd ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="text-slate-400">Stroke:</span>
              <span className="text-slate-200 font-bold">
                {isUpstroke ? 'UPSTROKE (Fluid Lift)' : 'DOWNSTROKE (Fluid Fill)'}
              </span>
            </div>
          </div>

        </div>

        {/* Right 4 Cols: Interactive Parameter Modulation Sandbox */}
        <div className="xl:col-span-4 flex flex-col justify-between space-y-4">
          
          {/* Temperature Slider & Fluid Mobility Response */}
          <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide font-mono flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                Thermal Dissipation Slider
              </span>
              <span className="text-xs font-mono font-bold text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-950/60 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-800">
                {simTemp}°C
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Drag temperature to simulate reservoir cooling across the 90-day post-steam cycle and observe how fluid drag alters rod kinematics.
            </p>

            <input
              type="range"
              min="48"
              max="110"
              step="1"
              value={simTemp}
              onChange={(e) => setSimTemp(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-600"
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
              <span>Native: 48°C (11,500 cP)</span>
              <span>Post-Soak: 110°C (160 cP)</span>
            </div>
          </div>

          {/* Side-by-Side Physics Comparison Card */}
          <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 space-y-3 font-mono text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block font-sans">
              Operational Envelope Metrics ({controlMode})
            </span>

            {/* Goodman Stress Metric */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-850 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-300 font-sans">Goodman Stress Ratio:</span>
              <span className={`font-bold ${goodmanStressPct > 85 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                {goodmanStressPct}% {goodmanStressPct > 85 ? '(FAIL >85%)' : '(PASS <85%)'}
              </span>
            </div>

            {/* Volumetric Fillage Metric */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-300 font-sans">Pump Volumetric Fillage:</span>
              <span className={`font-bold ${fillagePct >= 80 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {fillagePct}% {fillagePct < 70 ? '(Fluid Pound)' : '(Optimal)'}
              </span>
            </div>

            {/* Rod Fatigue Risk */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-300 font-sans">Rod String Floating Risk:</span>
              <span className={`font-bold ${isRodFloating ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-emerald-700 dark:text-emerald-400'}`}>
                {isRodFloating ? 'HIGH (Buckling Threat)' : 'ZERO (Axial Tension)'}
              </span>
            </div>
          </div>

          {/* Physics Innovation Takeaway */}
          <div className="p-3.5 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
            <div className="font-bold text-orange-900 dark:text-orange-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              The Coupled Continuum Principle
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
              Conventional practices pump at fixed speeds regardless of thermal state. ThermaLift links the VFD controller to the Andrade viscosity decay trajectory, automatically dialing back SPM as crude cools to maintain downstroke tension and prevent catastrophic rod unseating.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
