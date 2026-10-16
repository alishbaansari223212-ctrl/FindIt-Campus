import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Building2,
  Tag,
  ShieldCheck,
  Sparkles,
  Share2,
  Flag,
  CheckCircle2,
  User,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { ReportItem } from '../types';
import { useReports } from '../context/ReportsContext';

interface ReportDetailModalProps {
  item: ReportItem | null;
  onClose: () => void;
  onOpenMatches: (item: ReportItem) => void;
  onOpenClaim: (item: ReportItem) => void;
  onDelete?: (item: ReportItem) => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  item,
  onClose,
  onOpenMatches,
  onOpenClaim,
  onDelete,
}) => {
  const { getMatchesForReport, deleteReport } = useReports();
  const [flagged, setFlagged] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (!item) return null;

  const matches = getMatchesForReport(item);
  const isLost = item.type === 'lost';

  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `FindIt Campus: ${item.itemName}`,
          text: `Lost & Found Report: ${item.itemName} at ${item.college} (${item.location})`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `[FindIt Campus ${item.type.toUpperCase()}] ${item.itemName} at ${item.college} (${item.location})`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Header Bar */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                isLost ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {item.type} Report
            </span>
            {item.isDemo && (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                Demo Data
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Photo View */}
        {item.photoUrl && (
          <div className="relative aspect-16/9 bg-stone-900 overflow-hidden">
            <img
              src={item.photoUrl}
              alt={item.itemName}
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
              <span className="bg-stone-100 px-2 py-0.5 rounded-md font-medium text-stone-600 flex items-center gap-1">
                <Tag className="w-3 h-3 text-stone-400" />
                {item.category || 'General'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-stone-400" />
                {item.date}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-stone-900 leading-tight">
              {item.itemName}
            </h2>
          </div>

          {/* Custody status if found */}
          {!isLost && item.collectionStatus && (
            <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-purple-700 uppercase font-bold tracking-wider block">
                  Collection / Custody Location
                </span>
                <span className="text-sm font-bold text-purple-950">
                  {item.collectionStatus}
                </span>
              </div>
              <ShieldCheck className="w-6 h-6 text-purple-600" />
            </div>
          )}

          {/* Location details */}
          <div className="p-3.5 bg-stone-50 border border-stone-200/80 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-stone-800">
              <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="font-semibold">{item.college}</span>
            </div>
            <div className="flex items-center gap-2 text-stone-600">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <span>
                {item.campus} {item.location ? `— ${item.location}` : ''}
              </span>
            </div>
          </div>

          {/* Full description */}
          <div>
            <h4 className="text-xs font-bold text-stone-800 mb-1">Description &amp; Details</h4>
            <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-line bg-stone-50/50 p-3 rounded-xl border border-stone-100">
              {item.description}
            </p>
          </div>

          {/* Reporter privacy info */}
          <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-stone-400" />
              <span>Reported by: <strong>{item.ownerName || 'Campus Student'}</strong></span>
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">Privacy Protected</span>
          </div>

          {/* Possible Matches quick link */}
          {matches.length > 0 && (
            <button
              onClick={() => {
                onClose();
                onOpenMatches(item);
              }}
              className="w-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 p-3 rounded-2xl flex items-center justify-between text-left hover:bg-emerald-100 transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-950">
                    {matches.length} Smart Match{matches.length > 1 ? 'es' : ''} Detected
                  </p>
                  <p className="text-[11px] text-emerald-800">
                    Highest match: {matches[0].score}% ({matches[0].matchedReport.itemName})
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-800 underline">View</span>
            </button>
          )}

          {/* Actions */}
          <div className="pt-3 flex items-center gap-2.5">
            {!isLost ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenClaim(item);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition active:scale-95"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>Verify &amp; Claim Item</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onOpenMatches(item);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-rose-200" />
                <span>Inspect Matches ({matches.length})</span>
              </button>
            )}

            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition relative"
              title="Share report"
            >
              {copied ? (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1 rounded">Copied!</span>
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>

            {confirmingDelete ? (
              <div className="flex items-center gap-1 animate-in fade-in">
                <button
                  onClick={async () => {
                    await deleteReport(item.id);
                    onClose();
                  }}
                  className="py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Now</span>
                </button>
                <button
                  onClick={() => setConfirmingDelete(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg text-xs"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setConfirmingDelete(true);
                  setTimeout(() => setConfirmingDelete(false), 5000);
                }}
                className="p-2.5 rounded-xl border border-stone-200 text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                title="Delete this report"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => {
                setFlagged(true);
                setTimeout(() => setFlagged(false), 3000);
              }}
              className="p-2.5 rounded-xl border border-stone-200 text-stone-400 hover:text-amber-600 hover:bg-amber-50 transition"
              title="Report or Flag inappropriate content"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>

          {flagged && (
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 text-center animate-in fade-in">
              Report received. Campus moderators have been alerted.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
