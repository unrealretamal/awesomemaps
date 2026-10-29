---
name: AwesomeMaps
description: Poster maps from OpenStreetMap — a side product by Diego Ramos Retamal, in the same editorial family as retamal.xyz.
colors:
  bg-app: "#f5f1e8"
  bg-panel: "#fbf9f3"
  bg-input: "#efebe3"
  bg-well: "#ece6da"
  border: "#d9d2c5"
  text-1: "#17251f"
  text-2: "#59645d"
  text-3: "#7a847c"
  text-4: "#a39b8c"
  accent: "#c55a2d"
  accent-hover: "#a84822"
  accent-soft: "rgba(197, 90, 45, 0.08)"
  accent-line: "rgba(197, 90, 45, 0.55)"
  ink: "#17251f"
  paper: "#f5f1e8"
  tool-bg: "#0b0c0e"
  tool-accent: "#4ecdc4"
typography:
  display:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "clamp(2.75rem, 8vw, 5.5rem)"
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: "-0.06em"
  headline:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.01em"
  tool:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "48px"
  xl: "96px"
  gutter: "80px"
  gutter-sm: "24px"
  nav: "auto"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "16px 28px"
    typography: "{typography.title}"
  button-primary-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.paper}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "16px 28px"
  card:
    backgroundColor: "{colors.bg-panel}"
    textColor: "{colors.text-1}"
    rounded: "{rounded.md}"
    padding: "20px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.text-1}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
    typography: "{typography.label}"
  nav-cta:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
---

## Overview

AwesomeMaps is a side product by Diego Ramos Retamal. It sits in the same family as the portfolio at [retamal.xyz](https://retamal.xyz): paper, ink, one terracotta signal, huge display type, numbered process only when the sequence is real.

It is not a cartography HUD. The Figma night-shift chrome (teal on near-black, compass lenses, `SYS_REF` ticks) belongs only to the **generator**, which is an instrument. Home and gallery are the product pages — they should read as something Diego ships, the way “Built outside the brief” does on the portfolio.

The plotting idea started as a Streamlit studio forked from [prettymaps](https://github.com/marceloprates/prettymaps) at [unrealretamal/prettymaps-studio](https://github.com/unrealretamal/prettymaps-studio). This site is the independent JavaScript product: OpenStreetMap geometry in, SVG poster out.

Two surfaces, one authorship:

- **Home and gallery** — Inter on cream paper. Status strip (date, Berlin, time). Display headlines. Honest copy. Posters as posters, not radar overlays.
- **Generator** — dense three-column tool. JetBrains Mono, near-black, teal. No marketing display type in the sidebars.

Do not clone the portfolio vault, recruiter strip, or testimonials. Carry the *family*: status, scale, numbering, judgment — applied to maps.

## Colors

Marketing is print paper. One terracotta accent (`#c55a2d`), ink (`#17251f`) for type and primary buttons. Neutrals stay in the cream–olive range. Do not introduce teal on marketing pages; teal is the generator’s signal.

| Token | Hex | Use |
|---|---|---|
| `bg-app` | `#f5f1e8` | Page, nav, marketing paper |
| `bg-panel` | `#fbf9f3` | Cards, footer |
| `bg-well` | `#ece6da` | Poster wells |
| `border` | `#d9d2c5` | Hairlines |
| `text-1` | `#17251f` | Headlines, primary copy, buttons |
| `text-2` | `#59645d` | Supporting copy |
| `accent` | `#c55a2d` | Current nav, chips selected, hover |
| `tool-bg` | `#0b0c0e` | Generator only |
| `tool-accent` | `#4ecdc4` | Generator only |

Poster palettes (Nori, Terracotta, Midnight, …) are artwork. They live inside the generated map and must not restyle chrome.

## Typography

Inter carries the product. JetBrains Mono is reserved for the generator and for coordinates that are actual data.

- **Display** (home H1, gallery H1): Inter 700, `clamp(2.75rem, 8vw, 5.5rem)`, line-height ~0.92, tracking around `-0.06em`. Headings carry their own weight — no kicker above them.
- **Headline** (section titles): Inter 700, ~28px.
- **Body**: Inter 400, 17px / 1.55, measure 60–70ch.
- **Process numbers**: Inter 600, the `01` / `02` / `03` themselves, same size as the step title.

Sequence numbers are allowed only on the how-it-works steps, where order is the information.

## Layout

Desktop gutter 80px, 24px below 900px. Marketing nav is sticky and includes a status strip (date · Berlin · time · “Side product”). Sections pad ~96px vertically on desktop.

Home is a reading column that opens into poster grids. Gallery is a title, filters, then a responsive poster grid. Generator is a locked viewport: 256px left, canvas, 224px right.

## Elevation & Depth

Flat. Depth comes from paper on a slightly warmer well, 1px `border`, not drop shadows. Poster cards do not float. Hover is a border shift to terracotta, 150ms.

No technical grid over marketing viewports. No compass rings. A circular crop is a round image; a square crop is a rectangle.

## Shapes

Marketing controls and cards: 8px radius. Poster images: 12px, or 50% for circular crops. Primary buttons: ink fill, 8px, cream type. Hover goes terracotta.

## Components

### Status strip

Date, Berlin, local time (`Europe/Berlin`), and “Side product”. Same job as the portfolio’s “OPEN TO NEW PROJECTS” row — orientation, not decoration.

### Buttons

Primary is filled ink, Inter 600. Hover terracotta. Outline is 1px ink. Generator buttons stay on the tool palette.

### Chips / filters

Sentence case, not uppercase HUD labels. Unselected: ink hairline on paper. Selected (`aria-pressed="true"`): terracotta fill, cream type.

### Cards

Poster first, then city, country, palette. The whole card is the hit target into the generator (city, preset, crop, coordinates). Catalogue IDs and raw ticks stay off the marketing card unless they help a person choose.

### Navigation

Sticky. Brand mark + “AwesomeMaps”. Links in `text-2`, current page in terracotta. Generate CTA is the ink button. Generator uses the focused variant: “Back to home” only, on the tool tokens.

## Do's and Don'ts

### Do

- **Do** present AwesomeMaps as Diego’s product, with a link to `https://retamal.xyz`.
- **Do** keep marketing copy honest: the gallery is generated here, not submitted by a community.
- **Do** deep-link a gallery card with city, preset, crop, and coordinates.
- **Do** credit OpenStreetMap, the Python studio fork, and prettymaps as inspiration — this JavaScript app does not reuse prettymaps code.
- **Do** keep the generator as an instrument. Marketing and tool can disagree in chrome; they must agree in authorship.

### Don't

- **Don't** put a kicker or eyebrow above a heading.
- **Don't** dress marketing in HUD teal, compass lenses, coordinate ticks, or `SYS_REF` chrome.
- **Don't** invent view counts, npm packages, or WebGL compilers the product does not have.
- **Don't** restyle chrome with a poster palette.
- **Don't** clone portfolio-v2 vault, recruiter, or testimonial patterns.
- **Don't** ship Twitter or chat icons that are not links.
