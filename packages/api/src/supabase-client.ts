import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client for browser-side usage with public anon key.
 * Throws if env vars are missing so we fail fast during setup.
 */
export const createBrowserSupabaseClient = (): SupabaseClient => {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    "";

  if (!url || !anonKey) {
    throw new Error(
      "Supabase URL and anon key are required. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createClient(url, anonKey);
};
