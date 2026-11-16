import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** True only when both public Supabase variables are present. */
export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * Supabase client using the PUBLIC anon key only.
 * Access control is enforced by Row Level Security in the database (Phase 2),
 * never by this client. The service_role key must never appear in frontend code.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null;
