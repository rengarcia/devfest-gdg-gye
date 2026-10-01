/**
 * Browser client for the attendee accounts (Supabase project in ../../../supabase). Only the
 * account scripts import this module, so the other pages never download supabase-js.
 *
 * The publishable key is public by design: row-level security and the SQL functions decide what
 * each signed-in person can read or change. Types come from ./database.types.ts, generated from
 * the database schema (see ../../../supabase/README.md).
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export type Supabase = SupabaseClient<Database>;

let client: Supabase | undefined;

export function supabase(): Supabase {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      'Faltan PUBLIC_SUPABASE_URL y/o PUBLIC_SUPABASE_PUBLISHABLE_KEY. Copia .env.example a .env (y añádelas en Vercel).',
    );
  }
  client ??= createClient<Database>(
    url,
    key,
    // Sign-in is a 6-digit code typed on the page, so there is never a session in the URL.
    { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } },
  );
  return client;
}
