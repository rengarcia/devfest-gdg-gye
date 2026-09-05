import {defineField, defineType} from 'sanity'
import {ImageIcon} from '@sanity/icons/Image'
import {PLACEHOLDER_HINT} from '../shared/textFields'

/** Photo in a notch card, with the small chip in its corner. */
export const figure = defineType({
  name: 'figure',
  title: 'Foto',
  type: 'object',
  icon: ImageIcon,
  options: {collapsible: true, collapsed: false},
  fields: [
    defineField({
      name: 'image',
      title: 'Imagen',
      type: 'image',
      description: 'Se recorta en cuadrado; ajusta el punto de interés para elegir qué se ve.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Texto alternativo',
          type: 'string',
          description:
            'Describe la foto para lectores de pantalla. Déjalo vacío si es solo decorativa.',
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tag',
      title: 'Etiqueta',
      type: 'string',
      description: 'Chip en la esquina de la foto, p. ej. "2025" o "CFP". ' + PLACEHOLDER_HINT,
    }),
  ],
  preview: {
    select: {media: 'image', title: 'tag', subtitle: 'image.alt'},
  },
})
