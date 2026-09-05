import {defineField, defineType} from 'sanity'
import {TagIcon} from '@sanity/icons/Tag'
import {familyField} from '../shared/familyField'
import {orderByOrder, orderField} from '../shared/orderField'

/** Art from the DevFest kit, served by the site from public/assets/glyphs. Decoration only. */
const GLYPHS = [
  'braces',
  'semicolon',
  'globe',
  'at',
  'asterisk',
  'heart',
  'hash-green',
  'slash-a',
  'x-pink',
  'comma-yellow',
  'plus-blue',
  'half-circle-yellow',
  'dot-blue',
  'dot-green',
  'dot-red',
  'dot-yellow',
  'brace-left',
  'brace-right',
  'arrow-right',
  'quote-open',
]

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
