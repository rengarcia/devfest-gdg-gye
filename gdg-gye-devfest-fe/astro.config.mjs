// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/** Account screens: kept out of the sitemap, and their pages set `noindex`. */
const PRIVATE_PATHS = ['/cuenta'];

// https://astro.build/config
export default defineConfig({
  // Production URL: canonical links, Open Graph URLs, the sitemap and robots.txt are built on it.
  site: 'https://devfest-gdg-gye.vercel.app',
  // Internal links are written without a trailing slash (/agenda); canonical URLs and the sitemap match.
  trailingSlash: 'never',
  integrations: [
    sitemap({
      filter: (page) => {
        const { pathname } = new URL(page);
        return !PRIVATE_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
      },
    }),
  ],
});
