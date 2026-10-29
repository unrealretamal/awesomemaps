import "../shared/tokens.css";
import "./gallery.css";
import { mountNav } from "../shared/nav.js";
import { CATALOG, generatorHref } from "../catalog.js";
import { PORTFOLIO_URL, STUDIO_URL } from "../shared/site.js";
import { inject } from "@vercel/analytics";

const PALETTE_FILTERS = [...new Set(CATALOG.map((entry) => entry.preset))];
const SHAPE_FILTERS = [...new Set(CATALOG.map((entry) => entry.shape))];

const escape = (value) =>
  String(value).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function card(entry, isHero) {
  const round = entry.preview === "circle" ? " gal-card__image--round" : "";
  return `
    <a class="gal-card${isHero ? " gal-card--hero" : ""}" href="${generatorHref(entry)}">
      <div class="gal-card__well">
        <img class="gal-card__image${round}" src="${entry.image}" alt="Poster map of ${escape(entry.city)} in the ${escape(entry.presetName)} palette" loading="lazy" />
      </div>
      <div class="gal-card__meta">
        <div>
          <h2 class="gal-card__city">${escape(entry.city)}</h2>
          <p class="gal-card__country">${escape(entry.country)}</p>
        </div>
        <span class="gal-card__tag">${escape(entry.presetName)} · ${escape(entry.shape)}</span>
      </div>
    </a>`;
}

function chip(name, value, current, group) {
  const pressed = value === current;
  return `<button class="gal-chip" type="button" data-filter="${group}" data-value="${escape(value)}" aria-pressed="${pressed}">${escape(name)}</button>`;
}

function filtersMarkup(preset, shape) {
  const presetChips = [
    chip("All palettes", "", preset, "preset"),
    ...PALETTE_FILTERS.map((id) => {
      const name = CATALOG.find((entry) => entry.preset === id)?.presetName ?? id;
      return chip(name, id, preset, "preset");
    }),
  ].join("");
  const shapeChips = [
    chip("All crops", "", shape, "shape"),
    ...SHAPE_FILTERS.map((id) => chip(id, id, shape, "shape")),
  ].join("");
  return `
    <div class="gal-filters" role="toolbar" aria-label="Filter adaptations">
      <div class="gal-filters__row">${presetChips}</div>
      <div class="gal-filters__row">${shapeChips}</div>
    </div>`;
}

function filteredCatalog(preset, shape) {
  return CATALOG.filter((entry) => {
    if (preset && entry.preset !== preset) return false;
    if (shape && entry.shape !== shape) return false;
    return true;
  });
}

function pageShell() {
  return `
    <section class="gal-intro">
      <h1 class="gal-display">The city looks back.</h1>
      <p>Ten adaptations of live OpenStreetMap geometry — each city paired with a palette and a crop, then drawn as a print.</p>
    </section>

    <div id="gal-filters"></div>
    <div class="gal-grid" id="gal-grid"></div>

    <footer class="gal-foot">
      <p>AwesomeMaps — a side product by Diego Ramos Retamal. Map data © OpenStreetMap contributors.</p>
      <p>
        <a href="${PORTFOLIO_URL}" rel="author">retamal.xyz</a>
        ·
        <a href="${STUDIO_URL}" rel="noopener">Python studio</a>
      </p>
    </footer>`;
}

function renderGrid(preset, shape) {
  const host = document.getElementById("gal-grid");
  const filterHost = document.getElementById("gal-filters");
  if (!host || !filterHost) return;
  filterHost.innerHTML = filtersMarkup(preset, shape);
  const matches = filteredCatalog(preset, shape);
  if (matches.length === 0) {
    host.innerHTML = `<p class="gal-empty">No adaptations match those filters. Clear a filter to see the full collection.</p>`;
    return;
  }
  const unfiltered = !preset && !shape;
  host.innerHTML = matches.map((entry, index) => card(entry, unfiltered && index === 0)).join("");
}

mountNav("gallery");
inject();

const root = document.getElementById("gallery");
if (root) {
  root.innerHTML = pageShell();
  let preset = "";
  let shape = "";
  renderGrid(preset, shape);
  root.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    const group = button.dataset.filter;
    const value = button.dataset.value ?? "";
    if (group === "preset") preset = value;
    if (group === "shape") shape = value;
    renderGrid(preset, shape);
  });
}
