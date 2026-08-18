# Kibs Connect

Kibs Connect is a simple field survey app for Kibs Systems Ltd. Technicians conduct
site surveys for new installations and maintenance visits, then report the number of
devices used. Admins review every survey and approve it.

- Login page for two roles: **Admin** and **Technician** (no public or sales access)
- Technicians submit a survey for a site, choosing **New Site Survey** or **Maintenance**
- Each survey records CCTV cameras (2MP, 4MP, 5MP, 8MP/4K), flood lights (30W, 50W,
  100W, 200W), and solar panels installed or proposed
- Admins see every survey, filter by Pending / Approved, and approve pending ones
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

The app currently runs on local mock data (`src/data/mockData.ts`), so you can sign
in right away with:

- Admin — `admin@kibs.com` / `admin123`
- Technician — `musa@kibs.com` / `tech123`

## Supabase (optional next step)

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY`.
3. Run `supabase/schema.sql` in the Supabase SQL editor (or turn it into a migration).
   It creates `profiles` (admin/technician role) and `surveys` (with equipment counts
   and an approval workflow) with row-level security so technicians only see their
   own surveys and admins see everything.
4. Replace the arrays in `src/data/mockData.ts` with real Supabase auth + queries.
