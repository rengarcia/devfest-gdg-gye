import type {StructureResolver} from 'sanity/structure'
import {CogIcon} from '@sanity/icons/Cog'

/** Document types with a single, fixed-id document. Kept out of generic lists and the "new" menu. */
export const SINGLETONS = ['siteSettings']

const LISTED = [
  ...SINGLETONS,
  'track',
  'session',
  'speaker',
  'organizer',
  'sponsorTier',
  'sponsor',
  'faq',
]

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenido')
    .items([
      S.listItem()
        .title('Configuración del sitio')
        .id('siteSettings')
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
            .title('Configuración del sitio'),
        ),
      S.divider(),
      S.documentTypeListItem('track').title('Tracks'),
      S.documentTypeListItem('session').title('Sesiones'),
      S.documentTypeListItem('speaker').title('Speakers'),
      S.divider(),
      S.documentTypeListItem('organizer').title('Organizadores'),
      S.divider(),
      S.documentTypeListItem('sponsorTier').title('Niveles de patrocinio'),
      S.documentTypeListItem('sponsor').title('Sponsors'),
      S.divider(),
      S.documentTypeListItem('faq').title('Preguntas frecuentes'),
      // Any type added later still shows up until it gets a place above.
      ...S.documentTypeListItems().filter((item) => !LISTED.includes(item.getId() as string)),
    ])
