/**
 * The page singletons and the site chrome (menu, register block, footer), with the copy that used
 * to be hardcoded in gdg-gye-devfest-fe/src/pages and components. Shared by `npm run seed` (fresh
 * dataset) and `npm run seed:pages` (dataset that already has the collections).
 */
import {createReadStream} from 'node:fs'
import path from 'node:path'
import type {SanityClient} from 'sanity'

/** The site's static photos; the seed uploads them once and points the figures at the assets. */
const ASSETS = path.resolve(process.cwd(), '../gdg-gye-devfest-fe/public/assets')

const ref = (id: string) => ({_type: 'reference' as const, _ref: id})
const key = () => crypto.randomUUID().slice(0, 12)
const link = (label: string, href: string) => ({_type: 'link' as const, label, href})
const stat = (value: string, label: string, suffix?: string) => ({
  _type: 'stat' as const,
  _key: key(),
  value,
  label,
  ...(suffix ? {suffix} : {}),
})

type ImageValue = {_type: 'image'; asset: {_type: 'reference'; _ref: string}}

const figure = (image: ImageValue, tag: string, alt?: string) => ({
  _type: 'figure' as const,
  image: {...image, ...(alt ? {alt} : {})},
  tag,
})

/** Uploads a photo from public/assets unless the dataset already has one with that file name. */
async function uploadImage(client: SanityClient, filename: string): Promise<ImageValue> {
  const existing = await client.fetch<string | null>(
    '*[_type == "sanity.imageAsset" && originalFilename == $filename][0]._id',
    {filename},
  )
  const id =
    existing ??
    (await client.assets.upload('image', createReadStream(path.join(ASSETS, filename)), {filename}))
      ._id
  return {_type: 'image', asset: ref(id)}
}

/* Site chrome (siteSettings) ------------------------------------------------------------------- */

const PRIVACY_LINK = link('Aviso de privacidad', '/privacidad')

export const SITE_CHROME = {
  registerUrl: '/cuenta',
  controllerName: 'GDG Guayaquil',
  navigation: [
    link('Inicio', '/'),
    link('Agenda', '/agenda'),
    link('Speakers', '/speakers'),
    link('Sponsors', '/sponsors'),
    link('Nosotros', '/nosotros'),
    link('Organizadores', '/organizadores'),
    link('FAQ', '/faq'),
  ].map((l) => ({_key: key(), ...l})),
  registerCta: {
    eyebrow: 'Registro',
    title: 'Reserva tu lugar en {{title}}',
    lead: 'Cupos limitados a {{capacity}} asistentes. La entrada es gratuita y requiere registro previo.',
    primaryLabel: 'Regístrate',
    accountLabel: 'Mi cuenta',
    secondary: link('Ver agenda', '/agenda'),
  },
  footer: {
    columns: [
      {
        _type: 'footerColumn',
        _key: key(),
        heading: 'Evento',
        links: [
          link('Agenda', '/agenda'),
          link('Speakers', '/speakers'),
          link('Sponsors', '/sponsors'),
          link('FAQ', '/faq'),
        ].map((l) => ({_key: key(), ...l})),
      },
      {
        _type: 'footerColumn',
        _key: key(),
        heading: 'Comunidad',
        links: [
          link('Nosotros', '/nosotros'),
          link('Organizadores', '/organizadores'),
          link('Código de conducta', '/faq#conducta'),
          PRIVACY_LINK,
        ].map((l) => ({_key: key(), ...l})),
      },
    ],
    followHeading: 'Síguenos',
    tagline: 'Organizado por voluntarios de GDG Guayaquil. DevFest es una marca de Google.',
  },
}

/* Pages ---------------------------------------------------------------------------------------- */

interface PageAssets {
  /** Speaker ids for the three cards on the home page. */
  featuredSpeakers: string[]
  stage: ImageValue
  portrait: ImageValue
}

/** A page singleton as sent to the Content Lake; its shape follows the schema in ../../schemaTypes/pages. */
type PageDocument = {_id: string; _type: string; [field: string]: unknown}

