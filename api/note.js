// One-line note about the place currently on the map, written by Claude.
//
// The design hardcoded "One of the best spots in Lisbon so far", which is only
// true for one location. This asks for a short, specific line about whatever
// the user actually searched — a landmark, a quirk, what the streets are like.
//
// Requires ANTHROPIC_API_KEY. Without it the endpoint returns an empty note and
// the UI simply hides the line, so the app still works with no key configured.

import Anthropic from "@anthropic-ai/sdk";
import { readJson, sendJson } from "./_lib/http.js";

const MODEL = "claude-opus-5";
const MAX_PLACE_LENGTH = 120;

const SYSTEM = `You write one-line captions for a map poster generator.

Given a place, reply with a single sentence about that specific place: a
landmark, a quirk of its street layout, what it is known for, or what it feels
like to walk through. Be concrete and affectionate, never generic — "a lovely
area" could describe anywhere and is useless.

Rules:
- One sentence, at most 90 characters.
- No emoji, no quotation marks, no trailing period.
- English, regardless of the language the place name is in.
- If you do not recognise the place, describe what its coordinates suggest
  (coastal, mountainous, dense, remote) rather than inventing landmarks.`;

export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Use POST" });

  try {
    const { place, lat, lon } = await readJson(req);
    const name = String(place ?? "").trim().slice(0, MAX_PLACE_LENGTH);
    if (!name) return sendJson(res, 400, { error: "Missing place" });

    // No key configured: degrade to no note rather than failing the page.
    if (!process.env.ANTHROPIC_API_KEY) return sendJson(res, 200, { note: "" }, 3600);

    const client = new Anthropic();
    const coordinates =
      Number.isFinite(Number(lat)) && Number.isFinite(Number(lon))
        ? ` (${Number(lat).toFixed(4)}, ${Number(lon).toFixed(4)})`
        : "";

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 200,
      system: SYSTEM,
      output_config: { effort: "low" },
      messages: [{ role: "user", content: `${name}${coordinates}` }],
    });

    if (response.stop_reason === "refusal") return sendJson(res, 200, { note: "" }, 3600);

    const note = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join(" ")
      .trim()
      .replace(/^["'“”]|["'“”.]$/g, "");

    // Place notes do not change; cache them hard at the edge.
    return sendJson(res, 200, { note }, 2592000);
  } catch (error) {
    // A caption is decoration — never let it break a generation.
    return sendJson(res, 200, { note: "", error: error.message }, 0);
  }
}
