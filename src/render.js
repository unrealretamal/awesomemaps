// Draws the poster from the payload produced by /api/features.
//
// Geometry arrives already projected into the 1000×1000 artwork box, in tenths
// of a unit and delta-encoded along each ring: [x0, y0, dx, dy, …]. Areas are
// bare rings, roads and railways are { w: weight, p: ring }, amenities are one
// delta-encoded point list.

const SIZE = 1000;
const PRECISION = 10;

function toPath(ring, closed) {
  let x = ring[0];
  let y = ring[1];
  let d = `M${x / PRECISION} ${y / PRECISION}`;
  for (let i = 2; i < ring.length; i += 2) {
    x += ring[i];
    y += ring[i + 1];
    d += `L${x / PRECISION} ${y / PRECISION}`;
  }
  return closed ? `${d}Z` : d;
}

function clipShape(shape) {
  if (shape === "square") return `<rect width="${SIZE}" height="${SIZE}" />`;
  if (shape === "hexagon") {
    const r = SIZE / 2;
    const points = Array.from({ length: 6 }, (_, i) => {
      const angle = ((60 * i - 90) * Math.PI) / 180;
      const round = (n) => Math.round(n * 10) / 10;
      return `${round(r + r * Math.cos(angle))},${round(r + r * Math.sin(angle))}`;
    });
    return `<polygon points="${points.join(" ")}" />`;
  }
  return `<circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="${SIZE / 2}" />`;
}

const escape = (text) =>
  String(text).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);

/**
 * @param {object} opts
 * @param {object} opts.features  payload from /api/features
 * @param {object} opts.preset    palette (colors, paper, ink)
 * @param {object} opts.colors    per-layer color overrides
 * @param {object} opts.layers    { [layerId]: boolean }
 * @param {string} opts.shape     circle | square | hexagon
 * @param {boolean} [opts.attribution]  stamp the OSM credit inside the artwork
 */
export function renderSvg(opts) {
  const { features, preset, colors, layers, shape, place, attribution = false } = opts;
  const groups = [];

  const area = (layer, fill, strokeWidth = 0) => {
    if (!layers[layer] || !features[layer]?.length) return;
    const d = features[layer].map((ring) => toPath(ring, true)).join("");
    if (!d) return;
    const stroke = strokeWidth
      ? ` stroke="${preset.ink}" stroke-width="${strokeWidth}" stroke-linejoin="round"`
      : "";
    groups.push(`<path d="${d}" fill="${fill}" fill-rule="evenodd"${stroke} />`);
  };

  const lines = (layer, stroke, base, dash = "") => {
    if (!layers[layer] || !features[layer]?.length) return;
    const byWidth = new Map();
    for (const { w, p } of features[layer]) {
      const width = Math.round(base * (w ?? 1) * 10) / 10;
      if (width <= 0) continue;
      byWidth.set(width, (byWidth.get(width) ?? "") + toPath(p, false));
    }
    for (const [width, d] of byWidth) {
      groups.push(
        `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" ` +
          `stroke-linecap="round" stroke-linejoin="round"${dash} />`
      );
    }
  };

  area("water", colors.water);
  area("greenery", colors.greenery);
  lines("roads", colors.roads, opts.roadWidth);
  lines("railways", preset.ink, Math.max(opts.roadWidth * 0.5, 1), ' stroke-dasharray="6 5"');
  area("buildings", colors.buildings, 0.6);

  if (layers.amenities && features.amenities?.length) {
    const points = features.amenities;
    let x = points[0];
    let y = points[1];
    let dots = `<circle cx="${x / PRECISION}" cy="${y / PRECISION}" r="2.5" />`;
    for (let i = 2; i < points.length; i += 2) {
      x += points[i];
      y += points[i + 1];
      dots += `<circle cx="${x / PRECISION}" cy="${y / PRECISION}" r="2.5" />`;
    }
    groups.push(`<g fill="${preset.ink}">${dots}</g>`);
  }

  const credit = attribution
    ? `<text x="${SIZE / 2}" y="${SIZE - 24}" text-anchor="middle" ` +
      `font-family="JetBrains Mono, monospace" font-size="16" fill="${preset.ink}">` +
      `© OpenStreetMap contributors</text>`
    : "";

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" ` +
    `role="img" aria-label="Map of ${escape(place.label)}">` +
    `<defs><clipPath id="crop">${clipShape(shape)}</clipPath></defs>` +
    `<g clip-path="url(#crop)">` +
    `<rect width="${SIZE}" height="${SIZE}" fill="${preset.paper}" />` +
    groups.join("") +
    credit +
    `</g></svg>`
  );
}

/** Placeholder artwork shown before the first generation. */
export function renderPlaceholder({ preset, shape }) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" aria-hidden="true">` +
    `<defs><clipPath id="crop">${clipShape(shape)}</clipPath></defs>` +
    `<g clip-path="url(#crop)">` +
    `<rect width="${SIZE}" height="${SIZE}" fill="${preset.paper}" />` +
    `</g></svg>`
  );
}
