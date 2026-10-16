import React from 'react';
import {
  Search,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Building2,
  MapPin,
  ArrowRight,
  TrendingUp,
  Tag,
  CheckCircle2,
  Smartphone,
  BookOpen,
} from 'lucide-react';
import { ReportItem } from '../types';
import { ItemCard } from '../components/ItemCard';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { useReports } from '../context/ReportsContext';
import { useAuth } from '../context/AuthContext';
import { ITEM_CATEGORIES } from '../lib/demoData';

interface HomeViewProps {
  onOpenReportLost: () => void;
  onOpenReportFound: () => void;
  onSelectTab: (tab: string) => void;
  onSelectItem: (item: ReportItem) => void;
  onOpenMatches: (item: ReportItem) => void;
  onOpenClaim: (item: ReportItem) => void;
  onOpenHelp: () => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenReportLost,
  onOpenReportFound,
  onSelectTab,
  onSelectItem,
  onOpenMatches,
  onOpenClaim,
  onOpenHelp,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
}) => {
  const { reports, loading, getMatchesForReport } = useReports();
  const { userProfile, isGuestReviewer } = useAuth();

  // Find reports that have high-probability matches (>= 60%) to highlight in the Possible-Match suggestions banner
  const reportsWithMatches = React.useMemo(() => {
    return reports
      .filter((r) => r.status === 'open')
      .map((r) => ({
        report: r,
        matches: getMatchesForReport(r),
      }))
      .filter((entry) => entry.matches.length > 0 && entry.matches[0].score >= 60)
      .slice(0, 3);
  }, [reports, getMatchesForReport]);

  // Filtered reports for recent feed
  const filteredReports = React.useMemo(() => {
    return reports.filter((r) => {
      const matchesSearch =
        !searchQuery.trim() ||
        r.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.campus.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.college.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === 'All' || r.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [reports, searchQuery, selectedCategory]);

  const recentReports = filteredReports.slice(0, 8);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e2b1e] via-[#133e2b] to-[#1b4931] text-white p-6 sm:p-10 shadow-xl shadow-emerald-950/20">
        {/* Subtle decorative background circles */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-60 h-60 rounded-full bg-teal-400/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold mb-4 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Poona College of Arts, Science &amp; Commerce</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-display leading-tight">
            Lost something on campus? <br />
            <span className="text-emerald-300">FindIt Campus</span> helps you recover it.
          </h1>

          <p className="mt-3 text-sm sm:text-base text-stone-200 leading-relaxed max-w-xl">
            A smart lost-and-found registry for students, faculty, and campus staff. Powered by intelligent fuzzy matching to discover lost belongings faster.
          </p>

          {/* Two Prominent Action Buttons: I Lost Something & I Found Something */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onOpenReportLost}
              className="flex-1 inline-flex items-center justify-center gap-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-3.5 rounded-2xl text-sm shadow-lg shadow-rose-950/30 transition transform active:scale-95"
            >
              <HelpCircle className="w-5 h-5 text-rose-200" />
              <span>I Lost Something</span>
            </button>

            <button
              onClick={onOpenReportFound}
              className="flex-1 inline-flex items-center justify-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-[#091c13] font-extrabold px-6 py-3.5 rounded-2xl text-sm shadow-lg shadow-emerald-950/30 transition transform active:scale-95"
            >
              <ShieldCheck className="w-5 h-5 text-[#091c13]" />
              <span>I Found Something</span>
            </button>
          </div>
        </div>
      </section>

      {/* Possible Match Suggestions Section */}
      {reportsWithMatches.length > 0 && (
        <section className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/60 border border-emerald-300 rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-stone-900 text-base sm:text-lg">
                  Smart Match Suggestions Detected
                </h3>
                <p className="text-xs text-emerald-900">
                  Our algorithm matched recently reported items with potential candidates on campus.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {reportsWithMatches.map(({ report, matches }) => {
              const topMatch = matches[0];
              return (
                <div
                  key={report.id}
                  onClick={() => onOpenMatches(report)}
                  className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          report.type === 'lost'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {report.type}
                      </span>
                      <span className="bg-emerald-600 text-white text-xs font-black px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {topMatch.score}% Match
                      </span>
                    </div>

                    <h4 className="font-bold text-stone-900 text-sm line-clamp-1">
                      {report.itemName}
                    </h4>
                    <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                      Matches found item: &ldquo;{topMatch.matchedReport.itemName}&rdquo;
                    </p>

                    <div className="mt-2 text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-xl flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{topMatch.matchedReport.campus}</span>
                    </div>
                  </div>

                  <button className="mt-3 w-full py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1">
                    <span>Inspect Match Breakdown</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Search & Category Filter Section */}
      <section className="space-y-4">
        {/* Mobile Search Bar (also visible on desktop for quick filtering) */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by item name, campus wing, chemistry lab, library..."
            className="w-full pl-11 pr-4 py-3 bg-white text-sm rounded-2xl border border-stone-200/90 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 placeholder:text-stone-400 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-medium text-stone-400 hover:text-stone-700"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Horizontal Scroll Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition ${
              selectedCategory === 'All'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            All Categories ({reports.length})
          </button>
          {ITEM_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition ${
                selectedCategory === cat
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* PWA Install Banner */}
      <PWAInstallButton variant="banner" />

      {/* Recent Lost & Found Reports Feed */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-stone-900 font-display">
              Recent Campus Reports
            </h2>
            <p className="text-xs text-stone-500">
              Real-time Firestore items across Poona College
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectTab('lost')}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
            >
              View All Lost &rarr;
            </button>
            <span className="text-stone-300">|</span>
            <button
              onClick={() => onSelectTab('found')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              View All Found &rarr;
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl p-4 border border-stone-200 animate-pulse space-y-3"
              >
                <div className="aspect-16/9 bg-stone-200 rounded-xl" />
                <div className="h-4 bg-stone-200 rounded-md w-3/4" />
                <div className="h-3 bg-stone-200 rounded-md w-1/2" />
              </div>
            ))}
          </div>
        ) : recentReports.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
            <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto text-stone-400">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-stone-800 text-base">No Matching Reports Found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              We couldn&rsquo;t find anything matching &ldquo;{searchQuery}&rdquo;. Try another keyword or submit a new report.
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={onOpenReportLost}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition"
              >
                Report Lost Item
              </button>
              <button
                onClick={onOpenReportFound}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition"
              >
                Report Found Item
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recentReports.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onSelect={onSelectItem}
                onOpenMatches={onOpenMatches}
                onOpenClaim={onOpenClaim}
              />
            ))}
          </div>
        )}
      </section>

      {/* Simple Instructions Explaining How the App Works */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-stone-900 font-display">
              How FindIt Campus Works
            </h3>
            <p className="text-xs text-stone-500">
              Simple 3-step recovery flow for Poona College students
            </p>
          </div>
          <button
            onClick={onOpenHelp}
            className="text-xs font-bold text-emerald-800 hover:underline"
          >
            Learn More
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-[#fbf9f5] border border-stone-200/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-xs">
              1
            </div>
            <h4 className="font-bold text-stone-900 text-sm">Post a Report</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Submit your lost or found item with location details, date, and photo in seconds.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#fbf9f5] border border-stone-200/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-xs">
              2
            </div>
            <h4 className="font-bold text-stone-900 text-sm">Automated Matching</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Fuzzy keyword matching compares descriptions and campus locations automatically.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#fbf9f5] border border-stone-200/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-700 text-white flex items-center justify-center font-black text-xs">
              3
            </div>
            <h4 className="font-bold text-stone-900 text-sm">Safe Handover</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Items stored safely at Staff Room / Office. Ownership verified before collection.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
