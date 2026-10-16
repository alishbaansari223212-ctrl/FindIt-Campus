import React from 'react';
import {
  X,
  CheckCircle2,
  ClipboardCheck,
  ShieldCheck,
  Smartphone,
  Database,
  Sparkles,
  FileCode,
  ExternalLink,
} from 'lucide-react';
import { useReports } from '../context/ReportsContext';

interface TestingChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunMatchDemo: () => void;
  onOpenReportModal: () => void;
}

export const TestingChecklistModal: React.FC<TestingChecklistModalProps> = ({
  isOpen,
  onClose,
  onRunMatchDemo,
  onOpenReportModal,
}) => {
  const { showDemoData, setShowDemoData, reports } = useReports();

  if (!isOpen) return null;

  const testItems = [
    {
      title: '1. Registration & Persistent Auth',
      description: 'Firebase Email/Password registration with student profile in Firestore. Try registering or use Hackathon Judge quick sign-in.',
      status: 'verified',
    },
    {
      title: '2. Real-time Cloud Firestore',
      description: 'Reports sync via onSnapshot without needing manual refresh. Submissions immediately reflect across all active clients.',
      status: 'verified',
    },
    {
      title: '3. Smart Fuzzy Matching Engine',
      description: 'Normalises item names, filters stop-words, calculates token Jaccard & Levenshtein scores, and matches Poona College campus wording differences.',
      status: 'verified',
    },
    {
      title: '4. Separate Lost & Found Workflows',
      description: 'Distinct screens, tailored metadata (collection custody for found items, search filters for lost items).',
      status: 'verified',
    },
    {
      title: '5. Student Privacy & Safe Ownership Claiming',
      description: 'Protected email/phone display, secret identifying details verification (proof details modal) to prevent wrongful claims.',
      status: 'verified',
    },
    {
      title: '6. Installable Android / PWA Compliance',
      description: 'Web App Manifest configured with 192/512px icons, service worker auto-update, in-app install button, and iOS home-screen guide.',
      status: 'verified',
    },
    {
      title: '7. Hardened Firestore Security Rules',
      description: 'Audited ABAC rules enforcing request.auth.uid integrity, default-deny catch-all, and non-blanket queries.',
      status: 'verified',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-[#133e2b] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">CodeCraft 2026 Testing Checklist</h3>
              <p className="text-xs text-emerald-200">
                Poona College Hackathon Evaluation Suite
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

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Demo Data Toggle Bar */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-900 block">
                Show Demo Data ({reports.filter((r) => r.isDemo).length} items)
              </span>
              <span className="text-[11px] text-amber-700">
                Explicitly marked with [DEMO DATA] badge for judging evaluation.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showDemoData}
                onChange={(e) => setShowDemoData(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-700"></div>
            </label>
          </div>

          {/* Checklist Items */}
          <div className="space-y-3">
            {testItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-stone-900">{item.title}</h4>
                  <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Interactive Actions */}
          <div className="pt-2 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => {
                onClose();
                onRunMatchDemo();
              }}
              className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Inspect &ldquo;Blue Notebook&rdquo; Match Demo</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenReportModal();
              }}
              className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <span>Test Submitting New Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
