import { supabase, publicPhotoUrl } from './supabase';
import {
  emptyCctvCounts,
  emptyFloodlightCounts,
  type CctvCounts,
  type FloodlightCounts,
  type SiteAssignment,
  type Survey,
  type SurveyPhoto,
  type SurveyStatus,
  type SurveyType,
  type User,
} from '../types';

// ---- Row shapes coming back from PostgREST -------------------------------

interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'technician';
  phone: string | null;
}

interface SurveyPhotoRow {
  id: string;
  object_path: string;
  original_filename: string | null;
  size_kb: number | null;
}

interface SurveyRow {
  id: string;
  survey_number: string;
  type: SurveyType;
  site_name: string;
  site_location: string;
  contact_person: string | null;
  contact_phone: string | null;
  survey_date: string;
  technician_id: string | null;
  technician_name: string | null;
  site_assignment_id: string | null;
  notes: string | null;
  cctv_2mp: number;
  cctv_4mp: number;
  cctv_5mp: number;
  cctv_8mp: number;
  floodlight_30w: number;
  floodlight_50w: number;
  floodlight_100w: number;
  floodlight_200w: number;
  solar_panels: number;
  status: SurveyStatus;
  approved_by: string | null;
  approved_by_name: string | null;
  approved_at: string | null;
  created_at: string;
  survey_photos?: SurveyPhotoRow[] | null;
}

interface AssignmentRow {
  id: string;
  site_name: string;
  site_location: string;
  contact_person: string | null;
  contact_phone: string | null;
  type: SurveyType;
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
  };
}

function photoRowToPhoto(row: SurveyPhotoRow): SurveyPhoto {
  return {
    id: row.id,
    name: row.original_filename ?? 'photo.jpg',
    url: publicPhotoUrl(row.object_path),
    sizeKb: row.size_kb ?? 0,
  };
}

function cctvFromRow(row: SurveyRow): CctvCounts {
  return {
    '2MP': row.cctv_2mp,
    '4MP': row.cctv_4mp,
    '5MP': row.cctv_5mp,
    '8MP (4K)': row.cctv_8mp,
  };
}

function floodlightsFromRow(row: SurveyRow): FloodlightCounts {
  return {
    '30W': row.floodlight_30w,
    '50W': row.floodlight_50w,
    '100W': row.floodlight_100w,
    '200W': row.floodlight_200w,
  };
}

function surveyRowToSurvey(row: SurveyRow): Survey {
  return {
    id: row.id,
    surveyNumber: row.survey_number,
    type: row.type,
    siteName: row.site_name,
    siteLocation: row.site_location,
    contactPerson: row.contact_person ?? '',
    contactPhone: row.contact_phone ?? '',
    technicianId: row.technician_id ?? '',
    technicianName: row.technician_name ?? '',
    surveyDate: row.survey_date,
    notes: row.notes ?? '',
    cctv: cctvFromRow(row),
    floodlights: floodlightsFromRow(row),
    solarPanels: row.solar_panels,
    photos: (row.survey_photos ?? []).map(photoRowToPhoto),
    status: row.status,
    createdAt: row.created_at,
    approvedBy: row.approved_by_name ?? undefined,
    approvedAt: row.approved_at ?? undefined,
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
    surveyId: row.survey_id ?? undefined,
  };
}

const SURVEY_SELECT = `*, survey_photos(*)`;

const ASSIGNMENT_SELECT = '*';

// ---- Auth -------------------------------------------------------------

export async function signIn(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    throw new Error(error?.message === 'Invalid login credentials' ? 'Incorrect email or password.' : (error?.message ?? 'Sign in failed.'));
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

export async function fetchSurveys(): Promise<Survey[]> {
  const { data, error } = await supabase
    .from('surveys')
    .select(SURVEY_SELECT)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as unknown as SurveyRow[]).map(surveyRowToSurvey);
}

export async function fetchAssignments(): Promise<SiteAssignment[]> {
  const { data, error } = await supabase
    .from('site_assignments')
    .select(ASSIGNMENT_SELECT)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as unknown as AssignmentRow[]).map(assignmentRowToAssignment);
}

// ---- Mutations -------------------------------------------------------------

