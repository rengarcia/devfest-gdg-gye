import {defineField, defineType} from 'sanity'
import {SearchIcon} from '@sanity/icons/Search'

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  icon: SearchIcon,
  options: {collapsible: true, collapsed: true},
  fields: [
    defineField({
      name: 'title',
      title: 'Título de la pestaña',
      type: 'string',
      description: 'Nombre de la página. El sitio añade " · DevFest Guayaquil 2026" detrás.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Descripción',
      type: 'text',
      rows: 2,
      description: 'Meta description para buscadores y previsualizaciones en redes.',
      validation: (rule) => [
        rule.required(),
        rule.max(160).warning('Los buscadores suelen cortar a partir de 160 caracteres.'),
      ],
    }),
  ],
})
