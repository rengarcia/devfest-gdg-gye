import {defineArrayMember, defineField} from 'sanity'

/** Art from the DevFest kit, served by the site from public/assets/glyphs. Decoration only. */
export const GLYPHS = [
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

/** One glyph, e.g. the one next to a track or a principle card. */
export const glyphField = (description: string) =>
  defineField({
    name: 'glyph',
    title: 'Glyph',
    type: 'string',
    description,
    options: {list: GLYPHS},
    validation: (rule) => rule.required(),
  })

/** Up to three glyphs that float around a hero. */
export const glyphsField = (description: string) =>
  defineField({
    name: 'glyphs',
    title: 'Glyphs',
    type: 'array',
    description,
    of: [defineArrayMember({type: 'string', options: {list: GLYPHS}})],
    validation: (rule) => rule.max(3),
  })
