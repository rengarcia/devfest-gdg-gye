import type {ComponentType} from 'react'
import {defineField, defineType, type FieldDefinition} from 'sanity'
import {familyField} from './familyField'

interface PageOptions {
  /** Document type and, since pages are singletons, also the document id. */
  name: string
  title: string
  icon: ComponentType
  /** The page's own sections, between the SEO/colour fields and the closing register block. */
  fields: FieldDefinition[]
}

/**
 * A page singleton: SEO + colour family, the page's sections, and an optional override of the
 * register block that closes every page. Opened from the "Páginas" group in the Studio structure.
 */
export function definePage({name, title, icon, fields}: PageOptions) {
  return defineType({
    name,
    title,
    type: 'document',
    icon,
    fields: [
      defineField({
        name: 'seo',
        title: 'SEO',
        type: 'seo',
        validation: (rule) => rule.required(),
      }),
      defineField({
        ...familyField,
        description:
          'Acento de toda la página: una sola familia de color por página, según el brand guide.',
      }),
      ...fields,
      defineField({
        name: 'cta',
        title: 'Bloque de registro',
        type: 'cta',
        description:
          'Cierra la página. Deja vacío lo que no cambie: se usa el bloque de registro de la Configuración del sitio.',
      }),
    ],
    preview: {
      prepare: () => ({title}),
    },
  })
}
