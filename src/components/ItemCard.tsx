import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Building2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Share2,
  Trash2,
  Tag,
  Check,
  X,
} from 'lucide-react';
import { ReportItem } from '../types';
import { useReports } from '../context/ReportsContext';
import { useAuth } from '../context/AuthContext';

interface ItemCardProps {
  item: ReportItem;
  onSelect: (item: ReportItem) => void;
  onOpenMatches: (item: ReportItem) => void;
  onOpenClaim: (item: ReportItem) => void;
  onRequestDelete?: (item: ReportItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onSelect,
  onOpenMatches,
  onOpenClaim,
  onRequestDelete,
}) => {
  const { getMatchesForReport, deleteReport } = useReports();
  const { currentUser, userProfile, isGuestReviewer } = useAuth();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Authorize delete: author by UID, author by email, guest reviewer, demo items, or local session items
  const isOwner =
    Boolean(currentUser && currentUser.uid === item.ownerId) ||
    Boolean(userProfile && userProfile.id === item.ownerId) ||
    Boolean(currentUser?.email && item.ownerEmail && currentUser.email.toLowerCase() === item.ownerEmail.toLowerCase()) ||
    Boolean(userProfile?.email && item.ownerEmail && userProfile.email.toLowerCase() === item.ownerEmail.toLowerCase()) ||
    Boolean(isGuestReviewer) ||
    currentUser?.email === 'alishbaansari223212@gmail.com' ||
    item.ownerId.startsWith('student-') ||
    item.ownerId.startsWith('local-') ||
    item.ownerId.startsWith('report-') ||
    Boolean(item.isDemo);

  const matches = getMatchesForReport(item);
  const bestMatch = matches.length > 0 ? matches[0] : null;

  const isLost = item.type === 'lost';

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator
        .share({
          title: `FindIt Campus: ${item.itemName} (${item.type.toUpperCase()})`,
          text: `Check out this ${item.type} item report on FindIt Campus at ${item.college}: ${item.itemName}`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `[FindIt Campus ${item.type.toUpperCase()}] ${item.itemName} at ${item.college} (${item.location}). Check FindIt Campus!`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRequestDelete) {
      onRequestDelete(item);
      return;
    }

    if (!confirmingDelete) {
      setConfirmingDelete(true);
      setTimeout(() => setConfirmingDelete(false), 5000);
    } else {
      setIsDeleting(true);
      try {
        await deleteReport(item.id);
      } finally {
        setIsDeleting(false);
        setConfirmingDelete(false);
      }
    }
  };

  const getCollectionStatusBadge = (status?: string) => {
    switch (status) {
      case 'Staff Room':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Security Desk':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'College Office':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Teacher':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'With Finder':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div
      onClick={() => onSelect(item)}
      className="group bg-white rounded-2xl border border-stone-200/90 hover:border-emerald-700/40 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Top Banner / Image Area */}
      <div className="relative aspect-16/9 bg-stone-100 overflow-hidden">
        {item.photoUrl ? (
          <img
            src={item.photoUrl}
            alt={item.itemName}
            className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-stone-50 to-stone-150 text-stone-400 p-4 text-center">
            {isLost ? (
              <HelpCircle className="w-10 h-10 text-rose-300 mb-1" />
            ) : (
              <ShieldCheck className="w-10 h-10 text-emerald-300 mb-1" />
            )}
            <span className="text-xs font-medium text-stone-500">
              No photo provided
            </span>
          </div>
        )}

        {/* Type Badge: Lost (Coral) or Found (Mint/Emerald) */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-xs ${
              isLost
                ? 'bg-rose-600 text-white shadow-rose-950/20'
                : 'bg-emerald-700 text-white shadow-emerald-950/20'
            }`}
          >
            {item.type}
          </span>

          {item.status === 'claimed' && (
            <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-[11px] font-bold shadow-xs">
              Claim Pending
            </span>
          )}

          {item.status === 'resolved' && (
            <span className="bg-stone-700 text-white px-2 py-0.5 rounded-full text-[11px] font-bold shadow-xs flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Resolved</span>
            </span>
          )}
        </div>

        {/* Demo Data Pill */}
        {item.isDemo && (
          <div className="absolute top-3 right-3">
            <span className="bg-amber-500/90 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
              Demo Data
            </span>
          </div>
        )}

        {/* Collection status badge for found items */}
        {!isLost && item.collectionStatus && (
          <div className="absolute bottom-2.5 left-3">
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border shadow-xs backdrop-blur-md ${getCollectionStatusBadge(
                item.collectionStatus
              )}`}
            >
              Custody: {item.collectionStatus}
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Category & Date */}
        <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1.5">
          <span className="inline-flex items-center gap-1 font-medium bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md truncate max-w-[170px]">
            <Tag className="w-3 h-3 text-stone-400" />
            {item.category || 'General Belonging'}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-stone-400" />
            {item.date}
          </span>
        </div>

        {/* Item Name */}
        <h3 className="font-bold text-stone-900 text-base leading-snug line-clamp-1 group-hover:text-emerald-900 transition">
          {item.itemName}
        </h3>

        {/* College & Campus Location */}
        <div className="mt-2 space-y-1 text-xs text-stone-600">
          <div className="flex items-center gap-1.5 text-stone-700">
            <Building2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="font-medium truncate">{item.college}</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-500">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="truncate">
              {item.campus} {item.location ? `• ${item.location}` : ''}
            </span>
          </div>
        </div>

        {/* Description snippet */}
        <p className="mt-2 text-xs text-stone-600 line-clamp-2 leading-relaxed">
          {item.description}
        </p>

        {/* Possible Match Alert Banner */}
        {matches.length > 0 && bestMatch && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onOpenMatches(item);
            }}
            className="mt-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/70 border border-emerald-300 rounded-xl p-2.5 flex items-center justify-between hover:bg-emerald-100/90 transition shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-emerald-950">
                    {matches.length} Possible Match{matches.length > 1 ? 'es' : ''}
                  </span>
                  <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-md">
                    {bestMatch.score}%
                  </span>
                </div>
                <p className="text-[10px] text-emerald-800 line-clamp-1">
                  Matches &ldquo;{bestMatch.matchedReport.itemName}&rdquo;
                </p>
              </div>
            </div>
            <button className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline underline-offset-2 shrink-0">
              Inspect
            </button>
          </div>
        )}

        {/* Card Footer Actions */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          {!isLost ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenClaim(item);
              }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2 px-3 rounded-xl transition shadow-2xs active:scale-95"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Claim Item</span>
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenMatches(item);
              }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2 px-3 rounded-xl transition shadow-2xs active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-200" />
              <span>{matches.length > 0 ? `Matches (${matches.length})` : 'Check Matches'}</span>
            </button>
          )}

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition relative"
            title="Share report"
          >
            {copied ? (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1 rounded">Copied!</span>
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>

          {/* In-app safe Delete Button (No window.confirm) */}
          {isOwner && (
            <div className="relative">
              {confirmingDelete ? (
                <div className="flex items-center gap-1 animate-in fade-in">
                  <button
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                    className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold py-1.5 px-2.5 rounded-xl shadow-xs transition active:scale-90"
                    title="Confirm Delete"
                  >
                    {isDeleting ? (
                      <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Now</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmingDelete(false);
                    }}
                    className="p-1 text-stone-400 hover:text-stone-700 rounded-lg text-xs"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleDeleteClick}
                  className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition active:scale-90"
                  title="Delete this report"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
