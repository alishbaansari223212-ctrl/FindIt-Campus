import React, { useState } from 'react';
import {
  X,
  Camera,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Building2,
  MapPin,
  Calendar,
  User,
} from 'lucide-react';
import { CollectionStatus, ReportType } from '../types';
import { CAMPUS_LOCATIONS, ITEM_CATEGORIES } from '../lib/demoData';
import { useReports } from '../context/ReportsContext';
import { useAuth } from '../context/AuthContext';

interface ReportFormProps {
  initialType?: ReportType;
  onClose: () => void;
  onSuccess: (newReportId: string) => void;
  onRequireLogin: () => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({
  initialType = 'lost',
  onClose,
  onSuccess,
  onRequireLogin,
}) => {
  const { createReport } = useReports();
  const { currentUser, userProfile, isGuestReviewer } = useAuth();

  const [type, setType] = useState<ReportType>(initialType);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState(ITEM_CATEGORIES[0]);
  const [college, setCollege] = useState('Poona College of Arts, Science & Commerce');
  const [campus, setCampus] = useState(CAMPUS_LOCATIONS[0]);
  const [customCampus, setCustomCampus] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [collectionStatus, setCollectionStatus] = useState<CollectionStatus>('Staff Room');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [reporterName, setReporterName] = useState(
    userProfile?.displayName || (currentUser?.displayName ? currentUser.displayName : '')
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  // Handle local photo selection with client-side canvas compression
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Please select an image smaller than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 600; // Efficient size for database storage
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.65);
        setPhotoUrl(compressedDataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Field Validations
    if (!itemName.trim() || itemName.trim().length < 2) {
      setError('Please enter an item name (at least 2 characters).');
      return;
    }

    if (!college.trim()) {
      setError('Please provide the college name.');
      return;
    }

    const effectiveCampus = customCampus.trim() || campus;
    if (!effectiveCampus.trim()) {
      setError('Please choose or enter a campus building or area.');
      return;
    }

    if (!location.trim()) {
      setError('Please specify the location spot where the item was lost or found.');
      return;
    }

    if (!description.trim() || description.trim().length < 5) {
      setError('Please enter a description with identifying details (at least 5 characters).');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newId = await createReport({
        type,
        itemName: itemName.trim(),
        category,
        college: college.trim(),
        campus: effectiveCampus,
        location: location.trim(),
        description: description.trim(),
        date,
        photoUrl: photoUrl || undefined,
        collectionStatus: type === 'found' ? collectionStatus : undefined,
        customReporterName: reporterName.trim() || undefined,
      });

      setSuccessId(newId);
      setTimeout(() => {
        onSuccess(newId);
        onClose();
      }, 1800);
    } catch (err: any) {
      console.error('Report submission error:', err);
      setError(err?.message || 'Failed to submit report. Please check the fields and try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-[#133e2b] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              {type === 'lost' ? (
                <HelpCircle className="w-5 h-5 text-rose-300" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {type === 'lost' ? 'Report a Lost Item' : 'Report a Found Item'}
              </h2>
              <p className="text-xs text-emerald-200">
                Poona College Lost &amp; Found Registry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-stone-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successId ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-stone-900">Report Successfully Submitted!</h3>
            <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
              Your {type} item has been recorded in the campus registry. Matches will be automatically suggested.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Report Type Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-stone-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setType('lost')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  type === 'lost'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>I Lost Something</span>
              </button>

              <button
                type="button"
                onClick={() => setType('found')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  type === 'found'
                    ? 'bg-emerald-700 text-white shadow-md'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>I Found Something</span>
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Reporter Name (if not logged in or editable) */}
            {!currentUser && !userProfile && (
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Your Full Name or Student ID
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="e.g. Farhan Shaikh (Chemistry Dept)"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition"
                  />
                </div>
              </div>
            )}

            {/* Item Name & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Item Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Blue notebook, Casio calculator"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition"
                >
                  {ITEM_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* College Name */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                College / Institution <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="Poona College of Arts, Science & Commerce"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition"
                />
              </div>
            </div>

            {/* Campus Area & Specific Spot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Campus / Building / Area <span className="text-rose-500">*</span>
                </label>
                <select
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition"
                >
                  {CAMPUS_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                  <option value="Custom">Custom / Other Wing...</option>
                </select>
                {campus === 'Custom' && (
                  <input
                    type="text"
                    value={customCampus}
                    onChange={(e) => setCustomCampus(e.target.value)}
                    placeholder="Enter custom wing or department"
                    className="mt-1.5 w-full text-xs p-2 rounded-lg border border-stone-200 bg-white"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Specific Location Spot <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Table 4 in Reading Hall 2nd Floor"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Description &amp; Identifying Details <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Include color, brand, condition, handwritten notes, stickers, or marks (minimum 5 characters)..."
                className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition"
              />
            </div>

            {/* Date & Collection Status (for found items) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Date {type === 'lost' ? 'Lost' : 'Found'} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    required
                    value={date}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition"
                  />
                </div>
              </div>

              {type === 'found' && (
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Safe Custody / Collection Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={collectionStatus}
                    onChange={(e) => setCollectionStatus(e.target.value as CollectionStatus)}
                    className="w-full text-xs p-2.5 rounded-xl border border-purple-200 bg-purple-50 text-purple-950 font-medium focus:outline-hidden focus:ring-2 focus:ring-purple-700/20 focus:border-purple-700 transition"
                  >
                    <option value="Staff Room">Staff Room (Safe Custody)</option>
                    <option value="Teacher">Handed to Teacher / Professor</option>
                    <option value="College Office">College Administrative Office</option>
                    <option value="Security Desk">Campus Security Desk</option>
                    <option value="With Finder">With Finder (Arrange Direct Claim)</option>
                    <option value="Other">Other Safe Storage</option>
                  </select>
                </div>
              )}
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Optional Item Photo
              </label>
              {photoUrl ? (
                <div className="relative w-full aspect-16/9 rounded-2xl overflow-hidden border border-stone-200 bg-stone-100">
                  <img
                    src={photoUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl(null)}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1.5 rounded-xl transition"
                    title="Remove Photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-stone-200 hover:border-emerald-600 rounded-2xl p-4 cursor-pointer bg-stone-50/50 hover:bg-emerald-50/30 transition text-center">
                  <div className="flex items-center gap-2 text-stone-500 mb-1">
                    <Camera className="w-5 h-5 text-emerald-700" />
                    <span className="text-xs font-semibold text-stone-700">
                      Take Photo or Upload Image
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400">
                    Supports JPG, PNG up to 5MB (automatically optimized)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-semibold transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition active:scale-95 disabled:opacity-50 ${
                  type === 'lost'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-900/20'
                    : 'bg-emerald-800 hover:bg-emerald-900 shadow-emerald-900/20'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit {type === 'lost' ? 'Lost' : 'Found'} Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
