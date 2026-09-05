# DevFest Guayaquil 2026 site — notes for agents

Astro static site, Spanish-language, ported from the Claude Design project
"Devfest Guayaquil webpage design". See README.md for the file map.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.
Run `npm run format` (Prettier, config in `.prettierrc`), then `npm run build` and `npm run check`
before calling a change done.

Content comes from Sanity (project `l2u3btbc`, dataset `production`) and is fetched at build time,
so `.env` needs `PUBLIC_SANITY_PROJECT_ID` and `PUBLIC_SANITY_DATASET` (copy `.env.example`).

## Content (Sanity)

- The Studio is the sibling folder `../studio-gdg-gye-devfest`; it stays standalone, never embedded
  here. Schema in `studio-gdg-gye-devfest/schemaTypes/`, seed script in `scripts/seed-content.ts`.
- `src/sanity/queries.ts` holds every GROQ query (`defineQuery`, unique `*_QUERY` names).
  `src/sanity/content.ts` fetches them and shapes the results into the view models pages consume
  (`HomePage`, `AboutPage`, `SpeakerCard`, `TrackSchedule`, `SponsorTierSection`, ...). Pages
  `await` those helpers in frontmatter; components never query Sanity directly except the shared
  layout/header/footer, which read `getSiteSettings()` (memoized per build).
- Every route has a page singleton (`homePage`, `agendaPage`, `speakersPage`, `sponsorsPage`,
  `aboutPage`, `organizersPage`, `faqPage`; document id = type) with its SEO, colour family, hero,
  section copy, photos and an optional override of the register block (`cta`). `getXxxPage()`
  returns it fully resolved: `page.cta` already merges the override with the site default, photos
  come as `Figure` (Sanity CDN URL, square crop honouring the hotspot), stats as `Stat` (with
  `count` when the value is a whole number, for `data-count`). A missing page document fails the
  build with a message pointing at `npm run seed:pages`.
- Site chrome lives in `siteSettings`: `navigation` (header menu), `registerCta` (default register
  block, whose primary label is also the header button) and `footer` (link columns, contact heading,
  tagline). Nothing editorial is left in the components.
- Placeholders: any text from a page document or the site chrome may contain `{{capacity}}`,
  `{{dateShort}}`, `{{dateLong}}`, `{{year}}`, `{{venue}}`, `{{email}}`, `{{sponsorsEmail}}`,
  `{{handle}}`, `{{name}}` or `{{title}}`; `content.ts` replaces them (`fillDeep`) before pages
  see the data. Add a new one in `varsOf` and in the Studio's `PLACEHOLDERS` list.
- `sanity.types.ts` (repo root, committed) is generated: after changing the schema or a query run
  `npm run typegen` in the Studio. `astro check` depends on it.
- Plenary sessions (keynote, panel, breaks) have no track and appear in every agenda tab; talks
  and workshops belong to one track. Sponsor tiers with `kind: paid` render with perks, `community`
  ones as the tinted partner grid.

## Conventions

- Content lives in Sanity; pages map over the helpers in `src/sanity/content.ts`. Add a speaker,
  session, FAQ entry or sponsor in the Studio, not in the page markup, and do not hardcode copy in
  a page: add a field to its page schema, seed it in `scripts/lib/pages.ts`, run `npm run typegen`
  and read it from the page's helper. `src/data/site.ts` only keeps the `Family` colour union.
  UI strings that are not content (skip link, menu button labels, "Speaker por confirmar", the
  "Keynote" chip) stay in code.
- Global CSS only (`src/styles/`). Class names follow BEM: `block`, `block__element`,
  `block--modifier` (e.g. `site-header__toggle`, `btn--fill`, `notch__media`). A block gets
  context-specific styling through a mix, not a descendant selector: `class="btn btn--fill nav__cta"`,
  with `.nav__cta` declared after `.btn` in `site.css`. `Lockup` and `Icon` take a `class` prop for
  that. JS state is a modifier too (`nav--open`, `reveal--in`, `intro--done`, `page--loading`);
  `data-*` attributes (`data-family`, `data-stagger`, `data-count`) stay as behaviour hooks.
- Inline `style` attributes still come straight from the design; some responsive rules in `site.css`
  match on them (e.g. `[style*="grid-template-columns"]`), so keep them verbatim when copying a section.
- Brand rules (from the design-system readme): sentence case, `DevFest` spelling, one colour
  family per page, no shadows, no gradients, no emoji, glyphs are decoration only.
- Fonts and Material Symbols are loaded via `<link>` in `src/layouts/BaseLayout.astro`.
- Navigation goes through Astro's `<ClientRouter />` (in `BaseLayout.astro`): same-document view
  transitions, hover prefetch, no full reloads. The header keeps its own snapshot
  (`transition:animate="none"`). Links with `href="#"` are placeholders and are neutralised in
  `site.ts` so the router does not re-render the current page.
- Client behaviour is in `src/scripts/site.ts`, imported once by the layout and kept alive across
  navigations. Anything that touches page content runs from `init()` on `astro:page-load`;
  document-level listeners are registered once at module scope. The load intro only plays on full
  page loads.

## Documentation

Full documentation: https://docs.astro.build

- [Routing](https://docs.astro.build/en/guides/routing/)
- [Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Styling](https://docs.astro.build/en/guides/styling/)
