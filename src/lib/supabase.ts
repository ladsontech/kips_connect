import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
