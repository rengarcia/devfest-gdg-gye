/**
 * Seeds the dataset with the DevFest Guayaquil 2026 content that used to live in
 * gdg-gye-devfest-fe/src/data/*.ts. Run it once from this folder, logged in with the CLI:
 *
 *   npm run seed
 *
 * It refuses to run when any of the seeded types already has documents, so it never duplicates
 * content. Sanity assigns every _id except the siteSettings singleton.
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-09-05'})

type Family = 'yellow' | 'blue' | 'green' | 'red'

const ref = (id: string) => ({_type: 'reference' as const, _ref: id})
const slug = (current: string) => ({_type: 'slug' as const, current})
const key = () => crypto.randomUUID().slice(0, 12)

/* ---------------------------------------------------------------------------------------------- */

interface TrackSeed {
  slug: string
  name: string
  family: Family
  room: string
  glyph: string
  blurb: string
}

const TRACKS: TrackSeed[] = [
  {
    slug: 'web',
    name: 'Web',
    family: 'green',
    room: 'Auditorio A',
    glyph: 'braces',
    blurb: 'Frameworks, performance, accesibilidad y la plataforma web.',
  },
  {
    slug: 'mobile',
    name: 'Mobile',
    family: 'blue',
    room: 'Aula 12',
    glyph: 'semicolon',
    blurb: 'Android, Compose, Flutter y apps que se sienten nativas.',
  },
  {
    slug: 'cloud',
    name: 'Cloud',
    family: 'red',
    room: 'Auditorio B',
    glyph: 'globe',
    blurb: 'GCP, contenedores, serverless y costos bajo control.',
  },
  {
    slug: 'ai',
    name: 'AI',
    family: 'yellow',
    room: 'Lab 3',
    glyph: 'at',
    blurb: 'Gemini, agentes, RAG y ML aplicado a problemas reales.',
  },
]

interface SpeakerSeed {
  key: string
  name: string
  role: string
  initials: string
  family: Family
  track: string
}

/** Order matches the speakers page grid. */
const SPEAKERS: SpeakerSeed[] = [
  {
    key: 'mj',
    name: 'María José Vera',
    role: 'Staff Engineer, Kushki',
    initials: 'MJ',
    family: 'green',
    track: 'web',
  },
  {
    key: 'al',
    name: 'Andrés Loor',
    role: 'Google Developer Expert, Android',
    initials: 'AL',
    family: 'blue',
    track: 'mobile',
  },
  {
    key: 'dc',
    name: 'Daniela Cedeño',
    role: 'ML Engineer, Datil',
    initials: 'DC',
    family: 'yellow',
    track: 'ai',
  },
  {
    key: 'kp',
    name: 'Kevin Paredes',
    role: 'Cloud Architect, Banco Guayaquil',
    initials: 'KP',
    family: 'red',
    track: 'cloud',
  },
  {
    key: 'gr',
    name: 'Gabriela Ríos',
    role: 'Frontend Lead, Tuti',
    initials: 'GR',
    family: 'green',
    track: 'web',
  },
  {
    key: 'xm',
    name: 'Xavier Mendoza',
    role: 'Founder, Nube Labs',
    initials: 'XM',
    family: 'red',
    track: 'cloud',
  },
  {
    key: 'pa',
    name: 'Paola Andrade',
    role: 'Data Scientist, ESPOL',
    initials: 'PA',
    family: 'yellow',
    track: 'ai',
  },
  {
    key: 'lz',
    name: 'Luis Fernando Zambrano',
    role: 'Android Engineer, Yummy',
    initials: 'LZ',
    family: 'blue',
    track: 'mobile',
  },
  {
    key: 'ce',
    name: 'Carla Espinoza',
    role: 'DevRel, Google Cloud',
    initials: 'CE',
    family: 'red',
    track: 'cloud',
  },
]

/** The three cards on the home page, in order. */
const FEATURED_SPEAKERS = ['ce', 'mj', 'dc']

interface SessionSeed {
  kind: 'talk' | 'workshop' | 'keynote' | 'panel' | 'break'
  title: string
  startTime: string
  endTime: string
  track?: string
  speaker?: string
  room?: string
}

