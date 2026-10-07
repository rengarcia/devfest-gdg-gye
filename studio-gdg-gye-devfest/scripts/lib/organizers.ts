/**
 * The GDG Guayaquil organizers, as listed on the chapter page
 * (https://gdg.community.dev/gdg-guayaquil/, "Organizadores") and on the chapter's event pages.
 * Shared by `npm run seed` (fresh dataset) and `npm run seed:organizers` (replaces the
 * placeholder team the first seed shipped with).
 *
 * Photos come from the previous site (devfest-page, public/organizers) and live in
 * ./assets/organizers/<slug>.webp; organizers without a file keep the initials card.
 */
import {createReadStream, existsSync} from 'node:fs'
import {resolve} from 'node:path'
import type {SanityClient} from 'sanity'

type Family = 'yellow' | 'blue' | 'green' | 'red'

interface OrganizerSeed {
  name: string
  role: string
  family: Family
  /** Only where the site's guess from the name reads badly. */
  initials?: string
}

const FAMILIES: Family[] = ['yellow', 'green', 'blue', 'red']

/** In card order; the colour family cycles through the brand kit. */
export const ORGANIZERS: OrganizerSeed[] = [
  {name: 'Carlos Loja', role: 'Organizer'},
  {name: 'Joangie Márquez', role: 'Organizer'},
  {name: 'Joseph Ávila', role: 'Organizer', initials: 'JA'},
  {name: 'Carlos Carvajal', role: 'Organizer'},
  {name: 'Renán García', role: 'Organizer'},
  {name: 'Xavier Idrovo', role: 'Organizer'},
  {name: 'Cintya Aguirre', role: 'Organizer'},
  {name: 'Betsy Nazareno', role: 'Co-organizer'},
  {name: 'María José Moyano', role: 'Co-organizer'},
].map((o, i) => ({...o, family: FAMILIES[i % FAMILIES.length]}))

/** The made-up team of the first seed; `seed:organizers` deletes these documents. */
const PLACEHOLDER_NAMES = [
  'Renato Salazar',
  'Verónica Cruz',
  'Diego Montenegro',
  'Ana Lucía Pinto',
  'Jorge Vélez',
  'Camila Torres',
  'Sebastián Aguirre',
  'Nicole Bravo',
]

/** "María José Moyano" → "maria-jose-moyano", for stable document ids. */
const slugOf = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** Resolved from the Studio folder, where the npm scripts run. */
const PHOTOS_DIR = resolve(process.cwd(), 'scripts/assets/organizers')

/**
 * Uploads the organizer's photo, if there is one. Sanity keys assets by content hash, so
 * re-running returns the same asset instead of a duplicate.
 */
async function uploadPhoto(client: SanityClient, name: string) {
  const file = resolve(PHOTOS_DIR, `${slugOf(name)}.webp`)
  if (!existsSync(file)) return undefined
  const asset = await client.assets.upload('image', createReadStream(file), {
    filename: `${slugOf(name)}.webp`,
  })
  return {_type: 'image', asset: {_type: 'reference', _ref: asset._id}, alt: name}
}

/**
 * Removes the placeholder organizers (published and drafts) and creates or replaces the real
 * ones under fixed ids (`organizer-<slug>`; a dot would make them private), so it is safe to
 * re-run. Organizers added in the Studio under other names are kept as they are, and so is a
 * photo already set (or re-cropped) in the Studio: the bundled one only fills a missing photo.
 */
export async function syncOrganizers(client: SanityClient) {
  const placeholders = await client.fetch<string[]>(
    '*[_type == "organizer" && name in $names]._id',
    {names: PLACEHOLDER_NAMES},
    {perspective: 'raw'},
  )
  const existing = await client.fetch<{_id: string; photo?: object}[]>(
    '*[_id in $ids && defined(photo.asset)]{_id, photo}',
    {ids: ORGANIZERS.map((o) => `organizer-${slugOf(o.name)}`)},
  )
  const kept = new Map(existing.map((d) => [d._id, d.photo]))
  const photos = await Promise.all(
    ORGANIZERS.map((o) => kept.get(`organizer-${slugOf(o.name)}`) ?? uploadPhoto(client, o.name)),
  )
  const tx = client.transaction()
  for (const id of placeholders) tx.delete(id)
  for (const [i, o] of ORGANIZERS.entries()) {
    tx.createOrReplace({
      _id: `organizer-${slugOf(o.name)}`,
      _type: 'organizer',
      ...o,
      ...(photos[i] && {photo: photos[i]}),
      order: i + 1,
    })
  }
  await tx.commit()
  console.log(
    `  ${ORGANIZERS.length} organizadores (${photos.filter(Boolean).length} con foto)` +
      (placeholders.length ? `, ${placeholders.length} de ejemplo eliminados` : ''),
  )
}
