# Kibs Connect

Kibs Connect is a simple field survey app for Kibs Systems Ltd. Admins add a site and
assign it to a technician for a new installation or maintenance visit; the technician
surveys it and reports the number of devices used; admins review and approve.

- Login page for two roles: **Admin** and **Technician** (no public or sales access)
- Admins add a site (name, location, contact, New Site / Maintenance) and assign it to
  a technician, with optional instructions
- Technicians see their assigned sites under **My Sites** and tap **Start Survey** to
  fill in a survey pre-filled with that site's details — or start a survey from scratch
  for unplanned visits
- Each survey records CCTV cameras (2MP, 4MP, 5MP, 8MP/4K), flood lights (30W, 50W,
  100W, 200W), and solar panels installed or proposed
- Technicians can attach up to 6 site photos per survey (auto-compressed in the browser)
- Admins get a side-panel dashboard (Overview, Sites, Pending, Approved, All Surveys,
  Technicians) with stat tiles, open-assignment and equipment charts, and technician
  activity, and approve pending surveys from the detail view
- Admins can add technician accounts (name, email, phone, password — with a
  one-click password generator) and remove them from the **Technicians** panel
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

## Demo Accounts

The app currently runs on local mock data (`src/data/mockData.ts`) persisted to
`localStorage`, so you can sign in right away with:

- Admin — `admin@kibs.com` / `admin123`
- Technician — `musa@kibs.com` / `tech123`

Photos are compressed and stored as data URLs in `localStorage` for this demo —
fine for a handful of surveys, but browsers cap local storage at a few MB, so wire
up Supabase Storage (below) before using this for real fieldwork.

## Supabase (optional next step)

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY`.
3. Run `supabase/schema.sql` in the Supabase SQL editor (or turn it into a migration).
   It creates `profiles` (admin/technician role), `site_assignments` (admin-created
   sites assigned to a technician), `surveys` (with equipment counts, an approval
   workflow, and an optional link back to the assignment that spawned them), and
   `survey_photos` (pointers into storage) — with row-level security so technicians
   only see their own assignments/surveys and admins see everything.
4. Create a `survey-photos` storage bucket and upload photo files there instead of
   storing them as data URLs, inserting a `survey_photos` row per upload.
5. Replace the arrays in `src/data/mockData.ts` with real Supabase auth + queries.
6. The **Add Technician** flow currently creates a plain `User` record with a
   plaintext password in local mock data — fine for a demo, but a real Supabase
   setup can't create another person's login from the browser with the anon key.
   Move it to a Supabase Edge Function that calls `supabase.auth.admin.createUser()`
   with the service role key, then inserts the matching `profiles` row.
