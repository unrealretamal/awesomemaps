import "./style.css";
import { brandMark, mountIcons } from "./icons.js";
import { mountNav } from "./shared/nav.js";
import { COLOR_KEYS, LAYERS, LOCATION_PRESETS, PRESETS, SHAPES } from "./presets.js";

// The longest edge of a PNG export; the short edge follows the crop ratio.
const EXPORT_LONG_EDGE = 4096;
import { countFeatures, fetchFeatures, geocode } from "./osm.js";
import { frameOf, renderPlaceholder, renderSvg } from "./render.js";
import { exportPng, exportSvg } from "./export.js";
import { inject } from '@vercel/analytics';

const $ = (id) => document.getElementById(id);

// The gallery links here as /generator?q=Lisbon, so a card opens the map it shows.
const requestedQuery = new URLSearchParams(location.search).get("q")?.trim();

const noteCache = new Map();

const state = {
  query: requestedQuery || "Bairro Alto, Lisbon",
  place: null,
  preset: PRESETS[0],
  colors: { ...PRESETS[0].colors },
  layers: Object.fromEntries(LAYERS.map((l) => [l.id, l.on])),
  shape: "circle",
  radius: 1000,
  roadWidth: 2,
  mapDetails: "none",
  features: null,
  note: "",
  fetchedWith: null,
  busy: false,
};

/* ── Left sidebar ──────────────────────────────────────────────── */

function buildLocationPresets() {
  $("location-presets").innerHTML = LOCATION_PRESETS.map(
    (place) => `<button class="chip" type="button" title="${place}">${place}</button>`
  ).join("");

  $("location-presets").addEventListener("click", (event) => {
    const chip = event.target.closest(".chip");
    if (!chip) return;
    $("location-input").value = chip.textContent;
    state.query = chip.textContent;
    generate();
  });
}

function buildPresets() {
  $("preset-grid").innerHTML = PRESETS.map(
    (preset) => `
      <button class="preset" type="button" data-preset="${preset.id}" aria-pressed="${
        preset.id === state.preset.id
      }">
        <span class="preset__swatches">${COLOR_KEYS.map(
          (key) => `<span class="preset__swatch" style="background:${preset.colors[key]}"></span>`
        ).join("")}</span>
        <span class="preset__name">${preset.name}</span>
      </button>`
  ).join("");

  $("preset-grid").addEventListener("click", (event) => {
    const button = event.target.closest("[data-preset]");
    if (!button) return;
    state.preset = PRESETS.find((p) => p.id === button.dataset.preset);
    state.colors = { ...state.preset.colors };
    syncPresets();
    buildColorRows();
    draw();
  });
}

function syncPresets() {
  $("preset-grid")
    .querySelectorAll("[data-preset]")
    .forEach((el) => el.setAttribute("aria-pressed", String(el.dataset.preset === state.preset.id)));
}

function buildShapes() {
  $("shape-row").innerHTML = SHAPES.map(
    (shape) => `
      <button class="shape" type="button" data-shape="${shape.id}" aria-pressed="${
        shape.id === state.shape
      }">
        <i class="icon" data-icon="${shape.id}"></i>
        <span>${shape.name}</span>
      </button>`
  ).join("");
  mountIcons($("shape-row"));

  $("shape-row").addEventListener("click", (event) => {
    const button = event.target.closest("[data-shape]");
    if (!button) return;
    state.shape = button.dataset.shape;
    $("shape-row")
      .querySelectorAll("[data-shape]")
      .forEach((el) => el.setAttribute("aria-pressed", String(el.dataset.shape === state.shape)));
    draw();
    syncMeta();
  });
}

function bindSlider(id, format, onInput) {
  const input = $(id);
  const label = $(`${id}-value`);

  const sync = () => {
    const value = Number(input.value);
    const percent = ((value - input.min) / (input.max - input.min)) * 100;
    input.style.setProperty("--fill", `${percent}%`);
    label.textContent = format(value);
    return value;
  };

  input.addEventListener("input", () => onInput(sync()));
  sync();
}

/* ── Right sidebar ─────────────────────────────────────────────── */

