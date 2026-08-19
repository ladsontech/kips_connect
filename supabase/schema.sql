-- Kibs Connect — Supabase schema (reference copy of what's applied to the
-- live project). Run this against a fresh project via the SQL editor, or
-- use the Supabase CLI/MCP migration tools, to reproduce the setup.
--
-- The app assigns three kinds of site work — survey, installation and
-- maintenance — to technicians, who submit a report (notes + photos) when
-- they're done. An admin then approves or rejects each report.

create extension if not exists "pgcrypto";

create type app_role as enum ('admin', 'technician');
create type job_type as enum ('survey', 'installation', 'maintenance');
create type report_status as enum ('pending', 'approved', 'rejected');
create type assignment_status as enum ('assigned', 'completed');

-- One row per authenticated user (admin or technician). id matches auth.users.id.
-- email is denormalized from auth.users (which PostgREST can't query directly)
-- so the app can look up/display technician emails.
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role app_role not null default 'technician',
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- An admin-created site + technician assignment. The technician visits the
-- site and, once their report is submitted, the linked report row is stamped
-- back onto this assignment. technician_name/assigned_by_name are snapshotted
-- at write time so history reads fine even if that login is later removed
-- (technician_id/assigned_by go to NULL on account deletion).
create table site_assignments (
  id uuid primary key default gen_random_uuid(),
  site_name text not null,
  site_location text not null,
  contact_person text,
  contact_phone text,
  type job_type not null,
  instructions text,
  technician_id uuid references profiles (id) on delete set null,
  technician_name text,
  assigned_by uuid references profiles (id) on delete set null,
  assigned_by_name text,
  status assignment_status not null default 'assigned',
  survey_id uuid,
  created_at timestamptz not null default now()
);

create index site_assignments_technician_id_idx on site_assignments (technician_id);
create index site_assignments_status_idx on site_assignments (status);

-- A technician-submitted site report. The table keeps its original `surveys`
-- name (and survey_* column names) from before the app was generalised to
-- cover installations and maintenance too; src/lib/api.ts maps these onto the
-- app's Report model. survey_number is auto-generated.
create sequence survey_number_seq start 1;

create table surveys (
  id uuid primary key default gen_random_uuid(),
  survey_number text not null unique default ('SV-' || lpad(nextval('survey_number_seq')::text, 4, '0')),
  type job_type not null,
  site_name text not null,
  site_location text not null,
  contact_person text,
  contact_phone text,
  survey_date date not null default current_date,
  technician_id uuid references profiles (id) on delete set null,
  technician_name text,
  site_assignment_id uuid references site_assignments (id) on delete set null,
  notes text,

  status report_status not null default 'pending',
  reviewed_by uuid references profiles (id) on delete set null,
  reviewed_by_name text,
  reviewed_at timestamptz,
  rejection_reason text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index surveys_technician_id_idx on surveys (technician_id);
create index surveys_status_idx on surveys (status);

alter table site_assignments
  add constraint site_assignments_survey_fk
  foreign key (survey_id) references surveys (id) on delete set null;

-- Site photos attached to a report. The frontend uploads the file to the
-- public `survey-photos` storage bucket first, then inserts a row here
-- pointing at it.
create table survey_photos (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references surveys (id) on delete cascade,
  uploaded_by uuid references profiles (id) on delete set null,
  bucket text not null default 'survey-photos',
  object_path text not null,
  original_filename text,
  size_kb integer,
  created_at timestamptz not null default now()
);

create index survey_photos_survey_id_idx on survey_photos (survey_id);

create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  );
$$;

create or replace function touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
before update on profiles
for each row execute function touch_updated_at();

create trigger surveys_updated_at
before update on surveys
for each row execute function touch_updated_at();

alter table profiles enable row level security;
alter table site_assignments enable row level security;
alter table surveys enable row level security;
alter table survey_photos enable row level security;

create policy "Admins can manage profiles"
on profiles for all using (is_admin()) with check (is_admin());

create policy "Users can read own profile"
on profiles for select using (id = auth.uid());

create policy "Admins can manage all site assignments"
on site_assignments for all using (is_admin()) with check (is_admin());

create policy "Technicians can read their own site assignments"
on site_assignments for select
using (technician_id = auth.uid());

create policy "Technicians can complete their own site assignments"
on site_assignments for update
using (technician_id = auth.uid())
with check (technician_id = auth.uid());

create policy "Admins can manage all surveys"
on surveys for all using (is_admin()) with check (is_admin());

create policy "Technicians can submit their own surveys"
on surveys for insert
with check (technician_id = auth.uid());

create policy "Technicians can read their own surveys"
on surveys for select
using (technician_id = auth.uid());

create policy "Admins can manage all survey photos"
on survey_photos for all using (is_admin()) with check (is_admin());

create policy "Technicians can attach photos to their own surveys"
on survey_photos for insert
with check (
  exists (
    select 1 from surveys
    where surveys.id = survey_photos.survey_id
      and surveys.technician_id = auth.uid()
  )
);

create policy "Technicians can read photos on their own surveys"
on survey_photos for select
using (
  exists (
    select 1 from surveys
    where surveys.id = survey_photos.survey_id
      and surveys.technician_id = auth.uid()
  )
);

-- Storage: a public bucket for site photos (public so <img src> can load
-- them directly by URL; paths are unguessable UUIDs, and only technicians/
-- admins can ever obtain a path via the app). Only authenticated writes are
-- allowed, scoped to the uploader's own folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('survey-photos', 'survey-photos', true, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Admins manage survey photo objects"
on storage.objects for all
using (bucket_id = 'survey-photos' and is_admin())
with check (bucket_id = 'survey-photos' and is_admin());

create policy "Technicians upload own survey photos"
on storage.objects for insert
with check (
  bucket_id = 'survey-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Technicians read own survey photos"
on storage.objects for select
using (
  bucket_id = 'survey-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
