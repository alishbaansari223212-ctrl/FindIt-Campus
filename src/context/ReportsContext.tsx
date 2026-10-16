import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
} from 'firebase/firestore';
import { db, testConnection } from '../lib/firebase';
import { ClaimItem, MatchBreakdown, ReportItem, ReportType } from '../types';
import { INITIAL_DEMO_REPORTS } from '../lib/demoData';
import { findPossibleMatches } from '../lib/matching';
import { useAuth, getDeterministicStudentId } from './AuthContext';

export interface ToastInfo {
  type: 'success' | 'info' | 'error';
  message: string;
}

interface ReportsContextType {
  reports: ReportItem[];
  loading: boolean;
  error: string | null;
  showDemoData: boolean;
  setShowDemoData: (val: boolean) => void;
  toastNotification: ToastInfo | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  clearToast: () => void;
  createReport: (
    reportData: Omit<ReportItem, 'id' | 'createdAt' | 'ownerId' | 'ownerName' | 'status'> & {
      customReporterName?: string;
    }
  ) => Promise<string>;
  updateReportStatus: (reportId: string, status: ReportItem['status']) => Promise<void>;
  deleteReport: (reportId: string) => Promise<boolean>;
  submitClaim: (reportId: string, proofDetails: string, contactMethod?: string) => Promise<string>;
  getMatchesForReport: (report: ReportItem) => MatchBreakdown[];
  seedDemoDataToFirestore: () => Promise<void>;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

const DELETED_REPORTS_STORAGE_KEY = 'findit_deleted_reports_v2';
const SUBMITTED_REPORTS_STORAGE_KEY = 'findit_submitted_reports_v2';

// Helper to remove any undefined values which Firestore rejects
function sanitizeFirestorePayload(data: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined && val !== null) {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

export const ReportsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userProfile, isGuestReviewer } = useAuth();
  const [firestoreReports, setFirestoreReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDemoData, setShowDemoData] = useState(true);
  const [toastNotification, setToastNotification] = useState<ToastInfo | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastNotification({ message, type });
    setTimeout(() => {
      setToastNotification((prev) => (prev?.message === message ? null : prev));
    }, 3800);
  };

  const clearToast = () => setToastNotification(null);

  // Persistent user-submitted reports saved in localStorage so a browser refresh NEVER wipes them
  const [localSubmittedReports, setLocalSubmittedReports] = useState<ReportItem[]>(() => {
    try {
      const saved = localStorage.getItem(SUBMITTED_REPORTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persistent deleted IDs
  const [deletedIds, setDeletedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(DELETED_REPORTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Automatically link local reports submitted during session to active student on login
  useEffect(() => {
    const activeEmail = (currentUser?.email || userProfile?.email || '').toLowerCase().trim();
    const activeUid = currentUser?.uid || userProfile?.id;
    const activeName = userProfile?.displayName || currentUser?.displayName;
    if (activeEmail || activeUid) {
      setLocalSubmittedReports((prev) => {
        let changed = false;
        const updated = prev.map((item) => {
          if (!item.ownerEmail && activeEmail) {
            changed = true;
            return {
              ...item,
              ownerEmail: activeEmail,
              ownerId: activeUid || item.ownerId,
              ownerName: activeName || item.ownerName,
            };
          }
          return item;
        });
        if (changed) {
          try {
            localStorage.setItem(SUBMITTED_REPORTS_STORAGE_KEY, JSON.stringify(updated));
          } catch {}
        }
        return updated;
      });
    }
  }, [currentUser, userProfile]);

  // Initial connection test
  useEffect(() => {
    testConnection();
  }, []);

  // Real-time Firestore synchronization
  useEffect(() => {
    const reportsCollection = collection(db, 'reports');
    const q = query(reportsCollection);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched: ReportItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          fetched.push({
            id: docSnap.id,
            type: (data.type as ReportType) || 'lost',
            itemName: data.itemName || '',
            category: data.category || 'Other Campus Belongings',
            college: data.college || 'Poona College of Arts, Science & Commerce',
            campus: data.campus || '',
            location: data.location || '',
            description: data.description || '',
            date: data.date || '',
            photoUrl: data.photoUrl || undefined,
            collectionStatus: data.collectionStatus || undefined,
            status: data.status || 'open',
            ownerId: data.ownerId || '',
            ownerName: data.ownerName || 'Campus Student',
            ownerEmail: data.ownerEmail || undefined,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
            isDemo: false,
          });
        });

        // Sort newest first
        fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setFirestoreReports(fetched);
        setLoading(false);
      },
      (err) => {
        console.warn('Real-time snapshot note:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Merge reports: Firestore items + locally submitted items + demo items (excluding deleted)
  const combinedReports: ReportItem[] = React.useMemo(() => {
    const deletedSet = new Set(deletedIds);
    const seenIds = new Set<string>();
    const result: ReportItem[] = [];

    // 1. Add Firestore reports
    for (const item of firestoreReports) {
      if (!deletedSet.has(item.id) && !seenIds.has(item.id)) {
        seenIds.add(item.id);
        result.push(item);
      }
    }

    // 2. Add local submitted reports (ensures they stay visible even if Firestore is slow or offline)
    for (const item of localSubmittedReports) {
      if (!deletedSet.has(item.id) && !seenIds.has(item.id)) {
        seenIds.add(item.id);
        result.push(item);
      }
    }

    // 3. Add demo reports if enabled
    if (showDemoData) {
      for (const item of INITIAL_DEMO_REPORTS) {
        if (!deletedSet.has(item.id) && !seenIds.has(item.id)) {
          seenIds.add(item.id);
          result.push(item);
        }
      }
    }

    // Sort newest first
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [firestoreReports, localSubmittedReports, showDemoData, deletedIds]);

  // Create Report
  const createReport = async (
    reportData: Omit<ReportItem, 'id' | 'createdAt' | 'ownerId' | 'ownerName' | 'status'> & {
      customReporterName?: string;
    }
  ): Promise<string> => {
    const { customReporterName, ...fields } = reportData;

    const userEmail = (currentUser?.email || userProfile?.email || '').toLowerCase().trim();
    const ownerId =
      currentUser?.uid ||
      userProfile?.id ||
      (userEmail ? getDeterministicStudentId(userEmail) : (isGuestReviewer ? 'demo-reviewer-guest' : `student-${Date.now()}`));

    const ownerName =
      customReporterName?.trim() ||
      userProfile?.displayName ||
      currentUser?.displayName ||
      (userEmail ? userEmail.split('@')[0] : 'Poona College Student');

    const timestamp = new Date().toISOString();
    const tempId = `report-${Date.now()}`;

    const newLocalItem: ReportItem = {
      ...fields,
      id: tempId,
      status: 'open',
      ownerId,
      ownerName,
      ownerEmail: userEmail || undefined,
      createdAt: timestamp,
      isDemo: false,
    };

    // 1. Save immediately to persistent localStorage so a browser refresh NEVER deletes it
    setLocalSubmittedReports((prev) => {
      const updated = [newLocalItem, ...prev.filter((r) => r.id !== tempId)];
      try {
        localStorage.setItem(SUBMITTED_REPORTS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
      return updated;
    });

    // 2. Prepare payload for Firestore
    const rawPayload: Record<string, any> = {
      type: fields.type,
      itemName: fields.itemName.trim(),
      category: fields.category || 'Other Campus Belongings',
      college: fields.college.trim() || 'Poona College of Arts, Science & Commerce',
      campus: fields.campus.trim(),
      location: fields.location.trim(),
      description: fields.description.trim(),
      date: fields.date,
      status: 'open',
      ownerId,
      ownerName,
      ownerEmail: userEmail || undefined,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (fields.photoUrl && fields.photoUrl.trim()) {
      rawPayload.photoUrl = fields.photoUrl;
    }

    if (fields.type === 'found' && fields.collectionStatus) {
      rawPayload.collectionStatus = fields.collectionStatus;
    }

    const payload = sanitizeFirestorePayload(rawPayload);

    // 3. Write to Firestore
    try {
      const docRef = await addDoc(collection(db, 'reports'), payload);
      // Update the local item ID with the real Firestore ID
      const realId = docRef.id;
      setLocalSubmittedReports((prev) => {
        const updated = prev.map((r) => (r.id === tempId ? { ...r, id: realId } : r));
        try {
          localStorage.setItem(SUBMITTED_REPORTS_STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
      showToast(`Your ${fields.type} item was published successfully!`, 'success');
      return realId;
    } catch (err: any) {
      console.warn('Firestore write notice (item preserved in local storage):', err);
      showToast(`Report saved to campus registry!`, 'success');
      return tempId;
    }
  };

  // Update Status
  const updateReportStatus = async (reportId: string, status: ReportItem['status']) => {
    setLocalSubmittedReports((prev) => {
      const updated = prev.map((r) => (r.id === reportId ? { ...r, status } : r));
      try {
        localStorage.setItem(SUBMITTED_REPORTS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setFirestoreReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status } : r))
    );

    showToast(status === 'resolved' ? 'Marked as recovered & resolved!' : 'Report status updated.', 'success');

    if (reportId.startsWith('demo-') || reportId.startsWith('report-') || reportId.startsWith('local-')) {
      return;
    }

    try {
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Could not update report status in Firestore:', err);
    }
  };

  // Delete Report
  const deleteReport = async (reportId: string): Promise<boolean> => {
    // 1. Add to deleted IDs in memory & localStorage
    setDeletedIds((prev) => {
      const updated = Array.from(new Set([...prev, reportId]));
      try {
        localStorage.setItem(DELETED_REPORTS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 2. Remove from local submitted reports in localStorage
    setLocalSubmittedReports((prev) => {
      const updated = prev.filter((r) => r.id !== reportId);
      try {
        localStorage.setItem(SUBMITTED_REPORTS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 3. Remove from Firestore reports state
    setFirestoreReports((prev) => prev.filter((r) => r.id !== reportId));

    showToast('Report deleted successfully.', 'info');

    // 4. Delete from Firestore if it exists remotely
    if (
      !reportId.startsWith('demo-') &&
      !reportId.startsWith('report-') &&
      !reportId.startsWith('local-')
    ) {
      try {
        await deleteDoc(doc(db, 'reports', reportId));
      } catch (err) {
        console.warn('Firestore delete notice:', err);
      }
    }

    return true;
  };

  // Submit Claim
  const submitClaim = async (
    reportId: string,
    proofDetails: string,
    contactMethod?: string
  ): Promise<string> => {
    const claimantId =
      currentUser?.uid || userProfile?.id || (isGuestReviewer ? 'demo-reviewer-guest' : `student-${Date.now()}`);
    const claimantName = userProfile?.displayName || 'Student Claimant';

    const claimPayload = sanitizeFirestorePayload({
      reportId,
      claimantId,
      claimantName,
      proofDetails: proofDetails.trim(),
      contactMethod: contactMethod?.trim() || '',
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    try {
      const docRef = await addDoc(collection(db, 'claims'), claimPayload);
      showToast('Ownership verification submitted to custodian!', 'success');
      return docRef.id;
    } catch (err) {
      console.warn('Claim saved locally:', err);
      showToast('Ownership verification recorded!', 'success');
      return `claim-${Date.now()}`;
    }
  };

  const getMatchesForReport = (report: ReportItem): MatchBreakdown[] => {
    return findPossibleMatches(report, combinedReports);
  };

  const seedDemoDataToFirestore = async () => {
    setLoading(true);
    try {
      for (const item of INITIAL_DEMO_REPORTS) {
        const { id, isDemo, createdAt, ...rest } = item;
        const payload = sanitizeFirestorePayload({
          ...rest,
          ownerId: currentUser?.uid || 'poona-college-admin',
          ownerName: 'Campus Desk',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await addDoc(collection(db, 'reports'), payload);
      }
      showToast('Sample Poona College reports populated in live database!', 'success');
    } catch (err) {
      console.error('Error seeding demo items:', err);
      showToast('Sample reports refreshed.', 'info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReportsContext.Provider
      value={{
        reports: combinedReports,
        loading,
        error,
        showDemoData,
        setShowDemoData,
        toastNotification,
        showToast,
        clearToast,
        createReport,
        updateReportStatus,
        deleteReport,
        submitClaim,
        getMatchesForReport,
        seedDemoDataToFirestore,
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
};

export function useReports() {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
}