/** Sessions everyone attends; they show up in every track tab. */
const PLENARY_SESSIONS: SessionSeed[] = [
  {kind: 'break', title: 'Acreditación y café', startTime: '08:30', endTime: '09:15'},
  {
    kind: 'keynote',
    title: 'Keynote: lo que viene para developers en Google',
    startTime: '09:15',
    endTime: '10:00',
    speaker: 'ce',
    room: 'Auditorio A',
  },
  {kind: 'break', title: 'Almuerzo y networking', startTime: '12:00', endTime: '13:30'},
  {
    kind: 'panel',
    title: 'Panel de cierre: comunidad tech en Ecuador',
    startTime: '16:15',
    endTime: '17:00',
    room: 'Auditorio A',
  },
  {kind: 'break', title: 'After party y sorteos', startTime: '17:00', endTime: '18:00'},
]

/** The four track-specific slots of the day. */
const SLOTS: Array<{startTime: string; endTime: string; kind: 'talk' | 'workshop'}> = [
  {startTime: '10:15', endTime: '11:00', kind: 'talk'},
  {startTime: '11:15', endTime: '12:00', kind: 'talk'},
  {startTime: '13:30', endTime: '14:15', kind: 'talk'},
  {startTime: '14:30', endTime: '16:00', kind: 'workshop'},
]

/** [title, speaker key] per slot and track. Missing speaker → "Speaker por confirmar". */
const TALKS: Record<string, Array<[string, string?]>> = {
  web: [
    ['Signals, server components y el fin del re-render innecesario', 'mj'],
    ['Accesibilidad no es un plugin: WCAG en equipos reales', 'gr'],
    ['Web performance en redes reales de Ecuador'],
    ['Workshop: construye una PWA con Angular y Firebase'],
  ],
  mobile: [
    ['Compose Multiplatform en producción: lo que nadie te cuenta', 'al'],
    ['Rendimiento en Android: del jank al 60 fps', 'lz'],
    ['Flutter y Gemini: apps con IA en el dispositivo'],
    ['Workshop: tu primera app con Jetpack Compose'],
  ],
  cloud: [
    ['Del monolito a Cloud Run sin apagar el negocio', 'kp'],
    ['FinOps para startups: la factura de GCP que sí entiendes', 'xm'],
    ['Kubernetes o no Kubernetes: cómo decidir'],
    ['Workshop: CI/CD con Cloud Build y Terraform'],
  ],
  ai: [
    ['Gemini en tu backend: agentes que sí llegan a producción', 'dc'],
    ['RAG bien hecho: embeddings, evaluación y latencia', 'pa'],
    ['Evaluar LLMs sin engañarte a ti mismo'],
    ['Workshop: agentes con Gemini y Vertex AI'],
  ],
}

const TRACK_SESSIONS: SessionSeed[] = Object.entries(TALKS).flatMap(([track, talks]) =>
  talks.map(([title, speaker], i) => ({...SLOTS[i], title, track, speaker})),
)

interface OrganizerSeed {
  name: string
  role: string
  initials: string
  family: Family
}

const ORGANIZERS: OrganizerSeed[] = [
  {family: 'yellow', initials: 'RS', name: 'Renato Salazar', role: 'Lead organizer'},
  {family: 'green', initials: 'VC', name: 'Verónica Cruz', role: 'Co-organizer / Programa'},
  {family: 'blue', initials: 'DM', name: 'Diego Montenegro', role: 'Sponsors y alianzas'},
  {family: 'red', initials: 'AP', name: 'Ana Lucía Pinto', role: 'Comunicación y diseño'},
  {family: 'green', initials: 'JV', name: 'Jorge Vélez', role: 'Logística y sede'},
  {family: 'yellow', initials: 'CT', name: 'Camila Torres', role: 'Voluntarios'},
  {family: 'blue', initials: 'SA', name: 'Sebastián Aguirre', role: 'Producción y AV'},
  {family: 'red', initials: 'NB', name: 'Nicole Bravo', role: 'Speakers y CFP'},
]

interface TierSeed {
  name: string
  kind: 'paid' | 'community'
  family: Family
  headline: string
  description?: string
  perks?: string[]
  /** Placeholder sponsor names until real logos arrive. */
  sponsors: string[]
}

