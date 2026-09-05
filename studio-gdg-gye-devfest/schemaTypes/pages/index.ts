import {aboutPage} from './aboutPage'
import {agendaPage} from './agendaPage'
import {faqPage} from './faqPage'
import {homePage} from './homePage'
import {organizersPage} from './organizersPage'
import {speakersPage} from './speakersPage'
import {sponsorsPage} from './sponsorsPage'

/** One singleton per route, in site navigation order. */
export const pageTypes = [
  homePage,
  agendaPage,
  speakersPage,
  sponsorsPage,
  aboutPage,
  organizersPage,
  faqPage,
]

/** What the Studio structure needs to list the pages. */
export const PAGES = pageTypes.map(({name, title, icon}) => ({name, title: title ?? name, icon}))
