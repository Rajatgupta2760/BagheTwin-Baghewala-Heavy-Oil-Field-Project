import React, { useState } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  HelpCircle, 
  Layers, 
  Maximize2,
  TrendingDown,
  Info
} from 'lucide-react';
import { Well, DynacardData } from '../types';
import { getDynacardForWell } from '../data/mockWells';

interface DynacardViewerProps {
  well: Well;
}

export const DynacardViewer: React.FC<DynacardViewerProps> = ({ well }) => {
  const cardData: DynacardData = getDynacardForWell(well);

  const [showSurface, setShowSurface] = useState<boolean>(true);
  const [showDownhole, setShowDownhole] = useState<boolean>(true);
  const [showGoodmanLimits, setShowGoodmanLimits] = useState<boolean>(true);

  // SVG coordinate transformation
  // Stroke 0 - 86 inches (X axis: 50px to 450px)
  // Load 0 - 30,000 lbs (Y axis: 300px down to 40px)
  const maxStroke = well.srp.strokeLength_in || 74;
  const maxLoad = 30000;

  const toSvgX = (pos: number) => 60 + (pos / maxStroke) * 380;
  const toSvgY = (load: number) => 310 - (load / maxLoad) * 260;

  // Build SVG path for surface card
  const surfacePath = cardData.surfaceCard.map((p, idx) => 
    `${idx === 0 ? 'M' : 'L'} ${toSvgX(p.position_in)} ${toSvgY(p.load_lbs)}`
  ).join(' ') + ' Z';

  // Build SVG path for downhole card (scaled to comparable load range for visual comparison)
  const downholePath = cardData.downholeCard.map((p, idx) => 
    `${idx === 0 ? 'M' : 'L'} ${toSvgX(p.position_in)} ${toSvgY(p.load_lbs * 1.5 + 4000)}`
  ).join(' ') + ' Z';

  // Goodman Allowable Stress Limit (85% limit = ~24,500 lbs peak allowable)
  const goodmanUpperY = toSvgY(24500);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 font-mono">
              SRP Dynamometer Surveillance
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Polished Rod Load vs Position Loop
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            Dynacard AI Classification & Stress Lab ({well.id})
          </h2>
        </div>

        {/* AI Classification Badge */}
        <div className="flex items-center gap-3">
          <div className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 font-mono ${
            cardData.faultClassification === 'NORMAL'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : cardData.faultClassification === 'ROD_FLOATING'
              ? 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            {cardData.faultClassification === 'NORMAL' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
            AI FAULT: {cardData.faultClassification.replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* Main Grid: Card Canvas + Diagnostics Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Dynacard SVG Canvas */}
        <div className="lg:col-span-8 bg-slate-950 rounded-xl p-4 flex flex-col items-center relative overflow-hidden border border-slate-800 shadow-inner">
          
          {/* Card Toggles */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                <input 
                  type="checkbox" 
                  checked={showSurface} 
                  onChange={(e) => setShowSurface(e.target.checked)} 
                  className="rounded border-slate-700 bg-slate-800 text-orange-500 focus:ring-orange-500"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
                Surface Dynacard
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                <input 
                  type="checkbox" 
                  checked={showDownhole} 
                  onChange={(e) => setShowDownhole(e.target.checked)} 
                  className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-500"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
                Downhole Pump Card
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                <input 
                  type="checkbox" 
                  checked={showGoodmanLimits} 
                  onChange={(e) => setShowGoodmanLimits(e.target.checked)} 
                  className="rounded border-slate-700 bg-slate-800 text-rose-500 focus:ring-rose-500"
                />
                <span className="w-2.5 h-0.5 bg-rose-500 inline-block" />
                API Goodman Envelope
              </label>
            </div>

            <span className="text-[10px] text-slate-400 font-mono">
              Sample Rate: 50 Hz | Stroke: {maxStroke} in
            </span>
          </div>

          {/* SVG Canvas */}
          <svg viewBox="0 0 480 340" className="w-full h-auto max-h-[360px]">
            {/* Grid Lines */}
            {[0, 6000, 12000, 18000, 24000, 30000].map((load) => (
              <g key={load}>
                <line x1="60" y1={toSvgY(load)} x2="440" y2={toSvgY(load)} stroke="#1e293b" strokeWidth="1" strokeDasharray={load === 0 ? 'none' : '3 3'} />
                <text x="52" y={toSvgY(load) + 3} fill="#64748b" fontSize="8" textAnchor="end" fontFamily="monospace">
                  {(load / 1000).toFixed(0)}k
                </text>
              </g>
            ))}

            {/* X Axis: Stroke positions */}
            {[0, 20, 40, 60, maxStroke].map((pos) => (
              <g key={pos}>
                <line x1={toSvgX(pos)} y1="50" x2={toSvgX(pos)} y2="310" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                <text x={toSvgX(pos)} y="325" fill="#64748b" fontSize="8" textAnchor="middle" fontFamily="monospace">
                  {pos}&quot;
                </text>
              </g>
            ))}

            {/* API Goodman Maximum Allowable Upper Limit Line */}
            {showGoodmanLimits && (
              <g>
                <line x1="60" y1={goodmanUpperY} x2="440" y2={goodmanUpperY} stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 2" />
                <text x="435" y={goodmanUpperY - 4} fill="#fb7185" fontSize="8" textAnchor="end" fontFamily="monospace">
                  API Modified Goodman Max (24.5k lbs)
                </text>
              </g>
            )}

            {/* Downhole Pump Card */}
            {showDownhole && (
              <path
                d={downholePath}
                fill="#0284c7"
                fillOpacity="0.12"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Surface Polished Rod Dynacard */}
            {showSurface && (
              <path
                d={surfacePath}
                fill="#f97316"
                fillOpacity="0.15"
                stroke="#fb923c"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Labels */}
            <text x="250" y="338" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">
              POLISHED ROD POSITION (INCHES)
            </text>
            <text x="18" y="180" fill="#94a3b8" fontSize="9" textAnchor="middle" transform="rotate(-90 18 180)" fontFamily="monospace">
              POLISHED ROD LOAD (LBS)
            </text>
          </svg>

          {/* Canvas Bottom Legend & Stats */}
          <div className="w-full flex items-center justify-between text-xs font-mono bg-slate-900 border border-slate-800 rounded-lg p-2.5 mt-2 text-slate-300">
            <div className="flex items-center gap-4">
              <span>Peak: <strong className="text-orange-400">{cardData.peakLoad_lbs.toLocaleString()} lbs</strong></span>
              <span>Min: <strong className="text-sky-400">{cardData.minLoad_lbs.toLocaleString()} lbs</strong></span>
              <span>Range: <strong className="text-slate-100">{(cardData.peakLoad_lbs - cardData.minLoad_lbs).toLocaleString()} lbs</strong></span>
            </div>
            <div>
              <span className="text-slate-400">Card Area: </span>
              <strong className="text-amber-400">{cardData.area_sq_in} sq.in</strong>
            </div>
          </div>

        </div>

        {/* AI Diagnostics & Benchmark Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Card Diagnostic Notes */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5 font-mono">
              <Zap className="w-3.5 h-3.5 text-orange-600" />
              Automated AI Card Interpretation
            </h3>
            
            <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
              {cardData.diagnosticNotes}
            </p>

            <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-sans">AI Confidence</span>
                <span className="text-emerald-700 font-bold">{(cardData.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-sans">Stress Ratio</span>
                <span className={`font-bold ${well.srp.goodmanStressRatio_pct > 85 ? 'text-rose-600' : 'text-slate-800'}`}>
                  {well.srp.goodmanStressRatio_pct}%
                </span>
              </div>
            </div>
          </div>

          {/* Research & Benchmark Card (SPE/JPT 2026 Reference) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider font-mono">
                Literature ML Benchmark
              </span>
              <span className="text-[10px] text-slate-500 font-mono">SPE/JPT 2026</span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Based on recent 2026 SPE research for real-time sucker rod pump failure prediction using scaled load ratios and machine learning:
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[9px] text-slate-500 block font-sans">Reported F1 Score</span>
                <span className="text-amber-700 font-bold">0.857</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[9px] text-slate-500 block font-sans">Avg Lead Time</span>
                <span className="text-sky-700 font-bold">13.97 Days</span>
              </div>
            </div>

            <span className="text-[9px] text-slate-400 italic block mt-1">
              *Field validation benchmark from published Heavy Oil SPE papers.
            </span>
          </div>

          {/* Action Recommendation Trigger */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
            <span className="text-slate-600">
              {well.activeRecommendation ? 'Active AI Recommendation Ready' : 'System Operating in Envelope'}
            </span>
            <span className="text-orange-600 font-bold font-mono">
              {well.activeRecommendation?.status || 'OPTIMAL'}
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
