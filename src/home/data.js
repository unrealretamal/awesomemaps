import { PRESETS, SHAPES } from "../presets.js";

export const STEPS = [
  {
    badge: "01",
    title: "Choose a place.",
    body: "Name any neighbourhood. AwesomeMaps geocodes it and pulls OpenStreetMap geometry from vector tiles.",
  },
  {
    badge: "02",
    title: "Set palette and crop.",
    body: "Twelve palettes and eight crop shapes. Toggle buildings, water, greenery, roads and rail, then tune the radius.",
  },
  {
    badge: "03",
    title: "Export the poster.",
    body: "The render is plain SVG in the browser. Download the layered vector, or a 4096 px PNG for print.",
  },
];

export const STATS = [
  { value: String(PRESETS.length), label: "Palettes" },
  { value: String(SHAPES.length), label: "Crops" },
  { value: "SVG", label: "Native export" },
  { value: "OSM", label: "Open data" },
];

export const STYLES = [
  {
    title: "Circle",
    body: "A round crop of the same map — useful when the city should sit as a medal or a stamp.",
  },
  {
    title: "Square",
    body: "Equal weight on every edge. The default poster.",
  },
  {
    title: "Portrait & landscape",
    body: "Genuine crops of the frame, not squashed squares. A panorama exports 4096 × 2048.",
  },
  {
    title: "Arch, hex, diamond",
    body: "The other frames cut the same geometry. Pick the one that matches the wall, not the other way around.",
  },
];
