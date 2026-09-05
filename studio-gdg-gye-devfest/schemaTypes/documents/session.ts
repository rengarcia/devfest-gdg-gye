import {defineField, defineType} from 'sanity'
import {CalendarIcon} from '@sanity/icons/Calendar'
import {orderField} from '../shared/orderField'

const KINDS = [
  {title: 'Charla', value: 'talk'},
  {title: 'Workshop', value: 'workshop'},
  {title: 'Keynote', value: 'keynote'},
  {title: 'Panel', value: 'panel'},
  {title: 'Pausa', value: 'break'},
]

/** Sessions everyone attends: they show up in every track tab and have no track of their own. */
const PLENARY = ['keynote', 'panel', 'break']

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/

export const session = defineType({
  name: 'session',
  title: 'Sesión',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'kind',
      title: 'Tipo',
      type: 'string',
      options: {list: KINDS, layout: 'radio', direction: 'horizontal'},
      initialValue: 'talk',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'startTime',
      title: 'Inicio',
      type: 'string',
      description: 'Formato HH:MM, p. ej. 10:15.',
      validation: (rule) =>
        rule.required().regex(TIME, {name: 'hora', invert: false}).error('Usa el formato HH:MM.'),
    }),
    defineField({
      name: 'endTime',
      title: 'Fin',
      type: 'string',
      description: 'Formato HH:MM, p. ej. 11:00.',
      validation: (rule) =>
        rule
          .required()
          .regex(TIME, {name: 'hora', invert: false})
          .error('Usa el formato HH:MM.')
          .custom((endTime, context) => {
            const startTime = context.document?.startTime
            if (typeof startTime === 'string' && endTime && endTime <= startTime) {
              return 'Debe ser posterior a la hora de inicio.'
            }
            return true
          }),
    }),
    defineField({
      name: 'track',
      title: 'Track',
      type: 'reference',
      to: [{type: 'track'}],
      hidden: ({document}) => PLENARY.includes(String(document?.kind)),
      validation: (rule) =>
        rule.custom((value, context) => {
          const kind = String(context.document?.kind)
          if (!PLENARY.includes(kind) && !value)
            return 'Las charlas y workshops necesitan un track.'
          return true
        }),
    }),
    defineField({
      name: 'speaker',
      title: 'Speaker',
      type: 'reference',
      to: [{type: 'speaker'}],
      description: 'Si se deja vacío, la agenda muestra "Speaker por confirmar".',
      hidden: ({document}) => document?.kind === 'break',
    }),
    defineField({
      name: 'room',
      title: 'Sala',
      type: 'string',
      description:
        'Si se deja vacío se usa la sala del track. Las sesiones plenarias (keynote, panel) la indican aquí.',
    }),
    {
      ...orderField,
      description: 'Desempate cuando dos sesiones empiezan a la misma hora.',
    },
  ],
  orderings: [
    {title: 'Hora de inicio', name: 'startTimeAsc', by: [{field: 'startTime', direction: 'asc'}]},
  ],
  preview: {
    select: {
      title: 'title',
      startTime: 'startTime',
      endTime: 'endTime',
      track: 'track.name',
      kind: 'kind',
    },
    prepare({title, startTime, endTime, track, kind}) {
      const label = track ?? KINDS.find((k) => k.value === kind)?.title
      return {title, subtitle: [`${startTime} – ${endTime}`, label].filter(Boolean).join(' · ')}
    },
  },
})
