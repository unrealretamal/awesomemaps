// Palettes and layer definitions. Swatch values come straight from the
// Figma "Style Preset" cards; `paper` is the map background behind them.

export const LAYERS = [
  { id: "buildings", name: "Buildings", on: true },
  { id: "water", name: "Water", on: true },
  { id: "greenery", name: "Greenery", on: true },
  { id: "roads", name: "Roads", on: true },
  { id: "railways", name: "Railways", on: false },
  { id: "amenities", name: "Amenities", on: false },
];

// Order shown in the "Layer Colors" panel.
export const COLOR_KEYS = ["water", "greenery", "buildings", "roads"];

export const PRESETS = [
  {
    id: "default",
    name: "Default",
    colors: { water: "#A8D5E8", greenery: "#B5C99A", buildings: "#D4A96A", roads: "#F0EBE1" },
    paper: "#EFE8DA",
    ink: "#C9BFA8",
  },
  {
    id: "midnight",
    name: "Midnight",
    colors: { water: "#1A3A5C", greenery: "#1A2E1A", buildings: "#2D2416", roads: "#1E1E24" },
    paper: "#0E1014",
    ink: "#2A2E38",
  },
  {
    id: "pastel",
    name: "Pastel",
    colors: { water: "#B8D4E8", greenery: "#C8DDB4", buildings: "#F4D4C0", roads: "#EDE8E0" },
    paper: "#F4EFE7",
    ink: "#D8D2C8",
  },
  {
    id: "mono",
    name: "Mono",
    colors: { water: "#3A3A3A", greenery: "#2A2A2A", buildings: "#555555", roads: "#888888" },
    paper: "#EDEDED",
    ink: "#B4B4B4",
  },
  {
    id: "autumn",
    name: "Autumn",
    colors: { water: "#4A6FA5", greenery: "#6B7C45", buildings: "#C27C3E", roads: "#D4C5A9" },
    paper: "#EFE7D6",
    ink: "#B9A987",
  },
  {
    id: "arctic",
    name: "Arctic",
    colors: { water: "#7DB8D4", greenery: "#A8C4B8", buildings: "#C8D8E0", roads: "#E8F0F4" },
    paper: "#DDE9F0",
    ink: "#CBDBE4",
  },
];

export const SHAPES = [
  { id: "circle", name: "circle" },
  { id: "square", name: "square" },
  { id: "hexagon", name: "hexagon" },
];

// Short editorial note shown next to the topbar meta tag (Figma node 4:18).
// Keys are lowercase substrings matched against the resolved place label (the
// geocoder returns e.g. "Bairro Alto, Misericordia", not the typed query), so
// only places we have a note for show one; everything else hides the slot.
export const LOCATION_PRESETS = [
  "Montmartre, Paris",
  "Bairro Alto, Lisbon",
  "Trastevere, Rome",
  "Shimokitazawa, Tokyo",
];
