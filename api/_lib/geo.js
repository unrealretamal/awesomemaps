// Projection, quantisation and the payload budget.
//
// The artwork is a 1000×1000 box. Geometry leaves this server already
// projected into that box, in tenths of a unit and delta-encoded along each
// ring ([x0, y0, dx, dy, …]), which is what keeps a wide frame under the
// 4.5 MB serverless response limit.

export const SIZE_UNITS = 1000;
export const PRECISION = 10;

const M_PER_DEG_LAT = 110574;
const M_PER_DEG_LON = 111320;

/** lon/lat → tenths of an artwork unit. */
export function projector(lat, lon, radius) {
  const unitsPerMetre = SIZE_UNITS / (radius * 2);
  const lonScale = Math.cos((lat * Math.PI) / 180) * M_PER_DEG_LON;
  return (pointLon, pointLat) => [
    Math.round((SIZE_UNITS / 2 + (pointLon - lon) * lonScale * unitsPerMetre) * PRECISION),
    Math.round((SIZE_UNITS / 2 - (pointLat - lat) * M_PER_DEG_LAT * unitsPerMetre) * PRECISION),
  ];
}

// Anything thinner than ~0.8 unit cannot be seen in the artwork.
const MIN_EXTENT = Math.round(0.8 * PRECISION);

// Tiles cover more ground than the frame; drop what falls well outside it.
const PAD = 60 * PRECISION;
const MIN_XY = -PAD;
const MAX_XY = SIZE_UNITS * PRECISION + PAD;

/**
 * Drop coincident points, delta-encode, and reject geometry that is invisible
 * or outside the frame.
 *
 * @param {Array<[number, number]>} points  already projected, in tenths of a unit
 * @returns {{ring: number[], extent: number}|null}
 */
export function encodeRing(points, closed) {
  const out = [];
  let lastX = 0;
  let lastY = 0;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < points.length; i += 1) {
    const [x, y] = points[i];
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);

    const isEdge = i === 0 || i === points.length - 1;
    if (!isEdge && Math.abs(x - lastX) < MIN_EXTENT && Math.abs(y - lastY) < MIN_EXTENT) continue;

    if (out.length === 0) out.push(x, y);
    else out.push(x - lastX, y - lastY);
    lastX = x;
    lastY = y;
  }

  if (maxX < MIN_XY || minX > MAX_XY || maxY < MIN_XY || minY > MAX_XY) return null;
  if (maxX - minX < MIN_EXTENT && maxY - minY < MIN_EXTENT) return null;
  if (out.length < (closed ? 6 : 4)) return null;
  return { ring: out, extent: Math.max(maxX - minX, maxY - minY) };
}

export function emptyFeatures() {
  return {
    buildings: [], water: [], greenery: [], roads: [], railways: [],
    landmarks: [], transit: [], roadNames: [],
  };
}

// Vercel caps a function response at 4.5 MB; stay comfortably under it.
const MAX_PAYLOAD = 3_200_000;

/**
 * Shrink a dense frame until it fits the response budget: amenities go first
 * (they are decoration), then the smallest buildings, which are barely a pixel
 * wide at that scale anyway.
 */
export function fitPayload(features, sizedBuildings) {
  const size = () => JSON.stringify(features).length;
  if (size() <= MAX_PAYLOAD) return;

  for (const threshold of [15, 25, 40, 60, 100]) {
    features.buildings = sizedBuildings.filter((b) => b.extent >= threshold).map((b) => b.ring);
    if (size() <= MAX_PAYLOAD) return;
  }
  features.buildings = [];
}
