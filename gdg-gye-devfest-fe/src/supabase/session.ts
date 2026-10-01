/**
 * Cheap "is someone signed in?" check for the header, without loading supabase-js: the client
 * keeps its session in localStorage under `sb-<project ref>-auth-token`.
 *
 * site.ts imports this on every page, so it must never throw: without the Supabase env vars (e.g.
 * a deploy that has not set them yet) everyone is simply treated as signed out.
 */
function sessionKey(): string | undefined {
  try {
    const ref = new URL(import.meta.env.PUBLIC_SUPABASE_URL).hostname.split('.')[0];
    return `sb-${ref}-auth-token`;
  } catch {
    return undefined;
  }
}

export function hasStoredSession(): boolean {
  try {
    const key = sessionKey();
    return key !== undefined && localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}

/** Fired on `document` by the account scripts after signing in or out, so the header can update. */
export const ACCOUNT_CHANGE_EVENT = 'account:change';
