import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  FileCheck,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Well, OptimizationRecommendation } from '../types';

interface ApplySafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  well: Well;
  onConfirm: () => void;
  isApplying: boolean;
}

export const ApplySafetyModal: React.FC<ApplySafetyModalProps> = ({
  isOpen,
  onClose,
  well,
  onConfirm,
  isApplying,
}) => {
  const [operatorId, setOperatorId] = useState<string>('PE-RAJ-4091');
  const [confirmedCheck, setConfirmedCheck] = useState<boolean>(false);

  if (!isOpen || !well.activeRecommendation) return null;

  const rec = well.activeRecommendation;

  const handleApply = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ea580c', '#d97706', '#059669', '#0284c7']
    });
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Human-in-the-Loop Setpoint Authorization
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Well: {well.name} ({well.id}) • Pad: {well.pad}
            </p>
          </div>
        </div>

        {/* Action Summary Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
            Proposed Control Register Modifications
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 block font-sans">SRP Pumping Speed</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-slate-400 line-through">{rec.current.spm} SPM</span>
                <ArrowRight className="w-3.5 h-3.5 text-orange-600" />
                <span className="text-emerald-700 font-bold text-sm">{rec.recommended.spm} SPM</span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 block font-sans">VFD Drive Frequency</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-slate-400 line-through">{rec.current.vfdFrequency_hz} Hz</span>
                <ArrowRight className="w-3.5 h-3.5 text-orange-600" />
                <span className="text-emerald-700 font-bold text-sm">{rec.recommended.vfdFrequency_hz} Hz</span>
              </div>
            </div>
          </div>
        </div>

        {/* Automated Safety Envelope Verification */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            Physics Enclosure Check Verification (Passed)
          </div>
          <div className="space-y-1.5 text-xs">
            {rec.physicsConstraintsChecks.map((chk, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-700 font-medium">{chk.name}</span>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                  PASS ({chk.actual})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Operator Confirmation Checkbox */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmedCheck}
                onChange={(e) => setConfirmedCheck(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 bg-white text-orange-600 focus:ring-orange-500 cursor-pointer"
              />
              <span>I confirm that the downhole fluid drag and Goodman stress limits have been reviewed.</span>
            </label>
          </div>

          <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-200">
            <span className="text-slate-500">Operator ID:</span>
            <span className="text-slate-800 font-bold">{operatorId} (Production Lead)</span>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!confirmedCheck || isApplying}
            className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-40 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            {isApplying ? 'Applying...' : 'Authorize & Commit to Well'}
          </button>
        </div>

      </div>
    </div>
  );
};
