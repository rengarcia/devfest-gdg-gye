import {faq} from './documents/faq'
import {organizer} from './documents/organizer'
import {session} from './documents/session'
import {siteSettings} from './documents/siteSettings'
import {speaker} from './documents/speaker'
import {sponsor} from './documents/sponsor'
import {sponsorTier} from './documents/sponsorTier'
import {track} from './documents/track'
import {cta} from './objects/cta'
import {figure} from './objects/figure'
import {link} from './objects/link'
import {pageHero} from './objects/pageHero'
import {quote} from './objects/quote'
import {seo} from './objects/seo'
import {stat} from './objects/stat'
import {pageTypes} from './pages'

export const schemaTypes = [
  // Objects shared by the pages and the site settings
  seo,
  link,
  stat,
  quote,
  figure,
  cta,
  pageHero,
  // Singletons
  siteSettings,
  ...pageTypes,
  // Collections
  track,
  session,
  speaker,
  organizer,
  sponsorTier,
  sponsor,
  faq,
]
