import type { Family } from './event';

export interface Organizer {
  family: Family;
  initials: string;
  name: string;
  role: string;
}

export const organizers: Organizer[] = [
  { family: 'yellow', initials: 'RS', name: 'Renato Salazar', role: 'Lead organizer' },
  { family: 'green', initials: 'VC', name: 'Verónica Cruz', role: 'Co-organizer / Programa' },
  { family: 'blue', initials: 'DM', name: 'Diego Montenegro', role: 'Sponsors y alianzas' },
  { family: 'red', initials: 'AP', name: 'Ana Lucía Pinto', role: 'Comunicación y diseño' },
  { family: 'green', initials: 'JV', name: 'Jorge Vélez', role: 'Logística y sede' },
  { family: 'yellow', initials: 'CT', name: 'Camila Torres', role: 'Voluntarios' },
  { family: 'blue', initials: 'SA', name: 'Sebastián Aguirre', role: 'Producción y AV' },
  { family: 'red', initials: 'NB', name: 'Nicole Bravo', role: 'Speakers y CFP' },
];
