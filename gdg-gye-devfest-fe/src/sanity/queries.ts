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
    featuredSpeakers[]->{ ${speakerCardFields} }
  }
`);

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
