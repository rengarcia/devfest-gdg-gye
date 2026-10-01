import {aboutPage} from './aboutPage'
import {accountPage} from './accountPage'
import {agendaPage} from './agendaPage'
import {faqPage} from './faqPage'
import {homePage} from './homePage'
import {organizersPage} from './organizersPage'
import {privacyPage} from './privacyPage'
import {speakersPage} from './speakersPage'
import {sponsorsPage} from './sponsorsPage'
import {verifyPage} from './verifyPage'

/** One singleton per route, in site navigation order, then the account and legal pages. */
export const pageTypes = [
  homePage,
  agendaPage,
  speakersPage,
  sponsorsPage,
  aboutPage,
  organizersPage,
  faqPage,
  accountPage,
  verifyPage,
  privacyPage,
]

/** What the Studio structure needs to list the pages. */
export const PAGES = pageTypes.map(({name, title, icon}) => ({name, title: title ?? name, icon}))
