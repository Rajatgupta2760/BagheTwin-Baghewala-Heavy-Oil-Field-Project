import React from 'react';
import { 
  Activity, 
  Sparkles, 
  BookOpen, 
  RotateCw, 
  ShieldCheck,
  ChevronDown,
  Gauge,
  Sliders,
  Flame
} from 'lucide-react';
import { Well, FieldSummary } from '../types';
import { BagheTwinLogo } from './BagheTwinLogo';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  summary: FieldSummary;
  wells: Well[];
  selectedWell: Well;
  onSelectWell: (well: Well) => void;
  onOpenCopilot: () => void;
  onOpenDocs: () => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  summary,
  wells,
  selectedWell,
  onSelectWell,
  onOpenCopilot,
  onOpenDocs,
  onRefreshData,
  isRefreshing,
  activeTab,
  setActiveTab,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand & High-Definition Vector Logo */}
          <div className="flex items-center gap-3">
            <BagheTwinLogo size="md" showSubtitle={true} theme={theme} />
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <button
              onClick={() => setActiveTab('twin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'twin'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Digital Twin & Ops
            </button>

            <button
              onClick={() => setActiveTab('dynacard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'dynacard'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <Gauge className="w-3.5 h-3.5" />
              Dynacard Lab
            </button>

            <button
              onClick={() => setActiveTab('optimizer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'optimizer'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Joint Optimizer
              {selectedWell.activeRecommendation?.status === 'PENDING_APPROVAL' && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'simulator'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              What-If Simulator
            </button>
          </nav>

          {/* Quick Actions & Well Selector */}
          <div className="flex items-center gap-2">
            {/* Light / Dark Mode Toggle Button */}
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />

            {/* Well Quick Switcher */}
            <div className="relative">
              <select
                value={selectedWell.id}
                onChange={(e) => {
                  const found = wells.find(w => w.id === e.target.value);
                  if (found) onSelectWell(found);
                }}
                className="appearance-none bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer shadow-xs font-mono"
              >
                {wells.map(w => (
                  <option key={w.id} value={w.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {w.id} • {w.stage} ({w.production.oilRate_bopd} BOPD)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* AI Petroleum Copilot Trigger */}
            <button
              onClick={onOpenCopilot}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40 hover:from-orange-100 hover:to-amber-100 dark:hover:from-orange-900/50 dark:hover:to-amber-900/50 border border-orange-200 dark:border-orange-800/80 text-orange-800 dark:text-orange-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Open Gemini Petroleum AI Copilot"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              <span className="hidden sm:inline">AI Copilot</span>
            </button>

            {/* FastAPI REST API Swagger Docs Link */}
            <a
              href="/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="FastAPI Interactive Swagger REST API Docs (/docs)"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden lg:inline">FastAPI</span>
              <span className="font-mono text-[10px] bg-emerald-200/60 dark:bg-emerald-800/60 px-1 rounded text-emerald-900 dark:text-emerald-100">REST</span>
            </a>

            {/* Architecture & Specs Docs Trigger */}
            <button
              onClick={onOpenDocs}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              title="System Architecture & SIH Specs (Sections 4-12)"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline">Specs</span>
            </button>

            {/* Telemetry Refresh */}
            <button
              onClick={onRefreshData}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all disabled:opacity-50 cursor-pointer"
              title="Refresh Real-time Field Telemetry"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-orange-600 dark:text-orange-400' : ''}`} />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
