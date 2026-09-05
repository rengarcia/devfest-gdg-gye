import {defineField} from 'sanity'
import {MicrophoneIcon} from '@sanity/icons/Microphone'
import {definePage} from '../shared/pageType'
import {eyebrowField, leadField, titleField} from '../shared/textFields'

export const speakersPage = definePage({
  name: 'speakersPage',
  title: 'Speakers',
  icon: MicrophoneIcon,
  fields: [
    defineField({
      name: 'hero',
      title: 'Cabecera',
      type: 'pageHero',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'cfp',
      title: 'Call for papers',
      type: 'object',
      options: {collapsible: true, collapsed: false},
      fields: [
        eyebrowField,
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
          name: 'note',
          title: 'Nota',
          type: 'string',
          description:
            'Línea en monoespaciada bajo los botones, p. ej. la fecha de cierre del CFP.',
        }),
        defineField({
          name: 'figure',
          title: 'Foto',
          type: 'figure',
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
  ],
})
