import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {SINGLETONS, structure} from './structure'

export default defineConfig({
  name: 'default',
  title: 'gdg-gye-devfest',

  projectId: 'l2u3btbc',
  dataset: 'production',

  plugins: [structureTool({structure}), visionTool()],

  schema: {
    types: schemaTypes,
    // Singletons are opened from the structure, never created from the "new document" menu.
    templates: (templates) => templates.filter((t) => !SINGLETONS.includes(t.schemaType)),
  },

  document: {
    // Singletons cannot be duplicated, unpublished or deleted.
    actions: (actions, {schemaType}) =>
      SINGLETONS.includes(schemaType)
        ? actions.filter(({action}) => !['duplicate', 'unpublish', 'delete'].includes(action ?? ''))
        : actions,
  },
})
