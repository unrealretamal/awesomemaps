// Single catalogue of adapted posters. Consumed by the app (via catalog.js)
// and by scripts/generate-previews.mjs — keep this file free of asset imports
// so Node can load it.

export const HOME_ALIASES = { "new-york": "newyork" };

export const HERO_PREVIEW = {
  slug: "hero-circle",
  lat: 52.52,
  lon: 13.405,
  preset: "nori",
  shape: "circle",
  ratio: 14000,
  px: 240,
  roadWidth: 2.5,
};

/** @typedef {"circle" | "rect"} PreviewKind */

/**
 * @typedef {object} CatalogMeta
 * @property {string} slug
 * @property {string} city
 * @property {string} country
 * @property {string} tag
 * @property {number} lat
 * @property {number} lon
 * @property {string} preset   id from presets.js
 * @property {string} shape    crop id from presets.js
 * @property {PreviewKind} preview
 * @property {number} ratio    printed scale denominator
 * @property {string} scale
 * @property {string} id
 * @property {number} px
 * @property {number} roadWidth
 */

/** @type {CatalogMeta[]} */
export const CATALOG_META = [
  {
    slug: "berlin",
    city: "Berlin",
    country: "Germany",
    tag: "Rail & Grid",
    lat: 52.52,
    lon: 13.405,
    preset: "nori",
    shape: "circle",
    preview: "circle",
    ratio: 16000,
    scale: "1 : 16,000",
    id: "OSM-BER-16",
    px: 172,
    roadWidth: 2,
  },
  {
    slug: "madrid",
    city: "Madrid",
    country: "Spain",
    tag: "Warm Geometry",
    lat: 40.4168,
    lon: -3.7038,
    preset: "terracotta",
    shape: "square",
    preview: "rect",
    ratio: 18000,
    scale: "1 : 18,000",
    id: "OSM-MAD-18",
    px: 278,
    roadWidth: 2,
  },
  {
    slug: "tokyo",
    city: "Tokyo",
    country: "Japan",
    tag: "High Density",
    lat: 35.6764,
    lon: 139.65,
    preset: "midnight",
    shape: "square",
    preview: "rect",
    ratio: 25000,
    scale: "1 : 25,000",
    id: "OSM-TYO-25",
    px: 278,
    roadWidth: 1.5,
  },
  {
    slug: "lisbon",
    city: "Lisbon",
    country: "Portugal",
    tag: "Hills & Grid",
    lat: 38.7223,
    lon: -9.1393,
    preset: "default",
    shape: "circle",
    preview: "circle",
    ratio: 15000,
    scale: "1 : 15,000",
    id: "OSM-LIS-15",
    px: 172,
    roadWidth: 2,
  },
  {
    slug: "new-york",
    city: "New York",
    country: "United States",
    tag: "Street Grid",
    lat: 40.7128,
    lon: -74.006,
    preset: "mono",
    shape: "circle",
    preview: "circle",
    ratio: 18000,
    scale: "1 : 18,000",
    id: "OSM-NYC-18",
    px: 172,
    roadWidth: 2,
  },
  {
    slug: "cairo",
    city: "Cairo",
    country: "Egypt",
    tag: "River Coast",
    lat: 30.0444,
    lon: 31.2357,
    preset: "autumn",
    shape: "square",
    preview: "rect",
    ratio: 30000,
    scale: "1 : 30,000",
    id: "OSM-CAI-30",
    px: 278,
    roadWidth: 1.5,
  },
  {
    slug: "sydney",
    city: "Sydney",
    country: "Australia",
    tag: "Harbour",
    lat: -33.8688,
    lon: 151.2093,
    preset: "arctic",
    shape: "square",
    preview: "rect",
    ratio: 20000,
    scale: "1 : 20,000",
    id: "OSM-SYD-20",
    px: 278,
    roadWidth: 1.5,
  },
  {
    slug: "reykjavik",
    city: "Reykjavik",
    country: "Iceland",
    tag: "Coastal",
    lat: 64.1466,
    lon: -21.9426,
    preset: "pastel",
    shape: "circle",
    preview: "circle",
    ratio: 12000,
    scale: "1 : 12,000",
    id: "OSM-REY-12",
    px: 172,
    roadWidth: 2.5,
  },
  {
    slug: "rio-de-janeiro",
    city: "Rio de Janeiro",
    country: "Brazil",
    tag: "Mountain Coast",
    lat: -22.9068,
    lon: -43.1729,
    preset: "arctic",
    shape: "square",
    preview: "rect",
    ratio: 22000,
    scale: "1 : 22,000",
    id: "OSM-RIO-22",
    px: 278,
    roadWidth: 1.5,
  },
  {
    slug: "paris",
    city: "Paris",
    country: "France",
    tag: "Radial Grid",
    lat: 48.8566,
    lon: 2.3522,
    preset: "default",
    shape: "circle",
    preview: "circle",
    ratio: 16000,
    scale: "1 : 16,000",
    id: "OSM-PAR-16",
    px: 172,
    roadWidth: 2,
  },
];
