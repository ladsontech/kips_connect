create extension if not exists "pgcrypto";

create type app_role as enum ('admin', 'technician');
create type survey_type as enum ('new_site', 'maintenance');
create type survey_status as enum ('pending', 'approved');
create type assignment_status as enum ('assigned', 'completed');

-- One row per authenticated user (admin or technician). id matches auth.users.id.
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role app_role not null default 'technician',
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- An admin-created site + technician assignment. The technician surveys the
-- site (new install or maintenance) and, once submitted, the linked survey
-- row is stamped back onto this assignment.
create table site_assignments (
  id uuid primary key default gen_random_uuid(),
  site_name text not null,
  site_location text not null,
  contact_person text,
  contact_phone text,
  type survey_type not null,
  instructions text,
  technician_id uuid not null references profiles (id) on delete restrict,
  assigned_by uuid references profiles (id),
  status assignment_status not null default 'assigned',
  survey_id uuid,
  created_at timestamptz not null default now()
);

create index site_assignments_technician_id_idx on site_assignments (technician_id);
create index site_assignments_status_idx on site_assignments (status);

-- A technician-submitted site survey / maintenance visit / completion report.
-- Equipment counts are stored as plain columns per rating so they're easy to
-- query and total in the admin dashboard.
create table surveys (
  id uuid primary key default gen_random_uuid(),
  survey_number text not null unique,
  type survey_type not null,
  site_name text not null,
  site_location text not null,
  contact_person text,
  contact_phone text,
  survey_date date not null default current_date,
  technician_id uuid not null references profiles (id) on delete restrict,
  site_assignment_id uuid references site_assignments (id) on delete set null,
  notes text,

  cctv_2mp integer not null default 0,
  cctv_4mp integer not null default 0,
  cctv_5mp integer not null default 0,
  cctv_8mp integer not null default 0,

  floodlight_30w integer not null default 0,
  floodlight_50w integer not null default 0,
  floodlight_100w integer not null default 0,
  floodlight_200w integer not null default 0,

  solar_panels integer not null default 0,

  status survey_status not null default 'pending',
  approved_by uuid references profiles (id),
  approved_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index surveys_technician_id_idx on surveys (technician_id);
create index surveys_status_idx on surveys (status);

alter table site_assignments
  add constraint site_assignments_survey_fk
  foreign key (survey_id) references surveys (id) on delete set null;

-- Site photos attached to a survey. The frontend uploads the file to the
-- `survey-photos` storage bucket first, then inserts a row here pointing at it.
create table survey_photos (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references surveys (id) on delete cascade,
  uploaded_by uuid references profiles (id),
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
