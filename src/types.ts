export type Role = 'admin' | 'technician';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
}

export type SurveyType = 'new_site' | 'maintenance';

export type SurveyStatus = 'pending' | 'approved';

export const CCTV_CATEGORIES = ['2MP', '4MP', '5MP', '8MP (4K)'] as const;
export type CctvCategory = (typeof CCTV_CATEGORIES)[number];

export const FLOODLIGHT_CATEGORIES = ['30W', '50W', '100W', '200W'] as const;
export type FloodlightCategory = (typeof FLOODLIGHT_CATEGORIES)[number];

export type CctvCounts = Record<CctvCategory, number>;
export type FloodlightCounts = Record<FloodlightCategory, number>;

export interface SurveyPhoto {
  id: string;
  name: string;
  dataUrl: string;
  sizeKb: number;
}

export interface Survey {
  id: string;
  surveyNumber: string;
  type: SurveyType;
  siteName: string;
  siteLocation: string;
  contactPerson: string;
  contactPhone: string;
  technicianId: string;
  technicianName: string;
  surveyDate: string;
  notes: string;
  cctv: CctvCounts;
  floodlights: FloodlightCounts;
  solarPanels: number;
  photos: SurveyPhoto[];
  status: SurveyStatus;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  assignmentId?: string;
}

export type AssignmentStatus = 'assigned' | 'completed';

export interface SiteAssignment {
  id: string;
  siteName: string;
  siteLocation: string;
  contactPerson: string;
  contactPhone: string;
  type: SurveyType;
  instructions: string;
  technicianId: string;
  technicianName: string;
  assignedBy: string;
  assignedAt: string;
  status: AssignmentStatus;
  surveyId?: string;
}

export function emptyCctvCounts(): CctvCounts {
  return { '2MP': 0, '4MP': 0, '5MP': 0, '8MP (4K)': 0 };
}

export function emptyFloodlightCounts(): FloodlightCounts {
  return { '30W': 0, '50W': 0, '100W': 0, '200W': 0 };
}

export function totalCount(record: Record<string, number>): number {
  return Object.values(record).reduce((sum, value) => sum + (value || 0), 0);
}
