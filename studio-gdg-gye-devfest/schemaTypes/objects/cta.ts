import {defineField, defineType} from 'sanity'
import {RocketIcon} from '@sanity/icons/Rocket'
import {PLACEHOLDER_HINT} from '../shared/textFields'

/**
 * Per-page override of the register block. Every field is optional: what is left empty falls
 * back to the block defined in the site settings.
 */
export const cta = defineType({
  name: 'cta',
  title: 'Bloque de registro',
  type: 'object',
  icon: RocketIcon,
  options: {collapsible: true, collapsed: true},
  fields: [
    defineField({name: 'eyebrow', title: 'Antetítulo', type: 'string'}),
    defineField({name: 'title', title: 'Título', type: 'string', description: PLACEHOLDER_HINT}),
    defineField({
      name: 'lead',
      title: 'Entradilla',
      type: 'text',
      rows: 2,
      description: PLACEHOLDER_HINT,
    }),
    defineField({name: 'primary', title: 'Botón principal', type: 'link'}),
    defineField({name: 'secondary', title: 'Botón secundario', type: 'link'}),
  ],
})