function pageDocuments({featuredSpeakers, stage, portrait}: PageAssets): PageDocument[] {
  return [
    {
      _id: 'homePage',
      _type: 'homePage',
      seo: {
        title: 'Inicio',
        description:
          'DevFest Guayaquil 2026, 5 de diciembre en ESPOL. Charlas, workshops y comunidad.',
      },
      family: 'yellow',
      hero: {
        chips: ['{{dateShort}}', 'ESPOL Campus', '{{capacity}} asistentes'],
        title: 'La comunidad developer de Guayaquil, un solo día.',
        lead: 'Charlas, workshops y networking con la gente que construye tecnología en Ecuador. Gratis, organizado por voluntarios de GDG Guayaquil.',
        primary: link('Regístrate', '#registro'),
        secondary: link('Ver agenda', '/agenda'),
        figure: figure(stage, '{{year}}'),
        glyphs: ['asterisk', 'plus-blue', 'half-circle-yellow'],
      },
      stats: [
        stat('500', 'asistentes'),
        stat('4', 'tracks: Web, Mobile, Cloud, AI'),
        stat('24', 'charlas y workshops', '+'),
        stat('1', 'día, 08:30 – 18:00'),
      ],
      speakers: {
        eyebrow: 'Speakers',
        title: 'Quienes suben al escenario',
        lead: 'Ingenieras, GDEs y founders de la región. Confirmamos speakers cada semana hasta el evento.',
        featured: featuredSpeakers.map((id) => ({_key: key(), ...ref(id)})),
        link: link('Todos los speakers', '/speakers'),
      },
      tracks: {
        eyebrow: 'Tracks',
        title: 'Cuatro salas, un campus',
        linkLabel: 'Ver charlas',
      },
      quote: {
        _type: 'quote',
        highlight: 'DevFest',
        text: 'es el día en que Guayaquil deja de ser una ciudad con developers y se convierte en una comunidad de developers.',
        attribution: 'Equipo organizador / GDG Guayaquil',
      },
      sponsors: {
        eyebrow: 'Sponsors',
        title: 'Con el apoyo de',
        link: link('Conoce los paquetes de patrocinio', '/sponsors'),
      },
    },
    {
      _id: 'agendaPage',
      _type: 'agendaPage',
      seo: {
        title: 'Agenda',
        description: 'Agenda de DevFest Guayaquil 2026: tracks Web, Mobile, Cloud y AI.',
      },
      family: 'green',
      hero: {
        _type: 'pageHero',
        eyebrow: 'Agenda',
        title: 'Un día, cuatro tracks, 24 sesiones.',
        lead: 'Sábado 5 de diciembre, 08:30 a 18:00. Todas las salas están en el Campus Gustavo Galindo de ESPOL. Puedes moverte entre tracks en cada bloque.',
        glyphs: ['slash-a', 'hash-green', 'dot-blue'],
      },
      footnote:
        'La agenda puede cambiar. Los horarios finales se publican una semana antes del evento.',
    },
    {
      _id: 'speakersPage',
      _type: 'speakersPage',
      seo: {title: 'Speakers', description: 'Speakers confirmados de DevFest Guayaquil 2026.'},
      family: 'blue',
      hero: {
        _type: 'pageHero',
        eyebrow: 'Speakers',
        title: 'Quienes suben al escenario',
        lead: 'Nueve speakers confirmados y contando. Publicamos nuevos nombres cada semana hasta el 5 de diciembre.',
        glyphs: ['braces', 'x-pink', 'comma-yellow'],
      },
      cfp: {
        eyebrow: 'Call for papers',
        title: '¿Tienes algo que contar?',
        lead: 'Buscamos charlas de 45 minutos y workshops de 90. Primera vez como speaker: te ayudamos a preparar la propuesta y a ensayar.',
        primary: link('Enviar propuesta', '#'),
        secondary: link('Leer los criterios', '/faq'),
        note: 'El CFP cierra el 15 de octubre de 2026',
        figure: figure(
          portrait,
          'CFP',
          'Speaker presentando en el escenario de un DevFest anterior',
        ),
      },
    },
    {
      _id: 'sponsorsPage',
      _type: 'sponsorsPage',
      seo: {title: 'Sponsors', description: 'Paquetes de patrocinio de DevFest Guayaquil 2026.'},
      family: 'blue',
      hero: {
        _type: 'pageHero',
        eyebrow: 'Sponsors',
        title: 'Las empresas que hacen posible el evento',
        lead: 'DevFest es gratis para {{capacity}} asistentes porque las empresas de la región lo respaldan. Así se ve ese apoyo.',
        glyphs: ['plus-blue', 'dot-red', 'half-circle-yellow'],
      },
      cta: {
        _type: 'cta',
        eyebrow: 'Patrocina',
        title: 'Pon tu marca frente a {{capacity}} developers',
        lead: 'Te enviamos el prospecto con precios y disponibilidad en menos de 48 horas.',
        primary: link('Pedir el prospecto', '#'),
        secondary: link('{{sponsorsEmail}}', 'mailto:{{sponsorsEmail}}'),
      },
    },
    {
      _id: 'aboutPage',
      _type: 'aboutPage',
      seo: {title: 'Nosotros', description: 'Qué es DevFest y quién es GDG Guayaquil.'},
      family: 'yellow',
      hero: {
        _type: 'pageHero',
        eyebrow: 'Nosotros',
        title: 'Un capítulo de GDG, una ciudad, un DevFest',
        lead: 'GDG Guayaquil es una comunidad de developers organizada por voluntarios. DevFest es nuestro evento más grande del año, y forma parte de una red de cientos de DevFests en el mundo.',
        glyphs: ['globe', 'heart', 'asterisk'],
      },
      intro: {
        figure: figure(stage, '2025', 'Audiencia en un DevFest anterior de GDG Guayaquil'),
        title: 'Qué es DevFest',
        lead: 'Es la conferencia anual que cada capítulo de Google Developer Groups organiza en su ciudad. Mismo nombre, misma marca, contenido 100% local: los speakers, los temas y el público son de aquí.',
        body: 'En Guayaquil lo hacemos desde 2016. Empezamos con 80 personas en un aula; en {{year}} esperamos {{capacity}} en el campus de ESPOL.',
      },
      principles: {
        eyebrow: 'Cómo trabajamos',
        title: 'Tres principios',
        items: [
          {
            glyph: 'dot-green',
            title: 'Gratis y abierto',
            text: 'Nadie se queda afuera por dinero. Las entradas son gratuitas y el código de conducta aplica para todos, speakers y sponsors incluidos.',
          },
          {
            glyph: 'dot-blue',
            title: 'Hecho por voluntarios',
            text: 'Nadie del equipo organizador cobra. Lo hacemos porque queremos que exista la comunidad que nos hubiera gustado tener al empezar.',
          },
          {
            glyph: 'dot-yellow',
            title: 'Contenido local',
            text: 'Priorizamos speakers que trabajan en Ecuador y problemas que resolvemos aquí: conectividad, pagos, datos públicos, equipos pequeños.',
          },
        ].map((p) => ({_type: 'principle', _key: key(), ...p})),
      },
      history: {
        quote: {
          _type: 'quote',
          highlight: 'Diez',
          text: 'ediciones, más de 3.000 asistentes acumulados y 140 speakers que dieron su primera charla con nosotros.',
        },
        stats: [
          stat('10', 'ediciones de DevFest'),
          stat('3000', 'asistentes acumulados', '+'),
          stat('140', 'speakers que debutaron aquí'),
        ],
      },
      venue: {
        eyebrow: 'Sede',
        title: 'ESPOL, Campus Gustavo Galindo',
        lead: 'Km 30.5 Vía Perimetral, Guayaquil. Auditorios A y B, aulas del bloque 15 y el laboratorio 3. Estacionamiento gratuito y parada de Metrovía a 5 minutos.',
        link: link('Cómo llegar', '#'),
        mapNote: 'Mapa del campus (por publicar)',
      },
    },
    {
      _id: 'organizersPage',
      _type: 'organizersPage',
      seo: {title: 'Organizadores', description: 'El equipo organizador de GDG Guayaquil.'},
      family: 'red',
      hero: {
        _type: 'pageHero',
        eyebrow: 'Organizadores',
        title: 'Las personas detrás de DevFest',
        lead: 'Ocho organizadores y unos 40 voluntarios el día del evento. Todos con trabajo de tiempo completo, todos sin cobrar.',
        glyphs: ['at', 'dot-red', 'braces'],
      },
      volunteering: {
        eyebrow: 'Voluntariado',
        title: 'Únete al equipo del 5 de diciembre',
        lead: 'Acreditación, salas, speakers, redes. Turnos de 4 horas, camiseta, almuerzo y acceso a todas las charlas fuera de tu turno.',
        primary: link('Quiero ser voluntario', '#'),
        secondary: link('Preguntas frecuentes', '/faq'),
        stats: [
          stat('40', 'voluntarios'),
          stat('4 h', 'por turno'),
          stat('6', 'equipos'),
          stat('1', 'briefing previo'),
        ],
      },
    },
    {
      _id: 'faqPage',
      _type: 'faqPage',
      seo: {title: 'FAQ', description: 'Preguntas frecuentes sobre DevFest Guayaquil 2026.'},
      family: 'green',
      hero: {
        _type: 'pageHero',
        eyebrow: 'FAQ',
        title: 'Preguntas frecuentes',
        lead: 'Si no encuentras la respuesta, escríbenos a {{email}}.',
        glyphs: ['semicolon', 'x-pink', 'dot-green'],
      },
      cta: {
        _type: 'cta',
        lead: '¿Ya resolviste tus dudas? Los cupos se agotan cada año antes de noviembre.',
      },
    },
    ...accountDocuments(),
  ]
}

