import { createClient } from '@supabase/supabase-js';

// Hardcoded defaults so the app works on any host (Vercel, etc.) without
// needing environment variables.  The anon / publishable key is designed to
// be public and is safe to include in client-side code.
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://yevxhnfffzshqqznlqwc.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_t6mx-SpLEG3pRZ5R8Bpewg_3sxbcVbq';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// The app is fully backed by Supabase (auth, database, storage), so this
// client is required. When the env vars are missing we still avoid crashing
// at import time — App.tsx checks isSupabaseConfigured and shows a setup
// notice instead of rendering the rest of the app.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

export const SURVEY_PHOTOS_BUCKET = 'survey-photos';

export function publicPhotoUrl(objectPath: string): string {
  return supabase.storage.from(SURVEY_PHOTOS_BUCKET).getPublicUrl(objectPath).data.publicUrl;
}
