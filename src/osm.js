// Client side of the OSM pipeline. Both calls go to our own /api functions:
// Overpass refuses some browser origins and rate-limits per IP, and the proxy
// lets the edge cache identical requests.

const geocodeCache = new Map();
const featureCache = new Map();

async function post(path, payload) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? `Request failed (${res.status})`);
  return data;
}

export async function geocode(query) {
  const key = query.trim().toLowerCase();
  if (!key) throw new Error("Enter a location");
  if (geocodeCache.has(key)) return geocodeCache.get(key);

  const place = await post("/api/geocode", { query });
  geocodeCache.set(key, place);
  return place;
}

export async function fetchFeatures({ lat, lon, radius, layers }) {
  const key = [lat, lon, radius, layers.railways].join("|");
  if (featureCache.has(key)) return featureCache.get(key);

  const features = await post("/api/features?v=3", {
    lat,
    lon,
    radius,
    railways: layers.railways,
  });
  featureCache.set(key, features);
  return features;
}

/** Total number of geometries, used to warn on empty areas. */
export function countFeatures(features, layers, mapDetails) {
  const visible = Object.entries(layers)
    .filter(([, on]) => on)
    .reduce((total, [layer]) => total + (features[layer]?.length ?? 0), 0);
  const details = mapDetails === "landmarks" ? features.landmarks?.length ?? 0
    : mapDetails === "transit" ? features.transit?.length ?? 0
      : mapDetails === "all" ? (features.landmarks?.length ?? 0) + (features.transit?.length ?? 0)
        : 0;
  return visible + details;
}
