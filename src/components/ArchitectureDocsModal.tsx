import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Layout, 
  Cpu, 
  Network, 
  Database, 
  Package, 
  Zap, 
  ShieldCheck, 
  Eye, 
  BookOpen, 
  ChevronRight,
  Code,
  FileText
} from 'lucide-react';

interface ArchitectureDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureDocsModal: React.FC<ArchitectureDocsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeSection, setActiveSection] = useState<string>('4');

  if (!isOpen) return null;

  const sections = [
    { id: '4', title: '4. Information Architecture', icon: Layers },
    { id: '5', title: '5. UI/UX Specification', icon: Layout },
    { id: '6', title: '6. Technical Architecture', icon: Cpu },
    { id: '7', title: '7. API Design & Endpoints', icon: Network },
    { id: '8', title: '8. Data Models & Schemas', icon: Database },
    { id: '9', title: '9. Component Inventory', icon: Package },
    { id: '10', title: '10. Performance Strategy', icon: Zap },
    { id: '11', title: '11. Security & Safety Envelopes', icon: ShieldCheck },
    { id: '12', title: '12. Accessibility & Compliance', icon: Eye },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-5xl w-full h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                BagheTwin System Specifications & Architectural Blueprint
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-orange-50 text-orange-800 font-bold border border-orange-200">
                  SIH 2026 Ready
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Staff Product Manager & Senior Software Architect Technical Dossier
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto flex-shrink-0">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isCurrent = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isCurrent
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {sec.title}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-slate-700 space-y-6 leading-relaxed bg-white">
          
          {/* SECTION 4 */}
          {activeSection === '4' && (
            <div className="space-y-5">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900">4. Information Architecture & Navigation Hierarchy</h3>
                <p className="text-slate-500 text-xs mt-1">
                  Structural breakdown for field operators, production leads, and reservoir managers across the 23 heavy-oil wells of Baghewala.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="font-bold text-orange-600 uppercase text-[11px] font-mono">Screen Hierarchy</h4>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-orange-600 font-bold">L1:</span>
                      <span><strong>Fleet Surveillance Dashboard:</strong> 23-well fleet KPIs (Rate, SOR, Fillage, Rod Alerts), Rajasthani desert pad grid, search & filters.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-orange-600 font-bold">L2:</span>
                      <span><strong>Coupled Well-to-Surface Twin:</strong> Interactive animated wellbore cross-section linking surface walking beam down to Jodhpur Sandstone @ 1,150 m.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-orange-600 font-bold">L3:</span>
                      <span><strong>Dynacard Diagnostic Lab:</strong> Polished rod load vs position card with AI fault classification and SPE 2026 benchmarks.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-orange-600 font-bold">L4:</span>
                      <span><strong>Joint CSS-SRP Optimizer:</strong> Recommendation matrix, API Goodman stress checks, SHAP explainability, and Human-in-the-Loop authorization.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-orange-600 font-bold">L5:</span>
                      <span><strong>What-If Scenario Sandbox:</strong> 45-day multi-variable physics forward trajectory and economic NPV forecasting.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="font-bold text-orange-600 uppercase text-[11px] font-mono">Navigation & State Routing</h4>
                  <p className="text-slate-600 text-xs">
                    Persistent Top Bar contains global well selector (`BGW-01` to `BGW-23`), field status pulse, Gemini Petroleum Copilot trigger, and instant telemetry refresh.
                  </p>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 shadow-xs">
                    Field View → Select Well (BGW-07) → View Physics Schematic → Dynacard Anomaly → Review Joint Rec → Commit Setpoints
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5 */}
          {activeSection === '5' && (
            <div className="space-y-5">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900">5. UI/UX Specification (Linear / Apple / Stripe Grade)</h3>
                <p className="text-slate-500 text-xs mt-1">
                  Design decisions crafted for mission-critical industrial operational awareness, high scannability, and crisp contrast.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs">Aesthetic Archetype: Clean Industrial Precision</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Built using crisp neutral whites and slate backgrounds (`bg-white`, `bg-slate-50`) accented with thermal amber/orange tones (`#ea580c`, `#d97706`) representing steam injection and emerald (`#059669`) for productive oil flow. Typography pairs high-contrast <strong>Plus Jakarta Sans</strong> for body hierarchy with <strong>JetBrains Mono</strong> for precision engineering readouts, dynacard coordinates, and Goodman stress ratios.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-orange-700 block mb-1">Micro-Interactions</span>
                    <p className="text-slate-600 text-[11px]">
                      Live stroke oscillation synchronized to selected well SPM, subtle thermal gradient pulsing during steam injection, and confetti confirmation upon setpoint commitment.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-orange-700 block mb-1">Dynacard Canvas</span>
                    <p className="text-slate-600 text-[11px]">
                      Parametric closed-loop SVG rendering with dynamic toggles for Surface card, Downhole pump card, and the API Modified Goodman allowable stress boundary.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-orange-700 block mb-1">Mobile Responsiveness</span>
                    <p className="text-slate-600 text-[11px]">
                      Fluid flex layouts with touch targets &ge; 44px, horizontally scrollable pad filter pills, and sticky actions designed for ruggedized field tablets.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6 */}
          {activeSection === '6' && (
            <div className="space-y-5">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900">6. Technical Architecture & Component Organization</h3>
                <p className="text-slate-500 text-xs mt-1">
                  Full-stack reactive architecture using Express 4 + Vite + React 19 + TypeScript + Node ESM.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 font-mono text-[11px] leading-relaxed overflow-x-auto shadow-sm">
                <pre>{`src/
├── components/
│   ├── BagheTwinLogo.tsx        # High-detail vector logo component
│   ├── JointOptimizerModel.tsx  # Dynamic kinematic & thermodynamic physics model
│   ├── Navbar.tsx               # Global Header, Well Switcher, Copilot trigger
│   ├── FieldOverview.tsx        # 23-Well Fleet Telemetry & Rajasthan Pad Grid
│   ├── WellboreSchematic.tsx    # SVG Animated Pumping Unit & Jodhpur Reservoir Cross-section
│   ├── DynacardViewer.tsx       # Surface/Downhole Dynacard AI Classifier & Goodman Check
│   ├── CSSCycleTracker.tsx      # 3-Stage CSS Lifecycle & Economic SOR Cut-off Engine
│   ├── OptimizerPanel.tsx       # Coupled Joint Optimizer & Human-in-the-Loop Governance
│   ├── WhatIfSimulator.tsx      # 45-Day Physics Trajectory & NPV Recharts
│   ├── AICopilotDrawer.tsx      # Gemini Petroleum Copilot Chat Interface
│   ├── ApplySafetyModal.tsx     # Pre-Action Safety Verification & Confetti Dispatch
│   └── ArchitectureDocsModal.tsx# Comprehensive Architectural Specs (This Modal)
├── data/
│   └── mockWells.ts             # Calibrated Rajasthan Field Telemetry & 30-Day Logs
├── services/
│   └── physicsEngine.ts         # Andrade Viscosity, Darcy Inflow, Rod Drag, Goodman Ratio
├── types.ts                     # Strict Domain TypeScript Models & Contracts
└── server.ts                    # Express Backend + Vite Middleware + Gemini AI Endpoint`}</pre>
              </div>
            </div>
          )}

          {/* SECTION 7 */}
          {activeSection === '7' && (
            <div className="space-y-5">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900">7. API Design & Endpoints Specification</h3>
                <p className="text-slate-500 text-xs mt-1">
                  RESTful endpoints with structured payload contracts, HTTP status handling, and caching policies.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold text-[10px]">GET</span>
                    <span className="text-slate-900 font-bold">/api/fleet</span>
                  </div>
                  <p className="text-slate-600 text-xs font-sans">
                    Returns overall Baghewala field summary and active status for all 23 wells. Cached at edge for 5 seconds.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold text-[10px]">GET</span>
                    <span className="text-slate-900 font-bold">/api/wells/:id</span>
                  </div>
                  <p className="text-slate-600 text-xs font-sans">
                    Returns detailed well state vector ($S_t$), 30-day historical time-series, and 50-point high-resolution Dynacard.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">POST</span>
                    <span className="text-slate-900 font-bold">/api/optimize</span>
                  </div>
                  <p className="text-slate-600 text-xs font-sans">
                    Executes physics-guided AI optimizer; returns recommended action vector ($A_t^*$), Goodman stress check, and SHAP explainability.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">POST</span>
                    <span className="text-slate-900 font-bold">/api/ai-advisor</span>
                  </div>
                  <p className="text-slate-600 text-xs font-sans">
                    Queries Google Gemini API with well thermodynamic context or triggers resilient fallback petroleum rules.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 8 */}
          {activeSection === '8' && (
            <div className="space-y-5">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900">8. Data Models & Relational Schemas</h3>
                <p className="text-slate-500 text-xs mt-1">
                  Core entities representing the full coupled well-to-surface continuum.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-mono">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-orange-700 font-bold block">Wellbore & Reservoir State (S_t)</span>
                  <ul className="text-slate-600 space-y-0.5">
                    <li>• depth_m: 1,148 m (Jodhpur Sandstone)</li>
                    <li>• nativeTemp_c: 48°C | nearWellboreTemp_c: 74°C</li>
                    <li>• nativeVisc: 11,500 cP | effectiveVisc: 820 cP</li>
                    <li>• flowingBhp_psi: 620 | fluidLevel_m: 340</li>
                  </ul>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-orange-700 font-bold block">SRP Operating State (Action Space)</span>
                  <ul className="text-slate-600 space-y-0.5">
                    <li>• spm: 5.8 SPM | stroke_in: 74 in</li>
                    <li>• vfdFrequency_hz: 48.3 Hz</li>
                    <li>• goodmanStressRatio: 88.4% (Critical)</li>
                    <li>• pumpFillage: 61% | rodFloatRisk: 74%</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 9 */}
          {activeSection === '9' && (
            <div className="space-y-5">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900">9. Component Inventory & Reusability Matrix</h3>
                <p className="text-slate-500 text-xs mt-1">
                  List of reusable UI and physics components created in the codebase.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-mono">
                      <th className="py-2.5 px-3">Component</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">State Dependencies</th>
                      <th className="py-2.5 px-3">WCAG Support</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-900">WellboreSchematic</td>
                      <td className="py-2.5 px-3 text-slate-500 font-sans">Physics Canvas</td>
                      <td className="py-2.5 px-3 text-orange-700">Temp, SPM, Fluid Level</td>
                      <td className="py-2.5 px-3 text-emerald-700">ARIA Labels</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-900">DynacardViewer</td>
                      <td className="py-2.5 px-3 text-slate-500 font-sans">Diagnostics</td>
                      <td className="py-2.5 px-3 text-orange-700">Card points, Goodman limits</td>
                      <td className="py-2.5 px-3 text-emerald-700">High Contrast</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-900">OptimizerPanel</td>
                      <td className="py-2.5 px-3 text-slate-500 font-sans">Decision Support</td>
                      <td className="py-2.5 px-3 text-orange-700">Recommendation, Physics check</td>
                      <td className="py-2.5 px-3 text-emerald-700">Accessible Table</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-900">JointOptimizerModel</td>
                      <td className="py-2.5 px-3 text-slate-500 font-sans">Coupled Technical Model</td>
                      <td className="py-2.5 px-3 text-orange-700">Viscosity, Drag, SPM</td>
                      <td className="py-2.5 px-3 text-emerald-700">Interactive SVG</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-900">WhatIfSimulator</td>
                      <td className="py-2.5 px-3 text-slate-500 font-sans">Forecasting</td>
                      <td className="py-2.5 px-3 text-orange-700">Delta SPM, Steam, Soak</td>
                      <td className="py-2.5 px-3 text-emerald-700">Keyboard Sliders</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 10 */}
          {activeSection === '10' && (
            <div className="space-y-5">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900">10. Performance & Scalability Strategy</h3>
                <p className="text-slate-500 text-xs mt-1">
                  Techniques ensuring instantaneous responsiveness even under heavy telemetry streams.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-orange-700 uppercase text-[11px] font-mono">Physics Memoization</h4>
                  <p className="text-slate-600 text-xs">
                    Multi-day What-If simulation results are wrapped in `useMemo` hooks, only recalculating when SPM, steam volume, or soak days change.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-orange-700 uppercase text-[11px] font-mono">Lightweight SVG Animations</h4>
                  <p className="text-slate-600 text-xs">
                    Walking beam tilt and plunger stroke displacements use pure CSS and mathematical coordinate transforms rather than heavy canvas rerenders.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 11 */}
          {activeSection === '11' && (
            <div className="space-y-5">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900">11. Security, Authorization & Safety Envelopes</h3>
                <p className="text-slate-500 text-xs mt-1">
                  Multi-tier industrial protection ensuring algorithmic recommendations never compromise physical well integrity.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-3">
                <div className="flex items-center gap-2 text-rose-800 font-bold font-mono">
                  <ShieldCheck className="w-5 h-5 text-rose-600" />
                  CRITICAL ARCHITECTURAL SAFETY PRINCIPLE: No Direct VFD Control
                </div>
                <p className="text-slate-700 text-xs leading-relaxed">
                  The BagheTwin prototype enforces strict <strong>Human-in-the-Loop Governance</strong>. The AI and physics optimizer produce actionable setpoint proposals that undergo automated validation against the API Goodman Stress Envelope (&lt; 85%) and minimum downstroke tension (&gt; 2,000 lbs). The system <strong>never</strong> overrides physical VFD setpoints without an authenticated operator confirmation.
                </p>
              </div>
            </div>
          )}

          {/* SECTION 12 */}
          {activeSection === '12' && (
            <div className="space-y-5">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900">12. Accessibility (WCAG 2.1 AA Compliance)</h3>
                <p className="text-slate-500 text-xs mt-1">
                  Universal design ensuring readability in bright field control rooms or low-light night shifts.
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-700">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <span>Contrast Ratio: Minimum 4.5:1 for all telemetry and body text</span>
                  <span className="text-emerald-700 font-bold font-mono">WCAG AA PASS</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <span>Keyboard Navigation: Sliders, well selector, and modal controls operable via Tab / Arrows</span>
                  <span className="text-emerald-700 font-bold font-mono">WCAG AA PASS</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <span>Color Independence: Critical alerts pair color with distinct status iconography and text labels</span>
                  <span className="text-emerald-700 font-bold font-mono">WCAG AA PASS</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] font-mono text-slate-500">
            BagheTwin • Oil India Limited Rajasthan Project • SIH 2026
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
          >
            Close Documentation
          </button>
        </div>

      </div>
    </div>
  );
};
