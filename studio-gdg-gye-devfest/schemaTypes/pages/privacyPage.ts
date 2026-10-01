import {defineArrayMember, defineField} from 'sanity'
import {LockIcon} from '@sanity/icons/Lock'
import {definePage} from '../shared/pageType'
import {PLACEHOLDER_HINT} from '../shared/textFields'

/**
 * /privacidad: the full privacy notice required by the LOPDP. `version` is stored with every
 * consent; changing it asks signed-in attendees to accept the new text.
 */
export const privacyPage = definePage({
  name: 'privacyPage',
  title: 'Aviso de privacidad',
  icon: LockIcon,
  withCta: false,
  fields: [
    defineField({
      name: 'hero',
      title: 'Cabecera',
      type: 'pageHero',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'version',
      title: 'Versión',
      type: 'string',
      description:
        'Cámbiala (p. ej. a la fecha, 2026-10-01) solo cuando el cambio afecte a lo que la gente aceptó: se les pedirá aceptar de nuevo.',
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Última actualización',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sections',
      title: 'Secciones',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'privacySection',
          title: 'Sección',
          type: 'object',
          fields: [
            defineField({
              name: 'heading',
              title: 'Título',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'body',
              title: 'Texto',
              type: 'text',
              rows: 6,
              description: 'Separa los párrafos con una línea en blanco. ' + PLACEHOLDER_HINT,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {select: {title: 'heading'}},
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
})
