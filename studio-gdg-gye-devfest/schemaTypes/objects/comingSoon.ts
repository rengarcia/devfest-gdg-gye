import {defineField, defineType} from 'sanity'
import {ClockIcon} from '@sanity/icons/Clock'
import {leadField, titleField} from '../shared/textFields'

/**
 * What the agenda, speakers and sponsors pages say while the section is turned off in the site
 * settings ("Secciones publicadas"): it takes the place of the hero's title and lead.
 */
export const comingSoon = defineType({
  name: 'comingSoon',
  title: 'Próximamente',
  type: 'object',
  icon: ClockIcon,
  options: {collapsible: true, collapsed: true},
  fields: [
    titleField,
    leadField,
    defineField({
      name: 'link',
      title: 'Botón',
      type: 'link',
      description: 'Opcional, p. ej. hacia el Call for papers (#cfp en la página de speakers).',
    }),
  ],
})

/** The field the three pages add, described the same way in each. */
export const comingSoonField = defineField({
  name: 'comingSoon',
  title: 'Próximamente',
  type: 'comingSoon',
  description:
    'Mientras la sección está apagada en la Configuración del sitio (Secciones publicadas), este título y entradilla sustituyen a los de la cabecera y no se muestra el contenido.',
  validation: (rule) => rule.required(),
})
