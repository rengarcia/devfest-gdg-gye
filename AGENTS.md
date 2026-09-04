# DevFest Guayaquil 2026 site — notes for agents

Astro static site, Spanish-language, ported from the Claude Design project
"Devfest Guayaquil webpage design". See README.md for the file map.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.
Run `npm run build` and `npm run check` before calling a change done.

## Conventions

- Content lives in `src/data/*.ts`; pages map over it. Add a speaker, session, FAQ entry or
  sponsor tier there, not in the page markup.
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
