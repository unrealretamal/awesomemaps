import { PRESETS, SHAPES } from "../presets.js";
// Homepage content (Figma node 5:314). Card data drives both the featured
// strip (5:365) and the gallery preview (5:584) — same card, two grids.
import mapBerlin from "../assets/home/map-berlin.webp";
import mapMadrid from "../assets/home/map-madrid.webp";
import mapTokyo from "../assets/home/map-tokyo.webp";
import mapNewYork from "../assets/home/map-newyork.webp";
import mapCairo from "../assets/home/map-cairo.webp";
import mapReykjavik from "../assets/home/map-reykjavik.webp";
import mapParis from "../assets/home/map-paris.webp";

export const FEATURED = [
  {
    city: "Berlin",
    country: "Germany",
    tag: "Rail & Grid",
    lat: "52.5200° N",
    lon: "13.4050° E",
    code: "OSM-BER-16",
    scale: "1 : 16,000",
    shape: "circle",
    img: mapBerlin,
  },
  {
    city: "Madrid",
    country: "Spain",
    tag: "Warm Geometry",
    lat: "40.4168° N",
    lon: "3.7038° W",
    code: "OSM-MAD-18",
    scale: "1 : 18,000",
    shape: "rect",
    img: mapMadrid,
  },
  {
    city: "Tokyo",
    country: "Japan",
    tag: "High Density",
    lat: "35.6764° N",
    lon: "139.6500° E",
    code: "OSM-TYO-12",
    scale: "1 : 25,000",
    shape: "rect",
    img: mapTokyo,
  },
];

export const GALLERY = [
  {
    city: "New York",
    country: "United States",
    tag: "Topographic",
    lat: "40.7128° N",
    lon: "74.0060° W",
    code: "OSM-NYC-09",
    scale: "1 : 18,000",
    shape: "circle",
    img: mapNewYork,
  },
  {
    city: "Cairo",
    country: "Egypt",
    tag: "River Coast",
    lat: "30.0444° N",
    lon: "31.2357° E",
    code: "OSM-CAI-22",
    scale: "1 : 30,000",
    shape: "rect",
    img: mapCairo,
  },
  {
    city: "Reykjavik",
    country: "Iceland",
    tag: "Glacier/Volcanic",
    lat: "64.1466° N",
    lon: "21.9426° W",
    code: "OSM-REY-41",
    scale: "1 : 12,000",
    shape: "circle",
    img: mapReykjavik,
  },
  {
    city: "Paris",
    country: "France",
    tag: "Radial Grid",
    lat: "48.8566° N",
    lon: "2.3522° E",
    code: "OSM-PAR-02",
    scale: "1 : 16,000",
    shape: "circle",
    img: mapParis,
  },
];

export const STEPS = [
  {
    badge: "01 CHOOSE LOCATION",
    title: "Enter Coordinates",
    body: "Query any city on Earth. AwesomeMaps pulls raw geospatial geometry straight from OpenStreetMap nodes and ways, in real time.",
  },
  {
    badge: "02 CUSTOMIZE STYLE",
    title: "Stylize Layers",
    body: "Toggle specific map structures (buildings, transit, vegetation, water) and map custom high-contrast color palettes or focus radii.",
  },
  {
    badge: "03 GENERATE & EXPORT",
    title: "High-Res Render",
    body: "Every render is plain SVG, drawn in the browser — no raster tiles. Export the layered vector file, or a 4096 px PNG for print.",
  },
];

// Counts come from the source of truth so they cannot drift from the app.
export const STATS = [
  { value: String(PRESETS.length), label: "Style Presets", accent: true },
  { value: String(SHAPES.length), label: "Crop Shapes", accent: false },
  { value: "∞", label: "Custom Variations", accent: false },
  { value: "OSM", label: "Data Powered", accent: true },
];

export const STYLES = [
  {
    diagram: "circle-outline",
    title: "Urban Grid",
    body: "Maximizes layout geometry of urban centers. High contrast architectural alignments.",
  },
  {
    diagram: "rect-outline",
    title: "Topographic",
    body: "Features elegant geological land shapes and elevation patterns.",
  },
  {
    diagram: "circle-solid",
    title: "Coastline",
    body: "Isolates water interfaces to generate high contrast marine graphics.",
  },
  {
    diagram: "radial",
    title: "Radial Grid",
    body: "Organized around concentric road formats, ideal for European historically planned cities.",
  },
];
