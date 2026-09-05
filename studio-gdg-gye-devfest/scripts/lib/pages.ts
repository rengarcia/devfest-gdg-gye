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

export const SITE_CHROME = {
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
      .unset(['featuredSpeakers'])
      .commit({autoGenerateArrayKeys: true})
  }
  console.log('  configuración del sitio: menú, bloque de registro y pie de página')
}
