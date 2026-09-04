import React from 'react';
import { 
  Flame, 
  Clock, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  Layers,
  Thermometer
} from 'lucide-react';
import { Well } from '../types';

interface CSSCycleTrackerProps {
  well: Well;
}

export const CSSCycleTracker: React.FC<CSSCycleTrackerProps> = ({ well }) => {
  const css = well.css;
  const isCutoffNear = css.currentSor > 4.5;
  const isCutoffExceeded = css.currentSor >= 5.2;

  // Stages definition
  const stages = [
    { key: 'INJECTION', label: '1. Steam Injection', days: '7-12 Days', desc: 'High pressure steam injects heat bank' },
    { key: 'SOAKING', label: '2. Thermal Soaking', days: '4-7 Days', desc: 'Near-wellbore heat diffusion & soak' },
    { key: 'PRODUCTION', label: '3. SRP Production', days: '60-100 Days', desc: 'Stimulated heavy oil lift via SRP' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 font-mono">
              Thermal EOR Surveillance
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Cycle #{css.cycleNumber} Progress
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            Cyclic Steam Stimulation (CSS) & Thermal Cut-off Engine
          </h2>
        </div>

        {/* Economic Cutoff Indicator */}
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
            isCutoffExceeded
              ? 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse'
              : isCutoffNear
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}>
            <Flame className="w-4 h-4 text-orange-600" />
            SOR: {css.currentSor} {isCutoffExceeded ? '(CUT-OFF VIOLATION)' : isCutoffNear ? '(CUT-OFF NEAR)' : '(OPTIMAL)'}
          </span>
        </div>
      </div>

      {/* 3-Stage Progress Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {stages.map((stg, i) => {
          const isActive = css.stage === stg.key || (stg.key === 'PRODUCTION' && css.stage === 'CYCLE_CUTOFF_PENDING');
          const isCompleted = (stg.key === 'INJECTION' && (css.stage === 'SOAKING' || css.stage === 'PRODUCTION' || css.stage === 'CYCLE_CUTOFF_PENDING')) ||
                              (stg.key === 'SOAKING' && (css.stage === 'PRODUCTION' || css.stage === 'CYCLE_CUTOFF_PENDING'));

          return (
            <div
              key={stg.key}
              className={`p-4 rounded-xl border relative overflow-hidden transition-all ${
                isActive
                  ? 'bg-white border-orange-500 shadow-md ring-2 ring-orange-500/20'
                  : isCompleted
                  ? 'bg-slate-50 border-slate-200'
                  : 'bg-slate-50/50 border-slate-100 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold font-mono text-slate-800">{stg.label}</span>
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isActive ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-600 animate-ping" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{stg.desc}</p>
              
              <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-xs font-mono">
                <span className="text-slate-400">{stg.days}</span>
                {isActive && (
                  <span className="text-orange-600 font-bold">Active Day {css.stageDayCount}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cycle Telemetry & Cutoff Projection Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-center font-mono">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
          <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Steam Injected</span>
          <span className="text-lg font-bold text-orange-600">{css.cumulativeSteamInjected_m3} <span className="text-xs text-slate-400">m³</span></span>
          <span className="text-[10px] text-slate-500 block mt-0.5 font-sans">Target: {css.targetSteamVolume_m3} m³</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
          <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Near-Wellbore Temp</span>
          <span className="text-lg font-bold text-amber-700">{well.reservoir.nearWellboreTemp_c}°C</span>
          <span className="text-[10px] text-slate-500 block mt-0.5 font-sans">Native: 48°C</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
          <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Oil This Cycle</span>
          <span className="text-lg font-bold text-emerald-700">{css.cumulativeOilThisCycle_bbl.toLocaleString()} <span className="text-xs text-slate-400">bbl</span></span>
          <span className="text-[10px] text-slate-500 block mt-0.5 font-sans">Heavy 18° API</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
          <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Optimal Re-Steam</span>
          <span className="text-base font-bold text-sky-700 font-sans">{css.recommendedNextCycleDate}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5 font-sans">Day {css.economicCutoffPredictedDay} Cut-off</span>
        </div>
      </div>

      {/* Physics Deep Dive: Economic SOR Cut-off Rule */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-mono">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            Economic SOR Threshold Criterion (Baghewala Heavy Oil)
          </div>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            Oil Revenue ($75/bbl) must exceed Lifting Power ($12/bbl) + Marginal Steam Amortization ($28/m³). When cumulative SOR climbs above <strong>5.20</strong>, producing additional barrels destroys operator margin. BagheTwin triggers an automated Cycle Cut-off alert to terminate pumping and initiate the next steam cycle.
          </p>
        </div>

        <div className="flex-shrink-0 bg-white px-4 py-2.5 rounded-xl border border-slate-200 font-mono text-center shadow-sm">
          <span className="text-[10px] text-slate-500 block font-sans font-bold">Economic Cut-Off Limit</span>
          <span className="text-xl font-black text-rose-600">5.20 <span className="text-xs font-normal text-slate-400">SOR</span></span>
        </div>
      </div>

    </div>
  );
};
