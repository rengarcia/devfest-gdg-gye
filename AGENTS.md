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
- Global CSS only (`src/styles/`). Class names and inline `style` attributes come straight from
  the design; some responsive rules in `site.css` match on those inline styles
  (e.g. `[style*="grid-template-columns"]`), so keep them verbatim when copying a section.
- Brand rules (from the design-system readme): sentence case, `DevFest` spelling, one colour
  family per page, no shadows, no gradients, no emoji, glyphs are decoration only.
- Fonts and Material Symbols are loaded via `<link>` in `src/layouts/BaseLayout.astro`.
- Client behaviour is in `src/scripts/site.ts`, imported once by the layout.

## Documentation

Full documentation: https://docs.astro.build

- [Routing](https://docs.astro.build/en/guides/routing/)
- [Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Styling](https://docs.astro.build/en/guides/styling/)