/* Account, verification and privacy ------------------------------------------------------------ */

/**
 * Draft privacy notice for the attendee accounts, written against the LOPDP (Ecuador) and its
 * Reglamento. It must be reviewed by a lawyer before the accounts open to the public.
 */
const PRIVACY_SECTIONS: [heading: string, body: string][] = [
  [
    'Quién es responsable de tus datos',
    'El responsable del tratamiento es {{controller}}, comunidad organizadora de {{title}}. Para cualquier asunto sobre tus datos personales escríbenos a {{privacyEmail}}.',
  ],
  [
    'Qué datos tratamos',
    'Tu correo electrónico, tu nombre y tu apellido. Además, generamos y guardamos el código QR con el que registramos tu asistencia, la fecha y la forma en que se registró, los certificados emitidos a tu nombre y un historial de tus consentimientos (qué aceptaste, cuándo, con qué versión de este aviso y desde qué navegador).\n\nNo pedimos tu fecha de nacimiento: solo que declares tener 15 años o más. No tratamos datos sensibles.',
  ],
  [
    'Para qué los usamos y con qué base legal',
    'Con tu consentimiento, que nos das al crear la cuenta, usamos tus datos para darte acceso a tu cuenta, registrar tu asistencia al evento y emitir tu certificado de participación. Este consentimiento es necesario para tener cuenta.\n\nSolo si marcas la casilla correspondiente, mostramos tu nombre a quien verifique tu certificado en {{title}}. Sin ella, la verificación confirma que el certificado es auténtico sin mostrar tu nombre.\n\nSi en el futuro organizamos sorteos o un juego interactivo, te pediremos un consentimiento aparte antes de usar tus datos para eso. Nunca vendemos tus datos ni los usamos para publicidad.',
  ],
  [
    'Qué pasa si no nos los das',
    'Sin correo, nombre y apellido no podemos crear tu cuenta ni emitir tu certificado. Las casillas opcionales no cambian nada más: puedes asistir y recibir tu certificado sin marcarlas.',
  ],
  [
    'Cuánto tiempo los guardamos',
    'Mientras tengas la cuenta. Si no la usas durante 3 años, la eliminamos junto con todos sus datos. Si pides un código de acceso pero no completas el registro, borramos tu correo a los 7 días.',
  ],
  [
    'Con quién los compartimos y transferencias internacionales',
    'Tus datos se guardan con Supabase Inc. (Estados Unidos), que aloja nuestra base de datos en servidores de Amazon Web Services en São Paulo, Brasil, y envía los correos con tu código de acceso. Esto es una transferencia internacional de datos: Supabase actúa como encargado del tratamiento bajo un acuerdo de protección de datos que la obliga a tratarlos solo por nuestra cuenta y con medidas de seguridad.\n\nEl sitio web se publica en Vercel Inc. (Estados Unidos), que recibe datos técnicos de navegación como tu dirección IP, pero no los datos de tu cuenta. Las personas del equipo organizador solo ven tu nombre al registrar tu asistencia.',
  ],
  [
    'Tus derechos',
    'Tienes derecho a acceder a tus datos, rectificarlos y actualizarlos, eliminarlos, oponerte a su tratamiento, pedir su portabilidad, suspender su tratamiento y retirar tu consentimiento en cualquier momento, con la misma facilidad con que lo diste. No tomamos decisiones automatizadas sobre ti.\n\nDesde tu cuenta puedes descargar tus datos en un archivo, corregir tu nombre, cambiar las casillas opcionales y eliminar la cuenta. Para cualquier otra solicitud escríbenos a {{privacyEmail}}; respondemos en un máximo de 15 días.\n\nSi crees que no atendimos bien tu solicitud, puedes presentar un reclamo ante la Superintendencia de Protección de Datos Personales (spdp.gob.ec).',
  ],
  [
    'Menores de edad',
    'Puedes crear tu cuenta por tu cuenta desde los 15 años. Si tienes menos, tu representante legal puede escribirnos a {{privacyEmail}} para gestionar tu certificado.',
  ],
  [
    'Seguridad',
    'Entras con un código de un solo uso enviado a tu correo, sin contraseñas. Las conexiones van cifradas, cada persona solo puede leer sus propios datos y registramos qué organizador marcó cada asistencia. Si ocurriera una vulneración de seguridad que afecte tus datos, la notificaremos a la Superintendencia y a ti en los plazos que fija la ley.',
  ],
  [
    'Cambios en este aviso',
    'Si cambiamos algo que afecte a lo que aceptaste, actualizamos la versión de este aviso y te pedimos aceptarlo de nuevo la próxima vez que entres a tu cuenta.',
  ],
]

