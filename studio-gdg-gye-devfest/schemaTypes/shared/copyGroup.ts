import {defineField} from 'sanity'
import {PLACEHOLDER_HINT} from './textFields'

/** [field name, Studio title, optional help]. Names ending in "Lead", "Note" or "Text" get a textarea. */
type CopyField = [name: string, title: string, description?: string]

const LONG = /(lead|note|text|body|confirm)$/i

/**
 * A collapsible group of required interface strings: form labels, buttons and messages of the
 * account pages. Keeps those schemas a list of labels instead of a wall of defineField calls.
 */
export function copyGroup(name: string, title: string, fields: CopyField[], description?: string) {
  return defineField({
    name,
    title,
    type: 'object',
    description,
    options: {collapsible: true, collapsed: true},
    validation: (rule) => rule.required(),
    fields: fields.map(([field, fieldTitle, help]) =>
      defineField({
        name: field,
        title: fieldTitle,
        ...(LONG.test(field) ? {type: 'text', rows: 2} : {type: 'string'}),
        description: help ?? PLACEHOLDER_HINT,
        validation: (rule) => rule.required(),
      }),
    ),
  })
}
