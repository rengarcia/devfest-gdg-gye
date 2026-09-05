import {defineField, type SortOrdering} from 'sanity'

export const orderField = defineField({
  name: 'order',
  title: 'Orden',
  type: 'number',
  description: 'Posición en la lista. Los documentos sin orden van al final.',
  validation: (rule) => rule.integer().min(0),
})

/** Studio list ordering that matches how the site sorts these documents. */
export const orderByOrder: SortOrdering = {
  title: 'Orden',
  name: 'orderAsc',
  by: [{field: 'order', direction: 'asc'}],
}
