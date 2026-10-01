/**
 * Cheap "is someone signed in?" check for the header, without loading supabase-js: the client
 * keeps its session in localStorage under `sb-<project ref>-auth-token`.
 */
const ref = new URL(import.meta.env.PUBLIC_SUPABASE_URL).hostname.split('.')[0];

export const SESSION_KEY = `sb-${ref}-auth-token`;

export function hasStoredSession(): boolean {
  try {
    return localStorage.getItem(SESSION_KEY) !== null;
  } catch {
    return false;
  }
}

/** Fired on `document` by the account scripts after signing in or out, so the header can update. */
export const ACCOUNT_CHANGE_EVENT = 'account:change';
