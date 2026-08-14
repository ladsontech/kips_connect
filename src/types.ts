export type Role = 'manager' | 'technician' | 'sales' | 'public';

export type JobType = 'installation' | 'support' | 'maintenance';

export type ServiceType =
  | 'CCTV'
  | 'Flood Lights'
  | 'Access Control'
  | 'Alarm System'
  | 'Electric Fence'
  | 'Other';

export type Priority = 'normal' | 'urgent';

export type JobStatus =
  | 'draft'
  | 'surveyed'
  | 'reported'
  | 'scheduled'
  | 'assigned'
  | 'in_progress'
  | 'testing'
  | 'resolved'
  | 'completed'
  | 'feedback';

export type AttachmentCategory =
  | 'site_survey'
  | 'problem'
  | 'before_work'
  | 'after_work';

export interface Client {
  id: string;
  name: string;
  contactPerson: string;
  primaryPhone: string;
  secondaryPhone?: string;
  email: string;
  address: string;
  notes: string;
  averageRating: number;
  activeSupportRequests: number;
}

export interface Site {
  id: string;
  clientId: string;
  name: string;
  address: string;
  gps: string;
  contactPerson: string;
  contactPhone: string;
  notes: string;
}

export interface Technician {
  id: string;
  name: string;
  phone: string;
  specialty: ServiceType[];
  activeJobs: number;
  completedThisMonth: number;
  averageRating: number;
}

export type LeadStage =
  | 'new'
  | 'contacted'
  | 'survey_booked'
  | 'quoted'
  | 'negotiation'
  | 'won'
  | 'lost';

export interface SalesPerson {
  id: string;
  name: string;
  phone: string;
  territory: string;
  monthlyTarget: number;
}

export interface Lead {
  id: string;
  leadNumber: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  serviceInterest: ServiceType;
  stage: LeadStage;
  value: number;
  probability: number;
  source: string;
  assignedSalesId: string;
  nextAction: string;
  nextActionDate: string;
  notes: string;
  createdAt: string;
}

export interface InstalledEquipment {
  id: string;
  siteId: string;
  system: ServiceType;
  equipment: string;
  brand?: string;
  model?: string;
  quantity: string;
  installedOn: string;
  warrantyExpiry?: string;
}

export interface Tool {
  id: string;
  name: string;
}

export interface Material {
  id: string;
  name: string;
  quantity: string;
}

export interface Attachment {
  id: string;
  category: AttachmentCategory;
  name: string;
  sizeKb: number;
}

export interface Job {
  id: string;
  jobNumber: string;
  jobType: JobType;
  serviceType: ServiceType;
  title: string;
  description: string;
  clientId: string;
  siteId: string;
  priority: Priority;
  status: JobStatus;
  scheduledDate?: string;
  scheduledTime?: string;
  assignedTechnicianIds: string[];
  requiredToolIds: string[];
  materials: Material[];
  attachments: Attachment[];
  diagnosis?: string;
  workPerformed?: string;
  startedAt?: string;
  completedAt?: string;
  feedbackToken: string;
  supportToken: string;
  statusHistory: Array<{
    status: JobStatus;
    at: string;
    actor: string;
  }>;
}

export interface Feedback {
  id: string;
  jobId: string;
  technicianId: string;
  resolved: boolean;
  overallRating: number;
  technicianRating: number;
  comments: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  audience: 'manager' | 'technician';
  title: string;
  body: string;
  createdAt: string;
  unread: boolean;
  severity: 'info' | 'success' | 'warning' | 'urgent';
}

export interface Survey {
  id: string;
  clientId: string;
  siteId: string;
  surveyDate: string;
  conductedBy: string;
  proposedSystem: ServiceType;
  clientRequirements: string;
  securityConcerns: string;
  installationAreas: string;
  powerAvailability: string;
  networkAvailability: string;
  equipmentEstimate: string;
  notes: string;
}
