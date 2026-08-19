import { supabase, publicPhotoUrl } from './supabase';
import type {
  JobType,
  Report,
  ReportPhoto,
  ReportStatus,
  SeenMap,
  SiteAssignment,
  Urgency,
  User,
} from '../types';

// ---- Row shapes coming back from PostgREST -------------------------------
// Note: the database tables are still named `surveys` / `survey_photos` and
// keep their `survey_*` column names. The app model calls these "reports",
// so this file is the single place that translation happens.

interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'technician';
  phone: string | null;
  reports_seen_at?: SeenMap | null;
}

interface ReportPhotoRow {
  id: string;
  object_path: string;
  original_filename: string | null;
  size_kb: number | null;
}

interface ReportRow {
  id: string;
  survey_number: string;
  type: JobType;
  site_name: string;
  site_location: string;
  contact_person: string | null;
  contact_phone: string | null;
  survey_date: string;
  technician_id: string | null;
  technician_name: string | null;
  site_assignment_id: string | null;
  notes: string | null;
  urgency: Urgency;
  status: ReportStatus;
  reviewed_by: string | null;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  survey_photos?: ReportPhotoRow[] | null;
}

interface AssignmentRow {
  id: string;
  site_name: string;
  site_location: string;
  contact_person: string | null;
  contact_phone: string | null;
  type: JobType;
  instructions: string | null;
  technician_id: string | null;
  technician_name: string | null;
  assigned_by: string | null;
  assigned_by_name: string | null;
  status: 'assigned' | 'completed';
  survey_id: string | null;
  created_at: string;
}

// ---- Mapping helpers -------------------------------------------------------

function profileRowToUser(row: ProfileRow): User {
  return {
    id: row.id,
    name: row.full_name,
    email: row.email,
    role: row.role,
    phone: row.phone ?? undefined,
    reportsSeenAt: row.reports_seen_at ?? {},
  };
}

function photoRowToPhoto(row: ReportPhotoRow): ReportPhoto {
  return {
    id: row.id,
    name: row.original_filename ?? 'photo.jpg',
    url: publicPhotoUrl(row.object_path),
    sizeKb: row.size_kb ?? 0,
  };
}

function reportRowToReport(row: ReportRow): Report {
  return {
    id: row.id,
    reportNumber: row.survey_number,
    type: row.type,
    siteName: row.site_name,
    siteLocation: row.site_location,
    contactPerson: row.contact_person ?? '',
    contactPhone: row.contact_phone ?? '',
    technicianId: row.technician_id ?? '',
    technicianName: row.technician_name ?? '',
    reportDate: row.survey_date,
    notes: row.notes ?? '',
    urgency: row.urgency ?? 'medium',
    photos: (row.survey_photos ?? []).map(photoRowToPhoto),
    status: row.status,
    createdAt: row.created_at,
    reviewedBy: row.reviewed_by_name ?? undefined,
    reviewedAt: row.reviewed_at ?? undefined,
    rejectionReason: row.rejection_reason ?? undefined,
    assignmentId: row.site_assignment_id ?? undefined,
  };
}

function assignmentRowToAssignment(row: AssignmentRow): SiteAssignment {
  return {
    id: row.id,
    siteName: row.site_name,
    siteLocation: row.site_location,
    contactPerson: row.contact_person ?? '',
    contactPhone: row.contact_phone ?? '',
    type: row.type,
    instructions: row.instructions ?? '',
    technicianId: row.technician_id ?? '',
    technicianName: row.technician_name ?? '',
    assignedBy: row.assigned_by_name ?? '',
    assignedAt: row.created_at,
    status: row.status,
    reportId: row.survey_id ?? undefined,
  };
}

const REPORT_SELECT = `*, survey_photos(*)`;

const ASSIGNMENT_SELECT = '*';

// ---- Auth -------------------------------------------------------------

