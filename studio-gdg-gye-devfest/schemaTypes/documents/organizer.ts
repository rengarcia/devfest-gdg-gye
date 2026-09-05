import {defineField, defineType} from 'sanity'
import {UsersIcon} from '@sanity/icons/Users'
import {familyField} from '../shared/familyField'
import {orderByOrder, orderField} from '../shared/orderField'

export const organizer = defineType({
  name: 'organizer',
  title: 'Organizador',
  type: 'document',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Rol en el equipo',
      type: 'string',
      description: 'P. ej. "Sponsors y alianzas".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'initials',
      title: 'Iniciales',
      type: 'string',
      description: 'Se muestran en la tarjeta. Si se deja vacío se calculan a partir del nombre.',
      validation: (rule) => rule.max(3),
    }),
    familyField,
    orderField,
  ],
  orderings: [orderByOrder],
  preview: {
    select: {title: 'name', subtitle: 'role'},
  },
})
