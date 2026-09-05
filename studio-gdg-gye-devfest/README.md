# DevFest Guayaquil 2026 — Sanity Studio

Studio standalone del sitio [`../gdg-gye-devfest-fe`](../gdg-gye-devfest-fe). Proyecto `l2u3btbc`,
dataset `production`. El sitio lee el contenido en tiempo de build; publica en el Studio y vuelve a
desplegar el sitio para ver los cambios.

## Comandos

| Comando                 | Qué hace                                                                     |
| ----------------------- | ---------------------------------------------------------------------------- |
| `npm install`           | Instala dependencias                                                         |
| `npm run dev`           | Studio local en `localhost:3333`                                             |
| `npm run seed`          | Siembra el contenido inicial (falla si el dataset ya tiene contenido)        |
| `npm run seed:pages`    | Añade las páginas y el menú/registro/pie a un dataset que ya tiene contenido |
| `npm run typegen`       | Regenera `../gdg-gye-devfest-fe/sanity.types.ts` a partir del schema         |
| `npm run schema:deploy` | Sube el schema al Content Lake (MCP, validación remota)                      |
| `npm run deploy`        | Publica el Studio en sanity.studio                                           |

Los comandos usan la sesión de `npx sanity login`.

## Modelo de contenido

`schemaTypes/documents/`:

- `siteSettings`: singleton con fecha, sede, cupo, correos y enlaces, más el menú principal, el
  bloque de registro que cierra todas las páginas y el pie de página.
- `track`: Web, Mobile, Cloud, AI. Sala, glyph y familia de color.
- `session`: título, tipo (charla, workshop, keynote, panel, pausa), horas, track, speaker y sala.
  Las sesiones plenarias (keynote, panel, pausa) no tienen track y aparecen en todos los tabs.
- `speaker`: nombre, cargo, iniciales, track. El título de su charla sale de la sesión que lo referencia.
- `organizer`, `sponsorTier`, `sponsor`, `faq`.

`schemaTypes/pages/`: un singleton por ruta (`homePage`, `agendaPage`, `speakersPage`,
`sponsorsPage`, `aboutPage`, `organizersPage`, `faqPage`), todos con SEO, familia de color, cabecera,
las secciones propias de la página y un bloque de registro opcional que sobrescribe el general.
`schemaTypes/objects/` tiene los objetos que comparten (`seo`, `link`, `stat`, `quote`, `figure`,
`cta`, `pageHero`). Los textos admiten marcadores (`{{capacity}}`, `{{dateShort}}`, `{{email}}`…,
lista en `shared/textFields.ts`) que el sitio rellena con la configuración.

`schemaTypes/shared/` tiene los campos compartidos (`family`, `order`, glyphs, textos). `structure.ts`
define el panel lateral y fija `siteSettings` y las páginas como singletons.

Para cambiar un texto de una página: edítalo en el Studio. Para añadir uno nuevo: campo en el schema
de la página, valor inicial en `scripts/lib/pages.ts`, `npm run typegen`, y leerlo en el sitio.

Después de cambiar el schema o una consulta GROQ del sitio, ejecuta `npm run typegen`.
