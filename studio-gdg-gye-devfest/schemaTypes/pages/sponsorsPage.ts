import {defineField} from 'sanity'
import {CaseIcon} from '@sanity/icons/Case'
import {definePage} from '../shared/pageType'

export const sponsorsPage = definePage({
  name: 'sponsorsPage',
  title: 'Sponsors',
  icon: CaseIcon,
  fields: [
    defineField({
      name: 'hero',
      title: 'Cabecera',
      type: 'pageHero',
      description: 'Las secciones por nivel salen de los documentos Nivel de patrocinio y Sponsor.',
      validation: (rule) => rule.required(),
    }),
  ],
})
