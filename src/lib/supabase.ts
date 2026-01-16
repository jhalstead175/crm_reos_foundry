import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a mock client for when environment variables are missing
// This allows the app to run in demo mode without crashing
const createMockClient = () => {
  console.warn("⚠️ Supabase environment variables not configured. Running in demo mode.");
  console.warn("To enable persistence, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel.");

  return {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
      eq: function() { return this; },
      order: function() { return this; },
      single: () => Promise.resolve({ data: null, error: null }),
    }),
    channel: () => ({
      on: function() { return this; },
      subscribe: () => ({ unsubscribe: () => {} }),
      unsubscribe: () => {},
    }),
  } as any;
};

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient();
