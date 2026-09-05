import {defineField, defineType} from 'sanity'
import {HelpCircleIcon} from '@sanity/icons/HelpCircle'
import {orderByOrder, orderField} from '../shared/orderField'

export const faq = defineType({
  name: 'faq',
  title: 'Pregunta frecuente',
  type: 'document',
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: 'question',
      title: 'Pregunta',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'answer',
      title: 'Respuesta',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'anchor',
      title: 'Ancla',
      type: 'slug',
      description:
        'Opcional. Permite enlazar la pregunta directamente, p. ej. "conducta" → /faq#conducta.',
      options: {source: 'question'},
    }),
    orderField,
  ],
  orderings: [orderByOrder],
  preview: {
    select: {title: 'question', subtitle: 'answer'},
  },
})