function accountDocuments(): PageDocument[] {
  return [
    {
      _id: 'accountPage',
      _type: 'accountPage',
      seo: {
        title: 'Mi cuenta',
        description:
          'Tu cuenta de {{title}}: código de acceso, certificado de participación y privacidad.',
      },
      family: 'blue',
      hero: {
        _type: 'pageHero',
        eyebrow: 'Mi cuenta',
        title: 'Tu lugar en {{title}}',
        lead: 'Crea tu cuenta con tu correo para recibir tu código de acceso al evento y, después, tu certificado de participación.',
        glyphs: ['at', 'dot-blue', 'braces'],
      },
      signIn: {
        title: 'Entra con tu correo',
        lead: 'Te enviamos un código de 6 dígitos. No necesitas contraseña.',
        emailLabel: 'Correo electrónico',
        submitLabel: 'Enviar código',
        note: 'Usamos tu correo solo para enviarte el código y, si creas tu cuenta, para tu certificado. Si no completas el registro, lo borramos en 7 días.',
      },
      code: {
        title: 'Revisa tu correo',
        lead: 'Escribe el código de 6 dígitos que enviamos a',
        codeLabel: 'Código',
        submitLabel: 'Entrar',
        resendLabel: 'Reenviar código',
        changeEmailLabel: 'Usar otro correo',
      },
      register: {
        title: 'Completa tu registro',
        lead: 'Tu nombre aparecerá tal cual en tu certificado.',
        firstNameLabel: 'Nombre',
        lastNameLabel: 'Apellido',
        noticeTitle: 'Antes de aceptar',
        ageLabel: 'Tengo 15 años o más',
        submitLabel: 'Crear mi cuenta',
      },
      notice: [
        'Responsable: {{controller}}. Contacto para tus datos: {{privacyEmail}}.',
        'Usamos tu correo, nombre y apellido para tu cuenta, para registrar tu asistencia y para emitir tu certificado. Base legal: tu consentimiento, que puedes retirar cuando quieras.',
        'Guardamos tus datos mientras tengas la cuenta; si no la usas en 3 años, la eliminamos.',
        'Se alojan con Supabase en servidores de São Paulo, Brasil: es una transferencia internacional de datos.',
        'Desde tu cuenta puedes descargar, corregir o eliminar tus datos. También puedes reclamar ante la Superintendencia de Protección de Datos Personales.',
      ],
      purposes: [
        {
          key: 'account',
          label:
            'Acepto el tratamiento de mis datos para crear mi cuenta, registrar mi asistencia y emitir mi certificado.',
          description: 'Obligatoria: sin ella no podemos darte una cuenta ni un certificado.',
        },
        {
          key: 'public_verification',
          label: 'Mostrar mi nombre cuando alguien verifique mi certificado.',
          description:
            'Opcional. Sin esta casilla, la verificación confirma que el certificado es auténtico sin mostrar tu nombre.',
        },
      ].map((p) => ({_type: 'purposeCopy', _key: key(), ...p})),
      dashboard: {
        greeting: 'Hola,',
        signOutLabel: 'Cerrar sesión',
        qrTitle: 'Tu código de acceso',
        qrLead:
          'Muéstralo en la entrada el {{dateShort}}. Así registramos tu asistencia para el certificado.',
        certificatesTitle: 'Certificados',
        certificatesLead: 'Cada certificado tiene un código que cualquiera puede verificar.',
        certificatesEmptyText:
          'Tu certificado aparecerá aquí después del evento, cuando hayamos registrado tu asistencia.',
        downloadLabel: 'Descargar PDF',
        verifyLabel: 'Enlace de verificación',
        profileTitle: 'Tus datos',
        saveLabel: 'Guardar cambios',
        savedText: 'Guardado.',
      },
      privacy: {
        title: 'Privacidad',
        lead: 'Tus datos son tuyos. Desde aquí puedes ejercer tus derechos sin escribirnos.',
        purposesTitle: 'Usos opcionales',
        exportLabel: 'Descargar mis datos',
        exportNote: 'Un archivo JSON con todo lo que guardamos sobre ti.',
        deleteLabel: 'Eliminar mi cuenta',
        deleteConfirm:
          'Se borrarán tu cuenta, tu asistencia y tus certificados, y no se pueden recuperar. ¿Eliminar tu cuenta?',
        deletedText: 'Eliminamos tu cuenta y todos tus datos.',
        otherRequestsNote: 'Para cualquier otra solicitud escribe a {{privacyEmail}}.',
      },
      reconsent: {
        title: 'Actualizamos el aviso de privacidad',
        lead: 'Revisa los cambios y acéptalos para seguir usando tu cuenta. Si no estás de acuerdo, puedes eliminarla.',
        acceptLabel: 'Aceptar y continuar',
      },
      errors: {
        genericText: 'Algo salió mal. Inténtalo de nuevo en un momento.',
        invalidEmail: 'Revisa el correo: no parece válido.',
        invalidCode: 'El código es incorrecto o ya venció. Pide uno nuevo.',
        rateLimitedText: 'Demasiados intentos. Espera un minuto y vuelve a probar.',
        requiredText: 'Completa tu nombre, tu apellido y las casillas obligatorias.',
      },
      staff: {
        title: 'Check-in',
        lead: 'Escanea el QR de cada asistente o búscalo por correo.',
        forbiddenText: 'Esta pantalla es solo para el equipo organizador.',
        scanLabel: 'Activar cámara',
        stopLabel: 'Detener cámara',
        emailLabel: 'Correo del asistente',
        emailSubmitLabel: 'Registrar asistencia',
        checkedInText: 'Asistencia registrada:',
        alreadyText: 'Ya estaba registrada:',
        notFoundText: 'No hay ninguna cuenta con ese código o correo.',
        importTitle: 'Importar lista',
        importLead:
          'Pega los correos de quienes asistieron, uno por línea o separados por comas. Los correos sin cuenta no se guardan.',
        importLabel: 'Correos',
        importSubmitLabel: 'Importar asistencia',
        importResultText: 'Registradas, ya estaban y sin cuenta:',
        unmatchedTitle: 'Correos sin cuenta',
      },
    },
    {
      _id: 'verifyPage',
      _type: 'verifyPage',
      seo: {
        title: 'Verificar certificado',
        description: 'Comprueba que un certificado de {{title}} es auténtico.',
      },
      family: 'green',
      hero: {
        _type: 'pageHero',
        eyebrow: 'Certificados',
        title: 'Verificar un certificado',
        lead: 'Escribe el código impreso en el certificado para confirmar que lo emitimos nosotros.',
        glyphs: ['hash-green', 'dot-green', 'asterisk'],
      },
      form: {codeLabel: 'Código del certificado', submitLabel: 'Verificar'},
      result: {
        validTitle: 'Certificado válido',
        holderLabel: 'Emitido a',
        hiddenHolderText: 'La persona titular no autorizó mostrar su nombre.',
        eventLabel: 'Evento',
        issuedLabel: 'Fecha de emisión',
        invalidTitle: 'No encontramos ese certificado',
        invalidText: 'Revisa el código. Si crees que es un error, escríbenos a {{email}}.',
      },
    },
    {
      _id: 'privacyPage',
      _type: 'privacyPage',
      seo: {
        title: 'Aviso de privacidad',
        description: 'Cómo tratamos los datos personales de las cuentas de {{title}}.',
      },
      family: 'yellow',
      hero: {
        _type: 'pageHero',
        eyebrow: 'Privacidad',
        title: 'Aviso de privacidad',
        lead: 'Qué datos guardamos de tu cuenta, para qué, por cuánto tiempo y cómo ejercer tus derechos según la Ley Orgánica de Protección de Datos Personales.',
        glyphs: ['braces', 'dot-yellow', 'semicolon'],
      },
      version: '2026-10-01',
      updatedAt: '2026-10-01',
      sections: PRIVACY_SECTIONS.map(([heading, body]) => ({
        _type: 'privacySection',
        _key: key(),
        heading,
        body,
      })),
    },
  ]
}