function buildColorRows() {
  $("color-rows").innerHTML = COLOR_KEYS.map((key) => {
    const layer = LAYERS.find((l) => l.id === key);
    return `
      <div class="color-row">
        <label class="color-row__swatch" style="background:${state.colors[key]}">
          <input type="color" value="${state.colors[key]}" data-color="${key}" aria-label="${layer.name} color" />
        </label>
        <span class="color-row__name">${layer.name}</span>
        <span class="color-row__hex">${state.colors[key]}</span>
      </div>`;
  }).join("");
}

function buildLayerRows() {
  $("layer-rows").innerHTML = LAYERS.map(
    (layer) => `
      <button class="layer-row" type="button" data-layer="${layer.id}" aria-pressed="${
        state.layers[layer.id]
      }">
        <span class="switch"></span>
        <span class="layer-row__name">${layer.name}</span>
      </button>`
  ).join("");
}

/* ── Rendering ─────────────────────────────────────────────────── */

function currentSvg(attribution = false) {
  if (!state.place || !state.features) {
    return renderPlaceholder({ preset: state.preset, shape: state.shape });
  }
  return renderSvg({
    features: state.features,
    preset: state.preset,
    colors: state.colors,
    layers: state.layers,
    shape: state.shape,
    place: state.place,
    radius: state.radius,
    roadWidth: state.roadWidth,
    mapDetails: state.mapDetails,
    attribution,
  });
}

function draw() {
  $("canvas").innerHTML = currentSvg();
}

/** PNG export size: long edge fixed, short edge from the crop ratio. */
function exportSize() {
  const { w, h } = frameOf(state.shape);
  const scale = EXPORT_LONG_EDGE / Math.max(w, h);
  return { width: Math.round(w * scale), height: Math.round(h * scale) };
}

/** Ground area actually inside the crop, in km². */
function areaKm2() {
  const { w, h } = frameOf(state.shape);
  const kmPerUnit = (state.radius * 2) / 1000 / 1000;
  const width = w * kmPerUnit;
  const height = h * kmPerUnit;
  const short = Math.min(width, height);

  if (state.shape === "circle") return Math.PI * (short / 2) ** 2;
  if (state.shape === "hexagon") return ((3 * Math.sqrt(3)) / 2) * (short / 2) ** 2;
  if (state.shape === "diamond") return (width * height) / 2;
  // Arch: a rectangle capped with a semicircle of the frame's width.
  if (state.shape === "arch") {
    const r = width / 2;
    return width * (height - r) + (Math.PI * r * r) / 2;
  }
  return width * height;
}

function syncMeta() {
  const label = state.place?.label ?? state.query;
  $("topbar-place").textContent = label;
  $("canvas-caption").textContent = label;
  $("topbar-meta").textContent = `${state.radius}m · ${state.shape}`;

  setNote(state.note);

  $("info-area").textContent = `${areaKm2().toFixed(2)} km²`;
  const { width, height } = exportSize();
  $("info-format").textContent = `${width} × ${height}`;
  $("canvas").style.setProperty("--canvas-aspect", `${width} / ${height}`);

  const lat = state.place?.lat ?? 0;
  const metresPerPixel = (state.radius * 2) / 1000;
  const zoom = Math.log2((156543.03 * Math.cos((lat * Math.PI) / 180)) / metresPerPixel);
  $("info-zoom").textContent = String(Math.max(1, Math.round(zoom)));
}

function setNote(note) {
  const el = $("topbar-note");
  el.textContent = note ?? "";
  el.hidden = !note;
}

/**
 * A one-line caption for the place, written by Claude. Decoration: if it fails
 * or no API key is configured, the line stays hidden and nothing else changes.
 */
async function loadNote(place) {
  const key = `${place.label}|${place.lat}|${place.lon}`;
  if (noteCache.has(key)) return void setNote(noteCache.get(key));

  try {
    const res = await fetch("/api/note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ place: place.label, lat: place.lat, lon: place.lon }),
    });
    const { note = "" } = await res.json();
    noteCache.set(key, note);
    // Ignore a note that arrived after the user moved on.
    if (state.place?.label !== place.label) return;
    state.note = note;
    setNote(note);
  } catch {
    setNote("");
  }
}

function setStatus(message, isError = false) {
  const el = $("status");
  el.hidden = !message;
  el.textContent = message ?? "";
  el.classList.toggle("status--error", isError);
}

/* ── Generation ────────────────────────────────────────────────── */

