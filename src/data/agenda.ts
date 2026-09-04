import { tracks, type Track, type TrackId } from './tracks';

export interface Chip {
  label: string;
  cls?: string;
}

export interface Session {
  time: string;
  title: string;
  who?: string;
  chips?: Chip[];
  isBreak?: boolean;
}

export interface TrackSchedule {
  track: Track;
  sessions: Session[];
}

const keynote: Session = {
  time: '09:15 – 10:00',
  title: 'Keynote: lo que viene para developers en Google',
  who: 'Carla Espinoza / DevRel, Google Cloud',
  chips: [{ label: 'Keynote', cls: 'chip-tint' }, { label: 'Auditorio A' }],
};

const acreditacion: Session = { time: '08:30 – 09:15', title: 'Acreditación y café', isBreak: true };
const almuerzo: Session = { time: '12:00 – 13:30', title: 'Almuerzo y networking', isBreak: true };
const panel: Session = { time: '16:15 – 17:00', title: 'Panel de cierre: comunidad tech en Ecuador · Auditorio A', isBreak: true };
const after: Session = { time: '17:00 – 18:00', title: 'After party y sorteos', isBreak: true };

const TBC = 'Speaker por confirmar';

/** [time, title, who] for the four track-specific slots of the day. */
type Talk = [string, string, string?];

const talks: Record<TrackId, Talk[]> = {
  Web: [
    ['10:15 – 11:00', 'Signals, server components y el fin del re-render innecesario', 'María José Vera / Staff Engineer, Kushki'],
    ['11:15 – 12:00', 'Accesibilidad no es un plugin: WCAG en equipos reales', 'Gabriela Ríos / Frontend Lead, Tuti'],
    ['13:30 – 14:15', 'Web performance en redes reales de Ecuador'],
    ['14:30 – 16:00', 'Workshop: construye una PWA con Angular y Firebase'],
  ],
  Mobile: [
    ['10:15 – 11:00', 'Compose Multiplatform en producción: lo que nadie te cuenta', 'Andrés Loor / Google Developer Expert, Android'],
    ['11:15 – 12:00', 'Rendimiento en Android: del jank al 60 fps', 'Luis Fernando Zambrano / Android Engineer, Yummy'],
    ['13:30 – 14:15', 'Flutter y Gemini: apps con IA en el dispositivo'],
    ['14:30 – 16:00', 'Workshop: tu primera app con Jetpack Compose'],
  ],
  Cloud: [
    ['10:15 – 11:00', 'Del monolito a Cloud Run sin apagar el negocio', 'Kevin Paredes / Cloud Architect, Banco Guayaquil'],
    ['11:15 – 12:00', 'FinOps para startups: la factura de GCP que sí entiendes', 'Xavier Mendoza / Founder, Nube Labs'],
    ['13:30 – 14:15', 'Kubernetes o no Kubernetes: cómo decidir'],
    ['14:30 – 16:00', 'Workshop: CI/CD con Cloud Build y Terraform'],
  ],
  AI: [
    ['10:15 – 11:00', 'Gemini en tu backend: agentes que sí llegan a producción', 'Daniela Cedeño / ML Engineer, Datil'],
    ['11:15 – 12:00', 'RAG bien hecho: embeddings, evaluación y latencia', 'Paola Andrade / Data Scientist, ESPOL'],
    ['13:30 – 14:15', 'Evaluar LLMs sin engañarte a ti mismo'],
    ['14:30 – 16:00', 'Workshop: agentes con Gemini y Vertex AI'],
  ],
};

export const schedule: TrackSchedule[] = tracks.map((track) => {
  const [t1, t2, t3, t4] = talks[track.id].map(
    ([time, title, who]): Session => ({
      time,
      title,
      who: who ?? TBC,
      chips: [{ label: track.id, cls: track.chip }, { label: track.room }],
    }),
  );
  return { track, sessions: [acreditacion, keynote, t1, t2, almuerzo, t3, t4, panel, after] };
});
