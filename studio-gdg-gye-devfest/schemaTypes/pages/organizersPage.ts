import {defineArrayMember, defineField} from 'sanity'
import {UsersIcon} from '@sanity/icons/Users'
import {definePage} from '../shared/pageType'
import {eyebrowField, leadField, titleField} from '../shared/textFields'

export const organizersPage = definePage({
  name: 'organizersPage',
  title: 'Organizadores',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'hero',
      title: 'Cabecera',
      type: 'pageHero',
      description: 'Las tarjetas salen de los documentos Organizador.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'volunteering',
      title: 'Voluntariado',
      type: 'object',
      options: {collapsible: true, collapsed: false},
      fields: [
        eyebrowField,
        titleField,
        leadField,
        defineField({
          name: 'primary',
          title: 'Botón principal',
          type: 'link',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'secondary',
          title: 'Botón secundario',
          type: 'link',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'stats',
          title: 'Cifras',
          type: 'array',
          description: 'Las cuatro tarjetas junto al texto. Aquí los valores no se animan.',
          of: [defineArrayMember({type: 'stat'})],
          validation: (rule) => rule.required().max(4),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
  ],
})
