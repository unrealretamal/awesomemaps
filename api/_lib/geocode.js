import { UpstreamError } from "./http.js";

const NOMINATIM = "https://nominatim.openstreetmap.org/search";

// Nominatim's usage policy requires an identifying User-Agent.
export const USER_AGENT = "awesomemaps/0.2 (+https://github.com/unrealretamal/awesomemaps)";

export async function geocode(query) {
  const q = String(query ?? "").trim();
  if (!q) throw new UpstreamError("Enter a location", 400);

  const url = `${NOMINATIM}?q=${encodeURIComponent(q)}&format=json&limit=1&addressdetails=1`;
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new UpstreamError(`Geocoding failed (${res.status})`);

  const [hit] = await res.json();
  if (!hit) throw new UpstreamError(`No match for "${q}"`, 404);

  const address = hit.address || {};
  return {
    lat: Number(hit.lat),
    lon: Number(hit.lon),
    label: hit.display_name.split(",").slice(0, 2).join(",").trim(),
    city: address.city || address.town || address.municipality || address.province || q,
    search: q,
  };
}
