import React, { useState } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  HelpCircle,
  ShieldCheck,
  Building2,
  MapPin,
  Calendar,
  X,
  Tag,
} from 'lucide-react';
import { CollectionStatus, ReportItem, ReportType } from '../types';
import { ItemCard } from '../components/ItemCard';
import { CAMPUS_LOCATIONS, ITEM_CATEGORIES } from '../lib/demoData';
import { useReports } from '../context/ReportsContext';

interface LostFoundViewProps {
  type: ReportType;
  onOpenReportModal: () => void;
  onSelectItem: (item: ReportItem) => void;
  onOpenMatches: (item: ReportItem) => void;
  onOpenClaim: (item: ReportItem) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

export const LostFoundView: React.FC<LostFoundViewProps> = ({
  type,
  onOpenReportModal,
  onSelectItem,
  onOpenMatches,
  onOpenClaim,
  searchQuery,
  setSearchQuery,
}) => {
  const { reports, loading } = useReports();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCampus, setSelectedCampus] = useState<string>('All');
  const [selectedCustody, setSelectedCustody] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  const isLost = type === 'lost';

  // Filter items matching the view's type and selected criteria
  const filteredItems = React.useMemo(() => {
    return reports
      .filter((r) => r.type === type)
      .filter((r) => {
        // Search query filter
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !query ||
          r.itemName.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query) ||
          r.location.toLowerCase().includes(query) ||
          r.campus.toLowerCase().includes(query) ||
          r.college.toLowerCase().includes(query);

        // Category filter
        const matchesCat =
          selectedCategory === 'All' || r.category === selectedCategory;

        // Campus filter
        const matchesCampus =
          selectedCampus === 'All' ||
          r.campus.toLowerCase().includes(selectedCampus.toLowerCase());

        // Custody status filter (for found items)
        const matchesCustody =
          selectedCustody === 'All' ||
          (r.collectionStatus && r.collectionStatus === selectedCustody);

        return matchesQuery && matchesCat && matchesCampus && matchesCustody;
      })
      .sort((a, b) => {
        const timeA = new Date(a.date || a.createdAt).getTime();
        const timeB = new Date(b.date || b.createdAt).getTime();
        return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
      });
  }, [reports, type, searchQuery, selectedCategory, selectedCampus, selectedCustody, sortBy]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'All' ||
    selectedCampus !== 'All' ||
    selectedCustody !== 'All';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedCampus('All');
    setSelectedCustody('All');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                isLost ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {type} Items Directory
            </span>
            <span className="text-xs text-stone-500 font-semibold">
              {filteredItems.length} registered
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 font-display">
            {isLost ? 'Campus Lost Belongings' : 'Campus Found Items & Custody'}
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-xl">
            {isLost
              ? 'Browse reported lost items across Poona College. If you recognize something you found, inspect matching details to return it.'
              : 'Items safely recovered on campus and turned in to staff rooms, offices, or security desks. Verify ownership to reclaim.'}
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-white shadow-md transition active:scale-95 shrink-0 ${
            isLost
              ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-900/20'
              : 'bg-emerald-800 hover:bg-emerald-900 shadow-emerald-900/20'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report {isLost ? 'Lost Item' : 'Found Item'}</span>
        </button>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 items-stretch sm:items-center">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${type} items by title, brand, room, wing...`}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 text-xs rounded-xl border border-stone-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-xs text-stone-400 hover:text-stone-700 font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="w-full sm:w-auto min-w-[160px] flex-1 sm:flex-initial">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs py-2.5 px-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition"
            >
              <option value="All">All Categories</option>
              {ITEM_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Campus Area Dropdown */}
          <div className="w-full sm:w-auto min-w-[170px] flex-1 sm:flex-initial">
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="w-full text-xs py-2.5 px-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition"
            >
              <option value="All">All Campus Wings</option>
              {CAMPUS_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Collection status filter (Found items only) */}
          {!isLost && (
            <div className="w-full sm:w-auto min-w-[160px] flex-1 sm:flex-initial">
              <select
                value={selectedCustody}
                onChange={(e) => setSelectedCustody(e.target.value)}
                className="w-full text-xs py-2.5 px-3 rounded-xl border border-purple-200 bg-purple-50/70 text-purple-950 font-medium focus:outline-hidden focus:ring-2 focus:ring-purple-700/20 focus:border-purple-700 transition"
              >
                <option value="All">All Custody Points</option>
                <option value="Staff Room">Staff Room</option>
                <option value="College Office">College Office</option>
                <option value="Security Desk">Security Desk</option>
                <option value="Teacher">Teacher / Faculty</option>
                <option value="With Finder">With Finder</option>
              </select>
            </div>
          )}

          {/* Sort By */}
          <div className="w-full sm:w-auto min-w-[130px]">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
              className="w-full text-xs py-2.5 px-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>
              Showing results with applied filters
            </span>
            <button
              onClick={resetFilters}
              className="font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Item Cards Grid or Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
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
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
          <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto text-stone-400">
            {isLost ? (
              <HelpCircle className="w-7 h-7 text-rose-400" />
            ) : (
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            )}
          </div>
          <h3 className="font-bold text-stone-900 text-lg">
            No {type} items match your criteria
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
            {hasActiveFilters
              ? 'Try widening your search terms or clearing campus filters to discover more items.'
              : `No items have been filed under ${type} yet.`}
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 border border-stone-200 rounded-xl text-xs font-semibold hover:bg-stone-50 transition"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={onOpenReportModal}
              className={`px-4 py-2 text-white text-xs font-bold rounded-xl shadow-sm transition ${
                isLost ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-800 hover:bg-emerald-900'
              }`}
            >
              Report a {isLost ? 'Lost Item' : 'Found Item'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
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
    </div>
  );
};
