import type { Family } from './event';

export interface SponsorTier {
  name: string;
  family: Family;
  title: string;
  perks: string[];
  /** placeholder tile labels until real logos arrive */
  tiles: string[];
  grid: 'g2' | 'g3';
  big?: boolean;
}

export const tiers: SponsorTier[] = [
  {
    name: 'Diamond',
    family: 'blue',
    title: 'Presencia principal en escenario y stand',
    perks: ['Logo en escenario principal, credenciales y sitio web', 'Stand de 3 × 3 m en la zona de networking', 'Charla patrocinada de 20 minutos', '15 entradas para el equipo'],
    tiles: ['Diamond 1', 'Diamond 2'],
    grid: 'g2',
    big: true,
  },
  {
    name: 'Gold',
    family: 'yellow',
    title: 'Stand y marca en todas las salas',
    perks: ['Logo en salas de track y sitio web', 'Stand de 2 × 2 m', 'Mención en apertura y cierre', '8 entradas para el equipo'],
    tiles: ['Gold 1', 'Gold 2', 'Gold 3'],
    grid: 'g3',
  },
  {
    name: 'Silver',
    family: 'green',
    title: 'Marca visible durante todo el día',
    perks: ['Logo en sitio web y pantallas de descanso', 'Mesa en la zona de networking', '4 entradas para el equipo'],
    tiles: ['Silver 1', 'Silver 2', 'Silver 3', 'Silver 4', 'Silver 5', 'Silver 6'],
    grid: 'g3',
  },
];

export const communityTiles = Array.from({ length: 8 }, (_, i) => `Comunidad ${i + 1}`);

/** Home page teaser tiles. */
export const homeSponsorTiles = ['Sponsor Diamond', 'Sponsor Gold', 'Sponsor Gold', 'Sponsor Silver'];
