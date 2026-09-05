import {defineField} from 'sanity'

/**
 * Texts from the page documents can embed values from the site settings, so a change of date or
 * capacity does not have to be chased through every page. The site replaces them at build time
 * (see gdg-gye-devfest-fe/src/sanity/content.ts).
 */
export const PLACEHOLDERS = [
  'name',
  'year',
  'title',
  'dateShort',
  'dateLong',
  'venue',
  'capacity',
  'email',
  'sponsorsEmail',
  'handle',
] as const

export const PLACEHOLDER_HINT =
  'Admite marcadores que se rellenan desde la Configuración del sitio: ' +
  PLACEHOLDERS.map((p) => `{{${p}}}`).join(', ') +
  ' ({{title}} es nombre y año, {{dateShort}} "5 de diciembre, 2026").'

/** Short mono line above a title, e.g. "Speakers". */
export const eyebrowField = defineField({
  name: 'eyebrow',
  title: 'Antetítulo',
  type: 'string',
  description: 'Línea corta en monoespaciada sobre el título, p. ej. "Speakers".',
  validation: (rule) => rule.required(),
})

export const titleField = defineField({
  name: 'title',
  title: 'Título',
  type: 'string',
  description: PLACEHOLDER_HINT,
  validation: (rule) => rule.required(),
})

export const leadField = defineField({
  name: 'lead',
  title: 'Entradilla',
  type: 'text',
  rows: 3,
  description: PLACEHOLDER_HINT,
  validation: (rule) => rule.required(),
})
