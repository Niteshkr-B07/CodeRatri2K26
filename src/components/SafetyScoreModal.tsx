import React from 'react';
import { X, ShieldAlert, CheckCircle, AlertTriangle, Info, Clock, Building } from 'lucide-react';
import { SafetyScoreData } from '../types';

interface SafetyScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  scoreData: SafetyScoreData;
}

export const SafetyScoreModal: React.FC<SafetyScoreModalProps> = ({
  isOpen,
  onClose,
  scoreData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Explainable Safety Factors</h2>
              <p className="text-xs text-slate-400">Transparent algorithmic breakdown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="touch-target p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score Hero Summary */}
        <div className="my-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Corridor Rating
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span
                className={`text-3xl font-extrabold font-mono tabular-nums ${
                  scoreData.score >= 75
                    ? 'text-emerald-400'
                    : scoreData.score >= 55
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {scoreData.score}
              </span>
              <span className="text-slate-400 text-sm">/ 100</span>
              <span className="text-xs font-medium text-slate-300 ml-1">
                ({scoreData.ratingLabel})
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Data Confidence</span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded ${
                scoreData.confidence === 'High'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : scoreData.confidence === 'Medium'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {scoreData.confidence} Confidence
            </span>
          </div>
        </div>

        {/* Route Comparison Box */}
        <div className="mb-4 p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-semibold text-indigo-300 block">Fastest Route</span>
              <span className="text-[11px] text-slate-400">14 min · Through back alley connector</span>
            </div>
            <span className="text-xs font-mono text-amber-400">Score: 62</span>
          </div>
          <div className="h-px bg-slate-800" />
          <div className="flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-semibold text-emerald-300 block">Route with Fewer Reported Concerns</span>
              <span className="text-[11px] text-slate-400">17 min (+3 min) · Well-lit main avenue past police post</span>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">Score: 84</span>
          </div>
        </div>

        {/* Factors List */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Contributing Factor Breakdown
          </h3>
          {scoreData.factors.map((factor) => (
            <div
              key={factor.id}
              className="p-3 bg-slate-950/80 border border-slate-800/90 rounded-xl flex items-start justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-2.5">
                {factor.status === 'positive' && (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                )}
                {factor.status === 'warning' && (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                {factor.status === 'negative' && (
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{factor.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{factor.description}</p>
                </div>
              </div>

              <span
                className={`font-mono font-bold text-xs shrink-0 ${
                  factor.impact > 0
                    ? 'text-emerald-400'
                    : factor.impact < 0
                    ? 'text-rose-400'
                    : 'text-slate-400'
                }`}
              >
                {factor.impact > 0 ? `+${factor.impact}` : factor.impact} pts
              </span>
            </div>
          ))}
        </div>

        {/* Mandatory Advisory Disclaimer */}
        <div className="mt-5 p-3 bg-amber-950/30 border border-amber-800/50 rounded-xl text-amber-200/90 text-xs flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Advisory Notice:</strong> {scoreData.disclaimer} Ratings are derived solely from verified infrastructure reports, solar time calculations, and municipal assistance hubs.
          </p>
        </div>

        {/* Close Button */}
        <div className="mt-4">
          <button
            onClick={onClose}
            className="touch-target w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
