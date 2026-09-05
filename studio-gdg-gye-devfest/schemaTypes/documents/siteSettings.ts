import {defineArrayMember, defineField, defineType} from 'sanity'
import {CogIcon} from '@sanity/icons/Cog'

/** Singleton (document id "siteSettings"), managed from the Studio structure. */
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Configuración del sitio',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre del evento',
      type: 'string',
      initialValue: 'DevFest Guayaquil',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'Edición (año)',
      type: 'number',
      validation: (rule) => rule.required().integer().min(2016),
    }),
    defineField({
      name: 'date',
      title: 'Fecha',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'venue',
      title: 'Sede',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'capacity',
      title: 'Cupo',
      type: 'number',
      validation: (rule) => rule.required().integer().positive(),
    }),
    defineField({
      name: 'registerUrl',
      title: 'Enlace de registro',
      type: 'url',
      description: 'Déjalo vacío mientras no exista el formulario: el botón queda como marcador.',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'email',
      title: 'Correo de contacto',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'sponsorsEmail',
      title: 'Correo para sponsors',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'communityUrl',
      title: 'Página de la comunidad',
      type: 'url',
      description: 'P. ej. https://gdg.community.dev/guayaquil',
      validation: (rule) => rule.required().uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'handle',
      title: 'Usuario en redes',
      type: 'string',
      description: 'P. ej. @gdgguayaquil',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'socialUrl',
      title: 'Enlace del perfil en redes',
      type: 'url',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'featuredSpeakers',
      title: 'Speakers destacados',
      type: 'array',
      description: 'Las tres tarjetas de la portada, en orden.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'speaker'}]})],
      validation: (rule) => rule.max(3).unique(),
    }),
  ],
  preview: {
    prepare: () => ({title: 'Configuración del sitio'}),
  },
})
