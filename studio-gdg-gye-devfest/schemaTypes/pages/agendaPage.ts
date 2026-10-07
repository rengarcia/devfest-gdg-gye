import {defineField} from 'sanity'
import {CalendarIcon} from '@sanity/icons/Calendar'
import {comingSoonField} from '../objects/comingSoon'
import {definePage} from '../shared/pageType'

export const agendaPage = definePage({
  name: 'agendaPage',
  title: 'Agenda',
  icon: CalendarIcon,
  fields: [
    defineField({
      name: 'hero',
      title: 'Cabecera',
      type: 'pageHero',
      validation: (rule) => rule.required(),
    }),
    comingSoonField,
    defineField({
      name: 'footnote',
      title: 'Nota al pie',
      type: 'text',
      rows: 2,
      description:
        'Línea en monoespaciada bajo la agenda. Las sesiones salen de los documentos Sesión.',
      validation: (rule) => rule.required(),
    }),
  ],
})
