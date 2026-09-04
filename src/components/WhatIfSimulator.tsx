import React, { useState, useMemo } from 'react';
import { 
  Sliders, 
  TrendingUp, 
  RotateCcw, 
  Flame, 
  Gauge, 
  DollarSign,
  Activity,
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid
} from 'recharts';
import { Well, SimulationResult } from '../types';
import { simulateWellScenario } from '../services/physicsEngine';

interface WhatIfSimulatorProps {
  well: Well;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ well }) => {
  const [deltaSpm, setDeltaSpm] = useState<number>(0);
  const [deltaSteamPct, setDeltaSteamPct] = useState<number>(0);
  const [deltaSoakDays, setDeltaSoakDays] = useState<number>(0);

  // Compute live multi-day simulation using physics engine
  const simResult: SimulationResult = useMemo(() => {
    return simulateWellScenario(well, {
      wellId: well.id,
      deltaSpm,
      deltaSteamVolume_pct: deltaSteamPct,
      deltaSoakDays,
      vfdFrequency_hz: (well.srp.spm + deltaSpm) * 8.3,
    });
  }, [well, deltaSpm, deltaSteamPct, deltaSoakDays]);

  // Transform data for Recharts
  const chartData = simResult.simulatedDays.map((day, i) => ({
    day: `D+${day}`,
    oilRate: simResult.oilRateCurve_bopd[i],
    temp: simResult.temperatureCurve_c[i],
    visc: simResult.viscosityCurve_cp[i],
    fillage: simResult.pumpFillageCurve_pct[i],
    cumOil: simResult.cumulativeOil_bbl[i],
  }));

  const resetSliders = () => {
    setDeltaSpm(0);
    setDeltaSteamPct(0);
    setDeltaSoakDays(0);
  };

  const finalOil = simResult.cumulativeOil_bbl[simResult.cumulativeOil_bbl.length - 1] - well.css.cumulativeOilThisCycle_bbl;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 font-mono">
              Scenario Modeling Sandbox
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">
              45-Day Forward Physics Trajectory
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            What-If Scenario Simulator & Economic Forecasting
          </h2>
        </div>

        <button
          onClick={resetSliders}
          className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 border border-slate-200 transition-colors w-fit cursor-pointer shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          Reset Baseline
        </button>
      </div>

      {/* Interactive Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        
        {/* SPM Delta Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-600">SRP Pumping Speed:</span>
            <span className="text-sky-700 font-bold">
              {(well.srp.spm + deltaSpm).toFixed(1)} SPM ({deltaSpm >= 0 ? `+${deltaSpm.toFixed(1)}` : deltaSpm.toFixed(1)})
            </span>
          </div>
          <input
            type="range"
            min="-2.0"
            max="2.0"
            step="0.1"
            value={deltaSpm}
            onChange={(e) => setDeltaSpm(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>-2.0 SPM</span>
            <span>Baseline ({well.srp.spm})</span>
            <span>+2.0 SPM</span>
          </div>
        </div>

        {/* Steam Volume Delta */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-600">Next Steam Volume:</span>
            <span className="text-orange-700 font-bold">
              {Math.round(well.css.targetSteamVolume_m3 * (1 + deltaSteamPct / 100))} m³ ({deltaSteamPct >= 0 ? `+${deltaSteamPct}%` : `${deltaSteamPct}%`})
            </span>
          </div>
          <input
            type="range"
            min="-30"
            max="40"
            step="5"
            value={deltaSteamPct}
            onChange={(e) => setDeltaSteamPct(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>-30% Steam</span>
            <span>Standard</span>
            <span>+40% Steam</span>
          </div>
        </div>

        {/* Soak Days Delta */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-600">Thermal Soak Duration:</span>
            <span className="text-amber-700 font-bold">
              {well.css.soakDaysTotal + deltaSoakDays} Days ({deltaSoakDays >= 0 ? `+${deltaSoakDays}d` : `${deltaSoakDays}d`})
            </span>
          </div>
          <input
            type="range"
            min="-3"
            max="4"
            step="1"
            value={deltaSoakDays}
            onChange={(e) => setDeltaSoakDays(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>2 Days (Fast)</span>
            <span>5 Days</span>
            <span>9 Days (Deep)</span>
          </div>
        </div>

      </div>

      {/* Projected Outcome KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-center font-mono">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
          <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Simulated 45d Oil</span>
          <span className="text-lg font-black text-emerald-700">+{finalOil.toLocaleString()} <span className="text-xs">bbl</span></span>
          <span className="text-[10px] text-slate-500 block mt-0.5 font-sans">Incremental Lift</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
          <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">45d Net Present Value</span>
          <span className="text-lg font-black text-amber-700">
            ₹{(simResult.projectedNpv_inr / 100000).toFixed(2)} Lakh
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5 font-sans">Net Oil - Steam Cost</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
          <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Terminal Viscosity</span>
          <span className="text-lg font-black text-slate-800">
            {simResult.viscosityCurve_cp[simResult.viscosityCurve_cp.length - 1]} <span className="text-xs">cP</span>
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5 font-sans">Fluid Drag Level</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
          <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Avg Pump Fillage</span>
          <span className="text-lg font-black text-sky-700">
            {Math.round(simResult.pumpFillageCurve_pct.reduce((a, b) => a + b, 0) / simResult.pumpFillageCurve_pct.length)}%
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5 font-sans">Volumetric Uptake</span>
        </div>
      </div>

      {/* Chart: Simulated Oil Rate Decline & Temperature Profile */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 font-mono flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            Projected Daily Oil Rate (BOPD) over 45-Day Cooling Horizon
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Coupled Darcy Inflow + SRP Displacement</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 h-64 shadow-inner">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="oilGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  borderColor: '#e2e8f0', 
                  borderRadius: '10px', 
                  fontSize: '11px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="oilRate" name="Oil Rate (BOPD)" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#oilGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
