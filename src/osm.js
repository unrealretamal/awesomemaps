// OpenStreetMap access: Nominatim for geocoding, Overpass for geometry.
// Both are free community endpoints — keep requests coarse and cached.

const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const OVERPASS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const geocodeCache = new Map();

export async function geocode(query) {
  const key = query.trim().toLowerCase();
  if (!key) throw new Error("Enter a location");
  if (geocodeCache.has(key)) return geocodeCache.get(key);

  const url = `${NOMINATIM}?q=${encodeURIComponent(query)}&format=json&limit=1`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);

  const [hit] = await res.json();
  if (!hit) throw new Error(`No match for "${query}"`);

  const place = {
    lat: Number(hit.lat),
    lon: Number(hit.lon),
    label: hit.display_name.split(",").slice(0, 2).join(",").trim(),
  };
  geocodeCache.set(key, place);
  return place;
}

const AREA_FILTERS = [
  '["building"]',
  '["natural"="water"]',
  '["waterway"~"^(riverbank|dock|canal)$"]',
  '["landuse"~"^(grass|forest|meadow|village_green|recreation_ground|allotments|cemetery)$"]',
  '["leisure"~"^(park|garden|pitch|golf_course|nature_reserve)$"]',
  '["natural"~"^(wood|scrub|heath|grassland)$"]',
];

function buildQuery({ lat, lon, radius, layers }) {
  const at = `(around:${Math.round(radius)},${lat},${lon})`;
  const parts = AREA_FILTERS.map((f) => `way${f}${at};`);
  parts.push(`relation["natural"="water"]${at};`);
  if (layers.roads) parts.push(`way["highway"]["highway"!~"^(footway|steps|path|corridor)$"]${at};`);
  if (layers.railways) parts.push(`way["railway"~"^(rail|light_rail|subway|tram)$"]${at};`);
  if (layers.amenities) parts.push(`node["amenity"]${at};`);
  return `[out:json][timeout:60];(${parts.join("")});out geom;`;
}

/** Fetch raw OSM elements, bucketed by layer id. */
export async function fetchFeatures(options) {
  const body = new URLSearchParams({ data: buildQuery(options) });
  let lastError;

  for (const endpoint of OVERPASS) {
    try {
      const res = await fetch(endpoint, { method: "POST", body });
      if (!res.ok) throw new Error(`Overpass ${res.status}`);
      return classify((await res.json()).elements ?? []);
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(`Could not reach Overpass — ${lastError?.message ?? "unknown error"}`);
}

const GREEN_LANDUSE = /^(grass|forest|meadow|village_green|recreation_ground|allotments|cemetery)$/;
const GREEN_LEISURE = /^(park|garden|pitch|golf_course|nature_reserve)$/;
const GREEN_NATURAL = /^(wood|scrub|heath|grassland)$/;

function layerOf(tags = {}) {
  if (tags.building) return "buildings";
  if (tags.natural === "water" || tags.water || tags.waterway) return "water";
  if (GREEN_LANDUSE.test(tags.landuse ?? "")) return "greenery";
  if (GREEN_LEISURE.test(tags.leisure ?? "")) return "greenery";
  if (GREEN_NATURAL.test(tags.natural ?? "")) return "greenery";
  if (tags.highway) return "roads";
  if (tags.railway) return "railways";
  if (tags.amenity) return "amenities";
  return null;
}

// Rough visual hierarchy for street widths, relative to the Road Width slider.
const ROAD_WEIGHT = {
  motorway: 1.6,
  trunk: 1.5,
  primary: 1.3,
  secondary: 1.1,
  tertiary: 0.95,
  residential: 0.7,
  unclassified: 0.7,
  living_street: 0.6,
  service: 0.45,
  pedestrian: 0.45,
};

function classify(elements) {
  const buckets = { buildings: [], water: [], greenery: [], roads: [], railways: [], amenities: [] };

  for (const el of elements) {
    const layer = layerOf(el.tags);
    if (!layer) continue;

    if (el.type === "node") {
      buckets[layer].push({ point: [el.lon, el.lat] });
      continue;
    }

    const rings = el.type === "relation"
      ? (el.members ?? []).filter((m) => m.geometry).map((m) => m.geometry)
      : el.geometry
        ? [el.geometry]
        : [];

    for (const ring of rings) {
      if (ring.length < 2) continue;
      const points = ring.map((p) => [p.lon, p.lat]);
      const weight = ROAD_WEIGHT[el.tags.highway?.replace(/_link$/, "")] ?? 0.6;
      buckets[layer].push({ points, weight, closed: layer !== "roads" && layer !== "railways" });
    }
  }
  return buckets;
}
