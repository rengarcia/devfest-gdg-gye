import {defineField, defineType} from 'sanity'
import {ChartUpwardIcon} from '@sanity/icons/ChartUpward'

/** A big number with a mono label, as in the stats strips. */
export const stat = defineType({
  name: 'stat',
  title: 'Cifra',
  type: 'object',
  icon: ChartUpwardIcon,
  fields: [
    defineField({
      name: 'value',
      title: 'Valor',
      type: 'string',
      description:
        'Un número entero (500, 24) se anima al aparecer en pantalla. Cualquier otro texto ("4 h") se muestra tal cual.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'suffix',
      title: 'Sufijo',
      type: 'string',
      description: 'Se añade tras el valor, p. ej. "+" para mostrar 24+.',
    }),
    defineField({
      name: 'label',
      title: 'Etiqueta',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {value: 'value', suffix: 'suffix', label: 'label'},
    prepare: ({value, suffix, label}) => ({
      title: `${value ?? ''}${suffix ?? ''}`,
      subtitle: label,
    }),
  },
})
