import {defineField, defineType} from 'sanity'
import {TagIcon} from '@sanity/icons/Tag'
import {familyField} from '../shared/familyField'
import {GLYPHS} from '../shared/glyphField'
import {orderByOrder, orderField} from '../shared/orderField'

export const track = defineType({
  name: 'track',
  title: 'Track',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Identificador',
      type: 'slug',
      description: 'Se usa en los tabs de la agenda.',
      options: {source: 'name'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'blurb',
      title: 'Descripción corta',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'room',
      title: 'Sala',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'glyph',
      title: 'Glyph',
      type: 'string',
      description: 'Arte decorativo del kit DevFest que acompaña al track en la portada.',
      options: {list: GLYPHS},
      validation: (rule) => rule.required(),
    }),
    familyField,
    orderField,
  ],
  orderings: [orderByOrder],
  preview: {
    select: {title: 'name', subtitle: 'room'},
  },
})
