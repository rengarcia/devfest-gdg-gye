import {defineArrayMember, defineField, defineType} from 'sanity'
import {StarIcon} from '@sanity/icons/Star'
import {familyField} from '../shared/familyField'
import {orderByOrder, orderField} from '../shared/orderField'

const KINDS = [
  {title: 'Patrocinio', value: 'paid'},
  {title: 'Alianza comunitaria', value: 'community'},
]

export const sponsorTier = defineType({
  name: 'sponsorTier',
  title: 'Nivel de patrocinio',
  type: 'document',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre',
      type: 'string',
      description: 'P. ej. Diamond, Gold, Silver o Community.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'kind',
      title: 'Tipo',
      type: 'string',
      description:
        'Los patrocinios muestran sus beneficios; las alianzas comunitarias solo el listado de logos.',
      options: {list: KINDS, layout: 'radio', direction: 'horizontal'},
      initialValue: 'paid',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'headline',
      title: 'Titular',
      type: 'string',
      description: 'P. ej. "Presencia principal en escenario y stand".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Texto de apoyo',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'perks',
      title: 'Beneficios',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      hidden: ({document}) => document?.kind === 'community',
    }),
    familyField,
    orderField,
  ],
  orderings: [orderByOrder],
  preview: {
    select: {title: 'name', subtitle: 'headline'},
  },
})
