import {defineField} from 'sanity'

/** Colour families from the DevFest brand kit. One accent per page, card or chip. */
export const FAMILIES = [
  {title: 'Amarillo', value: 'yellow'},
  {title: 'Azul', value: 'blue'},
  {title: 'Verde', value: 'green'},
  {title: 'Rojo', value: 'red'},
]

export const familyField = defineField({
  name: 'family',
  title: 'Familia de color',
  type: 'string',
  description: 'Acento del kit DevFest que usa esta tarjeta o chip.',
  options: {list: FAMILIES, layout: 'radio', direction: 'horizontal'},
  validation: (rule) => rule.required(),
})
