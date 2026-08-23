// Map geometry comes from VersaTiles: free, key-less, CDN-served vector tiles
// in the Shortbread schema. It replaced Overpass, which throttled shared cloud
// egress hard enough to return empty frames after 30+ seconds.
//
// Tiles are decoded here rather than in the browser so the client keeps its
// small delta-encoded payload and the edge can cache the result.

import { VectorTile } from "@mapbox/vector-tile";
import { PbfReader } from "pbf";
import { UpstreamError } from "./http.js";
import { emptyFeatures, encodeRing, fitPayload, projector } from "./geo.js";

const TILE_HOST = "https://tiles.versatiles.org/tiles/osm";
const MAX_ZOOM = 14; // Shortbread carries buildings only at the top zoom.
// A wide frame still fetches full-detail tiles, but stops decoding buildings:
// past ~16 tiles they are a pixel wide and would only bloat the payload.
const MAX_TILES = 49;
const BUILDING_TILE_LIMIT = 36;
const TILE_TIMEOUT_MS = 12000;
const MAX_LANDMARKS = 60;
const MAX_TRANSIT = 100;

const M_PER_DEG_LAT = 110574;
const M_PER_DEG_LON = 111320;

/* ── Shortbread → our layers ───────────────────────────────────── */

const GREEN_KINDS = new Set([
  "park", "garden", "grass", "forest", "wood", "scrub", "heath", "meadow",
  "village_green", "allotments", "playground", "recreation_ground", "cemetery",
  "grave_yard", "orchard", "vineyard", "nature_reserve", "golf_course",
]);

const RAIL_KINDS = new Set([
  "rail", "light_rail", "subway", "tram", "narrow_gauge", "funicular", "monorail",
]);

// Visual hierarchy for street widths, relative to the Road Width slider.
const ROAD_WEIGHT = {
  motorway: 1.6,
  trunk: 1.5,
  primary: 1.3,
  secondary: 1.1,
  tertiary: 0.95,
  unclassified: 0.7,
  residential: 0.7,
  living_street: 0.6,
};

const LANDMARK_AMENITIES = new Set(["arts_centre", "museum", "theatre", "place_of_worship"]);
const LANDMARK_TOURISM = new Set(["attraction", "museum", "viewpoint"]);
const TRANSIT_KINDS = new Set(["station", "halt", "tram_stop", "subway_entrance"]);
const inFrame = ([x, y]) => x >= 0 && x <= 10000 && y >= 0 && y <= 10000;

/* ── Tile maths ────────────────────────────────────────────────── */

const lonToTileX = (lon, n) => ((lon + 180) / 360) * n;

const latToTileY = (lat, n) => {
  const rad = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n;
};

const tileXToLon = (x, n) => (x / n) * 360 - 180;

const tileYToLat = (y, n) =>
  (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) / Math.PI;

/** Tiles covering the frame, dropping a zoom level if the frame is too wide. */
function tileGrid(lat, lon, radius) {
  const dLat = radius / M_PER_DEG_LAT;
  const dLon = radius / (M_PER_DEG_LON * Math.cos((lat * Math.PI) / 180));

  for (let z = MAX_ZOOM; z >= 10; z -= 1) {
    const n = 2 ** z;
    const minX = Math.floor(lonToTileX(lon - dLon, n));
    const maxX = Math.floor(lonToTileX(lon + dLon, n));
    const minY = Math.floor(latToTileY(lat + dLat, n));
    const maxY = Math.floor(latToTileY(lat - dLat, n));
    const count = (maxX - minX + 1) * (maxY - minY + 1);

    if (count <= MAX_TILES) {
      const tiles = [];
      for (let x = minX; x <= maxX; x += 1) {
        for (let y = minY; y <= maxY; y += 1) tiles.push({ z, x, y });
      }
      return tiles;
    }
  }
  return [];
}

async function fetchTile({ z, x, y }) {
  const res = await fetch(`${TILE_HOST}/${z}/${x}/${y}`, {
    signal: AbortSignal.timeout(TILE_TIMEOUT_MS),
  });
  // Missing tiles (ocean, out of coverage) answer 204/404 or an empty body.
  if (!res.ok) {
    if (res.status === 404 || res.status === 204) return null;
    throw new Error(`tile ${z}/${x}/${y} → ${res.status}`);
  }
  const buffer = new Uint8Array(await res.arrayBuffer());
  if (buffer.length === 0) return null;
  return { z, x, y, tile: new VectorTile(new PbfReader(buffer)) };
}

/* ── Decoding ──────────────────────────────────────────────────── */

/** Per-tile point converter: tile-local coordinates → artwork units. */
function tilePointMapper({ z, x, y }, extent, project) {
  const n = 2 ** z;
  return (point) =>
    project(tileXToLon(x + point.x / extent, n), tileYToLat(y + point.y / extent, n));
}

function collect(layer, mapper, closed, onRing) {
  if (!layer) return;
  for (let i = 0; i < layer.length; i += 1) {
    const feature = layer.feature(i);
    const rings = feature.loadGeometry();
    for (const ring of rings) {
      if (ring.length < 2) continue;
      const encoded = encodeRing(ring.map(mapper), closed);
      if (encoded) onRing(encoded, feature.properties);
    }
  }
}

