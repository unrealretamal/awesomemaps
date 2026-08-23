# AwesomeMaps

Poster-style map generator. Pick a place, a palette and a crop shape; the app
pulls OpenStreetMap geometry, draws it as SVG in the browser, and exports SVG or
a 4096px PNG.

- **Live:** https://awesomemaps.diegoramosretamal.info
- **Also at:** https://awesomemaps.vercel.app
- **Repo:** https://github.com/unrealretamal/awesomemaps

Inspired by [prettymaps](https://github.com/marceloprates/prettymaps) by Marcelo
Prates. This is an independent JavaScript implementation — no prettymaps code is
reused, so it is not bound by that project's AGPL terms.

---

## The site

| Route | File | What it is |
|---|---|---|
| `/` | `index.html` + `src/home/` | Landing page: hero, featured maps, how it works, styles, gallery preview, `#about` |
| `/generator` | `generator.html` + `src/main.js` | The tool itself — three-column editor |
| `/gallery` | `gallery.html` + `src/gallery/` | Eight city cards, each linking to `/generator?q=<city>` |

Clean URLs come from `vercel.json`; `vite.config.js` maps them in dev so both
runtimes behave the same.

### Navigation

One component, `src/shared/nav.js`, mounted by every page with the current page
as its only argument — there is no second copy that can drift. Sticky, 76px.

The generator runs a **focused** variant: no brand, no links, a single
left-aligned "Back to home" at a 48px gutter. Inside the tool the app's own
sidebar already carries the brand, so the nav would have repeated it.

---

## How a map gets made

```
location string
  │  POST /api/geocode          Nominatim, cached 24h at the edge
  ▼
{ lat, lon, label }
  │  POST /api/features         VersaTiles → decode → project → quantise
  ▼
delta-encoded rings            ~500 KB for a 1 km frame
  │  src/render.js              pure string building, no DOM
  ▼
SVG                            → screen, → SVG file, → PNG via canvas
```

### Why vector tiles, not Overpass

The first version queried the Overpass API from the browser. Two things killed
it:

1. Overpass **refuses some browser origins** outright — the same fetch that
   worked from `example.com` failed from `awesomemaps.vercel.app`.
2. It **rate-limits to two slots per IP**, and shared cloud egress is heavily
   used. Requests took 3–38s, and a throttled instance answers `200` with an
   empty body, which is indistinguishable from open sea.

Geometry now comes from [VersaTiles](https://versatiles.org/) (Shortbread
schema): free, key-less, CDN-served. Lisbon at a 1 km radius went from **38s and
4,484 buildings** to **0.5s and 9,779**. Open sea answers in under 30ms.

Trade-off: Shortbread carries buildings only at zoom 14, so a frame wider than
36 tiles keeps roads, water and greenery at full detail and drops buildings —
they are sub-pixel at that scale anyway.

### The payload

Vercel caps a function response at 4.5 MB, and raw Overpass JSON for a 6 km
frame over Paris was 38 MB. The server therefore:

- projects and quantises geometry into the 1000-unit artwork box, in tenths of
  a unit, **delta-encoded** along each ring (`[x0, y0, dx, dy, …]`)
- drops sub-pixel geometry and anything outside the frame
- enforces a payload budget: amenities go first, then the smallest buildings

Result: 38 MB → 3.3 MB worst case, ~500 KB typical. The client does no
projection at all — it just accumulates deltas into a path.

---

## Palettes and crop shapes

`src/presets.js` is the source of truth for both, and the counts shown on the
homepage and the gallery are read from it rather than typed in.

**12 palettes:** Default, Midnight, Pastel, Mono, Autumn, Arctic, Blueprint,
Terracotta, Sepia, Neon, Sakura, Nori. Each declares four layer colours plus
`paper` (the background) and `ink` (hairlines and railways).

**8 crop shapes:** circle, square, hexagon, portrait, landscape, panorama,
diamond, arch. Each declares the frame it cuts out of the 1000-unit render, so a
rectangle is a genuine crop of the same map rather than a squashed square. The
SVG viewBox, the on-screen canvas and the PNG export all follow that ratio — a
panorama exports 4096 × 2048, an arch 2867 × 4096 — and the Area readout is
computed from the cropped frame.

---

## Layout

```
index.html  generator.html  gallery.html

src/
  main.js            generator state + wiring
  render.js          SVG drawing, crop frames
  osm.js             client calls to /api, in-memory caching
  export.js          SVG / PNG download
  presets.js         palettes, crop shapes, layers, sample locations
  icons.js           inline icons
  style.css          generator styles
  shared/            nav.js, nav.css, tokens.css — used by all three pages
  home/              home.js, sections.js, data.js, home.css
  gallery/           gallery.js, gallery.css
  assets/            icons/, home/, gallery/

api/
  geocode.js         Nominatim proxy
  features.js        map geometry endpoint
  note.js            one-line place caption (LLM)
  _lib/
    tiles.js         tile maths, fetching, decoding, Shortbread classification
    geo.js           projection, quantisation, payload budget
    geocode.js       Nominatim
    http.js          request/response helpers

scripts/
  generate-previews.mjs   renders the card previews with the app's own engine
```

`vite.config.js` mounts the same `api/` handlers as dev middleware, so
`npm run dev` behaves like production without `vercel dev`.

---

## Design source

Built from Figma file `CZVlaXUf4Ee68o6w68VksJ`:

| Node | Screen |
|---|---|
| `1:2` | Generator |
| `5:5` | Gallery |
| `5:314` | Homepage (`5:315` is the nav) |

Where the mock and reality disagreed, reality won — and the deviation is
documented in the commit that made it:

- The mock claimed an npm package (`@cartographia/core-maps`) and a "WebGL
  coordinate compiler". Neither exists; the copy now describes plain SVG and the
  real endpoint.
- The gallery's stat panel counted "Total Views", which nothing measures.
- All eight gallery cards carried Lisbon's coordinate ticks — a duplicated-layer
  artifact. Ticks are computed per city.
- The brand is a plain teal dot in the nav design; the real brand mark is used
  instead, on every page and as the favicon.
- Figma called the app "Wonderful Maps" in one frame and "AwesomeMaps" in
  another. Unified on AwesomeMaps.

Card previews were originally Figma's placeholder art — cities the app had never
drawn. `scripts/generate-previews.mjs` now renders them with the real engine, at
a radius derived from each card's printed scale so "1 : 15,000" is true at the
size it renders.

---

## The place note

`/api/note` asks an LLM for one line about the place on screen — a landmark, a
quirk of the street layout. Cached per place for a month at the edge.

It is decoration: with no `OPENAI_API_KEY` set, or on any error, the endpoint
returns an empty note and the line stays hidden. Model is read from
`OPENAI_MODEL`, default `gpt-4o-mini`.

## The five-second wait

`MIN_GENERATION_MS` in `src/main.js` holds the spinner open for five seconds
even when the data arrives sooner (it usually does, in about half a second).
That is a deliberate product choice, not a limitation — set it to `0` to go as
fast as the data allows.

---

## Develop

```bash
npm install
npm run dev      # http://localhost:5173 — serves /api through Vite middleware
npm run build    # static output in dist/
npm run preview

node scripts/generate-previews.mjs   # re-render the card previews
```

## Deploy

Vercel project `awesomemaps`, framework preset `vite`, output `dist`,
`cleanUrls: true`. DNS is on Cloudflare: `CNAME awesomemaps →
cname.vercel-dns.com`, DNS-only (grey cloud) so Vercel terminates TLS and serves
the functions without a second proxy in front.

Environment variables (production): `OPENAI_API_KEY`, optionally `OPENAI_MODEL`.

---

## Known limits

- **No buildings past ~4 km radius** — Shortbread carries them only at zoom 14.
- **Nominatim is a shared community endpoint.** Fine at this traffic; it would
  need a paid geocoder under real load.
- **The generator is desktop-first.** It collapses below 1100px and 720px, but
  the three-column editor is designed for a wide screen.
- **Gallery card metadata is hand-written** (tags, scales). Only the geometry
  and the ticks are derived.

## Attribution

Map data © OpenStreetMap contributors, available under the
[ODbL](https://www.openstreetmap.org/copyright). Tiles served by VersaTiles,
geocoding by Nominatim — respect their usage policies if you fork this and put
it under real traffic.
