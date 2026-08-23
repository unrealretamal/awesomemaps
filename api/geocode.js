import { geocode } from "./_lib/geocode.js";
import { readJson, sendJson, UpstreamError } from "./_lib/http.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Use POST" });

  try {
    const { query } = await readJson(req);
    return sendJson(res, 200, await geocode(query), 86400);
  } catch (error) {
    const status = error instanceof UpstreamError ? error.status : 500;
    return sendJson(res, status, { error: error.message });
  }
}
