import { fetchFeatures, readJson, sendJson, UpstreamError } from "./_lib/osm.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Use POST" });

  try {
    const { lat, lon, radius, railways, amenities } = await readJson(req);
    const features = await fetchFeatures({
      lat: Number(lat),
      lon: Number(lon),
      radius: Number(radius),
      railways: Boolean(railways),
      amenities: Boolean(amenities),
    });
    return sendJson(res, 200, features, 86400);
  } catch (error) {
    const status = error instanceof UpstreamError ? error.status : 500;
    return sendJson(res, status, { error: error.message });
  }
}
