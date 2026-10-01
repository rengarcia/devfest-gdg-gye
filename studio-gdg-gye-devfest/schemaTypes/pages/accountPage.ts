import {defineArrayMember, defineField} from 'sanity'
import {UserIcon} from '@sanity/icons/User'
import {copyGroup} from '../shared/copyGroup'
import {definePage} from '../shared/pageType'
import {PLACEHOLDER_HINT} from '../shared/textFields'

/** Purposes the database knows (public.purposes in ../../../supabase). A new one needs a row there too. */
const PURPOSES = [
  {title: 'Cuenta y certificados (obligatoria)', value: 'account'},
  {title: 'Nombre en la verificación pública', value: 'public_verification'},
  {title: 'Sorteos', value: 'giveaways'},
  {title: 'Juego interactivo', value: 'game'},
]

/**
 * /cuenta: sign-in with an email code, registration with the privacy notice and one consent per
 * purpose, and the attendee's dashboard (QR, certificates, privacy controls). The organizers'
 * check-in screen (/cuenta/checkin) reads its copy from `staff`.
 */
export const accountPage = definePage({
  name: 'accountPage',
  title: 'Mi cuenta',
  icon: UserIcon,
  withCta: false,
  fields: [
    defineField({
      name: 'hero',
      title: 'Cabecera',
      type: 'pageHero',
      validation: (rule) => rule.required(),
    }),
    copyGroup('signIn', 'Paso 1: correo', [
      ['title', 'Título'],
      ['lead', 'Entradilla'],
      ['emailLabel', 'Etiqueta del correo'],
      ['submitLabel', 'Botón'],
      [
        'note',
        'Nota de privacidad',
        'Debajo del botón. Explica para qué se usa el correo antes de enviarlo; el enlace al aviso se añade solo.',
      ],
    ]),
    copyGroup('code', 'Paso 2: código', [
      ['title', 'Título'],
      ['lead', 'Entradilla', 'El correo de la persona se muestra debajo.'],
      ['codeLabel', 'Etiqueta del código'],
      ['submitLabel', 'Botón'],
      ['resendLabel', 'Reenviar código'],
      ['changeEmailLabel', 'Usar otro correo'],
    ]),
    copyGroup('register', 'Paso 3: registro', [
      ['title', 'Título'],
      ['lead', 'Entradilla'],
      ['firstNameLabel', 'Etiqueta del nombre'],
      ['lastNameLabel', 'Etiqueta del apellido'],
      ['noticeTitle', 'Título del aviso'],
      ['ageLabel', 'Casilla de edad', 'P. ej. "Tengo 15 años o más". Es obligatoria.'],
      ['submitLabel', 'Botón'],
    ]),
    defineField({
      name: 'notice',
      title: 'Aviso de privacidad resumido',
      type: 'array',
      description:
        'Puntos que se leen antes de aceptar: responsable, finalidades, base legal, conservación, transferencias y derechos. El aviso completo está en Aviso de privacidad. ' +
        PLACEHOLDER_HINT,
      of: [defineArrayMember({type: 'text', rows: 2})],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'purposes',
      title: 'Finalidades',
      type: 'array',
      description:
        'Una casilla por finalidad, sin marcar por defecto. Solo se muestran las activas en la base de datos.',
      of: [
        defineArrayMember({
          name: 'purposeCopy',
          title: 'Finalidad',
          type: 'object',
          fields: [
            defineField({
              name: 'key',
              title: 'Finalidad',
              type: 'string',
              options: {list: PURPOSES},
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'label',
              title: 'Texto de la casilla',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Detalle',
              type: 'text',
              rows: 2,
              description: PLACEHOLDER_HINT,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {select: {title: 'label', subtitle: 'key'}},
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    copyGroup('dashboard', 'Panel', [
      ['greeting', 'Saludo', 'Va antes del nombre, p. ej. "Hola,".'],
      ['signOutLabel', 'Cerrar sesión'],
      ['qrTitle', 'Título del QR'],
      ['qrLead', 'Texto del QR'],
      ['certificatesTitle', 'Título de certificados'],
      ['certificatesLead', 'Texto de certificados'],
      [
        'certificatesEmptyText',
        'Sin certificados',
        'Antes del evento o si aún no se registró la asistencia.',
      ],
      ['downloadLabel', 'Descargar certificado'],
      ['verifyLabel', 'Enlace de verificación'],
      ['profileTitle', 'Título de datos personales'],
      ['saveLabel', 'Guardar'],
      ['savedText', 'Mensaje de guardado'],
    ]),
    copyGroup('privacy', 'Privacidad en el panel', [
      ['title', 'Título'],
      ['lead', 'Entradilla'],
      ['purposesTitle', 'Título de finalidades opcionales'],
      ['exportLabel', 'Descargar mis datos'],
      ['exportNote', 'Detalle de la descarga'],
      ['deleteLabel', 'Eliminar mi cuenta'],
      ['deleteConfirm', 'Confirmación', 'Se pide confirmar antes de borrar.'],
      ['deletedText', 'Cuenta eliminada'],
      ['otherRequestsNote', 'Otras solicitudes'],
    ]),
    copyGroup(
      'reconsent',
      'Nueva versión del aviso',
      [
        ['title', 'Título'],
        ['lead', 'Entradilla'],
        ['acceptLabel', 'Aceptar'],
      ],
      'Se muestra cuando la versión del Aviso de privacidad cambió desde que la persona aceptó.',
    ),
    copyGroup('errors', 'Mensajes de error', [
      ['genericText', 'Error genérico'],
      ['invalidEmail', 'Correo no válido'],
      ['invalidCode', 'Código incorrecto o vencido'],
      ['rateLimitedText', 'Demasiados intentos'],
      ['requiredText', 'Faltan campos o la casilla obligatoria'],
    ]),
    copyGroup(
      'staff',
      'Check-in (organizadores)',
      [
        ['title', 'Título'],
        ['lead', 'Entradilla'],
        ['forbiddenText', 'Sin permiso', 'Para quien entra sin ser organizador.'],
        ['scanLabel', 'Activar cámara'],
        ['stopLabel', 'Detener cámara'],
        ['emailLabel', 'Buscar por correo'],
        ['emailSubmitLabel', 'Registrar por correo'],
        ['checkedInText', 'Asistencia registrada'],
        ['alreadyText', 'Ya estaba registrada'],
        ['notFoundText', 'Código o correo sin cuenta'],
        ['importTitle', 'Título de importación'],
        ['importLead', 'Texto de importación'],
        ['importLabel', 'Etiqueta de la lista'],
        ['importSubmitLabel', 'Importar'],
        [
          'importResultText',
          'Resultado',
          'Va antes de los números: registradas, ya estaban, sin cuenta.',
        ],
        ['unmatchedTitle', 'Correos sin cuenta'],
      ],
      'Pantalla /cuenta/checkin. Solo funciona para cuentas marcadas como staff en la base de datos.',
    ),
  ],
})
