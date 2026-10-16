import React from 'react';
import { Home, HelpCircle, CheckSquare, Plus, User, FileQuestion, CheckCircle2 } from 'lucide-react';
import { useReports } from '../context/ReportsContext';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenReportModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenReportModal,
}) => {
  const { reports } = useReports();
  const lostCount = reports.filter((r) => r.type === 'lost' && r.status === 'open').length;
  const foundCount = reports.filter((r) => r.type === 'found' && r.status === 'open').length;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.05)] pb-safe">
      <div className="grid grid-cols-5 items-center h-16 px-1 max-w-lg mx-auto">
        {/* Home */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            currentTab === 'home'
              ? 'text-emerald-800 font-bold scale-105'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
        </button>

        {/* Lost Items */}
        <button
          onClick={() => onSelectTab('lost')}
          className={`flex flex-col items-center justify-center py-1 relative transition-all ${
            currentTab === 'lost'
              ? 'text-rose-600 font-bold scale-105'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className="relative">
            <FileQuestion className="w-5 h-5" />
            {lostCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {lostCount > 9 ? '9+' : lostCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Lost</span>
        </button>

        {/* Center Floating Action Button (FAB) for Post Report */}
        <div className="flex justify-center -mt-6">
          <button
            onClick={onOpenReportModal}
            className="flex items-center justify-center w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-800 via-[#133e2b] to-emerald-700 text-white shadow-lg shadow-emerald-900/30 border-4 border-[#fbf9f5] active:scale-90 transition transform"
            title="Report a Lost or Found Item"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        {/* Found Items */}
        <button
          onClick={() => onSelectTab('found')}
          className={`flex flex-col items-center justify-center py-1 relative transition-all ${
            currentTab === 'found'
              ? 'text-emerald-700 font-bold scale-105'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className="relative">
            <CheckCircle2 className="w-5 h-5" />
            {foundCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-emerald-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {foundCount > 9 ? '9+' : foundCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Found</span>
        </button>

        {/* My Activity / Profile */}
        <button
          onClick={() => onSelectTab('my-items')}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            currentTab === 'my-items'
              ? 'text-emerald-800 font-bold scale-105'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Activity</span>
        </button>
      </div>
    </nav>
  );
};