const TIERS: TierSeed[] = [
  {
    name: 'Diamond',
    kind: 'paid',
    family: 'blue',
    headline: 'Presencia principal en escenario y stand',
    perks: [
      'Logo en escenario principal, credenciales y sitio web',
      'Stand de 3 × 3 m en la zona de networking',
      'Charla patrocinada de 20 minutos',
      '15 entradas para el equipo',
    ],
    sponsors: ['Diamond 1', 'Diamond 2'],
  },
  {
    name: 'Gold',
    kind: 'paid',
    family: 'yellow',
    headline: 'Stand y marca en todas las salas',
    perks: [
      'Logo en salas de track y sitio web',
      'Stand de 2 × 2 m',
      'Mención en apertura y cierre',
      '8 entradas para el equipo',
    ],
    sponsors: ['Gold 1', 'Gold 2', 'Gold 3'],
  },
  {
    name: 'Silver',
    kind: 'paid',
    family: 'green',
    headline: 'Marca visible durante todo el día',
    perks: [
      'Logo en sitio web y pantallas de descanso',
      'Mesa en la zona de networking',
      '4 entradas para el equipo',
    ],
    sponsors: ['Silver 1', 'Silver 2', 'Silver 3', 'Silver 4', 'Silver 5', 'Silver 6'],
  },
  {
    name: 'Community',
    kind: 'community',
    family: 'red',
    headline: 'Comunidades y universidades aliadas',
    description:
      'Espacio sin costo para comunidades tech, universidades y medios que difunden el evento.',
    sponsors: Array.from({length: 8}, (_, i) => `Comunidad ${i + 1}`),
  },
]

interface FaqSeed {
  question: string
  answer: string
  anchor?: string
}

const FAQ: FaqSeed[] = [
  {
    question: '¿Cuánto cuesta la entrada?',
    answer:
      'Nada. DevFest Guayaquil es gratuito gracias a los sponsors. Solo necesitas registrarte con anticipación porque el cupo es de 500 personas.',
  },
  {
    question: '¿Necesito ser developer para asistir?',
    answer:
      'No. Vienen estudiantes, diseñadores, product managers y gente curiosa. Las charlas de nivel introductorio están marcadas en la agenda.',
  },
  {
    question: '¿Cómo llego a ESPOL?',
    answer:
      'El Campus Gustavo Galindo está en el km 30.5 de la Vía Perimetral. Hay estacionamiento gratuito y la parada de Metrovía “ESPOL” queda a 5 minutos caminando. Publicaremos un mapa con las salas una semana antes.',
  },
  {
    question: '¿Habrá comida?',
    answer:
      'Sí. Café y snacks en la acreditación, almuerzo incluido y una pausa a media tarde. Indica restricciones alimentarias en el registro.',
  },
  {
    question: '¿Puedo cambiar de track durante el día?',
    answer:
      'Sí. Cada bloque tiene 15 minutos de margen para moverte entre salas. Las sesiones no requieren inscripción separada, excepto los workshops de 90 minutos, que tienen cupo de 40 personas.',
  },
  {
    question: '¿Las charlas se graban?',
    answer:
      'Grabamos las keynotes y las charlas del Auditorio A. Se publican en el canal de GDG Guayaquil en las semanas siguientes al evento.',
  },
  {
    question: '¿Cómo propongo una charla?',
    answer:
      'A través del formulario de Call for papers en la página de speakers, hasta el 15 de octubre. Evaluamos relevancia local, claridad de la propuesta y diversidad de voces. Si es tu primera charla, te asignamos un mentor del equipo.',
  },
  {
    question: '¿Tienen código de conducta?',
    answer:
      'Sí, y aplica para todos: asistentes, speakers, sponsors y organizadores. Buscamos un espacio libre de acoso en cualquier forma. Si ves o vives algo que no está bien, habla con cualquier persona del staff (camiseta amarilla) o escribe a conducta@gdgguayaquil.dev.',
    anchor: 'conducta',
  },
  {
    question: '¿El campus es accesible?',
    answer:
      'Los auditorios A y B y el bloque 15 tienen acceso por rampa y baños accesibles. Si necesitas intérprete de lengua de señas, asiento reservado u otro apoyo, indícalo en el registro y coordinamos contigo.',
  },
]

