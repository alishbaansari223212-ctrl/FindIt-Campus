import React from 'react';
import { Logo } from './Logo';
import { PWAInstallButton } from './PWAInstallButton';
import { useAuth } from '../context/AuthContext';
import { useReports } from '../context/ReportsContext';
import {
  Search,
  PlusCircle,
  User,
  LogOut,
  Sparkles,
  ClipboardCheck,
  CheckCircle2,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenReportModal: () => void;
  onOpenAuthModal: () => void;
  onOpenTestingModal: () => void;
  onOpenHelpModal: () => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenReportModal,
  onOpenAuthModal,
  onOpenTestingModal,
  onOpenHelpModal,
  searchQuery,
  setSearchQuery,
}) => {
  const { currentUser, userProfile, isGuestReviewer, logoutStudent } = useAuth();
  const { reports } = useReports();

  const lostCount = reports.filter((r) => r.type === 'lost' && r.status === 'open').length;
  const foundCount = reports.filter((r) => r.type === 'found' && r.status === 'open').length;

  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#fbf9f5]/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Brand Logo */}
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center focus:outline-hidden text-left shrink-0"
          >
            <Logo size="sm" className="sm:hidden" />
            <Logo size="md" className="hidden sm:flex" />
          </button>

          {/* Tablet & Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-2 lg:mx-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lost items, calculators, ID cards, keys..."
                className="w-full pl-10 pr-4 py-2 text-xs lg:text-sm bg-white border border-stone-200 rounded-full focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 placeholder:text-stone-400 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-stone-400 hover:text-stone-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Tablet & Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs lg:text-sm font-medium">
            <button
              onClick={() => onSelectTab('home')}
              className={`px-2.5 lg:px-3 py-1.5 rounded-xl transition ${
                currentTab === 'home'
                  ? 'bg-emerald-900 text-white font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => onSelectTab('lost')}
              className={`px-2.5 lg:px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                currentTab === 'lost'
                  ? 'bg-rose-600 text-white font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <span>Lost Items</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                currentTab === 'lost' ? 'bg-white/25 text-white' : 'bg-rose-100 text-rose-700'
              }`}>
                {lostCount}
              </span>
            </button>

            <button
              onClick={() => onSelectTab('found')}
              className={`px-2.5 lg:px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                currentTab === 'found'
                  ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <span>Found Items</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                currentTab === 'found' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {foundCount}
              </span>
            </button>

            <button
              onClick={() => onSelectTab('my-items')}
              className={`px-2.5 lg:px-3 py-1.5 rounded-xl transition ${
                currentTab === 'my-items'
                  ? 'bg-emerald-900 text-white font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              My Activity
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mobile Search Toggle Icon */}
            <button
              onClick={() => setMobileSearchOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition"
              title="Search items"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Hackathon Testing Modal Button */}
            <button
              onClick={onOpenTestingModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold border border-amber-300 transition shrink-0"
              title="Review Hackathon Checklist & Architecture"
            >
              <ClipboardCheck className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden xl:inline">Judging Checklist</span>
              <span className="xl:hidden">Judging</span>
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton variant="navbar" />

            {/* Post Report CTA (Tablet & Desktop) */}
            <button
              onClick={onOpenReportModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 lg:px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-800 to-[#133e2b] hover:from-emerald-900 hover:to-emerald-950 text-white text-xs font-bold shadow-md shadow-emerald-900/15 transition active:scale-95 shrink-0"
            >
              <PlusCircle className="w-4 h-4 text-emerald-300" />
              <span>Report Item</span>
            </button>

            {/* User Profile / Auth */}
            {currentUser || isGuestReviewer ? (
              <div className="flex items-center gap-2 pl-1 border-l border-stone-200">
                <div
                  onClick={() => onSelectTab('my-items')}
                  className="cursor-pointer flex items-center gap-2 p-1.5 rounded-xl hover:bg-stone-100 transition"
                  title="View your reported items"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-800 text-emerald-100 flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                    {userProfile?.displayName ? userProfile.displayName.charAt(0) : 'S'}
                  </div>
                  <div className="hidden xl:block text-left text-xs leading-tight">
                    <p className="font-semibold text-stone-900 truncate max-w-[110px]">
                      {userProfile?.displayName || 'Student'}
                    </p>
                    <p className="text-[10px] text-emerald-700 font-medium">
                      {isGuestReviewer ? 'Reviewer' : 'Poona College'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={logoutStudent}
                  className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition active:scale-95 shadow-xs"
              >
                <User className="w-3.5 h-3.5" />
                <span>Student Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Mobile Search Input */}
        {mobileSearchOpen && (
          <div className="md:hidden pb-3 pt-1 animate-in slide-in-from-top-2 duration-150">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lost items, calculators, books..."
                className="w-full pl-10 pr-10 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-stone-700 font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
