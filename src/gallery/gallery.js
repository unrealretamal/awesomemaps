// Gallery page (Figma node 5:5, frame "map-gallery").
// Every card is generated from the CITIES data array below — the design shows
// eight hand-drawn copies of one card, we keep a single template.
import "../shared/tokens.css";
import "./gallery.css";
import { mountNav } from "../shared/nav.js";
import { PRESETS } from "../presets.js";
import { inject } from '@vercel/analytics';

import gridLineH from "../assets/gallery/grid-line-h.png";
import gridLineV from "../assets/gallery/grid-line-v.png";
import compassOuter from "../assets/gallery/compass-outer.png";
import compassInner from "../assets/gallery/compass-inner.svg";
import mapLisbon from "../assets/gallery/map-lisbon.webp";
import mapTokyo from "../assets/gallery/map-tokyo.webp";
import mapNewYork from "../assets/gallery/map-new-york.webp";
import mapCairo from "../assets/gallery/map-cairo.webp";
import mapSydney from "../assets/gallery/map-sydney.webp";
import mapReykjavik from "../assets/gallery/map-reykjavik.webp";
import mapRio from "../assets/gallery/map-rio-de-janeiro.webp";
import mapParis from "../assets/gallery/map-paris.webp";

/**
 * @typedef {object} City
 * @property {string} city
 * @property {string} country
 * @property {string} tag      accent pill copy
 * @property {number} lat      signed degrees, drives the corner ticks
 * @property {number} lon      signed degrees
 * @property {string} scale    scale-bar readout
 * @property {string} id       catalogue id shown bottom-right
 * @property {"circle"|"rect"} shape  preview treatment
 * @property {string} image    imported preview asset
 */

/** @type {City[]} */
const CITIES = [
  { city: "Lisbon", country: "Portugal", tag: "Urban Grid", lat: 38.7223, lon: -9.1393, scale: "1 : 15,000", id: "OSM-15", shape: "circle", image: mapLisbon },
  { city: "Tokyo", country: "Japan", tag: "High Density", lat: 35.6764, lon: 139.65, scale: "1 : 25,000", id: "OSM-15", shape: "rect", image: mapTokyo },
  { city: "New York", country: "United States", tag: "Topographic", lat: 40.7128, lon: -74.006, scale: "1 : 18,000", id: "OSM-15", shape: "circle", image: mapNewYork },
  { city: "Cairo", country: "Egypt", tag: "River Coast", lat: 30.0444, lon: 31.2357, scale: "1 : 30,000", id: "OSM-15", shape: "rect", image: mapCairo },
  { city: "Sydney", country: "Australia", tag: "Coastline", lat: -33.8688, lon: 151.2093, scale: "1 : 20,000", id: "OSM-15", shape: "rect", image: mapSydney },
  { city: "Reykjavik", country: "Iceland", tag: "Glacier/Volcanic", lat: 64.1466, lon: -21.9426, scale: "1 : 12,000", id: "OSM-15", shape: "circle", image: mapReykjavik },
  { city: "Rio de Janeiro", country: "Brazil", tag: "Mountain Grid", lat: -22.9068, lon: -43.1729, scale: "1 : 22,000", id: "OSM-15", shape: "rect", image: mapRio },
  { city: "Paris", country: "France", tag: "Radial Grid", lat: 48.8566, lon: 2.3522, scale: "1 : 16,000", id: "OSM-15", shape: "circle", image: mapParis },
];

// The mock reads "Total Views 08 / Styles 4 Categories". There is no view
// counter, and the preset count is read from the generator's own palette list
// so it cannot drift when palettes are added.
const STATS = [
  { label: "Exhibits", value: String(CITIES.length).padStart(2, "0"), accent: true },
  { label: "Styles", value: `${PRESETS.length} Presets` },
  { label: "Projection", value: "Conformal" },
];

const escape = (value) =>
  String(value).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/** Degrees-and-minutes label, e.g. `N 38° 43'`. */
function dm(value, hemisphere, minutesOffset = 0) {
  const total = Math.floor(Math.abs(value) * 60) + minutesOffset;
  return `${hemisphere} ${Math.floor(total / 60)}° ${((total % 60) + 60) % 60}'`;
}

