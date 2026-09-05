import {defineField} from 'sanity'
import {HelpCircleIcon} from '@sanity/icons/HelpCircle'
import {definePage} from '../shared/pageType'

export const faqPage = definePage({
  name: 'faqPage',
  title: 'FAQ',
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: 'hero',
      title: 'Cabecera',
      type: 'pageHero',
      description: 'Las preguntas salen de los documentos Pregunta frecuente.',
      validation: (rule) => rule.required(),
    }),
  ],
})