export async function signIn(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    throw new Error(
      error?.message === 'Invalid login credentials'
        ? 'Incorrect email or password.'
        : (error?.message ?? 'Sign in failed.')
    );
  }
  const profile = await fetchProfile(data.user.id);
  if (!profile) {
    throw new Error('No profile found for this account. Ask an admin to check your access.');
  }
  return profile;
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error || !data) return null;
  return profileRowToUser(data as ProfileRow);
}

// ---- Reads -------------------------------------------------------------

export async function fetchTechnicians(): Promise<User[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'technician')
    .order('full_name', { ascending: true });
  if (error) throw new Error(error.message);
  return (data as ProfileRow[]).map(profileRowToUser);
}

export async function fetchReports(): Promise<Report[]> {
  const { data, error } = await supabase
    .from('surveys')
    .select(REPORT_SELECT)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as unknown as ReportRow[]).map(reportRowToReport);
}

export async function fetchAssignments(): Promise<SiteAssignment[]> {
  const { data, error } = await supabase
    .from('site_assignments')
    .select(ASSIGNMENT_SELECT)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as unknown as AssignmentRow[]).map(assignmentRowToAssignment);
}

// ---- Assignments -------------------------------------------------------------

export interface AssignmentDraft {
  siteName: string;
  siteLocation: string;
  contactPerson: string;
  contactPhone: string;
  type: JobType;
  instructions: string;
  technicianId: string;
  technicianName: string;
}

export async function createAssignment(draft: AssignmentDraft, admin: User): Promise<SiteAssignment> {
  const { data, error } = await supabase
    .from('site_assignments')
    .insert({
      site_name: draft.siteName,
      site_location: draft.siteLocation,
      contact_person: draft.contactPerson || null,
      contact_phone: draft.contactPhone || null,
      type: draft.type,
      instructions: draft.instructions || null,
      technician_id: draft.technicianId,
      technician_name: draft.technicianName,
      assigned_by: admin.id,
      assigned_by_name: admin.name,
      status: 'assigned',
    })
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Could not create assignment.');
  return assignmentRowToAssignment(data as AssignmentRow);
}

export async function updateAssignment(
  assignmentId: string,
  draft: AssignmentDraft
): Promise<SiteAssignment> {
  const { data, error } = await supabase
    .from('site_assignments')
    .update({
      site_name: draft.siteName,
      site_location: draft.siteLocation,
      contact_person: draft.contactPerson || null,
      contact_phone: draft.contactPhone || null,
      type: draft.type,
      instructions: draft.instructions || null,
      technician_id: draft.technicianId,
      technician_name: draft.technicianName,
    })
    .eq('id', assignmentId)
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Could not update this assignment.');
  return assignmentRowToAssignment(data as AssignmentRow);
}

export async function cancelAssignment(assignmentId: string): Promise<void> {
  const { error } = await supabase.from('site_assignments').delete().eq('id', assignmentId);
  if (error) throw new Error(error.message);
}

// ---- Reports -------------------------------------------------------------

export interface ReportDraft {
  type: JobType;
  siteName: string;
  siteLocation: string;
  contactPerson: string;
  contactPhone: string;
  reportDate: string;
  notes: string;
  urgency: Urgency;
  photoFiles: File[];
  assignmentId?: string;
}

