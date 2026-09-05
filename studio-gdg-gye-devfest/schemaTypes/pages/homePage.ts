import {defineArrayMember, defineField} from 'sanity'
import {HomeIcon} from '@sanity/icons/Home'
import {glyphsField} from '../shared/glyphField'
import {definePage} from '../shared/pageType'
import {PLACEHOLDER_HINT, eyebrowField, leadField, titleField} from '../shared/textFields'

const section = {collapsible: true, collapsed: false}

export const homePage = definePage({
  name: 'homePage',
  title: 'Portada',
  icon: HomeIcon,
  fields: [
    defineField({
      name: 'hero',
      title: 'Cabecera',
      type: 'object',
      options: section,
      fields: [
        defineField({
          name: 'chips',
          title: 'Chips',
          type: 'array',
          of: [defineArrayMember({type: 'string'})],
          description: 'Etiquetas sobre el título; la primera va resaltada. ' + PLACEHOLDER_HINT,
          validation: (rule) => rule.max(4),
        }),
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
          name: 'figure',
          title: 'Foto',
          type: 'figure',
          validation: (rule) => rule.required(),
        }),
        glyphsField('Hasta tres glyphs que flotan alrededor de la foto. Solo decoración.'),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'stats',
      title: 'Cifras',
      type: 'array',
      of: [defineArrayMember({type: 'stat'})],
      description: 'La franja de cifras bajo la cabecera (cuatro en el diseño).',
      validation: (rule) => rule.required().max(4),
    }),
    defineField({
      name: 'speakers',
      title: 'Sección de speakers',
      type: 'object',
      options: section,
      fields: [
        eyebrowField,
        titleField,
        leadField,
        defineField({
          name: 'featured',
          title: 'Speakers destacados',
          type: 'array',
          description: 'Las tres tarjetas de la portada, en orden.',
          of: [defineArrayMember({type: 'reference', to: [{type: 'speaker'}]})],
          validation: (rule) => rule.max(3).unique(),
        }),
        defineField({
          name: 'link',
          title: 'Enlace',
          type: 'link',
          description: 'Botón bajo las tarjetas, p. ej. "Todos los speakers".',
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tracks',
      title: 'Sección de tracks',
      type: 'object',
      description: 'Las tarjetas salen de los documentos de tipo Track.',
      options: section,
      fields: [
        eyebrowField,
        titleField,
        defineField({
          name: 'linkLabel',
          title: 'Texto del chip',
          type: 'string',
          description: 'Chip al pie de cada tarjeta de track, p. ej. "Ver charlas".',
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'quote',
      title: 'Cita',
      type: 'quote',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sponsors',
      title: 'Sección de sponsors',
      type: 'object',
      description: 'Los tiles muestran los primeros cuatro sponsors de pago, por nivel.',
      options: section,
      fields: [
        eyebrowField,
        titleField,
        defineField({
          name: 'link',
          title: 'Enlace',
          type: 'link',
          description: 'Texto enlazado bajo los tiles, p. ej. "Conoce los paquetes de patrocinio".',
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
  ],
})
