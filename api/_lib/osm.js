// Server-side OSM access, shared by the Vercel functions and the Vite dev
// middleware. Overpass rejects some browser origins outright and rate-limits
// per IP (2 slots), so all traffic goes through here instead of the browser.

const OVERPASS_MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.osm.ch/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const NOMINATIM = "https://nominatim.openstreetmap.org/search";

// Nominatim's usage policy requires an identifying User-Agent.
const USER_AGENT = "awesomemaps/0.1 (+https://github.com/unrealretamal/awesomemaps)";

const MAX_RADIUS = 6000;
const MIN_RADIUS = 100;
const MIRROR_TIMEOUT_MS = 20000;

export class UpstreamError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.status = status;
  }
}

/* ── Geocoding ─────────────────────────────────────────────────── */

export async function geocode(query) {
  const q = String(query ?? "").trim();
  if (!q) throw new UpstreamError("Enter a location", 400);

  const url = `${NOMINATIM}?q=${encodeURIComponent(q)}&format=json&limit=1`;
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": USER_AGENT },
  });
  if (!res.ok) throw new UpstreamError(`Geocoding failed (${res.status})`);

  const [hit] = await res.json();
  if (!hit) throw new UpstreamError(`No match for "${q}"`, 404);

  return {
    lat: Number(hit.lat),
    lon: Number(hit.lon),
    label: hit.display_name.split(",").slice(0, 2).join(",").trim(),
  };
}

/* ── Overpass ──────────────────────────────────────────────────── */

const AREA_FILTERS = [
  '["building"]',
  '["natural"="water"]',
  '["waterway"~"^(riverbank|dock|canal)$"]',
  '["landuse"~"^(grass|forest|meadow|village_green|recreation_ground|allotments|cemetery)$"]',
  '["leisure"~"^(park|garden|pitch|golf_course|nature_reserve)$"]',
  '["natural"~"^(wood|scrub|heath|grassland)$"]',
];

function buildQuery({ lat, lon, radius, railways, amenities }) {
  const at = `(around:${Math.round(radius)},${lat},${lon})`;
  const parts = AREA_FILTERS.map((filter) => `way${filter}${at};`);
  parts.push(`relation["natural"="water"]${at};`);
  parts.push(`way["highway"]["highway"!~"^(footway|steps|path|corridor)$"]${at};`);
  if (railways) parts.push(`way["railway"~"^(rail|light_rail|subway|tram)$"]${at};`);
  if (amenities) parts.push(`node["amenity"]${at};`);
  return `[out:json][timeout:60];(${parts.join("")});out geom;`;
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

// Geometry is projected and quantised here, not in the browser: the payload
// becomes small integer deltas instead of full lon/lat pairs, which is what
// keeps a wide frame under the 4.5 MB serverless response limit.
//
// Units: the artwork is a 1000×1000 box; coordinates are sent in tenths of a
// unit (0.1 unit ≈ 0.2 m at a 1 km radius), delta-encoded along each ring.
const SIZE_UNITS = 1000;
const PRECISION = 10;
const M_PER_DEG_LAT = 110574;
const M_PER_DEG_LON = 111320;
const MAX_AMENITIES = 6000;

function projector(lat, lon, radius) {
  const unitsPerMetre = SIZE_UNITS / (radius * 2);
  const lonScale = Math.cos((lat * Math.PI) / 180) * M_PER_DEG_LON;
  return (pointLon, pointLat) => [
    Math.round((SIZE_UNITS / 2 + (pointLon - lon) * lonScale * unitsPerMetre) * PRECISION),
    Math.round((SIZE_UNITS / 2 - (pointLat - lat) * M_PER_DEG_LAT * unitsPerMetre) * PRECISION),
  ];
}

// Anything thinner than ~0.8 unit cannot be seen in the artwork.
const MIN_EXTENT = Math.round(0.8 * PRECISION);

/** Project, drop coincident points, delta-encode. Returns null if invisible. */
function encodeRing(ring, project, closed) {
  const out = [];
  let lastX = 0;
  let lastY = 0;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < ring.length; i += 1) {
    const [x, y] = project(ring[i].lon, ring[i].lat);
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);

    const isEdge = i === 0 || i === ring.length - 1;
    if (!isEdge && Math.abs(x - lastX) < MIN_EXTENT && Math.abs(y - lastY) < MIN_EXTENT) continue;

    if (out.length === 0) out.push(x, y);
    else out.push(x - lastX, y - lastY);
    lastX = x;
    lastY = y;
  }

  if (maxX - minX < MIN_EXTENT && maxY - minY < MIN_EXTENT) return null;
  if (out.length < (closed ? 6 : 4)) return null;
  return { ring: out, extent: Math.max(maxX - minX, maxY - minY) };
}

