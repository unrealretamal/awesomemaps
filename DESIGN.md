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

AwesomeMaps is a side product by Diego Ramos Retamal, in the same family as [retamal.xyz](https://retamal.xyz): paper, ink, one terracotta signal, large display type, numbered process only when the sequence is real.

Two surfaces, one authorship:

- **Home and gallery** — product pages. Cream paper, Inter, status strip, posters as posters.
- **Generator** — the instrument. Near-black, JetBrains Mono, teal. No marketing display type in the sidebars.

The plotting idea started as a Streamlit studio forked from [prettymaps](https://github.com/marceloprates/prettymaps) at [unrealretamal/prettymaps-studio](https://github.com/unrealretamal/prettymaps-studio). This site is the independent JavaScript product: OpenStreetMap geometry in, SVG poster out.

Carry the portfolio *family* (status, scale, numbering, judgment). Do not clone the vault, recruiter strip, or testimonials.

## Brand mark

The mark is a miniature circular poster crop on paper — water, land, ink streets, one terracotta boulevard. Source: `src/assets/icons/brand-mark.svg`. Favicons in `public/icons/` are rasterised from that file.

It uses the marketing tokens only. No rainbow frame, no folded-map clipart, no HUD teal. At 20px it should still read as “circular map crop.”

## Colors

| Token | Hex | Use |
|---|---|---|
| `bg-app` / `paper` | `#f5f1e8` | Marketing page |
| `bg-panel` | `#fbf9f3` | Cards, footer |
| `bg-well` | `#ece6da` | Poster wells |
| `border` | `#d9d2c5` | Hairlines |
| `text-1` / `ink` | `#17251f` | Type, primary buttons |
| `text-2` | `#59645d` | Supporting copy |
| `accent` | `#c55a2d` | Current nav, selected chips, hover |
| `tool-bg` | `#0b0c0e` | Generator only |
| `tool-accent` | `#4ecdc4` | Generator only |

Poster palettes (Nori, Terracotta, Midnight, …) are artwork inside the map. They do not restyle chrome. Teal stays off marketing pages.

## Typography

Inter for marketing. JetBrains Mono for the generator and for coordinates that are real data.

- **Display** (home / gallery H1): Inter 700, `clamp(2.75rem, 8vw, 5.5rem)`, line-height ~0.92, tracking ~`-0.06em`. No kicker above.
- **Headline**: Inter 700, ~28px.
- **Body**: Inter 400, 17px / 1.55, measure 60–70ch.
- **Process numbers**: Inter 600 — only on how-it-works steps, where order is the information.

## Layout

Desktop gutter 80px (24px below 900px). Marketing nav is sticky with a status strip: date · Berlin · time · “Side product”. Section padding ~80–96px vertical.

Home: reading column that opens into poster grids. Gallery: title, filters, poster grid. Generator: locked three-column viewport (256px / canvas / 224px).

## Elevation & shapes

Flat. Depth from paper on a warmer well and 1px borders — not shadows. Poster hover: border to terracotta, 150ms.

Marketing radius 8px; poster images 12px (or 50% for circular crops). Primary buttons: ink fill, cream type; hover terracotta.

No technical grids, compass rings, or coordinate ticks on marketing viewports. A circular crop is a round image.

## Components

**Status strip** — date, Berlin, local time (`Europe/Berlin`), “Side product”. Orientation, not decoration.

**Buttons** — primary: ink / Inter 600. Outline: 1px ink. Generator buttons stay on tool tokens.

**Chips** — sentence case. Unselected: ink hairline. Selected (`aria-pressed="true"`): terracotta fill, cream type.

**Cards** — poster, then city, country, palette · crop. Whole card deep-links into the generator with city, preset, crop, and coordinates.

**Navigation** — brand mark + “AwesomeMaps”. Links in `text-2`, current page terracotta. Generate CTA is the ink button. Generator focused variant: “Back to home” only.

## Do / don't

**Do** present AwesomeMaps as Diego’s product (link `https://retamal.xyz`). Keep gallery copy honest — these posters are generated here. Credit OSM, the Python studio fork, and prettymaps as inspiration (no prettymaps code is reused).

**Don't** put kickers above headings. Don't dress marketing in HUD teal or compass chrome. Don't invent view counts, npm packages, or WebGL compilers. Don't restyle chrome with a poster palette. Don't ship social icons that are not links.
