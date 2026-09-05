import {defineField, defineType} from 'sanity'
import {CaseIcon} from '@sanity/icons/Case'
import {orderByOrder, orderField} from '../shared/orderField'

export const sponsor = defineType({
  name: 'sponsor',
  title: 'Sponsor',
  type: 'document',
  icon: CaseIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tier',
      title: 'Nivel',
      type: 'reference',
      to: [{type: 'sponsorTier'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      description: 'Mientras no haya logo, el tile muestra el nombre.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Texto alternativo',
          type: 'string',
          validation: (rule) => rule.warning('Describe el logo para lectores de pantalla.'),
        }),
      ],
    }),
    defineField({
      name: 'url',
      title: 'Sitio web',
      type: 'url',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    orderField,
  ],
  orderings: [orderByOrder],
  preview: {
    select: {title: 'name', subtitle: 'tier.name', media: 'logo'},
  },
})
