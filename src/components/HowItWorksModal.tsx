import React from 'react';
import { X, Search, Sparkles, ShieldCheck, ArrowRight, HeartHandshake } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReportLost: () => void;
  onOpenReportFound: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
  onOpenReportLost,
  onOpenReportFound,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        <div className="bg-gradient-to-r from-emerald-900 to-[#133e2b] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">How FindIt Campus Works</h3>
              <p className="text-xs text-emerald-200">
                Poona College Lost &amp; Found Guide
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

        <div className="p-6 space-y-4 text-xs text-stone-600">
          {/* Step 1 */}
          <div className="flex items-start gap-3.5 p-3.5 bg-rose-50/60 border border-rose-100 rounded-2xl">
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              1
            </div>
            <div>
              <h4 className="font-bold text-stone-900 text-sm mb-0.5">
                Report Lost or Found
              </h4>
              <p className="leading-relaxed">
                Misplaced an item or picked up something left behind? Post a quick report with its name, campus building, description, and photo.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3.5 p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-2xl">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
              2
            </div>
            <div>
              <h4 className="font-bold text-stone-900 text-sm mb-0.5">
                Intelligent Campus Matching
              </h4>
              <p className="leading-relaxed">
                Our smart matching engine compares lost items with found items across Poona College—even if spelling or campus locations differ slightly (e.g. &ldquo;Library&rdquo; vs &ldquo;Main Library&rdquo;).
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3.5 p-3.5 bg-purple-50/60 border border-purple-100 rounded-2xl">
            <div className="w-8 h-8 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
              3
            </div>
            <div>
              <h4 className="font-bold text-stone-900 text-sm mb-0.5">
                Safe Custody &amp; Verified Claim
              </h4>
              <p className="leading-relaxed">
                Found items are handed over to trusted campus custody points (Staff Room, Office, Security Desk). Owners verify identity with secret details before collection.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenReportLost();
              }}
              className="py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition text-center shadow-xs"
            >
              I Lost Something
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenReportFound();
              }}
              className="py-2.5 px-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl transition text-center shadow-xs"
            >
              I Found Something
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
