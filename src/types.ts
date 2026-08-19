export type Role = 'admin' | 'technician';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  /** Per-category ISO timestamp of when this admin last reviewed new submissions. */
  reportsSeenAt?: SeenMap;
}

/** Last-seen timestamp per job category, used to flag new submissions. */
export type SeenMap = Partial<Record<JobType, string>>;

// The three kinds of site work an admin can send a technician out to do.
export type JobType = 'survey' | 'installation' | 'maintenance';

export const JOB_TYPES: JobType[] = ['survey', 'installation', 'maintenance'];

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  survey: 'Survey',
  installation: 'Installation',
  maintenance: 'Maintenance',
};

/** How urgently the work found on site needs attention. */
export type Urgency = 'low' | 'medium' | 'high';

export const URGENCY_LEVELS: Urgency[] = ['low', 'medium', 'high'];

export const URGENCY_LABELS: Record<Urgency, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export type ReportStatus = 'pending' | 'approved' | 'rejected';

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

export interface ReportPhoto {
  id: string;
  name: string;
  url: string;
  sizeKb: number;
}

// What a technician submits after visiting a site.
export interface Report {
  id: string;
  reportNumber: string;
  type: JobType;
  siteName: string;
  siteLocation: string;
  contactPerson: string;
  contactPhone: string;
  technicianId: string;
  technicianName: string;
  reportDate: string;
  notes: string;
  urgency: Urgency;
  photos: ReportPhoto[];
  status: ReportStatus;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  assignmentId?: string;
}

export type AssignmentStatus = 'assigned' | 'completed';

// A site the admin has assigned to a technician.
export interface SiteAssignment {
  id: string;
  /** Short reference shown to technicians, e.g. "AS-0012". */
  assignmentNumber: string;
  siteName: string;
  siteLocation: string;
  contactPerson: string;
  contactPhone: string;
  type: JobType;
  instructions: string;
  technicianId: string;
  technicianName: string;
  assignedBy: string;
  assignedAt: string;
  status: AssignmentStatus;
  reportId?: string;
}
