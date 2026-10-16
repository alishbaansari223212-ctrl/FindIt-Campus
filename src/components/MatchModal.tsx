import React from 'react';
import { X, Sparkles, AlertCircle, ArrowRight, CheckCircle2, ShieldCheck, MapPin, Building2, Calendar } from 'lucide-react';
import { MatchBreakdown, ReportItem } from '../types';

interface MatchModalProps {
  targetItem: ReportItem | null;
  matches: MatchBreakdown[];
  onClose: () => void;
  onSelectCandidate: (item: ReportItem) => void;
  onOpenClaim: (item: ReportItem) => void;
}

export const MatchModal: React.FC<MatchModalProps> = ({
  targetItem,
  matches,
  onClose,
  onSelectCandidate,
  onOpenClaim,
}) => {
  if (!targetItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#fbf9f5] rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-[#133e2b] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Smart Lost &amp; Found Matches</h2>
              <p className="text-xs text-emerald-200">
                Comparing &ldquo;{targetItem.itemName}&rdquo; against campus records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-stone-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Item Reference Card */}
        <div className="p-5 border-b border-stone-200/80 bg-white">
          <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
            Target Item ({targetItem.type.toUpperCase()})
          </p>
          <div className="flex items-start gap-4 p-3 rounded-2xl bg-stone-50 border border-stone-200">
            {targetItem.photoUrl && (
              <img
                src={targetItem.photoUrl}
                alt={targetItem.itemName}
                className="w-16 h-16 rounded-xl object-cover shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    targetItem.type === 'lost'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {targetItem.type}
                </span>
                <h4 className="font-bold text-stone-900 text-sm truncate">
                  {targetItem.itemName}
                </h4>
              </div>
              <p className="text-xs text-stone-600 mt-1 line-clamp-1">
                {targetItem.description}
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-stone-500">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-stone-400" />
                  {targetItem.college}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-stone-400" />
                  {targetItem.campus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Matches List */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
          {matches.length === 0 ? (
            <div className="py-12 text-center text-stone-500">
              <AlertCircle className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="font-semibold text-stone-700">No Possible Matches Found Yet</p>
              <p className="text-xs max-w-sm mx-auto mt-1">
                Our smart fuzzy matching engine continuously cross-checks all new reports for similar titles, descriptions, and campus locations.
              </p>
            </div>
          ) : (
            matches.map((match) => {
              const cand = match.matchedReport;
              const isHigh = match.score >= 70;
              const isMedium = match.score >= 50 && match.score < 70;

              return (
                <div
                  key={cand.id}
                  className="bg-white rounded-2xl border border-emerald-700/20 p-4 shadow-xs hover:border-emerald-700/50 transition"
                >
                  {/* Top Match Score Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm ${
                          isHigh
                            ? 'bg-emerald-600 text-white'
                            : isMedium
                            ? 'bg-teal-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {match.score}%
                      </div>
                      <div>
                        <span className="text-xs font-bold text-stone-900">
                          {isHigh
                            ? 'High Match Probability'
                            : isMedium
                            ? 'Moderate Match'
                            : 'Potential Match'}
                        </span>
                        <p className="text-[11px] text-stone-500">
                          Opposite report type: {cand.type.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                        cand.type === 'found'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {cand.type}
                    </span>
                  </div>

                  {/* Candidate Item Info */}
                  <div className="flex items-start gap-3">
                    {cand.photoUrl && (
                      <img
                        src={cand.photoUrl}
                        alt={cand.itemName}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-stone-900 text-base">
                        {cand.itemName}
                      </h4>
                      <p className="text-xs text-stone-600 mt-0.5 line-clamp-2">
                        {cand.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-stone-500">
                        <span className="flex items-center gap-1 font-medium text-stone-700">
                          <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                          {cand.college}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          {cand.campus} {cand.location ? `(${cand.location})` : ''}
                        </span>
                        {cand.collectionStatus && (
                          <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                            Custody: {cand.collectionStatus}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Matching Reasons Breakdown */}
                  <div className="mt-3.5 pt-3 border-t border-stone-100 bg-emerald-50/50 rounded-xl p-3">
                    <p className="text-[11px] font-bold text-emerald-950 mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                      Matching Evidence &amp; Signals:
                    </p>
                    <ul className="text-xs text-emerald-900 space-y-1">
                      {match.reasons.map((r, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex items-center justify-end gap-2.5">
                    <button
                      onClick={() => onSelectCandidate(cand)}
                      className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition"
                    >
                      View Report
                    </button>

                    {cand.type === 'found' && (
                      <button
                        onClick={() => onOpenClaim(cand)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-300" />
                        <span>Verify Ownership &amp; Claim</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Safety Disclaimer Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 text-stone-600 text-[11px] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Note on Matches:</strong> A possible match score is an algorithmic recommendation based on text similarity and college/campus coordinates. Ownership must always be verified through distinct identifying features (e.g. lock code hint, scratches, unique contents) before handover.
          </p>
        </div>
      </div>
    </div>
  );
};
