import {defineField} from 'sanity'
import {CheckmarkCircleIcon} from '@sanity/icons/CheckmarkCircle'
import {copyGroup} from '../shared/copyGroup'
import {definePage} from '../shared/pageType'

/** /verificar: anyone can check a certificate code. The holder's name only shows with consent. */
export const verifyPage = definePage({
  name: 'verifyPage',
  title: 'Verificar certificado',
  icon: CheckmarkCircleIcon,
  withCta: false,
  fields: [
    defineField({
      name: 'hero',
      title: 'Cabecera',
      type: 'pageHero',
      validation: (rule) => rule.required(),
    }),
    copyGroup('form', 'Formulario', [
      ['codeLabel', 'Etiqueta del código'],
      ['submitLabel', 'Botón'],
    ]),
    copyGroup('result', 'Resultado', [
      ['validTitle', 'Certificado válido'],
      ['holderLabel', 'Etiqueta del titular'],
      ['hiddenHolderText', 'Titular oculto', 'Cuando la persona no autorizó mostrar su nombre.'],
      ['eventLabel', 'Etiqueta del evento'],
      ['issuedLabel', 'Etiqueta de la fecha de emisión'],
      ['invalidTitle', 'Certificado no encontrado'],
      ['invalidText', 'Detalle de no encontrado'],
    ]),
  ],
})
