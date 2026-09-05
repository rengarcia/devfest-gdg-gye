import {defineArrayMember, defineField, defineType} from 'sanity'
import {CogIcon} from '@sanity/icons/Cog'
import {PLACEHOLDER_HINT} from '../shared/textFields'

/** Singleton (document id "siteSettings"), managed from the Studio structure. */
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Configuración del sitio',
  type: 'document',
  icon: CogIcon,
  fieldsets: [
    {name: 'event', title: 'Evento', options: {collapsible: true, collapsed: false}},
    {name: 'contact', title: 'Contacto y enlaces', options: {collapsible: true, collapsed: false}},
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre del evento',
      type: 'string',
      fieldset: 'event',
      initialValue: 'DevFest Guayaquil',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'Edición (año)',
      type: 'number',
      fieldset: 'event',
      validation: (rule) => rule.required().integer().min(2016),
    }),
    defineField({
      name: 'date',
      title: 'Fecha',
      type: 'date',
      fieldset: 'event',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'venue',
      title: 'Sede',
      type: 'string',
      fieldset: 'event',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'capacity',
      title: 'Cupo',
      type: 'number',
      fieldset: 'event',
      validation: (rule) => rule.required().integer().positive(),
    }),
    defineField({
      name: 'registerUrl',
      title: 'Enlace de registro',
      type: 'url',
      fieldset: 'contact',
      description: 'Déjalo vacío mientras no exista el formulario: el botón queda como marcador.',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'email',
      title: 'Correo de contacto',
      type: 'string',
      fieldset: 'contact',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'sponsorsEmail',
      title: 'Correo para sponsors',
      type: 'string',
      fieldset: 'contact',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'communityUrl',
      title: 'Página de la comunidad',
      type: 'url',
      fieldset: 'contact',
      description: 'P. ej. https://gdg.community.dev/guayaquil',
      validation: (rule) => rule.required().uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'handle',
      title: 'Usuario en redes',
      type: 'string',
      fieldset: 'contact',
      description: 'P. ej. @gdgguayaquil',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'socialUrl',
      title: 'Enlace del perfil en redes',
      type: 'url',
      fieldset: 'contact',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'navigation',
      title: 'Menú principal',
      type: 'array',
      description:
        'Enlaces de la cabecera, en orden. Las rutas del sitio son /, /agenda, /speakers, /sponsors, /nosotros, /organizadores y /faq.',
      of: [defineArrayMember({type: 'link'})],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'registerCta',
      title: 'Bloque de registro',
      type: 'object',
      description:
        'Cierra todas las páginas; cada página puede sobrescribir partes desde su propio documento. El botón principal enlaza al Enlace de registro.',
      options: {collapsible: true, collapsed: true},
      fields: [
        defineField({
          name: 'eyebrow',
          title: 'Antetítulo',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'title',
          title: 'Título',
          type: 'string',
          description: PLACEHOLDER_HINT,
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'lead',
          title: 'Entradilla',
          type: 'text',
          rows: 2,
          description: PLACEHOLDER_HINT,
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'primaryLabel',
          title: 'Texto del botón de registro',
          type: 'string',
          description: 'También es el botón de la cabecera.',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'secondary',
          title: 'Botón secundario',
          type: 'link',
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'footer',
      title: 'Pie de página',
      type: 'object',
      description:
        'La columna de contacto se arma sola con la página de la comunidad, el perfil en redes y el correo.',
      options: {collapsible: true, collapsed: true},
      fields: [
        defineField({
          name: 'columns',
          title: 'Columnas de enlaces',
          type: 'array',
          of: [
            defineArrayMember({
              name: 'footerColumn',
              title: 'Columna',
              type: 'object',
              fields: [
                defineField({
                  name: 'heading',
                  title: 'Encabezado',
                  type: 'string',
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: 'links',
                  title: 'Enlaces',
                  type: 'array',
                  of: [defineArrayMember({type: 'link'})],
                  validation: (rule) => rule.required().min(1),
                }),
              ],
              preview: {select: {title: 'heading'}},
            }),
          ],
          validation: (rule) => rule.required().max(2),
        }),
        defineField({
          name: 'followHeading',
          title: 'Encabezado de contacto',
          type: 'string',
          description: 'P. ej. "Síguenos".',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'tagline',
          title: 'Línea legal',
          type: 'text',
          rows: 2,
          description: 'Texto en monoespaciada al pie, junto al logo de GDG.',
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare: () => ({title: 'Configuración del sitio'}),
  },
})
