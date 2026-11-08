// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/** Pages kept out of the sitemap because they set `noindex`: the account screens and the 404. */
const PRIVATE_PATHS = ['/cuenta', '/404'];

// https://astro.build/config
export default defineConfig({
  // Production URL: canonical links, Open Graph URLs, the sitemap and robots.txt are built on it.
  // Keep it on the domain that serves the site: devfest-gdg-gye.vercel.app and gdggye.org redirect here.
  site: 'https://www.gdggye.org',
  // Internal links are written without a trailing slash (/agenda); canonical URLs and the sitemap match.
  trailingSlash: 'never',
  integrations: [
    sitemap({
      // No `lastmod`: a build date stamped on every URL changes on every deploy, so Google ignores it.
      filter: (page) => {
        const { pathname } = new URL(page);
        return !PRIVATE_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
      },
    }),
  ],
});
