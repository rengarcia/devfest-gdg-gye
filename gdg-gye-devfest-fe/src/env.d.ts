interface ImportMetaEnv {
  readonly PUBLIC_SANITY_PROJECT_ID: string;
  readonly PUBLIC_SANITY_DATASET: string;
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_PUBLISHABLE_KEY: string;
  /** Optional: Google Search Console meta-tag token. */
  readonly PUBLIC_GOOGLE_SITE_VERIFICATION?: string;
  /** Optional: Bing Webmaster Tools meta-tag token. */
  readonly PUBLIC_BING_SITE_VERIFICATION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
