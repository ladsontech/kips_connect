# Kibs Connect

Kibs Connect is a simple field survey app for Kibs Systems Ltd. Admins add a site and
assign it to a technician for a new installation or maintenance visit; the technician
surveys it and reports the number of devices used; admins review and approve.

The app runs on a live Supabase backend: real login (Supabase Auth), a Postgres
database with row-level security, and Supabase Storage for photos.

- Login page for two roles: **Admin** and **Technician** (no public or sales access)
- Admins add a site (name, location, contact, New Site / Maintenance) and assign it to
  a technician, with optional instructions
- Technicians see their assigned sites under **My Sites** and tap **Start Survey** to
  fill in a survey pre-filled with that site's details — or start a survey from scratch
  for unplanned visits
- Each survey records CCTV cameras (2MP, 4MP, 5MP, 8MP/4K), flood lights (30W, 50W,
  100W, 200W), and solar panels installed or proposed
- Technicians can attach up to 6 site photos per survey (compressed in the browser,
  then uploaded to Supabase Storage)
- Admins get a side-panel dashboard (Overview, Sites, Pending, Approved, All Surveys,
  Technicians) with stat tiles, open-assignment and equipment charts, and technician
  activity, and approve pending surveys from the detail view
- Admins can add technician accounts (name, email, phone, password — with a
  one-click password generator) and remove them from the **Technicians** panel.
  Both actions call a secure Supabase Edge Function so the service-role key never
  reaches the browser
- PWA manifest and service worker for installing on a phone

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Supabase Setup

This project already has a Supabase backend provisioned (project **Kibs_Connect**).
To run it locally or set up a fresh environment:

1. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` from **Project Settings → API** in the Supabase dashboard.
2. The database schema (`profiles`, `site_assignments`, `surveys`, `survey_photos`,
   row-level security policies) is documented in `supabase/schema.sql`. It's already
   applied to the live project as a migration — that file is kept as a reference/setup
   script for a fresh project.
3. The `survey-photos` storage bucket (public, 8MB limit, image types only) is also
   already created, with policies so technicians can only upload into their own
   folder and admins can manage everything.
4. Two Edge Functions handle technician account management with the service-role key
   (source in `supabase/functions/`):
   - `create-technician` — verifies the caller is an admin, then creates the Auth
     user + matching `profiles` row.
   - `delete-technician` — verifies the caller is an admin, blocks removal while the
     technician has an open (unassigned-survey) site assignment, then deletes the
     Auth user. Historical surveys/assignments keep showing that technician's name
     even after removal (it's snapshotted at the time, not looked up live).

### Demo Accounts

Seeded directly as real Supabase Auth users:

- Admin — `admin@kibs.com` / `admin123`
- Technician — `musa@kibs.com` / `tech123`
- Technician — `peter@kibs.com` / `tech123`
- Technician — `asha@kibs.com` / `tech123`

`src/data/mockData.ts` is no longer imported anywhere — it's kept only as a reference
for the original data shape.