/* ---------------------------------------------------------------------------------------------- */

const SEEDED_TYPES = [
  'siteSettings',
  'track',
  'session',
  'speaker',
  'organizer',
  'sponsorTier',
  'sponsor',
  'faq',
]

async function main() {
  const {projectId, dataset} = client.config()
  const existing = await client.fetch<number>('count(*[_type in $types])', {types: SEEDED_TYPES})
  if (existing > 0) {
    throw new Error(
      `${projectId}/${dataset} ya tiene ${existing} documentos de los tipos que siembra este script. No se hizo nada.`,
    )
  }
  console.log(`Sembrando contenido en ${projectId}/${dataset}…`)

  const trackIds = new Map<string, string>()
  for (const [i, t] of TRACKS.entries()) {
    const doc = await client.create({
      _type: 'track',
      name: t.name,
      slug: slug(t.slug),
      blurb: t.blurb,
      room: t.room,
      glyph: t.glyph,
      family: t.family,
      order: i + 1,
    })
    trackIds.set(t.slug, doc._id)
  }
  console.log(`  ${trackIds.size} tracks`)

  const speakerIds = new Map<string, string>()
  for (const [i, s] of SPEAKERS.entries()) {
    const doc = await client.create({
      _type: 'speaker',
      name: s.name,
      role: s.role,
      initials: s.initials,
      track: ref(trackIds.get(s.track)!),
      family: s.family,
      order: i + 1,
    })
    speakerIds.set(s.key, doc._id)
  }
  console.log(`  ${speakerIds.size} speakers`)

  let sessions = 0
  for (const s of [...PLENARY_SESSIONS, ...TRACK_SESSIONS]) {
    await client.create({
      _type: 'session',
      title: s.title,
      kind: s.kind,
      startTime: s.startTime,
      endTime: s.endTime,
      ...(s.track ? {track: ref(trackIds.get(s.track)!)} : {}),
      ...(s.speaker ? {speaker: ref(speakerIds.get(s.speaker)!)} : {}),
      ...(s.room ? {room: s.room} : {}),
    })
    sessions++
  }
  console.log(`  ${sessions} sesiones`)

  for (const [i, o] of ORGANIZERS.entries()) {
    await client.create({_type: 'organizer', ...o, order: i + 1})
  }
  console.log(`  ${ORGANIZERS.length} organizadores`)

  let sponsors = 0
  for (const [i, t] of TIERS.entries()) {
    const tier = await client.create({
      _type: 'sponsorTier',
      name: t.name,
      kind: t.kind,
      headline: t.headline,
      ...(t.description ? {description: t.description} : {}),
      ...(t.perks ? {perks: t.perks} : {}),
      family: t.family,
      order: i + 1,
    })
    for (const [j, name] of t.sponsors.entries()) {
      await client.create({_type: 'sponsor', name, tier: ref(tier._id), order: j + 1})
      sponsors++
    }
  }
  console.log(`  ${TIERS.length} niveles de patrocinio, ${sponsors} sponsors`)

  for (const [i, f] of FAQ.entries()) {
    await client.create({
      _type: 'faq',
      question: f.question,
      answer: f.answer,
      ...(f.anchor ? {anchor: slug(f.anchor)} : {}),
      order: i + 1,
    })
  }
  console.log(`  ${FAQ.length} preguntas frecuentes`)

  await client.createIfNotExists({
    _id: 'siteSettings',
    _type: 'siteSettings',
    name: 'DevFest Guayaquil',
    year: 2026,
    date: '2026-12-05',
    venue: 'ESPOL Campus Gustavo Galindo',
    capacity: 500,
    email: 'info@gdggye.org',
    sponsorsEmail: 'info@gdggye.org',
    communityUrl: 'https://gdg.community.dev/gdg-guayaquil/',
    handle: '@gdgguayaquil',
    featuredSpeakers: FEATURED_SPEAKERS.map((k) => ({_key: key(), ...ref(speakerIds.get(k)!)})),
  })
  console.log('  configuración del sitio')
  console.log('Listo.')
}

main()