function decodeTile(entry, project, features, sizedBuildings, withBuildings) {
  const { tile } = entry;

  const mapperFor = (layer) => tilePointMapper(entry, layer.extent, project);

  const buildings = withBuildings ? tile.layers.buildings : null;
  if (buildings) {
    collect(buildings, mapperFor(buildings), true, (encoded) => {
      features.buildings.push(encoded.ring);
      sizedBuildings.push(encoded);
    });
  }

  // `water_polygons` covers rivers/lakes. Coast and open sea live separately
  // in Shortbread's `ocean` layer and must be merged into same visual layer.
  for (const water of [tile.layers.ocean, tile.layers.water_polygons]) {
    if (water) collect(water, mapperFor(water), true, (e) => features.water.push(e.ring));
  }

  const land = tile.layers.land;
  if (land) {
    collect(land, mapperFor(land), true, (encoded, props) => {
      if (GREEN_KINDS.has(props.kind)) features.greenery.push(encoded.ring);
    });
  }

  const streets = tile.layers.streets;
  if (streets) {
    const mapper = mapperFor(streets);
    collect(streets, mapper, false, (encoded, props) => {
      const kind = props.kind;
      if (RAIL_KINDS.has(kind)) {
        features.railways.push({ w: 1, p: encoded.ring });
        return;
      }
      const weight = ROAD_WEIGHT[kind];
      if (weight) features.roads.push({ w: weight, p: encoded.ring });
    });
  }

  const pois = tile.layers.pois;
  if (pois) {
    const mapper = mapperFor(pois);
    for (let i = 0; i < pois.length; i += 1) {
      const feature = pois.feature(i);
      const props = feature.properties;
      if (!props.name || !(props.historic || LANDMARK_AMENITIES.has(props.amenity) || LANDMARK_TOURISM.has(props.tourism))) continue;
      const point = feature.loadGeometry()[0]?.[0];
      if (!point) continue;
      const projected = mapper(point);
      if (!inFrame(projected)) continue;
      const kind = props.historic ? "historic" : props.amenity || props.tourism || "landmark";
      features.landmarks.push({ p: projected, n: props.name, k: kind });
    }
  }

  const transport = tile.layers.public_transport;
  if (transport) {
    const mapper = mapperFor(transport);
    for (let i = 0; i < transport.length; i += 1) {
      const feature = transport.feature(i);
      const props = feature.properties;
      if (!props.name || !TRANSIT_KINDS.has(props.kind)) continue;
      const point = feature.loadGeometry()[0]?.[0];
      if (!point) continue;
      const projected = mapper(point);
      if (inFrame(projected)) features.transit.push({ p: projected, n: props.name, k: props.kind });
    }
  }
}

/* ── Public API ────────────────────────────────────────────────── */

const MAX_RADIUS = 6000;
const MIN_RADIUS = 100;

export async function fetchFeatures({ lat, lon, radius, railways }) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new UpstreamError("Invalid coordinates", 400);
  }
  const safeRadius = Math.min(Math.max(Number(radius) || 1000, MIN_RADIUS), MAX_RADIUS);

  const grid = tileGrid(lat, lon, safeRadius);
  if (grid.length === 0) throw new UpstreamError("Frame too wide to render", 400);

  const results = await Promise.allSettled(grid.map(fetchTile));
  const tiles = results.filter((r) => r.status === "fulfilled" && r.value).map((r) => r.value);

  if (tiles.length === 0) {
    const reason = results.find((r) => r.status === "rejected")?.reason;
    if (reason) throw new UpstreamError(`Tile server unreachable — ${reason.message}`, 503);
    return emptyFeatures(); // genuinely blank coverage, e.g. open sea
  }

  const project = projector(lat, lon, safeRadius);
  const features = emptyFeatures();
  const sizedBuildings = [];
  const withBuildings = grid.length <= BUILDING_TILE_LIMIT;
  for (const tile of tiles) decodeTile(tile, project, features, sizedBuildings, withBuildings);

  const nearestUnique = (points, limit) => {
    const seen = new Set();
    return points
      .sort((a, b) => (a.p[0] - 5000) ** 2 + (a.p[1] - 5000) ** 2 - ((b.p[0] - 5000) ** 2 + (b.p[1] - 5000) ** 2))
      .filter((point) => {
        const key = `${point.k}|${point.n}|${Math.round(point.p[0] / 20)}|${Math.round(point.p[1] / 20)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, limit);
  };
  features.landmarks = nearestUnique(features.landmarks, MAX_LANDMARKS);
  features.transit = nearestUnique(features.transit, MAX_TRANSIT);

  // Railway lines are opt-in; landmark/transit points stay small and power
  // the client-side detail dropdown without another network request.
  if (!railways) features.railways = [];

  fitPayload(features, sizedBuildings);
  return features;
}

/** Detail points and railways ride along in the same tiles, so one cache key fits all. */
export { MAX_RADIUS, MIN_RADIUS };