export const PAGE_TYPES = [
  'homePage',
  'agendaPage',
  'speakersPage',
  'sponsorsPage',
  'aboutPage',
  'organizersPage',
  'faqPage',
  'accountPage',
  'verifyPage',
  'privacyPage',
]

interface SeedPagesOptions {
  /**
   * Speaker ids for the home page cards. When omitted they are taken from the legacy
   * `siteSettings.featuredSpeakers` field, which is then removed (it moved to the home page).
   */
  featuredSpeakers?: string[]
}

/**
 * Creates the page documents that do not exist yet and fills in the site chrome fields that
 * siteSettings is missing. Existing documents and fields are left alone, so it is safe to re-run.
 */
export async function seedPages(client: SanityClient, options: SeedPagesOptions = {}) {
  const settings = await client.fetch<{featured: string[] | null} | null>(
    '*[_id == "siteSettings"][0]{"featured": featuredSpeakers[]._ref}',
  )
  if (!settings) throw new Error('No existe "siteSettings". Ejecuta primero `npm run seed`.')
  const featuredSpeakers = options.featuredSpeakers ?? settings.featured ?? []

  const [stage, portrait] = await Promise.all([
    uploadImage(client, 'speaker-stage.jpg'),
    uploadImage(client, 'speaker-portrait.jpg'),
  ])

  const docs = pageDocuments({featuredSpeakers, stage, portrait})
  const existing = new Set(
    await client.fetch<string[]>('*[_id in $ids]._id', {ids: docs.map((d) => d._id)}),
  )
  for (const doc of docs) {
    if (existing.has(doc._id)) continue
    await client.createIfNotExists(doc)
  }
  console.log(
    `  ${docs.length - existing.size} páginas creadas` +
      (existing.size ? `, ${existing.size} ya existían` : ''),
  )

  // The chrome fields go on the published settings and on an open draft, if there is one, so
  // publishing that draft later does not wipe them.
  const settingsIds = await client.fetch<string[]>(
    '*[_id in ["siteSettings", "drafts.siteSettings"]]._id',
  )
  for (const id of settingsIds) {
    await client
      .patch(id)
      .setIfMissing(SITE_CHROME)
      // Fields added to objects that older datasets already have.
      .setIfMissing({'registerCta.accountLabel': SITE_CHROME.registerCta.accountLabel})
      .unset(['featuredSpeakers'])
      .commit({autoGenerateArrayKeys: true})
    const hasPrivacyLink = await client.fetch<boolean>(
      'count(*[_id == $id && $href in footer.columns[].links[].href]) > 0',
      {id, href: PRIVACY_LINK.href},
    )
    if (!hasPrivacyLink) {
      await client
        .patch(id)
        .insert('after', 'footer.columns[-1].links[-1]', [{_key: key(), ...PRIVACY_LINK}])
        .commit()
    }
  }
  console.log(
    '  configuración del sitio: menú, bloque de registro, pie de página y datos personales',
  )
}
