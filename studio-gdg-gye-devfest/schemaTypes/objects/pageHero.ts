import {defineType} from 'sanity'
import {PresentationIcon} from '@sanity/icons/Presentation'
import {glyphsField} from '../shared/glyphField'
import {eyebrowField, leadField, titleField} from '../shared/textFields'

/** Inner-page hero: eyebrow, display title, lead and up to three floating glyphs. */
export const pageHero = defineType({
  name: 'pageHero',
  title: 'Cabecera',
  type: 'object',
  icon: PresentationIcon,
  options: {collapsible: true, collapsed: false},
  fields: [
    eyebrowField,
    titleField,
    leadField,
    glyphsField('Hasta tres glyphs del kit que flotan junto al título. Solo decoración.'),
  ],
})
