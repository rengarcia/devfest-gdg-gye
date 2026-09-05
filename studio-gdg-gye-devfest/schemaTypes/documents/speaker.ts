import {defineField, defineType} from 'sanity'
import {UserIcon} from '@sanity/icons/User'
import {familyField} from '../shared/familyField'
import {orderByOrder, orderField} from '../shared/orderField'

export const speaker = defineType({
  name: 'speaker',
  title: 'Speaker',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Cargo y empresa',
      type: 'string',
      description: 'P. ej. "Staff Engineer, Kushki".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'initials',
      title: 'Iniciales',
      type: 'string',
      description: 'Se muestran en la tarjeta. Si se deja vacío se calculan a partir del nombre.',
      validation: (rule) => rule.max(3),
    }),
    defineField({
      name: 'track',
      title: 'Track',
      type: 'reference',
      to: [{type: 'track'}],
      validation: (rule) => rule.required(),
    }),
    familyField,
    orderField,
  ],
  orderings: [
    orderByOrder,
    {title: 'Nombre', name: 'nameAsc', by: [{field: 'name', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'name', subtitle: 'role'},
  },
})
