import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Proxy configuration to bypass local browser adblocker/shields blocking supabase.co domains
const isBrowser = typeof window !== 'undefined';
const useProxy = isBrowser && import.meta.env.DEV;
const activeSupabaseUrl = useProxy 
  ? `${window.location.origin}/supabase` 
  : supabaseUrl;

export const supabase = createClient(activeSupabaseUrl, supabaseAnonKey);

const isValidJWT = (token?: string) => {
  if (!token) return false;
  const parts = token.split('.');
  return parts.length === 3 && token.startsWith('eyJ');
};

export const supabaseAdmin = (supabaseServiceKey && isValidJWT(supabaseServiceKey))
  ? createClient(activeSupabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : supabase;

