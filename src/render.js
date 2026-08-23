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

const DETAIL_ICONS = {
  train: `<path d="M-5-5h10v8a3 3 0 01-3 3h-4a3 3 0 01-3-3zm2 2h6v4h-6zm0 9-2 3m8-3 2 3"/>`,
  metro: `<circle r="6"/><path d="M-3 3v-6l3 4 3-4v6"/>`,
  tram: `<path d="M-5-4h10v8H-5zm2 0 2-3h2l2 3M-3 0h6M-3 7l2-3m4 3L1 4"/>`,
  church: `<path d="M0-7v14M-4-2h8"/>`,
  mosque: `<path d="M3-6a6 6 0 10.5 11A5 5 0 113-6z" fill="currentColor" stroke="none"/><path d="M4-7l.7 1.5 1.6.2-1.2 1.1.3 1.6L4-3.4l-1.4.8.3-1.6-1.2-1.1 1.6-.2z" fill="currentColor" stroke="none"/>`,
  synagogue: `<path d="M0-7 6 4H-6zm0 14L-6-4H6z"/>`,
  temple: `<path d="M-6-3h12M-4-3l1 9m7-9L3 6M-6 6H6M-3-6h6"/>`,
  museum: `<path d="M-6-3 0-7l6 4zM-5-1h10M-4-1v6m3-6v6m2-6v6m3-6v6M-6 6H6"/>`,
  theatre: `<path d="M-6-5h12v7a6 6 0 01-12 0zM-3-1h.1M3-1h.1M-3 3q3 2 6 0"/>`,
  viewpoint: `<path d="M-7 0q7-8 14 0Q0 8-7 0z"/><circle r="2"/>`,
  historic: `<path d="M-6 6V-3l3-2 3 2 3-2 3 2v9M-6 1H6M-3 6V2h6v4"/>`,
  landmark: `<path d="M0-7 2-2l5 2-5 2-2 5-2-5-5-2 5-2z"/>`,
};

function detailIcon(kind, mode) {
  if (mode === "metro" || kind === "subway_entrance") return DETAIL_ICONS.metro;
  if (mode === "train") return DETAIL_ICONS.train;
  if (kind === "tram_stop") return DETAIL_ICONS.tram;
  if (kind === "station" || kind === "halt") return DETAIL_ICONS.train;
  if (kind === "museum") return DETAIL_ICONS.museum;
  if (kind === "theatre" || kind === "arts_centre") return DETAIL_ICONS.theatre;
  if (kind === "viewpoint") return DETAIL_ICONS.viewpoint;
  if (kind === "historic") return DETAIL_ICONS.historic;
  if (kind === "worship:muslim") return DETAIL_ICONS.mosque;
  if (kind === "worship:jewish") return DETAIL_ICONS.synagogue;
  if (["worship:buddhist", "worship:shinto", "worship:hindu"].includes(kind)) return DETAIL_ICONS.temple;
  if (kind === "worship:christian") return DETAIL_ICONS.church;
  if (kind.startsWith("worship:")) return DETAIL_ICONS.landmark;
  return DETAIL_ICONS.landmark;
}

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
  const { features, preset, colors, layers, shape, place, mapDetails = "none", attribution = false } = opts;
  const groups = [];

  const area = (layer, fill, strokeWidth = 0) => {
    if (!layers[layer] || !features[layer]?.length) return;
    const d = features[layer].map((ring) => toPath(ring, true)).join("");
    if (!d) return;
    // Never outline tile-clipped area fragments: their artificial closing edges
    // form straight horizontal/vertical lines across the finished map.
    const stroke = strokeWidth
      ? ` stroke="${preset.ink}" stroke-width="${strokeWidth}" stroke-linejoin="round"`
      : "";
    // Vector tiles include buffered overlap beyond each tile edge. evenodd
    // cancels those overlaps into straight seams; nonzero keeps them filled.
    groups.push(`<path d="${d}" fill="${fill}" fill-rule="nonzero"${stroke} />`);
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
  area("buildings", colors.buildings);

  const showLandmarks = mapDetails === "landmarks" || mapDetails === "all";
  const showTransit = mapDetails === "transit" || mapDetails === "all";
  const marker = ({ p: [x, y], n, k, m }) =>
    `<g transform="translate(${x / PRECISION} ${y / PRECISION})">` +
    `<circle r="10" fill="${preset.paper}" stroke="${preset.ink}" stroke-width="2"/>` +
    `<g color="${preset.ink}" fill="none" stroke="currentColor" stroke-width="1.5" ` +
    `stroke-linecap="round" stroke-linejoin="round">${detailIcon(k, m)}</g>` +
    `<title>${escape(n)}</title></g>`;

  if (showLandmarks && features.landmarks?.length) {
    groups.push(`<g aria-label="Landmarks">${features.landmarks.map(marker).join("")}</g>`);
  }
  if (showTransit && features.transit?.length) {
    groups.push(`<g aria-label="Metro and rail stations">${features.transit.map(marker).join("")}</g>`);
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
