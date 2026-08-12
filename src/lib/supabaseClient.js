import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_AXIM_CORE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_AXIM_CORE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const aximCoreClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
