// Turns OSM buckets into an SVG poster. Everything is drawn in a
// 1000×1000 viewBox so the same markup scales to any export size.

const SIZE = 1000;
const M_PER_DEG_LAT = 110574;
const M_PER_DEG_LON = 111320;

function projector({ lat, lon, radius }) {
  const metresPerUnit = (radius * 2) / SIZE;
  const lonScale = Math.cos((lat * Math.PI) / 180) * M_PER_DEG_LON;
  return ([px, py]) => [
    SIZE / 2 + ((px - lon) * lonScale) / metresPerUnit,
    SIZE / 2 - ((py - lat) * M_PER_DEG_LAT) / metresPerUnit,
  ];
}

const round = (n) => Math.round(n * 10) / 10;

function toPath(points, project, closed) {
  let d = "";
  for (let i = 0; i < points.length; i += 1) {
    const [x, y] = project(points[i]);
    d += `${i === 0 ? "M" : "L"}${round(x)} ${round(y)}`;
  }
  return closed ? `${d}Z` : d;
}

function clipShape(shape) {
  if (shape === "square") return `<rect width="${SIZE}" height="${SIZE}" />`;
  if (shape === "hexagon") {
    const r = SIZE / 2;
    const points = Array.from({ length: 6 }, (_, i) => {
      const angle = ((60 * i - 90) * Math.PI) / 180;
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
 * @param {object} opts.features  buckets from osm.js (may be empty)
 * @param {object} opts.preset    palette (colors, paper, ink)
 * @param {object} opts.colors    per-layer overrides
 * @param {object} opts.layers    { [layerId]: boolean }
 * @param {string} opts.shape     circle | square | hexagon
 * @param {boolean} [opts.attribution]  stamp OSM credit inside the artwork
 */
export function renderSvg(opts) {
  const { features, preset, colors, layers, shape, place, radius, attribution = false } = opts;
  const project = projector({ lat: place.lat, lon: place.lon, radius });
  const groups = [];

  const area = (layer, fill, strokeWidth = 0) => {
    if (!layers[layer] || !features[layer]?.length) return;
    const d = features[layer]
      .filter((f) => f.points)
      .map((f) => toPath(f.points, project, true))
      .join("");
    if (!d) return;
    const stroke = strokeWidth
      ? ` stroke="${preset.ink}" stroke-width="${strokeWidth}" stroke-linejoin="round"`
      : "";
    groups.push(`<path d="${d}" fill="${fill}" fill-rule="evenodd"${stroke} />`);
  };

  const lines = (layer, stroke, base, dash = "") => {
    if (!layers[layer] || !features[layer]?.length) return;
    const byWeight = new Map();
    for (const f of features[layer]) {
      if (!f.points) continue;
      const w = round(base * (f.weight ?? 1));
      if (w <= 0) continue;
      byWeight.set(w, (byWeight.get(w) ?? "") + toPath(f.points, project, false));
    }
    for (const [width, d] of byWeight) {
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
    const dots = features.amenities
      .filter((f) => f.point)
      .map((f) => {
        const [x, y] = project(f.point);
        return `<circle cx="${round(x)}" cy="${round(y)}" r="2.5" />`;
      })
      .join("");
    if (dots) groups.push(`<g fill="${preset.ink}">${dots}</g>`);
  }

  const credit = attribution
    ? `<text x="${SIZE / 2}" y="${SIZE - 24}" text-anchor="middle" font-family="JetBrains Mono, monospace" ` +
      `font-size="16" fill="${preset.ink}">© OpenStreetMap contributors</text>`
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
