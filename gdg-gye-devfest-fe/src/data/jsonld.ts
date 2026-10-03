/**
 * schema.org structured data (JSON-LD) for search engines: the event on the home page and the
 * questions on /faq. Pages build it here and hand it to BaseLayout through its `jsonLd` prop.
 */
import type { FaqItem, SiteSettings, SpeakerCard } from '../sanity/content';

type JsonLd = Record<string, unknown>;

/** Guayaquil is UTC-5 all year (Ecuador has no daylight saving time). */
const VENUE_UTC_OFFSET = '-05:00';

/** Where the venue is; the Studio only stores its name. */
const VENUE_ADDRESS = {
  '@type': 'PostalAddress',
  addressLocality: 'Guayaquil',
  addressRegion: 'Guayas',
  addressCountry: 'EC',
};

const absolute = (href: string, site: URL) => new URL(href, site).href;

const graph = (...nodes: JsonLd[]): JsonLd => ({
  '@context': 'https://schema.org',
  '@graph': nodes,
});

function organization(settings: SiteSettings, site: URL): JsonLd {
  return {
    '@type': 'Organization',
    '@id': absolute('/#organizer', site),
    name: settings.organizer,
    url: settings.communityUrl,
    logo: absolute('/assets/gdg-logo.png', site),
    sameAs: [settings.communityUrl, settings.socialHref].filter((href) => href !== '#'),
    email: settings.email,
  };
}

interface EventInput {
  settings: SiteSettings;
  site: URL;
  /** The home page's meta description. */
  description: string;
  /** First start and last end on the agenda; without them the event is listed as all-day. */
  hours?: { start: string; end: string };
  speakers: SpeakerCard[];
}

/** WebSite + Organization + Event, for the home page. */
export function eventJsonLd({ settings, site, description, hours, speakers }: EventInput): JsonLd {
  const at = (time: string) => `${settings.date}T${time}:00${VENUE_UTC_OFFSET}`;
  const registers = settings.registerHref !== '#';
  return graph(
    {
      '@type': 'WebSite',
      '@id': absolute('/#website', site),
      url: absolute('/', site),
      name: settings.title,
      inLanguage: 'es',
      publisher: { '@id': absolute('/#organizer', site) },
    },
    organization(settings, site),
    {
      '@type': 'Event',
      '@id': absolute('/#event', site),
      name: settings.title,
      description,
      url: absolute('/', site),
      image: [absolute(settings.shareImage.src, site)],
      startDate: hours ? at(hours.start) : settings.date,
      endDate: hours ? at(hours.end) : settings.date,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      inLanguage: 'es',
      // The register block says entry is free; change this and `offers` if that ever changes.
      isAccessibleForFree: true,
      maximumAttendeeCapacity: settings.capacity,
      location: { '@type': 'Place', name: settings.venue, address: VENUE_ADDRESS },
      organizer: { '@id': absolute('/#organizer', site) },
      ...(registers && {
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
    },
  );
}

/** FAQPage for /faq: every question with its answer, as rendered on the page. */
export function faqJsonLd(items: FaqItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}
