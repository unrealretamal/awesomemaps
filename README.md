# awesomemaps

Poster-style map generator in the browser. Pick a neighbourhood, a palette and a
crop shape; the app pulls OpenStreetMap geometry and draws an SVG you can export
as SVG or a 4096 × 4096 PNG.

Inspired by [prettymaps](https://github.com/marceloprates/prettymaps) by Marcelo
Prates. This is an independent JavaScript implementation — no prettymaps code is
reused, so it is not bound by that project's AGPL terms.

## Stack

- Vite + vanilla JS, no framework, no CSS framework
- [Nominatim](https://nominatim.org/) for geocoding, [Overpass](https://overpass-api.de/)
  for OSM geometry — both behind our own `/api` functions, because Overpass
  refuses some browser origins and rate-limits to two slots per IP
- SVG rendering; PNG export rasterises the same markup on a canvas

## Develop

```bash
npm install
npm run dev      # http://localhost:5173 — serves /api through Vite middleware
npm run build    # static output in dist/
npm run preview
```

## Structure

```
index.html            markup for the three-column app shell
src/main.js           state + event wiring
src/presets.js        palettes, layers, crop shapes, sample locations
src/osm.js            client calls to /api, with in-memory caching
src/render.js         SVG drawing from the delta-encoded payload
src/export.js         SVG / PNG download
src/style.css         design tokens and layout
src/assets/icons/     icons exported from the Figma source file
api/geocode.js        Nominatim proxy
api/features.js       Overpass proxy
api/_lib/osm.js       queries, tag classification, projection, payload budget
```

## Deploy

Static build, deploys to Vercel as-is (framework preset: Vite, output `dist`).

## Attribution

Map data © OpenStreetMap contributors, available under the
[ODbL](https://www.openstreetmap.org/copyright). Geocoding and geometry come from
the public Nominatim and Overpass endpoints — respect their usage policies if you
fork this and put it under real traffic.
