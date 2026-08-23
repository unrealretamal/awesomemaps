// Renders the card previews for the homepage and the gallery with the app's
// own engine — same tiles, same SVG renderer, same palettes as a live
// generation — instead of shipping the placeholder art from the mock.
//
//   node scripts/generate-previews.mjs
//
// Radii are derived from each card's printed scale so the ratio on the card is
// true at the size it renders on screen (CSS px at 96dpi), rather than being
// decorative text.

import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { fetchFeatures } from "../api/_lib/tiles.js";
import { renderSvg } from "../src/render.js";
import { PRESETS } from "../src/presets.js";

const MM_PER_CSS_PX = 25.4 / 96;
const OUTPUT_WIDTH = 900;

/** Radius in metres that makes `1 : ratio` true at `cssPx` wide. */
const radiusFor = (ratio, cssPx) => Math.round((ratio * cssPx * MM_PER_CSS_PX) / 1000 / 2);

// Card render widths: circular lens 172px, rectangular inset 278px.
const CIRCLE_PX = 172;
const RECT_PX = 278;

const CITIES = [
  { slug: "lisbon",         lat: 38.7223,  lon: -9.1393,   preset: "default",  shape: "circle", ratio: 15000, px: CIRCLE_PX, roadWidth: 2 },
  { slug: "tokyo",          lat: 35.6764,  lon: 139.65,    preset: "midnight", shape: "square", ratio: 25000, px: RECT_PX,   roadWidth: 1.5 },
  { slug: "new-york",       lat: 40.7128,  lon: -74.006,   preset: "mono",     shape: "circle", ratio: 18000, px: CIRCLE_PX, roadWidth: 2 },
  { slug: "cairo",          lat: 30.0444,  lon: 31.2357,   preset: "autumn",   shape: "square", ratio: 30000, px: RECT_PX,   roadWidth: 1.5 },
  { slug: "sydney",         lat: -33.8688, lon: 151.2093,  preset: "arctic",   shape: "square", ratio: 20000, px: RECT_PX,   roadWidth: 1.5 },
  { slug: "reykjavik",      lat: 64.1466,  lon: -21.9426,  preset: "pastel",   shape: "circle", ratio: 12000, px: CIRCLE_PX, roadWidth: 2.5 },
  { slug: "rio-de-janeiro", lat: -22.9068, lon: -43.1729,  preset: "arctic",   shape: "square", ratio: 22000, px: RECT_PX,   roadWidth: 1.5 },
  { slug: "paris",          lat: 48.8566,  lon: 2.3522,    preset: "default",  shape: "circle", ratio: 16000, px: CIRCLE_PX, roadWidth: 2 },
];

// The homepage hero lens, and the home page's own file naming.
const HERO = { slug: "hero-circle", lat: 38.7223, lon: -9.1393, preset: "default", shape: "circle", ratio: 14000, px: 240, roadWidth: 2.5 };
const HOME_ALIASES = { "new-york": "newyork" };

const LAYERS = {
  buildings: true,
  water: true,
  greenery: true,
  roads: true,
  railways: false,
  amenities: false,
};

async function render(entry) {
  const preset = PRESETS.find((p) => p.id === entry.preset);
  const radius = radiusFor(entry.ratio, entry.px);

  const features = await fetchFeatures({
    lat: entry.lat,
    lon: entry.lon,
    radius,
    railways: false,
    amenities: false,
  });

  const svg = renderSvg({
    features,
    preset,
    colors: preset.colors,
    layers: LAYERS,
    shape: entry.shape,
    place: { lat: entry.lat, lon: entry.lon, label: entry.slug },
    radius,
    roadWidth: entry.roadWidth,
  });

  const png = await sharp(Buffer.from(svg), { density: 200 })
    .resize(OUTPUT_WIDTH, OUTPUT_WIDTH, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 88 })
    .toBuffer();

  return { svg, png, radius, features };
}

async function main() {
  await mkdir("src/assets/gallery", { recursive: true });
  await mkdir("src/assets/home", { recursive: true });

  for (const entry of [...CITIES, HERO]) {
    const { png, radius, features } = await render(entry);
    const isHero = entry.slug === HERO.slug;

    const targets = isHero
      ? [`src/assets/home/map-hero-circle.webp`]
      : [
          `src/assets/gallery/map-${entry.slug}.webp`,
          `src/assets/home/map-${HOME_ALIASES[entry.slug] ?? entry.slug}.webp`,
        ];

    for (const path of targets) await writeFile(path, png);

    console.log(
      `${entry.slug.padEnd(16)} ${entry.preset.padEnd(9)} r=${String(radius).padStart(4)}m ` +
        `buildings=${String(features.buildings.length).padStart(5)} roads=${String(features.roads.length).padStart(5)} ` +
        `→ ${(png.length / 1024).toFixed(0)} KB`
    );
  }
}

main();
