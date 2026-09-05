import {defineField, defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons/Link'
import {PLACEHOLDER_HINT} from '../shared/textFields'

const HREF = /^(\/|#|https?:\/\/|mailto:|tel:)/

/** Button or text link: a label plus a destination, internal or external. */
export const link = defineType({
  name: 'link',
  title: 'Enlace',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'label',
      title: 'Texto',
      type: 'string',
      description: PLACEHOLDER_HINT,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'href',
      title: 'Destino',
      type: 'string',
      description:
        'Ruta del sitio (/agenda, /faq#conducta), ancla (#registro), URL (https://…) o correo (mailto:…). Deja "#" mientras no exista el destino.',
      validation: (rule) => [
        rule.required(),
        rule
          .regex(HREF, {name: 'destino', invert: false})
          .error('Debe empezar por /, #, https://, mailto: o tel:.'),
      ],
    }),
  ],
  preview: {
    select: {title: 'label', subtitle: 'href'},
  },
})
