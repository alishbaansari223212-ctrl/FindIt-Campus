/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ReportsProvider, useReports } from './context/ReportsContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ReportForm } from './components/ReportForm';
import { AuthModal } from './components/AuthModal';
import { MatchModal } from './components/MatchModal';
import { ClaimModal } from './components/ClaimModal';
import { ReportDetailModal } from './components/ReportDetailModal';
import { TestingChecklistModal } from './components/TestingChecklistModal';
import { HowItWorksModal } from './components/HowItWorksModal';
import { HomeView } from './views/HomeView';
import { LostFoundView } from './views/LostFoundView';
import { MyItemsView } from './views/MyItemsView';
import { ReportItem, ReportType } from './types';
import { Logo } from './components/Logo';
import {
  Heart,
  Shield,
  HelpCircle,
  FileText,
  Sparkles,
  ClipboardCheck,
  CheckCircle2,
  X,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { reports, getMatchesForReport, toastNotification, clearToast } = useReports();

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<'home' | 'lost' | 'found' | 'my-items'>('home');

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal states
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportModalType, setReportModalType] = useState<ReportType>('lost');

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const [isTestingModalOpen, setIsTestingModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Selected item modal states
  const [detailItem, setDetailItem] = useState<ReportItem | null>(null);
  const [matchItem, setMatchItem] = useState<ReportItem | null>(null);
  const [claimItem, setClaimItem] = useState<ReportItem | null>(null);

  // Quick action helpers
  const handleOpenReportLost = () => {
    setReportModalType('lost');
    setIsReportModalOpen(true);
  };

  const handleOpenReportFound = () => {
    setReportModalType('found');
    setIsReportModalOpen(true);
  };

  const handleOpenMatches = (item: ReportItem) => {
    setMatchItem(item);
  };

  const handleOpenClaim = (item: ReportItem) => {
    setClaimItem(item);
  };

  // Run Notebook Match Demo directly from Testing modal
  const handleRunMatchDemo = () => {
    const notebookReport = reports.find(
      (r) => r.id === 'demo-lost-notebook' || r.itemName.toLowerCase().includes('blue')
    );
    if (notebookReport) {
      setMatchItem(notebookReport);
    } else if (reports.length > 0) {
      setMatchItem(reports[0]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f5] text-stone-900 pb-24 md:pb-8 selection:bg-emerald-200">
      {/* Offline Alert Banner */}
      <OfflineIndicator />

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab as any)}
        onOpenReportModal={handleOpenReportLost}
        onOpenAuthModal={() => {
          setAuthModalMode('login');
          setIsAuthModalOpen(true);
        }}
        onOpenTestingModal={() => setIsTestingModalOpen(true)}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'home' && (
          <HomeView
            onOpenReportLost={handleOpenReportLost}
            onOpenReportFound={handleOpenReportFound}
            onSelectTab={(tab) => setCurrentTab(tab as any)}
            onSelectItem={(item) => setDetailItem(item)}
            onOpenMatches={handleOpenMatches}
            onOpenClaim={handleOpenClaim}
            onOpenHelp={() => setIsHelpModalOpen(true)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        )}

        {currentTab === 'lost' && (
          <LostFoundView
            type="lost"
            onOpenReportModal={handleOpenReportLost}
            onSelectItem={(item) => setDetailItem(item)}
            onOpenMatches={handleOpenMatches}
            onOpenClaim={handleOpenClaim}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {currentTab === 'found' && (
          <LostFoundView
            type="found"
            onOpenReportModal={handleOpenReportFound}
            onSelectItem={(item) => setDetailItem(item)}
            onOpenMatches={handleOpenMatches}
            onOpenClaim={handleOpenClaim}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {currentTab === 'my-items' && (
          <MyItemsView
            onOpenReportModal={handleOpenReportLost}
            onSelectItem={(item) => setDetailItem(item)}
            onOpenMatches={handleOpenMatches}
            onOpenAuthModal={() => {
              setAuthModalMode('login');
              setIsAuthModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab as any)}
        onOpenReportModal={handleOpenReportLost}
      />

      {/* Desktop Footer */}
      <footer className="mt-auto border-t border-stone-200/90 bg-white/70 py-8 text-stone-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size="sm" showSubtitle={false} />
            <span>•</span>
            <p>
              Built for <strong>CodeCraft 2026</strong> Hackathon at Poona College of Arts, Science &amp; Commerce.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setIsTestingModalOpen(true)}
              className="hover:text-emerald-800 font-semibold flex items-center gap-1"
            >
              <ClipboardCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Judging Suite</span>
            </button>
            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="hover:text-emerald-800"
            >
              How it Works
            </button>
            <span>•</span>
            <span>MIT License</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isReportModalOpen && (
        <ReportForm
          initialType={reportModalType}
          onClose={() => setIsReportModalOpen(false)}
          onSuccess={(newId) => {
            const created = reports.find((r) => r.id === newId);
            if (created) {
              setDetailItem(created);
            }
          }}
          onRequireLogin={() => {
            setIsReportModalOpen(false);
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
          }}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          defaultMode={authModalMode}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}

      {matchItem && (
        <MatchModal
          targetItem={matchItem}
          matches={getMatchesForReport(matchItem)}
          onClose={() => setMatchItem(null)}
          onSelectCandidate={(cand) => {
            setMatchItem(null);
            setDetailItem(cand);
          }}
          onOpenClaim={(cand) => {
            setMatchItem(null);
            setClaimItem(cand);
          }}
        />
      )}

      {claimItem && (
        <ClaimModal
          item={claimItem}
          onClose={() => setClaimItem(null)}
          onSuccess={() => {
            // ClaimModal renders its own verified success screen
          }}
          onRequireLogin={() => {
            setClaimItem(null);
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
          }}
        />
      )}

      {detailItem && (
        <ReportDetailModal
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onOpenMatches={handleOpenMatches}
          onOpenClaim={handleOpenClaim}
        />
      )}

      <TestingChecklistModal
        isOpen={isTestingModalOpen}
        onClose={() => setIsTestingModalOpen(false)}
        onRunMatchDemo={handleRunMatchDemo}
        onOpenReportModal={handleOpenReportLost}
      />

      <HowItWorksModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        onOpenReportLost={() => {
          setIsHelpModalOpen(false);
          handleOpenReportLost();
        }}
        onOpenReportFound={() => {
          setIsHelpModalOpen(false);
          handleOpenReportFound();
        }}
      />

      {/* Floating Toast Notification */}
      {toastNotification && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-stone-900/95 text-white shadow-2xl backdrop-blur-md text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 max-w-sm w-auto mx-auto border border-stone-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">{toastNotification.message}</span>
          <button
            onClick={clearToast}
            className="p-1 hover:bg-white/10 rounded-lg text-stone-400 hover:text-white transition ml-1"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ReportsProvider>
        <AppContent />
      </ReportsProvider>
    </AuthProvider>
  );
}
