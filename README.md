# Kibs Connect

Kibs Connect is a mobile-first field service management starter for Kibs Systems Ltd. It implements the MVP workflows from the product specification:

- Manager dashboard, clients, sites, jobs, technicians, reports, notifications, and settings
- Technician home, assigned jobs, start job, field report, before/after evidence, and completion
- Public support request and client feedback forms using token-ready data shapes
- PWA manifest and service worker
- Supabase-ready schema with role, public-token, job, attachment, feedback, notification, and RLS foundations

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Supabase

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Run `supabase/schema.sql` in the Supabase SQL editor or convert it into a migration.
4. Create the storage buckets referenced in the schema notes: `site-surveys`, `problem-photos`, `before-work`, and `after-work`.

The frontend currently runs with mock data, but the types match the schema closely so the next step is replacing the local arrays in `src/data/mockData.ts` with Supabase queries.

## Firebase Cloud Messaging

The UI and schema include notification history and push token storage. The next implementation step is adding Firebase initialization, requesting device permission after login, and invoking FCM from Supabase Edge Functions on assignment, support request, job start, job completion, and unresolved feedback events.
