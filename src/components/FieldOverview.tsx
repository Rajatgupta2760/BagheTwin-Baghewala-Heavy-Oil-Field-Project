import React, { useState } from 'react';
import { 
  Droplets, 
  Flame, 
  Gauge, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Filter, 
  Search,
  Zap,
  Layers,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { Well, FieldSummary } from '../types';

interface FieldOverviewProps {
  summary: FieldSummary;
  wells: Well[];
  selectedWell: Well;
  onSelectWell: (well: Well) => void;
}

export const FieldOverview: React.FC<FieldOverviewProps> = ({
  summary,
  wells,
  selectedWell,
  onSelectWell,
}) => {
  const [selectedPad, setSelectedPad] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stageFilter, setStageFilter] = useState<string>('ALL');

  const filteredWells = wells.filter(well => {
    const matchesPad = selectedPad === 'ALL' || well.pad === selectedPad;
    const matchesStage = stageFilter === 'ALL' || well.stage === stageFilter;
    const matchesSearch = well.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          well.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          well.pad.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPad && matchesStage && matchesSearch;
  });

  const pads = ['ALL', 'Pad-North Alpha', 'Pad-Central Bravo', 'Pad-South Gamma', 'Pad-West Delta'];

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Context */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden transition-colors duration-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-mono">
                Real-Time Surveillance Active
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Oil India Ltd • Bikaner-Nagaur Basin, Rajasthan
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {summary.fieldName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              Ultra-heavy crude thermal recovery from Jodhpur Sandstone (~1,150 m depth). Native viscosity {summary.nativeViscosityRange}. Coupled CSS + SRP digital twin closed-loop.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block font-mono">Total Oil Rate</span>
              <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                {summary.totalOilRate_bopd} <span className="text-xs font-medium text-slate-500 dark:text-slate-400">BOPD</span>
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block font-mono">Field Avg SOR</span>
              <span className="text-xl font-black text-amber-700 dark:text-amber-400 font-mono">
                {summary.averageSor} <span className="text-xs font-medium text-slate-500 dark:text-slate-400">t/m³</span>
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block font-mono">Rod Risk Alerts</span>
              <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">
                {summary.activeRodRiskAlerts} <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Wells</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Producing Wells</span>
            <Droplets className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {summary.producingWells} <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">/ 23</span>
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-1 block">16 on Active SRP</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Steam Injection</span>
            <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{summary.steamingWells} <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">Wells</span></div>
          <span className="text-[11px] text-orange-700 dark:text-orange-400 font-medium mt-1 block">{summary.totalSteamInjection_t_day} t/day rate</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Soaking Phase</span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{summary.soakingWells} <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">Wells</span></div>
          <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium mt-1 block">Pressure Equalizing</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Cut-off Pending</span>
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{summary.cutoffPendingWells} <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">Wells</span></div>
          <span className="text-[11px] text-rose-700 dark:text-rose-400 font-medium mt-1 block">Past Economic SOR</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Avg Pump Fillage</span>
            <Gauge className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{summary.averagePumpFillage_pct}%</div>
          <span className="text-[11px] text-sky-700 dark:text-sky-400 font-medium mt-1 block">Target: &gt; 75%</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Fleet Health</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{summary.fleetHealthAvg_pct}%</div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-1 block">Reliability Index</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search well ID, pad, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white dark:focus:bg-slate-750"
          />
        </div>

        {/* Pad Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1 font-medium">
            <Layers className="w-3.5 h-3.5" />
            Pad:
          </span>
          {pads.map((pad) => (
            <button
              key={pad}
              onClick={() => setSelectedPad(pad)}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedPad === pad
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {pad === 'ALL' ? 'All Pads' : pad.replace('Pad-', '')}
            </button>
          ))}
        </div>

        {/* Stage Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
            <Filter className="w-3.5 h-3.5" />
            Stage:
          </span>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
          >
            <option value="ALL">All Stages</option>
            <option value="PRODUCTION">Active SRP Production</option>
            <option value="INJECTION">Steam Injection</option>
            <option value="SOAKING">Soaking Phase</option>
            <option value="CYCLE_CUTOFF_PENDING">Cut-off Pending</option>
          </select>
        </div>
      </div>

      {/* Wells Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {filteredWells.map((well) => {
          const isSelected = selectedWell.id === well.id;
          const isWarning = well.status === 'WARNING';
          const isCritical = well.status === 'CRITICAL';
          
          return (
            <div
              key={well.id}
              onClick={() => onSelectWell(well)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 border-orange-500 shadow-md ring-2 ring-orange-500/30'
                  : isCritical
                  ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 hover:border-rose-400 dark:hover:border-rose-600 hover:bg-white dark:hover:bg-slate-900 shadow-xs'
                  : isWarning
                  ? 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60 hover:border-amber-400 dark:hover:border-amber-600 hover:bg-white dark:hover:bg-slate-900 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
              }`}
            >
              {/* Top Row: Well ID & Stage Badge */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">{well.id}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[100px]">{well.pad.replace('Pad-', '')}</span>
                </div>

                {/* Stage Pill */}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  well.stage === 'PRODUCTION'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                    : well.stage === 'INJECTION'
                    ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800 animate-pulse'
                    : well.stage === 'SOAKING'
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                }`}>
                  {well.stage === 'PRODUCTION' ? 'SRP Prod' : well.stage}
                </span>
              </div>

              {/* Middle Metrics Row */}
              <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-800 my-2 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Oil Rate</span>
                  <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                    {well.production.oilRate_bopd > 0 ? `${well.production.oilRate_bopd}` : '—'}
                    <span className="text-[9px] font-normal text-slate-500 dark:text-slate-400"> b/d</span>
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Viscosity</span>
                  <span className={`text-xs font-bold font-mono ${
                    well.reservoir.effectiveViscosity_cp > 1000 
                      ? 'text-rose-600 dark:text-rose-400' 
                      : well.reservoir.effectiveViscosity_cp > 500 
                      ? 'text-amber-600 dark:text-amber-400' 
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {well.reservoir.effectiveViscosity_cp}
                    <span className="text-[9px] font-normal text-slate-500 dark:text-slate-400"> cP</span>
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">SRP Speed</span>
                  <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                    {well.srp.spm > 0 ? `${well.srp.spm}` : '—'}
                    <span className="text-[9px] font-normal text-slate-500 dark:text-slate-400"> SPM</span>
                  </span>
                </div>
              </div>

              {/* Bottom Row: Reliability & Action Indicator */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-16 bg-slate-200 dark:bg-slate-750 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        well.reliability.healthScore_pct > 80
                          ? 'bg-emerald-500'
                          : well.reliability.healthScore_pct > 60
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${well.reliability.healthScore_pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400">{well.reliability.healthScore_pct}% Health</span>
                </div>

                {well.activeRecommendation?.status === 'PENDING_APPROVAL' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                    <Zap className="w-2.5 h-2.5" /> AI Rec
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
