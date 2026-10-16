export type ReportType = 'lost' | 'found';

export type CollectionStatus =
  | 'Staff Room'
  | 'Teacher'
  | 'College Office'
  | 'Security Desk'
  | 'With Finder'
  | 'Other';

export type ReportStatus = 'open' | 'claimed' | 'resolved';

export interface ReportItem {
  id: string;
  type: ReportType;
  itemName: string;
  category: string;
  college: string;
  campus: string;
  location: string;
  description: string;
  date: string;
  photoUrl?: string;
  collectionStatus?: CollectionStatus;
  status: ReportStatus;
  ownerId: string;
  ownerName: string;
  ownerEmail?: string;
  createdAt: any;
  updatedAt?: any;
  isDemo?: boolean;
}

export interface MatchBreakdown {
  targetReportId: string;
  matchedReport: ReportItem;
  score: number; // 0 - 100
  reasons: string[];
  matchedKeywords: string[];
  collegeMatch: boolean;
  campusMatch: boolean;
  locationMatchScore: number;
}

export interface ClaimItem {
  id: string;
  reportId: string;
  claimantId: string;
  claimantName: string;
  proofDetails: string;
  contactMethod?: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: any;
}

export interface StudentProfile {
  id: string;
  displayName: string;
  email: string;
  college: string;
  createdAt?: any;
}
