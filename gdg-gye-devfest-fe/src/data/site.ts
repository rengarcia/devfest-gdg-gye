/** Colour family from the DevFest brand kit: one accent per page, card or chip. */
export type Family = 'yellow' | 'blue' | 'green' | 'red';

export interface NavLink {
  label: string;
  href: string;
}

/** Main navigation. It mirrors the routes in src/pages, so it stays in code rather than in Sanity. */
export const nav: NavLink[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Agenda', href: '/agenda' },
  { label: 'Speakers', href: '/speakers' },
  { label: 'Sponsors', href: '/sponsors' },
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Organizadores', href: '/organizadores' },
  { label: 'FAQ', href: '/faq' },
];