/** The four corner ticks: own hemisphere top/left, opposite one bottom/right. */
function ticks({ lat, lon }) {
  const [latHemi, latOpp] = lat >= 0 ? ["N", "S"] : ["S", "N"];
  const [lonHemi, lonOpp] = lon >= 0 ? ["E", "W"] : ["W", "E"];
  return [
    ["nw", dm(lat, latHemi)],
    ["ne", dm(lon, lonHemi)],
    ["sw", dm(lat, latOpp, -2)],
    ["se", dm(lon, lonOpp, -2)],
  ];
}

/** Faint dashed measuring grid drawn over every preview. */
function technicalGrid() {
  const rows = [0, 33.333, 66.667, 100]
    .map((top) => `<img class="gal-view__hline" src="${gridLineH}" alt="" style="top:${top}%" />`)
    .join("");
  const columns = [12.5, 37.5, 62.5, 87.5]
    .map((left) => `<img class="gal-view__vline" src="${gridLineV}" alt="" style="left:${left}%" />`)
    .join("");
  return rows + columns;
}

function preview(entry) {
  if (entry.shape === "rect") {
    return `<img class="gal-rect" src="${entry.image}" alt="Map preview of ${escape(entry.city)}" loading="lazy" />`;
  }
  return `
    <div class="gal-lens">
      <img class="gal-lens__outer" src="${compassOuter}" alt="" />
      <img class="gal-lens__inner" src="${compassInner}" alt="" />
      <img class="gal-lens__map" src="${entry.image}" alt="Map preview of ${escape(entry.city)}" loading="lazy" />
    </div>`;
}

function coordinates({ lat, lon }) {
  return `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"}, ${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? "E" : "W"}`;
}

function card(entry) {
  return `
    <a class="gal-card" href="/generator?q=${encodeURIComponent(entry.city)}">
      <div class="gal-view">
        ${technicalGrid()}
        ${preview(entry)}
        ${ticks(entry)
          .map(([corner, label]) => `<span class="gal-tick gal-tick--${corner}">${label}</span>`)
          .join("")}
        <span class="gal-scale">${escape(entry.scale)}</span>
      </div>
      <div class="gal-meta">
        <div class="gal-meta__head">
          <span class="gal-city">
            <span class="gal-city__name">${escape(entry.city)}</span>
            <span class="gal-city__country">${escape(entry.country)}</span>
          </span>
          <span class="gal-tag">${escape(entry.tag)}</span>
        </div>
        <div class="gal-rule"></div>
        <div class="gal-meta__details">
          <span>${coordinates(entry)}</span>
          <span class="gal-meta__id">${escape(entry.id)}</span>
        </div>
      </div>
    </a>`;
}

function pageMarkup() {
  return `
    <section class="gal-head">
      <div class="gal-rule"></div>
      <div class="gal-head__coords">
        <span>LATITUDE SCALE 90°N - 90°S</span>
        <em>SYS_REF: MERCATOR / WGS 84</em>
        <span>LONGITUDE SCALE 180°W - 180°E</span>
      </div>
    </section>

    <section class="gal-intro">
      <div class="gal-intro__title">
        <span class="gal-eyebrow">Exhibit No. 01</span>
        <h1>AWESOMEMAPS</h1>
        <p>A curated digital gallery showcasing the geometry of human habitats. High-contrast vector alignments, organic costal boundaries, and terrain elevation matrices.</p>
      </div>
      <div class="gal-stats">
        ${STATS.map(
          ({ label, value, accent }) => `
          <div class="gal-stat">
            <span class="gal-stat__label">${label}</span>
            <span class="gal-stat__value${accent ? " gal-stat__value--accent" : ""}">${value}</span>
          </div>`
        ).join('<div class="gal-stats__divider"></div>')}
      </div>
    </section>

    <div class="gal-grid">${CITIES.map(card).join("")}</div>

    <footer class="gal-foot">
      <div class="gal-rule"></div>
      <div class="gal-foot__row">
        <div class="gal-foot__disclaimer">
          <span>AWESOMEMAPS — A MAP GENERATION PROJECT BY DIEGO RAMOS RETAMAL.</span>
          <span>MAP DATA © OPENSTREETMAP CONTRIBUTORS.</span>
        </div>
        <div class="gal-foot__brand">
          <span>VOL. 01 // 2026 COLLECTION</span>
          <span class="gal-foot__mono">DRR</span>
        </div>
      </div>
    </footer>`;
}

mountNav("gallery");
inject();

const root = document.getElementById("gallery");
if (root) root.innerHTML = pageMarkup();
