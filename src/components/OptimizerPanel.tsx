import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Sliders, 
  TrendingUp,
  FileCheck,
  Award,
  ChevronRight,
  Activity,
  Info
} from 'lucide-react';
import { Well, OptimizationRecommendation } from '../types';
import { JointOptimizerModel } from './JointOptimizerModel';

interface OptimizerPanelProps {
  well: Well;
  onApplyRecommendation: (wellId: string, recId: string) => void;
  isApplying: boolean;
}

export const OptimizerPanel: React.FC<OptimizerPanelProps> = ({
  well,
  onApplyRecommendation,
  isApplying,
}) => {
  const rec = well.activeRecommendation;
  const isApplied = rec?.status === 'APPLIED';

  return (
    <div className="space-y-6">
      
      {/* 1. Interactive Technical Animation Model (The Core User Request) */}
      <JointOptimizerModel 
        wellId={well.id} 
        initialTemp={well.reservoir.nearWellboreTemp_c} 
      />

      {/* 2. Main Optimization Management Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        
        {/* Header & Core Innovation Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600 font-mono">
                Coupled EOR & Artificial Lift Optimization
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">
                Well ID: {well.id} ({well.stage})
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              Joint CSS & Sucker Rod Pump Controller
            </h2>
          </div>

          {/* Status Badge */}
          <div>
            {isApplied ? (
              <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                SETPOINTS COMMITTED (ACTIVE IN VFD)
              </span>
            ) : rec ? (
              <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5 shadow-sm">
                <Zap className="w-4 h-4 text-amber-600" />
                PENDING PETROLEUM ENGINEER APPROVAL
              </span>
            ) : (
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                Operating in Standard Profile
              </span>
            )}
          </div>
        </div>

        {/* Engineering Contrast Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="text-xs font-bold uppercase text-slate-600 flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              Conventional Field Practice (Disconnected)
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Reservoir teams schedule CSS steam cycles on fixed calendar dates. Production teams run SRP at constant speeds, reacting only after rod unseating or fluid pound occurs. <strong>Thermal drawdown and mechanical pumping are siloed.</strong>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50/50 border border-orange-200 space-y-2">
            <div className="text-xs font-bold uppercase text-orange-700 flex items-center gap-1.5 font-mono">
              <Zap className="w-3.5 h-3.5 text-orange-600" />
              BagheTwin Closed-Loop Innovation
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Treats the well as a <strong>coupled thermodynamic continuum</strong>: Steam heat bank → Andrade viscosity curve → Darcy mobility surge → dynamic pump fillage → rod stress curve. Pumping speed and steam timing co-optimize in real time.
            </p>
          </div>
        </div>

        {rec ? (
          <>
            {/* Setpoints Matrix */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-orange-600" />
                  Operating Setpoints: Current State vs AI Optimal
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">
                  Confidence Score: 96.4%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* SPM Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <span className="text-[11px] uppercase font-bold text-slate-500 font-mono">Pumping Speed (SPM)</span>
                  <div className="flex items-center justify-between my-2 font-mono">
                    <div className="text-slate-500 text-sm">{rec.current.spm} <span className="text-[10px]">SPM</span></div>
                    <ArrowRight className="w-4 h-4 text-orange-600" />
                    <div className="text-emerald-700 font-bold text-xl">{rec.recommended.spm} <span className="text-xs">SPM</span></div>
                  </div>
                  <span className="text-[11px] text-slate-600 font-mono">VFD Target: {rec.recommended.vfdFrequency_hz} Hz</span>
                </div>

                {/* Oil Rate Projected */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <span className="text-[11px] uppercase font-bold text-slate-500 font-mono">Produced Oil Rate</span>
                  <div className="flex items-center justify-between my-2 font-mono">
                    <div className="text-slate-500 text-sm">{rec.current.oilRate_bopd} <span className="text-[10px]">BOPD</span></div>
                    <ArrowRight className="w-4 h-4 text-emerald-600" />
                    <div className="text-emerald-700 font-bold text-xl">{rec.recommended.projectedOilRate_bopd} <span className="text-xs">BOPD</span></div>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold font-mono">
                    +{rec.deltas.deltaOilRate_bopd} BOPD ({rec.deltas.deltaOilRatePct > 0 ? `+${rec.deltas.deltaOilRatePct}%` : ''})
                  </span>
                </div>

                {/* Rod Failure Risk */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <span className="text-[11px] uppercase font-bold text-slate-500 font-mono">Rod String Risk</span>
                  <div className="flex items-center justify-between my-2 font-mono">
                    <div className="text-rose-600 text-sm">{rec.current.rodFailureRisk_pct}%</div>
                    <ArrowRight className="w-4 h-4 text-sky-600" />
                    <div className="text-sky-700 font-bold text-xl">{rec.recommended.projectedRodFailureRisk_pct}%</div>
                  </div>
                  <span className="text-[11px] text-sky-700 font-semibold font-mono">{rec.deltas.deltaRodRiskPct}% Risk Reduction</span>
                </div>

                {/* Monthly Value */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <span className="text-[11px] uppercase font-bold text-slate-500 font-mono">Projected Net Benefit</span>
                  <div className="my-2 font-mono">
                    <span className="text-amber-700 font-black text-xl">
                      +₹{(rec.deltas.projectedMonthlyNetBenefit_inr / 100000).toFixed(2)} Lakh
                    </span>
                    <span className="text-[10px] text-slate-500 block font-sans">Per Month / Well</span>
                  </div>
                  <span className="text-[11px] text-slate-600">Avoided unseating downtime</span>
                </div>
              </div>
            </div>

            {/* Physics Constraints Validation & Goodman Envelope Checks */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                Pre-Action Mechanical & Thermodynamic Envelope Verification
              </h3>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-mono">
                    <tr>
                      <th className="py-2.5 px-3">Constraint Parameter</th>
                      <th className="py-2.5 px-3">API Limit</th>
                      <th className="py-2.5 px-3">Simulated Setpoint</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {rec.physicsConstraintsChecks.map((check, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-sans font-medium text-slate-800">{check.name}</td>
                        <td className="py-2.5 px-3 text-slate-500">{check.limit}</td>
                        <td className="py-2.5 px-3 text-slate-900 font-bold">{check.actual}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            check.status === 'PASS'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {check.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Engineering Rationale & Explainability */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                AI Petroleum Engineering Justification (Closed-Loop Rationale)
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {rec.engineeringRationale.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Trigger Button */}
            {!isApplied && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Human-in-the-Loop Operating Governance</span>
                  <span className="text-[11px] text-slate-600">
                    Commit validated setpoints directly to Wellhead SCADA/VFD control register.
                  </span>
                </div>

                <button
                  onClick={() => onApplyRecommendation(well.id, rec.id)}
                  disabled={isApplying}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-orange-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {isApplying ? 'Applying Setpoints...' : 'Approve & Commit Setpoints'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-slate-500 text-xs font-medium">
            No pending optimization recommendation for this well. System operating in optimal envelope.
          </div>
        )}

      </div>
    </div>
  );
};
