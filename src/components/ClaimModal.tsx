import React, { useState } from 'react';
import { X, ShieldCheck, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ReportItem } from '../types';
import { useReports } from '../context/ReportsContext';
import { useAuth } from '../context/AuthContext';

interface ClaimModalProps {
  item: ReportItem | null;
  onClose: () => void;
  onSuccess: () => void;
  onRequireLogin: () => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  item,
  onClose,
  onSuccess,
  onRequireLogin,
}) => {
  const { submitClaim } = useReports();
  const { currentUser, isGuestReviewer, userProfile } = useAuth();

  const [proofDetails, setProofDetails] = useState('');
  const [contactMethod, setContactMethod] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser && !isGuestReviewer) {
      onRequireLogin();
      return;
    }

    if (!proofDetails.trim()) {
      setError('Please provide secret identifying details to verify that this item is yours.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await submitClaim(item.id, proofDetails, contactMethod);
      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2500);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit verification claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-[#133e2b] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">Claim Ownership</h3>
              <p className="text-xs text-emerald-200">
                Safe campus verification for &ldquo;{item.itemName}&rdquo;
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl hover:bg-white/10 text-stone-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-stone-900">Verification Submitted!</h4>
            <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
              Your ownership claim and proof details have been safely registered. The campus custodian or finder has been notified to inspect and arrange handover.
            </p>
            {item.collectionStatus && (
              <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-2xl text-purple-900 text-xs">
                <strong>Handover Location:</strong> Currently held at <strong>{item.collectionStatus}</strong>.
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Safe Custody Callout */}
            {item.collectionStatus && (
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-700 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-stone-500 uppercase font-semibold block">Current Custody</span>
                  <span className="font-bold text-purple-800">{item.collectionStatus}</span>
                </div>
                <span className="text-[11px] text-stone-500">{item.campus}</span>
              </div>
            )}

            {/* Privacy Shield Info */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <p>
                <strong>Privacy Protected:</strong> Your verification proof is private and only shared with the authorized finder or campus authority holding the item.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Proof Input */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Identifying Proof / Secret Details <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={proofDetails}
                onChange={(e) => setProofDetails(e.target.value)}
                placeholder="Describe features not shown in the public photo (e.g., sticker inside case, lock screen wallpaper, notes on page 4, scratches on corner, serial number...)"
                className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition"
              />
              <span className="text-[10px] text-stone-500 mt-1 block">
                This prevents unauthorized people from claiming your belongings.
              </span>
            </div>

            {/* Contact / Handover Preference */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Handover Contact or Meeting Preference
              </label>
              <input
                type="text"
                value={contactMethod}
                onChange={(e) => setContactMethod(e.target.value)}
                placeholder="e.g. Roll No. 24 Chemistry SY, or meet at Central Library Staff Room"
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition"
              />
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition active:scale-95"
              >
                {submitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                    <span>Submit Claim</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
