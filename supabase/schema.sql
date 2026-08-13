create extension if not exists "pgcrypto";

create type app_role as enum ('manager', 'technician');
create type job_type as enum ('installation', 'support', 'maintenance');
create type service_type as enum (
  'CCTV',
  'Flood Lights',
  'Access Control',
  'Alarm System',
  'Electric Fence',
  'Other'
);
create type priority_level as enum ('normal', 'urgent');
create type job_status as enum (
  'draft',
  'surveyed',
  'reported',
  'scheduled',
  'assigned',
  'in_progress',
  'testing',
  'resolved',
  'completed',
  'feedback'
);
create type attachment_category as enum (
  'site_survey',
  'problem',
  'before_work',
  'after_work'
);
create type notification_audience as enum ('manager', 'technician');
create type notification_severity as enum ('info', 'success', 'warning', 'urgent');

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role app_role not null default 'technician',
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_person text not null,
  primary_phone text not null,
  secondary_phone text,
  email text,
  address text,
  notes text,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table sites (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  name text not null,
  physical_address text not null,
  gps_point point,
  contact_person text,
  contact_phone text,
  notes text,
  support_token text not null unique default encode(gen_random_bytes(24), 'hex'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table technicians (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references profiles (id) on delete set null,
  display_name text not null,
  phone text not null,
  specialties service_type[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table site_surveys (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  site_id uuid not null references sites (id) on delete cascade,
  survey_date date not null default current_date,
  conducted_by uuid references profiles (id),
  client_requirements text,
  security_concerns text,
  proposed_system service_type,
  installation_areas text,
  power_availability text,
  network_availability text,
  cable_routing text,
  mounting_locations text,
  equipment_estimate text,
  special_considerations text,
  notes text,
  converted_job_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table jobs (
  id uuid primary key default gen_random_uuid(),
  job_number text not null unique,
  client_id uuid not null references clients (id) on delete restrict,
  site_id uuid not null references sites (id) on delete restrict,
  site_survey_id uuid references site_surveys (id) on delete set null,
  job_type job_type not null,
  service_type service_type not null,
  title text not null,
  description text not null,
  priority priority_level not null default 'normal',
  status job_status not null default 'draft',
  scheduled_date date,
  scheduled_time time,
  started_at timestamptz,
  completed_at timestamptz,
  feedback_token text not null unique default encode(gen_random_bytes(24), 'hex'),
  support_contact_name text,
  support_contact_phone text,
  diagnosis text,
  work_performed text,
  technician_notes text,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table site_surveys
  add constraint site_surveys_converted_job_fk
  foreign key (converted_job_id) references jobs (id) on delete set null;

create table job_assignments (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs (id) on delete cascade,
  technician_id uuid not null references technicians (id) on delete restrict,
  scheduled_date date,
  scheduled_time time,
  instructions text,
  assigned_by uuid references profiles (id),
  assigned_at timestamptz not null default now(),
  unique (job_id, technician_id)
);

create table job_status_history (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs (id) on delete cascade,
  status job_status not null,
  actor_id uuid references profiles (id),
  actor_label text,
  created_at timestamptz not null default now()
);

create table tools (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table job_tools (
  job_id uuid not null references jobs (id) on delete cascade,
  tool_id uuid not null references tools (id) on delete restrict,
  checked boolean not null default false,
  primary key (job_id, tool_id)
);

create table installed_systems (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  site_id uuid not null references sites (id) on delete cascade,
  service_type service_type not null,
  installed_on date,
  source_job_id uuid references jobs (id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

create table installed_equipment (
  id uuid primary key default gen_random_uuid(),
  installed_system_id uuid not null references installed_systems (id) on delete cascade,
  site_id uuid not null references sites (id) on delete cascade,
  equipment_name text not null,
  brand text,
  model text,
  serial_number text,
  quantity text not null,
  installed_on date,
  warranty_expiry date,
  notes text,
  created_at timestamptz not null default now()
);

create table job_materials (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs (id) on delete cascade,
  name text not null,
  quantity text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table attachments (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs (id) on delete cascade,
  site_id uuid references sites (id) on delete cascade,
  site_survey_id uuid references site_surveys (id) on delete cascade,
  uploaded_by uuid references profiles (id),
  category attachment_category not null,
  bucket text not null,
  object_path text not null,
  original_filename text,
  content_type text,
  size_bytes integer,
  compressed_size_bytes integer,
  created_at timestamptz not null default now(),
  constraint attachment_parent_check check (
    job_id is not null or site_id is not null or site_survey_id is not null
  )
);

create table feedback (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs (id) on delete cascade,
  client_id uuid not null references clients (id) on delete cascade,
  site_id uuid not null references sites (id) on delete cascade,
  technician_id uuid references technicians (id) on delete set null,
  resolved boolean not null,
  overall_rating integer not null check (overall_rating between 1 and 5),
  technician_rating integer check (technician_rating between 1 and 5),
  comments text,
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  audience notification_audience not null,
  user_id uuid references profiles (id) on delete cascade,
  job_id uuid references jobs (id) on delete cascade,
  title text not null,
  body text not null,
  severity notification_severity not null default 'info',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  fcm_token text not null unique,
  device_label text,
  platform text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index clients_name_idx on clients using gin (to_tsvector('simple', name));
create index sites_client_id_idx on sites (client_id);
create index jobs_client_id_idx on jobs (client_id);
create index jobs_site_id_idx on jobs (site_id);
create index jobs_status_idx on jobs (status);
create index jobs_priority_idx on jobs (priority);
create index job_assignments_technician_id_idx on job_assignments (technician_id);
create index attachments_job_id_idx on attachments (job_id);
create index notifications_user_id_idx on notifications (user_id, read_at);

create or replace function is_manager()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'manager'
  );
$$;

create or replace function is_assigned_technician(target_job_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from job_assignments
    join technicians on technicians.id = job_assignments.technician_id
    where job_assignments.job_id = target_job_id
      and technicians.profile_id = auth.uid()
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

create trigger clients_updated_at
before update on clients
for each row execute function touch_updated_at();

create trigger sites_updated_at
before update on sites
for each row execute function touch_updated_at();

create trigger surveys_updated_at
before update on site_surveys
for each row execute function touch_updated_at();

create trigger jobs_updated_at
before update on jobs
for each row execute function touch_updated_at();

alter table profiles enable row level security;
alter table clients enable row level security;
alter table sites enable row level security;
alter table technicians enable row level security;
alter table site_surveys enable row level security;
alter table jobs enable row level security;
alter table job_assignments enable row level security;
alter table job_status_history enable row level security;
alter table tools enable row level security;
alter table job_tools enable row level security;
alter table installed_systems enable row level security;
alter table installed_equipment enable row level security;
alter table job_materials enable row level security;
alter table attachments enable row level security;
alter table feedback enable row level security;
alter table notifications enable row level security;
alter table push_tokens enable row level security;

create policy "Managers can manage profiles"
on profiles for all using (is_manager()) with check (is_manager());

create policy "Users can read own profile"
on profiles for select using (id = auth.uid());

create policy "Managers can manage clients"
on clients for all using (is_manager()) with check (is_manager());

create policy "Assigned technicians can read job clients"
on clients for select using (
  is_manager()
  or exists (
    select 1
    from jobs
    where jobs.client_id = clients.id
      and is_assigned_technician(jobs.id)
  )
);

create policy "Managers can manage sites"
on sites for all using (is_manager()) with check (is_manager());

create policy "Assigned technicians can read job sites"
on sites for select using (
  is_manager()
  or exists (
    select 1
    from jobs
    where jobs.site_id = sites.id
      and is_assigned_technician(jobs.id)
  )
);

create policy "Managers can manage technicians"
on technicians for all using (is_manager()) with check (is_manager());

create policy "Technicians can read own record"
on technicians for select using (profile_id = auth.uid());

create policy "Managers can manage surveys"
on site_surveys for all using (is_manager()) with check (is_manager());

create policy "Assigned technicians can read related surveys"
on site_surveys for select using (
  exists (
    select 1
    from jobs
    where jobs.site_survey_id = site_surveys.id
      and is_assigned_technician(jobs.id)
  )
);

create policy "Managers can manage jobs"
on jobs for all using (is_manager()) with check (is_manager());

create policy "Assigned technicians can read jobs"
on jobs for select using (is_assigned_technician(id));

create policy "Assigned technicians can update field job progress"
on jobs for update using (is_assigned_technician(id))
with check (is_assigned_technician(id));

create policy "Managers can manage assignments"
on job_assignments for all using (is_manager()) with check (is_manager());

create policy "Technicians can read own assignments"
on job_assignments for select using (
  exists (
    select 1 from technicians
    where technicians.id = job_assignments.technician_id
      and technicians.profile_id = auth.uid()
  )
);

create policy "Managers can manage status history"
on job_status_history for all using (is_manager()) with check (is_manager());

create policy "Assigned technicians can read and add status history"
on job_status_history for all
using (is_assigned_technician(job_id))
with check (is_assigned_technician(job_id));

create policy "Managers can manage tools"
on tools for all using (is_manager()) with check (is_manager());

create policy "Technicians can read tools"
on tools for select using (true);

create policy "Managers can manage job tools"
on job_tools for all using (is_manager()) with check (is_manager());

create policy "Assigned technicians can read job tools"
on job_tools for select using (is_assigned_technician(job_id));

create policy "Managers can manage installed systems"
on installed_systems for all using (is_manager()) with check (is_manager());

create policy "Assigned technicians can read installed systems"
on installed_systems for select using (
  exists (
    select 1 from jobs
    where jobs.site_id = installed_systems.site_id
      and is_assigned_technician(jobs.id)
  )
);

create policy "Managers can manage installed equipment"
on installed_equipment for all using (is_manager()) with check (is_manager());

create policy "Assigned technicians can read installed equipment"
on installed_equipment for select using (
  exists (
    select 1 from jobs
    where jobs.site_id = installed_equipment.site_id
      and is_assigned_technician(jobs.id)
  )
);

create policy "Managers can manage job materials"
on job_materials for all using (is_manager()) with check (is_manager());

create policy "Assigned technicians can manage own job materials"
on job_materials for all
using (is_assigned_technician(job_id))
with check (is_assigned_technician(job_id));

create policy "Managers can manage attachments"
on attachments for all using (is_manager()) with check (is_manager());

create policy "Assigned technicians can manage job attachments"
on attachments for all
using (job_id is not null and is_assigned_technician(job_id))
with check (job_id is not null and is_assigned_technician(job_id));

create policy "Managers can read feedback"
on feedback for select using (is_manager());

create policy "Managers can manage notifications"
on notifications for all using (is_manager()) with check (is_manager());

create policy "Users can read own notifications"
on notifications for select using (user_id = auth.uid());

create policy "Users can update own notifications"
on notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users can manage own push tokens"
on push_tokens for all using (user_id = auth.uid()) with check (user_id = auth.uid());

insert into tools (name) values
  ('Ladder'),
  ('Electric drill'),
  ('Screwdriver set'),
  ('Multimeter'),
  ('CCTV tester'),
  ('Network tester'),
  ('Crimping tool'),
  ('Cable tester'),
  ('Pliers'),
  ('Spanner set'),
  ('Safety equipment')
on conflict (name) do nothing;

-- Public support and feedback endpoints should be implemented as Supabase Edge
-- Functions that validate sites.support_token or jobs.feedback_token, then insert
-- the minimum required rows with the service role. Do not expose broad anonymous
-- table policies for public forms.
