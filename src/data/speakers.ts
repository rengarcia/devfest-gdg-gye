import type { Family } from './event';
import type { TrackId } from './tracks';

export interface Speaker {
  id: string;
  family: Family;
  initials: string;
  track: TrackId;
  talk: string;
  name: string;
  role: string;
}

/** Order matches the speakers page grid. */
export const speakers: Speaker[] = [
  { id: 'mj', family: 'green', initials: 'MJ', track: 'Web', talk: 'Signals, server components y el fin del re-render innecesario', name: 'María José Vera', role: 'Staff Engineer, Kushki' },
  { id: 'al', family: 'blue', initials: 'AL', track: 'Mobile', talk: 'Compose Multiplatform en producción: lo que nadie te cuenta', name: 'Andrés Loor', role: 'Google Developer Expert, Android' },
  { id: 'dc', family: 'yellow', initials: 'DC', track: 'AI', talk: 'Gemini en tu backend: agentes que sí llegan a producción', name: 'Daniela Cedeño', role: 'ML Engineer, Datil' },
  { id: 'kp', family: 'red', initials: 'KP', track: 'Cloud', talk: 'Del monolito a Cloud Run sin apagar el negocio', name: 'Kevin Paredes', role: 'Cloud Architect, Banco Guayaquil' },
  { id: 'gr', family: 'green', initials: 'GR', track: 'Web', talk: 'Accesibilidad no es un plugin: WCAG en equipos reales', name: 'Gabriela Ríos', role: 'Frontend Lead, Tuti' },
  { id: 'xm', family: 'red', initials: 'XM', track: 'Cloud', talk: 'FinOps para startups: la factura de GCP que sí entiendes', name: 'Xavier Mendoza', role: 'Founder, Nube Labs' },
  { id: 'pa', family: 'yellow', initials: 'PA', track: 'AI', talk: 'RAG bien hecho: embeddings, evaluación y latencia', name: 'Paola Andrade', role: 'Data Scientist, ESPOL' },
  { id: 'lz', family: 'blue', initials: 'LZ', track: 'Mobile', talk: 'Rendimiento en Android: del jank al 60 fps', name: 'Luis Fernando Zambrano', role: 'Android Engineer, Yummy' },
  { id: 'ce', family: 'red', initials: 'CE', track: 'Cloud', talk: 'Keynote: lo que viene para developers en Google', name: 'Carla Espinoza', role: 'DevRel, Google Cloud' },
];

/** The three cards shown on the home page, in order. */
export const featuredSpeakers: Speaker[] = ['ce', 'mj', 'dc'].map((id) => speakers.find((s) => s.id === id)!);
