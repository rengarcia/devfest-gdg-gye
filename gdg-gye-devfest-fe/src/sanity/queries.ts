/**
 * GROQ queries for the site. Their result types are generated into ../../sanity.types.ts by
 * `npm run typegen` in the Studio (../studio-gdg-gye-devfest); run it after editing a query.
 */
import { defineQuery } from 'groq';

/** What cards and chips need from a track, expanded from a reference. */
const trackFields = /* groq */ `
  name,
  "slug": slug.current,
  room,
  family
`;

/** Speaker card. The talk title comes from the session that references the speaker. */
const speakerCardFields = /* groq */ `
  _id,
  name,
  role,
  initials,
  family,
  track->{ ${trackFields} },
  "talk": *[_type == "session" && speaker._ref == ^._id] | order(startTime asc)[0].title
`;

const sponsorTileFields = /* groq */ `
  _id,
  name,
  url,
  logo
`;

export const SITE_SETTINGS_QUERY = defineQuery(/* groq */ `
  *[_type == "siteSettings" && _id == "siteSettings"][0]{
    name,
    year,
    date,
    venue,
    capacity,
    registerUrl,
    email,
    sponsorsEmail,
    communityUrl,
    handle,
    socialUrl,
    navigation,
    registerCta,
    footer
  }
`);

/* Pages: one singleton per route, its id equal to its type -------------------------------------- */

export const HOME_PAGE_QUERY = defineQuery(/* groq */ `
  *[_type == "homePage" && _id == "homePage"][0]{
    seo,
    family,
    hero,
    stats,
    speakers{
      eyebrow,
      title,
      lead,
      link,
      featured[]->{ ${speakerCardFields} }
    },
    tracks,
    quote,
    sponsors,
    cta
  }
`);

export const AGENDA_PAGE_QUERY = defineQuery(/* groq */ `
  *[_type == "agendaPage" && _id == "agendaPage"][0]{ seo, family, hero, footnote, cta }
`);

export const SPEAKERS_PAGE_QUERY = defineQuery(/* groq */ `
  *[_type == "speakersPage" && _id == "speakersPage"][0]{ seo, family, hero, cfp, cta }
`);

export const SPONSORS_PAGE_QUERY = defineQuery(/* groq */ `
  *[_type == "sponsorsPage" && _id == "sponsorsPage"][0]{ seo, family, hero, cta }
`);

export const ABOUT_PAGE_QUERY = defineQuery(/* groq */ `
  *[_type == "aboutPage" && _id == "aboutPage"][0]{
    seo,
    family,
    hero,
    intro,
    principles,
    history,
    venue,
    cta
  }
`);

export const ORGANIZERS_PAGE_QUERY = defineQuery(/* groq */ `
  *[_type == "organizersPage" && _id == "organizersPage"][0]{ seo, family, hero, volunteering, cta }
`);

export const FAQ_PAGE_QUERY = defineQuery(/* groq */ `
  *[_type == "faqPage" && _id == "faqPage"][0]{ seo, family, hero, cta }
`);

/* Collections ---------------------------------------------------------------------------------- */

export const TRACKS_QUERY = defineQuery(/* groq */ `
  *[_type == "track"] | order(coalesce(order, 9999) asc, name asc){
    _id,
    ${trackFields},
    glyph,
    blurb
  }
`);

export const SPEAKERS_QUERY = defineQuery(/* groq */ `
  *[_type == "speaker"] | order(coalesce(order, 9999) asc, name asc){ ${speakerCardFields} }
`);

export const SESSIONS_QUERY = defineQuery(/* groq */ `
  *[_type == "session"] | order(startTime asc, coalesce(order, 9999) asc, title asc){
    _id,
    title,
    kind,
    startTime,
    endTime,
    room,
    track->{ ${trackFields} },
    speaker->{ name, role }
  }
`);

export const ORGANIZERS_QUERY = defineQuery(/* groq */ `
  *[_type == "organizer"] | order(coalesce(order, 9999) asc, name asc){
    _id,
    name,
    role,
    initials,
    family
  }
`);

export const SPONSOR_TIERS_QUERY = defineQuery(/* groq */ `
  *[_type == "sponsorTier"] | order(coalesce(order, 9999) asc, name asc){
    _id,
    name,
    kind,
    headline,
    description,
    perks,
    family,
    "sponsors": *[_type == "sponsor" && tier._ref == ^._id]
      | order(coalesce(order, 9999) asc, name asc){ ${sponsorTileFields} }
  }
`);

/** Home page teaser: the first four sponsors, highest tier first. */
export const HOME_SPONSORS_QUERY = defineQuery(/* groq */ `
  *[_type == "sponsor" && tier._ref in *[_type == "sponsorTier" && kind == "paid"]._id]
    | order(tier->order asc, coalesce(order, 9999) asc, name asc)[0...4]{ ${sponsorTileFields} }
`);

export const FAQ_QUERY = defineQuery(/* groq */ `
  *[_type == "faq"] | order(coalesce(order, 9999) asc){
    _id,
    question,
    answer,
    "anchor": anchor.current
  }
`);
