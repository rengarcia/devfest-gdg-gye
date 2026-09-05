import {defineArrayMember, defineField} from 'sanity'
import {InfoOutlineIcon} from '@sanity/icons/InfoOutline'
import {glyphField} from '../shared/glyphField'
import {definePage} from '../shared/pageType'
import {PLACEHOLDER_HINT, eyebrowField, leadField, titleField} from '../shared/textFields'

const section = {collapsible: true, collapsed: false}

export const aboutPage = definePage({
  name: 'aboutPage',
  title: 'Nosotros',
  icon: InfoOutlineIcon,
  fields: [
    defineField({
      name: 'hero',
      title: 'Cabecera',
      type: 'pageHero',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'intro',
      title: 'Qué es DevFest',
      type: 'object',
      options: section,
      fields: [
        defineField({
          name: 'figure',
          title: 'Foto',
          type: 'figure',
          validation: (rule) => rule.required(),
        }),
        titleField,
        leadField,
        defineField({
          name: 'body',
          title: 'Párrafo',
          type: 'text',
          rows: 3,
          description: PLACEHOLDER_HINT,
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'principles',
      title: 'Principios',
      type: 'object',
      options: section,
      fields: [
        eyebrowField,
        titleField,
        defineField({
          name: 'items',
          title: 'Tarjetas',
          type: 'array',
          of: [
            defineArrayMember({
              name: 'principle',
              title: 'Principio',
              type: 'object',
              fields: [
                glyphField('Glyph decorativo sobre el título de la tarjeta.'),
                titleField,
                defineField({
                  name: 'text',
                  title: 'Texto',
                  type: 'text',
                  rows: 3,
                  validation: (rule) => rule.required(),
                }),
              ],
              preview: {select: {title: 'title', subtitle: 'text'}},
            }),
          ],
          validation: (rule) => rule.required().min(1).max(3),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'history',
      title: 'Trayectoria',
      type: 'object',
      options: section,
      fields: [
        defineField({
          name: 'quote',
          title: 'Cita',
          type: 'quote',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'stats',
          title: 'Cifras',
          type: 'array',
          of: [defineArrayMember({type: 'stat'})],
          validation: (rule) => rule.required().max(3),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'venue',
      title: 'Sede',
      type: 'object',
      options: section,
      fields: [
        eyebrowField,
        titleField,
        leadField,
        defineField({
          name: 'link',
          title: 'Enlace',
          type: 'link',
          description: 'Botón "Cómo llegar". Deja "#" mientras no haya mapa.',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'mapNote',
          title: 'Texto del mapa',
          type: 'string',
          description: 'Se muestra en el recuadro del mapa mientras no se publique uno.',
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
  ],
})
