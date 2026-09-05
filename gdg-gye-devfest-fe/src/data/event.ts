export type Family = 'yellow' | 'blue' | 'green' | 'red';

export const event = {
  name: 'DevFest Guayaquil',
  year: 2026,
  title: 'DevFest Guayaquil 2026',
  dateShort: '5 de diciembre, 2026',
  dateLong: '5 de diciembre de 2026',
  venue: 'ESPOL Campus Gustavo Galindo',
  capacity: 500,
  /** Registration is not open yet in the design; wire this to the real form when it is. */
  registerHref: '#',
  email: 'hola@gdgguayaquil.dev',
  sponsorsEmail: 'sponsors@gdgguayaquil.dev',
  community: 'gdg.community.dev/guayaquil',
  handle: '@gdgguayaquil',
};

export interface NavLink {
  label: string;
  href: string;
}

export const nav: NavLink[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Agenda', href: '/agenda' },
  { label: 'Speakers', href: '/speakers' },
  { label: 'Sponsors', href: '/sponsors' },
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Organizadores', href: '/organizadores' },
  { label: 'FAQ', href: '/faq' },
];
