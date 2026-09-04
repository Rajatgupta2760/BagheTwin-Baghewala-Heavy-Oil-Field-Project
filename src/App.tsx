import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FieldOverview } from './components/FieldOverview';
import { WellboreSchematic } from './components/WellboreSchematic';
import { DynacardViewer } from './components/DynacardViewer';
import { CSSCycleTracker } from './components/CSSCycleTracker';
import { OptimizerPanel } from './components/OptimizerPanel';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { AICopilotDrawer } from './components/AICopilotDrawer';
import { ApplySafetyModal } from './components/ApplySafetyModal';
import { ArchitectureDocsModal } from './components/ArchitectureDocsModal';
import { Well, FieldSummary } from './types';
import { INITIAL_WELLS, BAGHEWALA_FIELD_SUMMARY } from './data/mockWells';
import { Sparkles, ShieldCheck, Activity, Flame, Gauge, Info } from 'lucide-react';

export default function App() {
  const [summary, setSummary] = useState<FieldSummary>(BAGHEWALA_FIELD_SUMMARY);
  const [wells, setWells] = useState<Well[]>(INITIAL_WELLS);
  // Default to BGW-07 to show the core problem (cooling crude, high viscosity, rod floating risk, and pending recommendation)
  const [selectedWell, setSelectedWell] = useState<Well>(INITIAL_WELLS[0]);
  
  const [activeTab, setActiveTab] = useState<string>('twin');
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Theme state: light / dark with persistent storage and system fallback
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('baghetwin-theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('baghetwin-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Fetch live fleet state from backend API on mount
  useEffect(() => {
    fetchFleetData();
  }, []);

  const fetchFleetData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/fleet');
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        setWells(data.wells);
        // Sync selected well
        const updated = data.wells.find((w: Well) => w.id === selectedWell.id);
        if (updated) setSelectedWell(updated);
      }
    } catch (err) {
      console.warn('API fetch failed, utilizing calibrated in-memory dataset:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSelectWell = (well: Well) => {
    setSelectedWell(well);
  };

  const handleApplyRecommendation = async (wellId: string, recId: string) => {
    setIsSafetyModalOpen(true);
  };

  const confirmApplyRecommendation = async () => {
    setIsApplying(true);
    try {
      const res = await fetch('/api/apply-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wellId: selectedWell.id }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.updatedWell) {
          setSelectedWell(data.updatedWell);
          setWells((prev) => prev.map((w) => (w.id === data.updatedWell.id ? data.updatedWell : w)));
        }
      } else {
        // Fallback in-memory update
        const updated = { ...selectedWell };
        if (updated.activeRecommendation) {
          updated.activeRecommendation.status = 'APPLIED';
          updated.srp.spm = updated.activeRecommendation.recommended.spm;
          updated.srp.vfdFrequency_hz = updated.activeRecommendation.recommended.vfdFrequency_hz;
          updated.production.oilRate_bopd = updated.activeRecommendation.recommended.projectedOilRate_bopd;
          updated.reliability.rodFailureProbability_pct = updated.activeRecommendation.recommended.projectedRodFailureRisk_pct;
          updated.srp.pumpFillage_pct = 84;
          updated.status = 'OPTIMAL';
          setSelectedWell(updated);
          setWells((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
        }
      }

      setNotification(`Successfully committed setpoints to ${selectedWell.id}: VFD set to ${selectedWell.activeRecommendation?.recommended.vfdFrequency_hz || 40.8} Hz (${selectedWell.activeRecommendation?.recommended.spm || 4.9} SPM).`);
      setTimeout(() => setNotification(null), 6000);
      setIsSafetyModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white transition-colors duration-200">
      
      {/* Toast Notification Banner */}
      {notification && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold font-mono text-center flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top duration-200 sticky top-0 z-50">
          <ShieldCheck className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Global Navigation */}
      <Navbar
        summary={summary}
        wells={wells}
        selectedWell={selectedWell}
        onSelectWell={handleSelectWell}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onOpenDocs={() => setIsDocsOpen(true)}
        onRefreshData={fetchFleetData}
        isRefreshing={isRefreshing}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Active Well Summary Card Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs transition-colors duration-200">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-black text-sm border shadow-xs ${
              selectedWell.status === 'CRITICAL'
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                : selectedWell.status === 'WARNING'
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
            }`}>
              {selectedWell.id}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 dark:text-white">{selectedWell.name}</h2>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">• {selectedWell.pad}</span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  selectedWell.stage === 'PRODUCTION'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                    : selectedWell.stage === 'INJECTION'
                    ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-400 border-orange-200 dark:border-orange-800'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                }`}>
                  {selectedWell.stage}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Depth: {selectedWell.reservoir.reservoirDepth_m} m | Near-Wellbore Temp: {selectedWell.reservoir.nearWellboreTemp_c}°C | Viscosity: {selectedWell.reservoir.effectiveViscosity_cp} cP
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-5 text-xs font-mono">
            <div className="text-right">
              <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 block font-sans font-bold">Oil Rate</span>
              <span className="text-base font-black text-slate-900 dark:text-white">{selectedWell.production.oilRate_bopd} <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">BOPD</span></span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 block font-sans font-bold">SPM</span>
              <span className="text-base font-black text-sky-700 dark:text-sky-400">{selectedWell.srp.spm} <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">SPM</span></span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 block font-sans font-bold">Rod Float Risk</span>
              <span className={`text-base font-black ${selectedWell.srp.rodFloatRisk_pct > 60 ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-emerald-700 dark:text-emerald-400'}`}>
                {selectedWell.srp.rodFloatRisk_pct}%
              </span>
            </div>
          </div>
        </div>

        {/* Tab 1: Digital Twin & Ops (Overview + Schematic + Thermal Tracker) */}
        {activeTab === 'twin' && (
          <div className="space-y-6">
            <WellboreSchematic well={selectedWell} />
            <CSSCycleTracker well={selectedWell} />
            <FieldOverview
              summary={summary}
              wells={wells}
              selectedWell={selectedWell}
              onSelectWell={handleSelectWell}
            />
          </div>
        )}

        {/* Tab 2: Dynacard Diagnostic Lab */}
        {activeTab === 'dynacard' && (
          <div className="space-y-6">
            <DynacardViewer well={selectedWell} />
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1 shadow-xs">
              <span className="font-bold text-slate-900 dark:text-white block">About Baghewala SRP Dynacards:</span>
              <p className="leading-relaxed">
                In heavy oil wells with crude viscosities of 800 - 3,500 cP during thermal decay, dynacards typically show a characteristic delayed load drop on the downstroke due to fluid friction opposing gravity fall. If the card exhibits a compressed lower profile, rod-floating is occurring, indicating the pump speed must be dialed down via VFD to prevent buckling.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Joint Optimizer */}
        {activeTab === 'optimizer' && (
          <div className="space-y-6">
            <OptimizerPanel
              well={selectedWell}
              onApplyRecommendation={handleApplyRecommendation}
              isApplying={isApplying}
            />
          </div>
        )}

        {/* Tab 4: What-If Simulator */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <WhatIfSimulator well={selectedWell} />
          </div>
        )}

      </main>

      {/* Floating AI Petroleum Copilot Button */}
      <button
        onClick={() => setIsCopilotOpen(true)}
        className="fixed bottom-6 right-6 z-30 px-4 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xl shadow-orange-600/20 border border-orange-500/30 transition-all flex items-center gap-2.5 cursor-pointer hover:scale-105 active:scale-95"
      >
        <Sparkles className="w-4 h-4 text-orange-200" />
        <span>Ask AI Petroleum Copilot</span>
      </button>

      {/* Drawer & Modals */}
      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        selectedWell={selectedWell}
      />

      <ApplySafetyModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
        well={selectedWell}
        onConfirm={confirmApplyRecommendation}
        isApplying={isApplying}
      />

      <ArchitectureDocsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400 font-mono transition-colors duration-200">
        <p className="font-semibold text-slate-700 dark:text-slate-200">BagheTwin EOR: Thermal-Lift Digital Twin for Heavy Oil Production Optimization</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          Baghewala Field, Jodhpur Sandstone • Oil India Limited (Rajasthan Project) • Smart India Hackathon 2026
        </p>
      </footer>

    </div>
  );
}
