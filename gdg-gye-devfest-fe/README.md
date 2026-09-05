# DevFest Guayaquil 2026 — sitio web

Sitio estático del DevFest Guayaquil 2026 (GDG Guayaquil), construido con [Astro](https://astro.build).
Es un port fiel del proyecto de Claude Design _Devfest Guayaquil webpage design_: mismo HTML, CSS,
tokens y comportamiento, reorganizado en layouts y componentes. El contenido vive en Sanity
(Studio en [`../studio-gdg-gye-devfest`](../studio-gdg-gye-devfest)) y se lee al hacer el build.

## Comandos

| Comando           | Qué hace                                   |
| ----------------- | ------------------------------------------ |
| `npm install`     | Instala dependencias                       |
| `npm run dev`     | Servidor de desarrollo en `localhost:4321` |
| `npm run build`   | Genera el sitio estático en `dist/`        |
| `npm run preview` | Sirve `dist/` localmente                   |
| `npm run check`   | Chequeo de tipos de `.astro` y `.ts`       |

Antes de arrancar, copia `.env.example` a `.env` (id de proyecto y dataset de Sanity; no son
secretos).

## Estructura

```
public/assets/            Logos, fotos y glyphs del kit DevFest 2026 (PNG con alpha)
sanity.types.ts           Tipos generados desde el schema (`npm run typegen` en el Studio)
src/
  data/site.ts            Constantes de código: familias de color
  sanity/                 Cliente, consultas GROQ (`queries.ts`) y helpers que dan forma al
                          contenido para las páginas (`content.ts`)
  styles/tokens/          Tokens del design system (color, tipografía, espacio, forma, motion)
  styles/ds.css           Punto de entrada de los tokens
  styles/site.css         Estilos del sitio sobre los tokens
  scripts/site.ts         Intro de carga, menú móvil, reveals, tabs, contadores
  layouts/BaseLayout.astro  <head>, header, footer y script compartidos
  components/             Lockup, header, footer, hero de página, tarjetas, CTA de registro
  pages/                  /, /agenda, /speakers, /sponsors, /nosotros, /organizadores, /faq
```

## Editar contenido

Todo el texto que cambia de una edición a otra se edita en el Studio de Sanity
(`cd ../studio-gdg-gye-devfest && npm run dev`):

- **Configuración del sitio**: fecha, sede, cupo, correos, enlaces, menú principal, bloque de
  registro y pie de página. El enlace de registro queda vacío (botón como marcador) hasta que
  exista el formulario.
- **Páginas** (Portada, Agenda, Speakers, Sponsors, Nosotros, Organizadores, FAQ): SEO, familia de
  color, cabecera, textos y fotos de cada sección y, si hace falta, un bloque de registro propio.
  Los textos admiten marcadores como `{{capacity}}`, `{{dateShort}}` o `{{email}}`, que se
  rellenan con la configuración del sitio.
- **Tracks, sesiones, speakers, organizadores, niveles de patrocinio, sponsors y FAQ**: listas que
  las páginas recorren para generar las tarjetas, filas de agenda y tiles.

El sitio es estático: después de publicar en el Studio hay que volver a hacer el build. Si cambias
el schema o una consulta en `src/sanity/queries.ts`, ejecuta `npm run typegen` en el Studio para
regenerar `sanity.types.ts`.

Cada página elige una familia de color (`yellow`, `blue`, `green` o `red`) en su documento del
Studio, siguiendo la regla del brand guide de un solo acento por pieza.

## Notas de marca

- Tipografía: el kit oficial usa Google Sans Display / Text / Mono, que no tienen licencia
  pública. Se sustituyen por **DM Sans** y **Roboto Mono** desde Google Fonts
  (`src/layouts/BaseLayout.astro`). Si se reciben las fuentes licenciadas, cámbialas ahí y en
  `src/styles/tokens/typography.css`.
- Iconos funcionales (menú, flechas, mapa): Material Symbols Rounded, también desde Google Fonts.
- Los glyphs de `public/assets/glyphs/` son arte del kit DevFest 2026; no se recolorean ni se
  redibujan. Las fotos `speaker-*.jpg` son PNG con extensión `.jpg`, tal como venían en el
  proyecto de diseño.
