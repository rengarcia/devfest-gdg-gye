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
      description:
        'Nombre de la página. El sitio añade " · DevFest Guayaquil 2026" detrás, salvo que el título ya lo incluya (p. ej. el de Inicio, "{{title}} · ..."). Apunta a menos de 60 caracteres en total.',
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
    defineField({
      name: 'image',
      title: 'Imagen para redes',
      type: 'image',
      description:
        'Previsualización al compartir el enlace (WhatsApp, LinkedIn, X). Se recorta a 1200×630. Vacío: se usa la de la Configuración del sitio.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Texto alternativo',
          type: 'string',
          description: 'Describe la imagen.',
        }),
      ],
    }),
  ],
})
