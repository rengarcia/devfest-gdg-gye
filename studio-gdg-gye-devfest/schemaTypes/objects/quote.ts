import {defineField, defineType} from 'sanity'
import {BlockquoteIcon} from '@sanity/icons/Blockquote'
import {PLACEHOLDER_HINT} from '../shared/textFields'

/** Scalloped pull quote. The design bolds the opening word. */
export const quote = defineType({
  name: 'quote',
  title: 'Cita',
  type: 'object',
  icon: BlockquoteIcon,
  options: {collapsible: true, collapsed: false},
  fields: [
    defineField({
      name: 'highlight',
      title: 'Palabra destacada',
      type: 'string',
      description: 'Va en negrita al inicio de la cita, p. ej. "DevFest". Opcional.',
    }),
    defineField({
      name: 'text',
      title: 'Texto',
      type: 'text',
      rows: 3,
      description:
        'El resto de la cita, a continuación de la palabra destacada. ' + PLACEHOLDER_HINT,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'attribution',
      title: 'Autor',
      type: 'string',
      description:
        'Línea en monoespaciada bajo la cita, p. ej. "Equipo organizador / GDG Guayaquil". Opcional.',
    }),
  ],
  preview: {
    select: {highlight: 'highlight', text: 'text'},
    prepare: ({highlight, text}) => ({title: [highlight, text].filter(Boolean).join(' ')}),
  },
})
