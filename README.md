# AwesomeMaps

Poster-style map generator in the browser. A side product by
[Diego Ramos Retamal](https://retamal.xyz).

Pick a neighbourhood, a palette and a crop shape; the app pulls OpenStreetMap
geometry and draws an SVG you can export as SVG or a 4096 px PNG.

- **Live:** https://awesomemaps.diegoramosretamal.info
- **Also at:** https://awesomemaps.vercel.app
- **Repo:** https://github.com/unrealretamal/awesomemaps

## Lineage

The plotting idea started as a Streamlit studio forked from
[marceloprates/prettymaps](https://github.com/marceloprates/prettymaps):
[unrealretamal/prettymaps-studio](https://github.com/unrealretamal/prettymaps-studio)
(AGPL-3.0, Python). That editor is still the Python studio.

This repository is the independent JavaScript product — no prettymaps code is
reused, so it is not bound by that project's AGPL terms.

## Stack

- Vite + vanilla JS, no framework, no CSS framework
- [VersaTiles](https://versatiles.org/) vector tiles (Shortbread schema) for map
  geometry and [Nominatim](https://nominatim.org/) for geocoding, both behind our
  own `/api` functions. Tiles replaced the Overpass API, which throttled shared
  cloud egress to 3-38s per frame and answered 200 with an empty body when it
  gave up
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
index.html            home (editorial product page)
gallery.html          gallery of adapted posters
generator.html        three-column generator
DESIGN.md             visual system (paper / ink / terracotta + tool HUD)
src/main.js           generator state + event wiring
src/presets.js        palettes, layers, crop shapes, sample locations
src/catalog.js        unified catalogue for home + gallery
src/osm.js            client calls to /api, with in-memory caching
src/render.js         SVG drawing from the delta-encoded payload
src/export.js         SVG / PNG download
src/style.css         generator styles (HUD tokens)
src/shared/           nav, tokens, site URLs — used by all three pages
src/home/             landing page
src/gallery/          gallery page
src/assets/icons/brand-mark.svg   brand mark source
public/icons/         favicon + apple-touch derived from the mark
api/geocode.js        Nominatim proxy
api/features.js       map geometry endpoint
api/_lib/tiles.js     tile maths, fetching, decoding, Shortbread classification
api/_lib/geo.js       projection, quantisation, payload budget
api/_lib/geocode.js   Nominatim
api/_lib/http.js      request/response helpers
```

## Deploy

Static build, deploys to Vercel as-is (framework preset: Vite, output `dist`).

## Attribution

Map data © OpenStreetMap contributors, available under the
[ODbL](https://www.openstreetmap.org/copyright). Tiles are served by VersaTiles
and geocoding by the public Nominatim endpoint — respect their usage policies if
you fork this and put it under real traffic.
