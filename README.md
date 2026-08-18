# Kibs Connect

Kibs Connect is a simple field survey app for Kibs Systems Ltd. Technicians conduct
site surveys for new installations and maintenance visits, then report the number of
devices used. Admins review every survey and approve it.

- Login page for two roles: **Admin** and **Technician** (no public or sales access)
- Technicians submit a survey for a site, choosing **New Site Survey** or **Maintenance**
- Each survey records CCTV cameras (2MP, 4MP, 5MP, 8MP/4K), flood lights (30W, 50W,
  100W, 200W), and solar panels installed or proposed
- Technicians can attach up to 6 site photos per survey (auto-compressed in the browser)
- Admins get an Overview dashboard (stat tiles, equipment totals, per-rating breakdowns,
  technician activity) plus Pending / Approved / All Surveys lists, and approve pending
  surveys from the detail view
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
   It creates `profiles` (admin/technician role), `surveys` (with equipment counts and
   an approval workflow), and `survey_photos` (pointers into storage), with row-level
   security so technicians only see their own surveys and admins see everything.
4. Create a `survey-photos` storage bucket and upload photo files there instead of
   storing them as data URLs, inserting a `survey_photos` row per upload.
5. Replace the arrays in `src/data/mockData.ts` with real Supabase auth + queries.
