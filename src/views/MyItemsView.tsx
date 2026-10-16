import React from 'react';
import {
  User,
  PlusCircle,
  CheckCircle2,
  Trash2,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Building2,
  Calendar,
  AlertCircle,
  Database,
  ArrowRight,
  X,
} from 'lucide-react';
import { ReportItem } from '../types';
import { useReports } from '../context/ReportsContext';
import { useAuth, getDeterministicStudentId } from '../context/AuthContext';

interface MyItemsViewProps {
  onOpenReportModal: () => void;
  onSelectItem: (item: ReportItem) => void;
  onOpenMatches: (item: ReportItem) => void;
  onOpenAuthModal: () => void;
}

export const MyItemsView: React.FC<MyItemsViewProps> = ({
  onOpenReportModal,
  onSelectItem,
  onOpenMatches,
  onOpenAuthModal,
}) => {
  const { reports, deleteReport, updateReportStatus, getMatchesForReport, seedDemoDataToFirestore } = useReports();
  const { currentUser, userProfile, isGuestReviewer, logoutStudent } = useAuth();

  const currentUserId = currentUser?.uid || userProfile?.id || (isGuestReviewer ? 'demo-reviewer-guest' : null);

  // Filter items submitted by this user (by email, deterministic ID, UID, or author name)
  const myReports = React.useMemo(() => {
    const activeEmail = (currentUser?.email || userProfile?.email || '').toLowerCase().trim();
    const activeUid = currentUser?.uid || userProfile?.id;
    const activeName = (userProfile?.displayName || currentUser?.displayName || '').toLowerCase().trim();
    const deterministicId = activeEmail ? getDeterministicStudentId(activeEmail) : '';

    if (!activeEmail && !activeUid) {
      return reports.filter((r) => r.ownerId.startsWith('student-') || r.ownerId.startsWith('local-'));
    }

    return reports.filter((r) => {
      // 1. Match by Email (case-insensitive)
      if (activeEmail && r.ownerEmail && r.ownerEmail.toLowerCase().trim() === activeEmail) {
        return true;
      }
      // 2. Match by deterministic student ID
      if (deterministicId && r.ownerId === deterministicId) {
        return true;
      }
      // 3. Match by active UID / Profile ID
      if (activeUid && r.ownerId === activeUid) {
        return true;
      }
      // 4. Match by author student name if no email is on the report
      if (activeName && r.ownerName && r.ownerName.toLowerCase().trim() === activeName) {
        return true;
      }
      // 5. Guest reviewer
      if (isGuestReviewer && (r.ownerId === 'demo-reviewer-guest' || r.isDemo)) {
        return true;
      }
      return false;
    });
  }, [reports, currentUserId, currentUser, userProfile, isGuestReviewer]);

  const activeLost = myReports.filter((r) => r.type === 'lost' && r.status === 'open').length;
  const activeFound = myReports.filter((r) => r.type === 'found' && r.status === 'open').length;
  const resolved = myReports.filter((r) => r.status === 'resolved').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Student Profile Card */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-900 to-emerald-700 text-white flex items-center justify-center text-xl font-extrabold uppercase shadow-md">
            {userProfile?.displayName ? userProfile.displayName.charAt(0) : 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-stone-900">
                {userProfile?.displayName || 'Campus Student'}
              </h2>
              {isGuestReviewer && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Judge Mode
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500">{userProfile?.email || 'Student Session Active'}</p>
            <p className="text-xs text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {userProfile?.college || 'Poona College of Arts, Science & Commerce'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenReportModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Report</span>
          </button>
          {currentUser || userProfile ? (
            <button
              onClick={logoutStudent}
              className="px-3 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold transition"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-rose-100 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Lost</span>
            <HelpCircle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-stone-900">{activeLost}</p>
          <p className="text-[10px] text-stone-400">Open Lost Reports</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Found</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-stone-900">{activeFound}</p>
          <p className="text-[10px] text-stone-400">Items Turned In</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-purple-700 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-stone-900">{resolved}</p>
          <p className="text-[10px] text-stone-400">Recovered Belongings</p>
        </div>
      </div>

      {/* Items List */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-stone-900 font-display">
              Your Published Reports ({myReports.length})
            </h3>
            <p className="text-xs text-stone-500">
              Manage your submissions and check for potential matches
            </p>
          </div>

          <button
            onClick={seedDemoDataToFirestore}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 transition"
            title="Populates live Firestore database with sample Poona College items"
          >
            <Database className="w-3.5 h-3.5 text-emerald-700" />
            <span>Seed Sample Items</span>
          </button>
        </div>

        {myReports.length === 0 ? (
          <div className="py-12 text-center text-stone-500 space-y-2">
            <HelpCircle className="w-10 h-10 text-stone-300 mx-auto" />
            <p className="font-semibold text-stone-700 text-sm">No items currently listed under your account</p>
            <p className="text-xs max-w-xs mx-auto">
              Whenever you report a lost belonging or turn in a found item, it will show up here.
            </p>
            <button
              onClick={onOpenReportModal}
              className="mt-3 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              Report an Item Now
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {myReports.map((item) => {
              const matches = getMatchesForReport(item);
              const isLost = item.type === 'lost';

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-stone-200 bg-[#fbf9f5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-700/40 transition"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {item.photoUrl && (
                      <img
                        src={item.photoUrl}
                        alt={item.itemName}
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isLost ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.type}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.status === 'resolved'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          Status: {item.status.toUpperCase()}
                        </span>
                        {item.isDemo && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                            Demo
                          </span>
                        )}
                      </div>
                      <h4
                        onClick={() => onSelectItem(item)}
                        className="font-bold text-stone-900 text-sm mt-1 truncate cursor-pointer hover:text-emerald-800"
                      >
                        {item.itemName}
                      </h4>
                      <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
                        <span>{item.campus}</span>
                        <span>•</span>
                        <span>{item.date}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 justify-end">
                    {matches.length > 0 && (
                      <button
                        onClick={() => onOpenMatches(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold hover:bg-emerald-200 transition"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{matches.length} Matches ({matches[0].score}%)</span>
                      </button>
                    )}

                    {item.status !== 'resolved' ? (
                      <button
                        onClick={() => updateReportStatus(item.id, 'resolved')}
                        className="px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold transition flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
                        <span>Mark Recovered</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => updateReportStatus(item.id, 'open')}
                        className="px-3 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold transition"
                      >
                        Re-open
                      </button>
                    )}

                    <InlineDeleteButton onDelete={() => deleteReport(item.id)} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const InlineDeleteButton: React.FC<{ onDelete: () => void }> = ({ onDelete }) => {
  const [confirming, setConfirming] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-1 animate-in fade-in">
        <button
          onClick={async () => {
            setDeleting(true);
            await onDelete();
            setDeleting(false);
            setConfirming(false);
          }}
          disabled={deleting}
          className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1 active:scale-95"
        >
          {deleting ? (
            <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Now</span>
            </>
          )}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="p-1 text-stone-400 hover:text-stone-700 rounded-lg text-xs"
          title="Cancel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        setConfirming(true);
        setTimeout(() => setConfirming(false), 5000);
      }}
      className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
      title="Delete Report"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
};