export interface AssignmentDraft {
  siteName: string;
  siteLocation: string;
  contactPerson: string;
  contactPhone: string;
  type: SurveyType;
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
  return {
    id: data.id,
    siteName: data.site_name,
    siteLocation: data.site_location,
    contactPerson: data.contact_person ?? '',
    contactPhone: data.contact_phone ?? '',
    type: data.type,
    instructions: data.instructions ?? '',
    technicianId: data.technician_id,
    technicianName: draft.technicianName,
    assignedBy: admin.name,
    assignedAt: data.created_at,
    status: data.status,
    surveyId: undefined,
  };
}

export async function updateAssignment(assignmentId: string, draft: AssignmentDraft): Promise<SiteAssignment> {
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

export interface SurveyDraft {
  type: SurveyType;
  siteName: string;
  siteLocation: string;
  contactPerson: string;
  contactPhone: string;
  surveyDate: string;
  notes: string;
  cctv: CctvCounts;
  floodlights: FloodlightCounts;
  solarPanels: number;
  photoFiles: File[];
  assignmentId?: string;
}

export async function createSurvey(draft: SurveyDraft, technician: User): Promise<Survey> {
  const { data: inserted, error } = await supabase
    .from('surveys')
    .insert({
      type: draft.type,
      site_name: draft.siteName,
      site_location: draft.siteLocation,
      contact_person: draft.contactPerson || null,
      contact_phone: draft.contactPhone || null,
      survey_date: draft.surveyDate,
      technician_id: technician.id,
      technician_name: technician.name,
      site_assignment_id: draft.assignmentId ?? null,
      notes: draft.notes || null,
      cctv_2mp: draft.cctv['2MP'],
      cctv_4mp: draft.cctv['4MP'],
      cctv_5mp: draft.cctv['5MP'],
      cctv_8mp: draft.cctv['8MP (4K)'],
      floodlight_30w: draft.floodlights['30W'],
      floodlight_50w: draft.floodlights['50W'],
      floodlight_100w: draft.floodlights['100W'],
      floodlight_200w: draft.floodlights['200W'],
      solar_panels: draft.solarPanels,
    })
    .select()
    .single();

  if (error || !inserted) throw new Error(error?.message ?? 'Could not save the survey.');

  const surveyId = inserted.id as string;
  const photos: SurveyPhoto[] = [];

  for (const file of draft.photoFiles) {
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const objectPath = `${technician.id}/${surveyId}/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from('survey-photos')
      .upload(objectPath, file, { contentType: file.type || 'image/jpeg' });
    if (uploadError) throw new Error(`Photo upload failed: ${uploadError.message}`);

    const { data: photoRow, error: photoError } = await supabase
      .from('survey_photos')
      .insert({
        survey_id: surveyId,
        uploaded_by: technician.id,
        object_path: objectPath,
        original_filename: file.name,
        size_kb: Math.round(file.size / 1024),
      })
      .select()
      .single();
    if (photoError || !photoRow) throw new Error(photoError?.message ?? 'Could not save photo.');

    photos.push(photoRowToPhoto(photoRow as SurveyPhotoRow));
  }

  if (draft.assignmentId) {
    await supabase
      .from('site_assignments')
      .update({ status: 'completed', survey_id: surveyId })
      .eq('id', draft.assignmentId);
  }

  return {
    id: surveyId,
    surveyNumber: inserted.survey_number,
    type: inserted.type,
    siteName: inserted.site_name,
    siteLocation: inserted.site_location,
    contactPerson: inserted.contact_person ?? '',
    contactPhone: inserted.contact_phone ?? '',
    technicianId: technician.id,
    technicianName: technician.name,
    surveyDate: inserted.survey_date,
    notes: inserted.notes ?? '',
    cctv: cctvFromRow(inserted as SurveyRow),
    floodlights: floodlightsFromRow(inserted as SurveyRow),
    solarPanels: inserted.solar_panels,
    photos,
    status: inserted.status,
    createdAt: inserted.created_at,
    assignmentId: draft.assignmentId,
  };
}

export async function approveSurvey(surveyId: string, admin: User): Promise<void> {
  const { error } = await supabase
    .from('surveys')
    .update({
      status: 'approved',
      approved_by: admin.id,
      approved_by_name: admin.name,
      approved_at: new Date().toISOString(),
    })
    .eq('id', surveyId);
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

export async function updateTechnician(technicianId: string, input: UpdateTechnicianInput): Promise<User> {
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

export { emptyCctvCounts, emptyFloodlightCounts };
