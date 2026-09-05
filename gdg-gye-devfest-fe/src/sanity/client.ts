import { createClient } from '@sanity/client';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.PUBLIC_SANITY_DATASET;

if (!projectId || !dataset) {
  throw new Error(
    'Faltan PUBLIC_SANITY_PROJECT_ID y/o PUBLIC_SANITY_DATASET. Copia .env.example a .env.',
  );
}

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: '2026-09-05',
  // Static site: content is fetched at build time, so read straight from the API for fresh data.
  useCdn: false,
});