export async function createReport(draft: ReportDraft, technician: User): Promise<Report> {
  const { data: inserted, error } = await supabase
    .from('surveys')
    .insert({
      type: draft.type,
      site_name: draft.siteName,
      site_location: draft.siteLocation,
      contact_person: draft.contactPerson || null,
      contact_phone: draft.contactPhone || null,
      survey_date: draft.reportDate,
      technician_id: technician.id,
      technician_name: technician.name,
      site_assignment_id: draft.assignmentId ?? null,
      notes: draft.notes || null,
      urgency: draft.urgency,
    })
    .select()
    .single();

  if (error || !inserted) throw new Error(error?.message ?? 'Could not save the report.');

  const reportId = inserted.id as string;
  const photos: ReportPhoto[] = [];

  for (const file of draft.photoFiles) {
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const objectPath = `${technician.id}/${reportId}/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from('survey-photos')
      .upload(objectPath, file, { contentType: file.type || 'image/jpeg' });
    if (uploadError) throw new Error(`Photo upload failed: ${uploadError.message}`);

    const { data: photoRow, error: photoError } = await supabase
      .from('survey_photos')
      .insert({
        survey_id: reportId,
        uploaded_by: technician.id,
        object_path: objectPath,
        original_filename: file.name,
        size_kb: Math.round(file.size / 1024),
      })
      .select()
      .single();
    if (photoError || !photoRow) throw new Error(photoError?.message ?? 'Could not save photo.');

    photos.push(photoRowToPhoto(photoRow as ReportPhotoRow));
  }

  if (draft.assignmentId) {
    await supabase
      .from('site_assignments')
      .update({ status: 'completed', survey_id: reportId })
      .eq('id', draft.assignmentId);
  }

  return { ...reportRowToReport(inserted as ReportRow), photos };
}

export async function approveReport(reportId: string, admin: User): Promise<void> {
  const { error } = await supabase
    .from('surveys')
    .update({
      status: 'approved',
      reviewed_by: admin.id,
      reviewed_by_name: admin.name,
      reviewed_at: new Date().toISOString(),
      rejection_reason: null,
    })
    .eq('id', reportId);
  if (error) throw new Error(error.message);
}

export async function rejectReport(reportId: string, admin: User, reason: string): Promise<void> {
  const { error } = await supabase
    .from('surveys')
    .update({
      status: 'rejected',
      reviewed_by: admin.id,
      reviewed_by_name: admin.name,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason || null,
    })
    .eq('id', reportId);
  if (error) throw new Error(error.message);
}

/**
 * Persists which categories this admin has caught up on. Stored on their own
 * profile row so the "new submission" badges follow them between devices.
 */
export async function saveSeenMap(userId: string, seen: SeenMap): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ reports_seen_at: seen })
    .eq('id', userId);
  if (error) throw new Error(error.message);
}

// ---- Technician account management (via Edge Functions, service-role only) --

export interface CreateTechnicianInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export async function createTechnician(input: CreateTechnicianInput): Promise<User> {
  const { data, error } = await supabase.functions.invoke('create-technician', {
    body: input,
  });
  if (error) {
    const message = await extractFunctionError(error);
    throw new Error(message);
  }
  if (data?.error) throw new Error(data.error);
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: 'technician',
    phone: data.phone ?? undefined,
  };
}

export interface UpdateTechnicianInput {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
}

export async function updateTechnician(
  technicianId: string,
  input: UpdateTechnicianInput
): Promise<User> {
  const { data, error } = await supabase.functions.invoke('update-technician', {
    body: { technicianId, ...input },
  });
  if (error) {
    const message = await extractFunctionError(error);
    throw new Error(message);
  }
  if (data?.error) throw new Error(data.error);
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: 'technician',
    phone: data.phone ?? undefined,
  };
}

export async function deleteTechnician(technicianId: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('delete-technician', {
    body: { technicianId },
  });
  if (error) {
    const message = await extractFunctionError(error);
    throw new Error(message);
  }
  if (data?.error) throw new Error(data.error);
}

// Supabase's FunctionsHttpError only carries a Response; the real message is
// in its JSON body, so pull it out for a readable error to show the admin.
async function extractFunctionError(error: unknown): Promise<string> {
  const withContext = error as { context?: Response; message?: string };
  if (withContext?.context && typeof withContext.context.json === 'function') {
    try {
      const body = await withContext.context.json();
      if (body?.error) return body.error as string;
    } catch {
      // fall through to generic message
    }
  }
  return withContext?.message ?? 'Something went wrong. Please try again.';
}