// Vercel caps a function response at 4.5 MB; stay comfortably under it.
const MAX_PAYLOAD = 3_500_000;

/**
 * Shrink a dense frame until it fits the response budget: amenities go first
 * (they are decoration), then the smallest buildings, which are barely a
 * pixel wide at that scale anyway.
 */
function fit(out, sized) {
  const size = () => JSON.stringify(out).length;
  if (size() <= MAX_PAYLOAD) return;

  out.amenities = [];
  if (size() <= MAX_PAYLOAD) return;

  for (const threshold of [15, 25, 40, 60, 100]) {
    out.buildings = sized.filter((b) => b.extent >= threshold).map((b) => b.ring);
    if (size() <= MAX_PAYLOAD) return;
  }
  out.buildings = [];
}

/**
 * Compact payload: areas are delta-encoded rings, roads and railways carry a
 * width weight, amenities are one delta-encoded point list.
 */
function compact(elements, radius, lat, lon) {
  const out = { buildings: [], water: [], greenery: [], roads: [], railways: [], amenities: [] };
  const sizedBuildings = [];
  const project = projector(lat, lon, radius);
  // Service roads and alleys turn into noise once the frame gets wide.
  const minRoadWeight = radius > 3000 ? 0.5 : 0;

  let amenityX = 0;
  let amenityY = 0;

  for (const el of elements) {
    const layer = layerOf(el.tags);
    if (!layer) continue;

    if (el.type === "node") {
      if (out.amenities.length >= MAX_AMENITIES * 2) continue;
      const [x, y] = project(el.lon, el.lat);
      if (out.amenities.length === 0) out.amenities.push(x, y);
      else out.amenities.push(x - amenityX, y - amenityY);
      amenityX = x;
      amenityY = y;
      continue;
    }

    const isLine = layer === "roads" || layer === "railways";
    const weight = isLine ? (ROAD_WEIGHT[el.tags.highway?.replace(/_link$/, "")] ?? 0.6) : 0;
    if (layer === "roads" && weight < minRoadWeight) continue;

    const rings =
      el.type === "relation"
        ? (el.members ?? []).filter((m) => m.geometry).map((m) => m.geometry)
        : el.geometry
          ? [el.geometry]
          : [];

    for (const ring of rings) {
      if (!ring || ring.length < 2) continue;
      const encoded = encodeRing(ring, project, !isLine);
      if (!encoded) continue;

      if (isLine) out[layer].push({ w: weight, p: encoded.ring });
      else out[layer].push(encoded.ring);
      if (layer === "buildings") sizedBuildings.push(encoded);
    }
  }

  fit(out, sizedBuildings);
  return out;
}

export async function fetchFeatures({ lat, lon, radius, railways, amenities }) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new UpstreamError("Invalid coordinates", 400);
  }
  const safeRadius = Math.min(Math.max(Number(radius) || 1000, MIN_RADIUS), MAX_RADIUS);
  const body = new URLSearchParams({
    data: buildQuery({ lat, lon, radius: safeRadius, railways, amenities }),
  });

  let lastError;
  // Public Overpass instances allow two concurrent slots per IP, and the
  // shared cloud egress we sit behind is heavily used — so walk the mirrors,
  // pause, then walk them once more before giving up.
  for (const endpoint of [...OVERPASS_MIRRORS, "retry", ...OVERPASS_MIRRORS]) {
    if (endpoint === "retry") {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      continue;
    }
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body,
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(MIRROR_TIMEOUT_MS),
      });
      if (res.status === 429 || res.status === 504) {
        lastError = new Error(`${endpoint} busy (${res.status})`);
        continue;
      }
      if (!res.ok) {
        lastError = new Error(`${endpoint} returned ${res.status}`);
        continue;
      }
      const json = await res.json();
      // Overpass answers 200 with a `remark` when a query times out or the
      // rate limit bites; the body is empty but looks successful.
      if (json.remark) {
        lastError = new Error(json.remark);
        continue;
      }
      if (!json.elements?.length) {
        // Throttled mirrors return an empty 200 too, and we cannot tell that
        // apart from open sea — so never treat it as a successful frame.
        lastError = new Error("empty response");
        continue;
      }
      return compact(json.elements, safeRadius, lat, lon);
    } catch (error) {
      lastError = error;
    }
  }
  throw new UpstreamError(
    `OpenStreetMap's Overpass API is throttling us — press Generate Map again ` +
      `(${lastError?.message ?? "unknown"})`,
    503
  );
}

/* ── Tiny helpers shared by both runtimes ──────────────────────── */

export async function readJson(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

export function sendJson(res, status, payload, cacheSeconds = 0) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader(
    "Cache-Control",
    cacheSeconds
      ? `public, s-maxage=${cacheSeconds}, stale-while-revalidate=604800`
      : "no-store"
  );
  res.end(JSON.stringify(payload));
}
