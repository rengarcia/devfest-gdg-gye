import type { Family } from './event';

export type TrackId = 'Web' | 'Mobile' | 'Cloud' | 'AI';

export interface Track {
  id: TrackId;
  family: Family;
  /** chip modifier class (BEM) used on agenda rows, e.g. 'chip--green' */
  chip: string;
  room: string;
  glyph: string;
  blurb: string;
}

export const tracks: Track[] = [
  { id: 'Web', family: 'green', chip: 'chip--green', room: 'Auditorio A', glyph: 'braces', blurb: 'Frameworks, performance, accesibilidad y la plataforma web.' },
  { id: 'Mobile', family: 'blue', chip: 'chip--blue', room: 'Aula 12', glyph: 'semicolon', blurb: 'Android, Compose, Flutter y apps que se sienten nativas.' },
  { id: 'Cloud', family: 'red', chip: 'chip--red', room: 'Auditorio B', glyph: 'globe', blurb: 'GCP, contenedores, serverless y costos bajo control.' },
  { id: 'AI', family: 'yellow', chip: 'chip--yellow', room: 'Lab 3', glyph: 'at', blurb: 'Gemini, agentes, RAG y ML aplicado a problemas reales.' },
];