// A generation usually resolves in well under a second, and cached frames come
// back instantly. The wait is held open deliberately so the render reads as a
// render; drop this to 0 to go as fast as the data allows.
const MIN_GENERATION_MS = 5000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function setSpinner(label) {
  const el = $("spinner");
  el.hidden = !label;
  if (label) $("spinner-label").textContent = label;
}

function fetchKey() {
  return [
    state.query.trim().toLowerCase(),
    state.radius,
    state.layers.railways,
  ].join("|");
}

async function generate() {
  if (state.busy) return;
  state.busy = true;
  $("generate-btn").disabled = true;

  const started = performance.now();
  setStatus("");
  setSpinner("Locating…");

  try {
    state.place = await geocode(state.query);
    state.note = "";
    syncMeta();
    loadNote(state.place);

    setSpinner("Reading vector tiles…");
    state.features = await fetchFeatures({
      lat: state.place.lat,
      lon: state.place.lon,
      radius: state.radius,
      layers: state.layers,
    });
    state.fetchedWith = fetchKey();

    setSpinner("Projecting layers…");
    await wait(Math.max(0, MIN_GENERATION_MS - (performance.now() - started)));

    draw();
    syncMeta();
    const count = countFeatures(state.features, state.layers, state.mapDetails);
    setStatus(count ? "" : "No features found here — try a larger radius", !count);
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    setSpinner(null);
    state.busy = false;
    $("generate-btn").disabled = false;
  }
}

/** Data-changing controls mark the map stale instead of refetching on every tick. */
function markStale() {
  if (state.features && state.fetchedWith !== fetchKey()) {
    setStatus("Press Generate Map to apply");
  } else {
    setStatus("");
  }
}

/* ── Wiring ────────────────────────────────────────────────────── */

function init() {
  inject();
  mountNav("generator");
  mountIcons();
  $("brand-mark").src = brandMark;
  $("spinner-mark").src = brandMark;
  if (requestedQuery) $("location-input").value = requestedQuery;
  buildLocationPresets();
  buildPresets();
  buildShapes();
  buildColorRows();
  buildLayerRows();

  $("location-input").addEventListener("input", (event) => {
    state.query = event.target.value;
    markStale();
  });
  $("location-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") generate();
  });

  bindSlider("radius", (v) => `${v}m`, (value) => {
    state.radius = value;
    syncMeta();
    markStale();
  });

  bindSlider("roadwidth", (v) => String(v), (value) => {
    state.roadWidth = value;
    draw();
  });

  $("color-rows").addEventListener("input", (event) => {
    const input = event.target.closest("[data-color]");
    if (!input) return;
    state.colors[input.dataset.color] = input.value.toUpperCase();
    input.parentElement.style.background = input.value;
    input.closest(".color-row").querySelector(".color-row__hex").textContent =
      input.value.toUpperCase();
    draw();
  });

  $("layer-rows").addEventListener("click", (event) => {
    const button = event.target.closest("[data-layer]");
    if (!button) return;
    const id = button.dataset.layer;
    state.layers[id] = !state.layers[id];
    button.setAttribute("aria-pressed", String(state.layers[id]));

    // Railway lines need a refetch; all other layers are already in the payload.
    if (state.layers[id] && id === "railways" && state.place) {
      generate();
    } else {
      draw();
      markStale();
    }
  });

  $("map-details").addEventListener("change", (event) => {
    state.mapDetails = event.target.value;
    draw();
  });

  $("generate-btn").addEventListener("click", generate);

  const menu = $("export-menu");
  $("export-btn").addEventListener("click", () => {
    menu.hidden = !menu.hidden;
    $("export-btn").setAttribute("aria-expanded", String(!menu.hidden));
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".menu")) {
      menu.hidden = true;
      $("export-btn").setAttribute("aria-expanded", "false");
    }
  });
  menu.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-export]");
    if (!button) return;
    menu.hidden = true;
    const name = state.place?.label ?? state.query;
    try {
      if (button.dataset.export === "svg") {
        exportSvg(currentSvg(true), name);
      } else {
        setStatus("Rendering PNG…");
        await exportPng(currentSvg(true), name, exportSize());
        setStatus("");
      }
    } catch (error) {
      setStatus(error.message, true);
    }
  });

  draw();
  syncMeta();
  generate();
}

init();
