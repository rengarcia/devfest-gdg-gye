# DevFest Guayaquil 2026 — sitio web

Sitio estático del DevFest Guayaquil 2026 (GDG Guayaquil), construido con [Astro](https://astro.build).
Es un port fiel del proyecto de Claude Design _Devfest Guayaquil webpage design_: mismo HTML, CSS,
tokens y comportamiento, reorganizado en layouts, componentes y datos tipados.

## Comandos

| Comando           | Qué hace                                   |
| ----------------- | ------------------------------------------ |
| `npm install`     | Instala dependencias                       |
| `npm run dev`     | Servidor de desarrollo en `localhost:4321` |
| `npm run build`   | Genera el sitio estático en `dist/`        |
| `npm run preview` | Sirve `dist/` localmente                   |
| `npm run check`   | Chequeo de tipos de `.astro` y `.ts`       |

## Estructura

```
public/assets/            Logos, fotos y glyphs del kit DevFest 2026 (PNG con alpha)
src/
  data/                   Contenido editable: evento, navegación, speakers, agenda, FAQ,
                          organizadores, sponsors
  styles/tokens/          Tokens del design system (color, tipografía, espacio, forma, motion)
  styles/ds.css           Punto de entrada de los tokens
  styles/site.css         Estilos del sitio sobre los tokens
  scripts/site.ts         Intro de carga, menú móvil, reveals, tabs, contadores
  layouts/BaseLayout.astro  <head>, header, footer y script compartidos
  components/             Lockup, header, footer, hero de página, tarjetas, CTA de registro
  pages/                  /, /agenda, /speakers, /sponsors, /nosotros, /organizadores, /faq
```

## Editar contenido

Todo el texto que cambia de una edición a otra vive en `src/data/`:

- `event.ts`: fecha, sede, cupo, correos y enlaces de navegación. `registerHref` apunta a `#`
  hasta que exista el formulario de registro.
- `speakers.ts`, `agenda.ts`, `faq.ts`, `organizers.ts`, `sponsors.ts`: listas que las páginas
  recorren para generar las tarjetas, filas de agenda y tiles.

Cada página elige una familia de color (`family="yellow" | "blue" | "green" | "red"`) en su
`BaseLayout`, siguiendo la regla del brand guide de un solo acento por pieza.

## Notas de marca

- Tipografía: el kit oficial usa Google Sans Display / Text / Mono, que no tienen licencia
  pública. Se sustituyen por **DM Sans** y **Roboto Mono** desde Google Fonts
  (`src/layouts/BaseLayout.astro`). Si se reciben las fuentes licenciadas, cámbialas ahí y en
  `src/styles/tokens/typography.css`.
- Iconos funcionales (menú, flechas, mapa): Material Symbols Rounded, también desde Google Fonts.
- Los glyphs de `public/assets/glyphs/` son arte del kit DevFest 2026; no se recolorean ni se
  redibujan. Las fotos `speaker-*.jpg` son PNG con extensión `.jpg`, tal como venían en el
  proyecto de diseño.
