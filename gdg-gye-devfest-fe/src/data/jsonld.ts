/**
 * schema.org structured data (JSON-LD) for search engines: the event on the home page, and a
 * WebPage + BreadcrumbList on every other indexable page (with the questions on /faq). Pages build
 * it here and hand it to BaseLayout through its `jsonLd` prop.
 *
 * Every graph carries the same WebSite and Organization nodes under fixed `@id`s, so search
 * engines see one GDG Guayaquil whichever page they read first.
 */
import type { FaqItem, SiteSettings, SpeakerCard } from '../sanity/content';

type JsonLd = Record<string, unknown>;

/** Guayaquil is UTC-5 all year (Ecuador has no daylight saving time). */
const VENUE_UTC_OFFSET = '-05:00';

/** Where the venue (ESPOL, Campus Gustavo Galindo) is; the Studio only stores its name. */
const VENUE_ADDRESS = {
  '@type': 'PostalAddress',
  streetAddress: 'Km 30.5 Vía Perimetral',
  addressLocality: 'Guayaquil',
  addressRegion: 'Guayas',
  addressCountry: 'EC',
};

/**
 * The chapter's public profiles, listed as `sameAs` so search engines tie this site to the GDG
 * Guayaquil they already know (the Studio only stores the LinkedIn one, `socialUrl`).
 */
const CHAPTER_PROFILES = [
  'https://www.instagram.com/gdgguayaquil',
  'https://www.facebook.com/gdgGuayaquil',
  'https://x.com/gdgguayaquil',
  'https://www.linkedin.com/company/gdgguayaquil/',
];

/** Other names people search the chapter by. */
const CHAPTER_ALTERNATE_NAMES = ['Google Developer Group Guayaquil', 'GDG Guayaquil Ecuador'];

/** This edition's listing on the GDG community platform, where registration also opens. */
const EVENT_LISTING =
  'https://gdg.community.dev/events/details/google-gdg-guayaquil-presents-devfest-guayaquil-2026/';

const absolute = (href: string, site: URL) => new URL(href, site).href;

const ids = (site: URL) => ({
  website: absolute('/#website', site),
  organizer: absolute('/#organizer', site),
  event: absolute('/#event', site),
});

const graph = (...nodes: JsonLd[]): JsonLd => ({
  '@context': 'https://schema.org',
  '@graph': nodes,
});

/** A real URL: not a '#' placeholder, an in-page anchor or an empty value. */
const isUrl = (href: string | null | undefined): href is string =>
  !!href && /^https?:\/\//.test(href);

function website(settings: SiteSettings, site: URL): JsonLd {
  return {
    '@type': 'WebSite',
    '@id': ids(site).website,
    url: absolute('/', site),
    name: settings.title,
    // The edition-free name ("DevFest Guayaquil") helps Google pick a stable site name.
    ...(settings.name !== settings.title && { alternateName: settings.name }),
    inLanguage: 'es',
    publisher: { '@id': ids(site).organizer },
  };
}

function organization(settings: SiteSettings, site: URL): JsonLd {
  const url = settings.communityUrl;
  // Other profiles of the chapter; the community page is already `url`.
  const sameAs = [...new Set([settings.socialHref, ...CHAPTER_PROFILES])].filter(
    (href) => isUrl(href) && href !== url,
  );
  return {
    '@type': 'Organization',
    '@id': ids(site).organizer,
    name: settings.organizer,
    alternateName: CHAPTER_ALTERNATE_NAMES,
    url,
    logo: absolute('/assets/gdg-logo.png', site),
    email: settings.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Guayaquil',
      addressRegion: 'Guayas',
      addressCountry: 'EC',
    },
    ...(sameAs.length > 0 && { sameAs }),
  };
}

interface EventInput {
  settings: SiteSettings;
  site: URL;
  /** What happens at the event (Google asks not to repeat the date or venue here). */
  description: string;
  /** First start and last end on the agenda; without them the event is listed as all-day. */
  hours?: { start: string; end: string };
  /** Only once the speakers section is published. */
  speakers: SpeakerCard[];
}

/** WebSite + Organization + Event, for the home page. */
export function eventJsonLd({ settings, site, description, hours, speakers }: EventInput): JsonLd {
  const at = (time: string) => `${settings.date}T${time}:00${VENUE_UTC_OFFSET}`;
  const org = organization(settings, site);
  return graph(website(settings, site), org, {
    '@type': 'Event',
    '@id': ids(site).event,
    name: settings.title,
    description,
    url: absolute('/', site),
    sameAs: EVENT_LISTING,
    image: [absolute(settings.shareImage.src, site)],
    // Date-only (all-day) until the agenda is published, as Google asks when the hours are unknown.
    startDate: hours ? at(hours.start) : settings.date,
    endDate: hours ? at(hours.end) : settings.date,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    inLanguage: 'es',
    // The register block says entry is free; change this and `offers` if that ever changes.
    isAccessibleForFree: true,
    maximumAttendeeCapacity: settings.capacity,
    location: { '@type': 'Place', name: settings.venue, address: VENUE_ADDRESS },
    // Inlined name and url (not just the @id) so validators that do not follow references see them.
    organizer: { '@type': 'Organization', '@id': org['@id'], name: org.name, url: org.url },
    ...(settings.registerHref !== '#' && {
      offers: {
        '@type': 'Offer',
        url: absolute(settings.registerHref, site),
        price: 0,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
    }),
    ...(speakers.length > 0 && {
      performer: speakers.map((s) => ({ '@type': 'Person', name: s.name, jobTitle: s.role })),
    }),
  });
}

interface PageInput {
  settings: SiteSettings;
  site: URL;
  /** `Astro.url.pathname`, e.g. /agenda */
  path: string;
  /** The page's SEO title and description, as in its <title> and meta description. */
  seo: { title: string; description: string };
  /** schema.org WebPage subtype, e.g. 'AboutPage' or 'FAQPage'. */
  type?: string;
  /** Extra properties for the page node (e.g. the FAQ's `mainEntity`). */
  extra?: JsonLd;
}

/** WebSite + Organization + WebPage + BreadcrumbList (Inicio › page), for every inner page. */
export function pageJsonLd({
  settings,
  site,
  path,
  seo,
  type = 'WebPage',
  extra,
}: PageInput): JsonLd {
  const url = absolute(path, site);
  const home = settings.navigation.find((l) => l.href === '/')?.label ?? settings.name;
  const breadcrumbId = `${url}#breadcrumb`;
  return graph(
    website(settings, site),
    organization(settings, site),
    {
      '@type': type,
      '@id': `${url}#webpage`,
      url,
      name: seo.title,
      description: seo.description,
      inLanguage: 'es',
      isPartOf: { '@id': ids(site).website },
      publisher: { '@id': ids(site).organizer },
      breadcrumb: { '@id': breadcrumbId },
      ...extra,
    },
    {
      '@type': 'BreadcrumbList',
      '@id': breadcrumbId,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: home, item: absolute('/', site) },
        { '@type': 'ListItem', position: 2, name: seo.title, item: url },
      ],
    },
  );
}

/** The questions on /faq, as the `mainEntity` of its FAQPage node (see `pageJsonLd`). */
export const faqEntities = (items: FaqItem[]): JsonLd => ({
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
});
