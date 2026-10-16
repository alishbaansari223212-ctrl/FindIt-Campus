import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { ReportItem } from '../types';

interface DeleteModalProps {
  item: ReportItem | null;
  onClose: () => void;
  onConfirm: (itemId: string) => void;
  isDeleting?: boolean;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  item,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95">
        <div className="p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <Trash2 className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-stone-900">Delete This Report?</h3>
            <p className="text-xs text-stone-500 mt-1">
              Are you sure you want to remove &ldquo;<strong>{item.itemName}</strong>&rdquo;? This action cannot be undone.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-semibold text-xs hover:bg-stone-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm(item.id)}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              {isDeleting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Yes, Delete</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
