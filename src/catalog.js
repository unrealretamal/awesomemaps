import { CATALOG_META } from "./catalog-data.js";
import { PRESETS } from "./presets.js";

import mapBerlin from "./assets/gallery/map-berlin.webp";
import mapMadrid from "./assets/gallery/map-madrid.webp";
import mapTokyo from "./assets/gallery/map-tokyo.webp";
import mapLisbon from "./assets/gallery/map-lisbon.webp";
import mapNewYork from "./assets/gallery/map-new-york.webp";
import mapCairo from "./assets/gallery/map-cairo.webp";
import mapSydney from "./assets/gallery/map-sydney.webp";
import mapReykjavik from "./assets/gallery/map-reykjavik.webp";
import mapRio from "./assets/gallery/map-rio-de-janeiro.webp";
import mapParis from "./assets/gallery/map-paris.webp";

const IMAGES = {
  berlin: mapBerlin,
  madrid: mapMadrid,
  tokyo: mapTokyo,
  lisbon: mapLisbon,
  "new-york": mapNewYork,
  cairo: mapCairo,
  sydney: mapSydney,
  reykjavik: mapReykjavik,
  "rio-de-janeiro": mapRio,
  paris: mapParis,
};

const presetName = (id) => PRESETS.find((preset) => preset.id === id)?.name ?? id;

export const CATALOG = CATALOG_META.map((entry) => ({
  ...entry,
  image: IMAGES[entry.slug],
  presetName: presetName(entry.preset),
}));

export const FEATURED = CATALOG.slice(0, 3);
export const GALLERY_PREVIEW = CATALOG.slice(3, 7);

export function generatorHref(entry) {
  const params = new URLSearchParams({
    q: entry.city,
    preset: entry.preset,
    shape: entry.shape,
    lat: String(entry.lat),
    lon: String(entry.lon),
  });
  return `/generator?${params}`;
}
