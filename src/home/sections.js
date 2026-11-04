import { STEPS, STATS, STYLES } from "./data.js";
import { FEATURED, GALLERY_PREVIEW, generatorHref } from "../catalog.js";
import { PRETTYMAPS_URL, REPO_URL, STUDIO_URL } from "../shared/site.js";

import socialGithub from "../assets/home/social-github.svg";

function poster(item, extraClass = "") {
  const round = item.preview === "circle" ? " poster--round" : "";
  return `
  <a class="poster${extraClass}" href="${generatorHref(item)}">
    <div class="poster__well">
      <img class="poster__image${round}" src="${item.image}" alt="Poster map of ${item.city} in the ${item.presetName} palette" loading="lazy" />
    </div>
    <div class="poster__meta">
      <div class="poster__titles">
        <h3>${item.city}</h3>
        <p>${item.country}</p>
      </div>
      <span class="poster__tag">${item.presetName} · ${item.shape}</span>
    </div>
  </a>`;
}

export function hero() {
  const lead = FEATURED[0];
  return `
  <section class="hero">
    <div class="hero__copy">
      <h1 class="hero__headline">Poster maps from OpenStreetMap.</h1>
      <p class="hero__subtitle">
        Pick a palette and crop, toggle layers, export SVG or a 4096&nbsp;px PNG.
        By Diego Ramos Retamal.
      </p>
      <div class="hero__ctas">
        <a class="btn btn--fill" href="/generator">Open generator</a>
        <a class="btn btn--outline" href="/gallery">Browse gallery</a>
      </div>
    </div>
    ${
      lead
        ? `<a class="hero__poster" href="${generatorHref(lead)}">
             <img src="${lead.image}" alt="Poster map of ${lead.city} in the ${lead.presetName} palette" />
           </a>`
        : ""
    }
  </section>`;
}

export function featured() {
  return `
  <section class="section">
    <header class="section__head">
      <div class="section__titles">
        <h2>Three cities, three palettes.</h2>
        <p>Berlin in Nori, Madrid in Terracotta, Tokyo in Midnight. Same render path, different colors.</p>
      </div>
      <a class="text-link" href="/gallery">View all</a>
    </header>
    <div class="poster-grid poster-grid--3">
      ${FEATURED.map((item) => poster(item)).join("")}
    </div>
  </section>`;
}

export function howItWorks() {
  const steps = STEPS.map(
    (step) => `
      <li class="process__item">
        <span class="process__n">${step.badge}</span>
        <div>
          <h3>${step.title}</h3>
          <p>${step.body}</p>
        </div>
      </li>`
  ).join("");

  return `
  <section class="section">
    <header class="section__head">
      <div class="section__titles">
        <h2>Three steps to a poster.</h2>
        <p>Search a place, tune the map, download SVG or PNG.</p>
      </div>
    </header>
    <ol class="process">${steps}</ol>
  </section>`;
}

export function stats() {
  const items = STATS.map(
    (stat) => `
    <div class="facts__item">
      <span class="facts__value">${stat.value}</span>
      <span class="facts__label">${stat.label}</span>
    </div>`
  ).join("");

  return `<section class="facts" aria-label="Product facts">${items}</section>`;
}

export function mapStyles() {
  const cards = STYLES.map(
    (style) => `
      <article class="crop">
        <h3>${style.title}</h3>
        <p>${style.body}</p>
      </article>`
  ).join("");

  return `
  <section class="section">
    <header class="section__head">
      <div class="section__titles">
        <h2>What each crop does.</h2>
        <p>Circle, square, arch, hex, and diamond cut the same map. Nothing is a stretched square.</p>
      </div>
    </header>
    <div class="crop-grid">${cards}</div>
  </section>`;
}

export function galleryPreview() {
  return `
  <section class="section">
    <header class="section__head">
      <div class="section__titles">
        <h2>Gallery renders.</h2>
        <p>Each card opens the generator with that city, palette, and crop already set.</p>
      </div>
      <a class="btn btn--outline btn--sm" href="/gallery">See the collection</a>
    </header>
    <div class="poster-grid poster-grid--2">
      ${GALLERY_PREVIEW.map((item) => poster(item)).join("")}
    </div>
  </section>`;
}

export function about() {
  return `
  <section class="section section--about" id="about">
    <div class="about">
      <h2>About the project.</h2>
      <p>
        AwesomeMaps reads OpenStreetMap geometry from vector tiles, draws it as
        SVG in the browser, and exports layered files you can edit or print.
      </p>
      <p>
        The idea started in a Streamlit fork of
        <a href="${PRETTYMAPS_URL}" rel="noopener">prettymaps by Marcelo Prates</a>.
        The Python editor lives at
        <a href="${STUDIO_URL}" rel="noopener">unrealretamal/prettymaps-studio</a>.
        This site is new JavaScript in
        <a href="${REPO_URL}" rel="noopener">unrealretamal/awesomemaps</a>.
      </p>
      <p>Diego Ramos Retamal · Senior Product Designer in Berlin.</p>
    </div>
  </section>`;
}

export function footer() {
  return `
  <footer class="footer">
    <div class="footer__top">
      <div class="footer__brand">
        <span class="footer__logo">AwesomeMaps</span>
        <p>OpenStreetMap in, poster SVG or PNG out.</p>
      </div>
      <nav class="footer__cols" aria-label="Footer">
        <div class="footer__col">
          <h2>Product</h2>
          <a href="/generator">Generator</a>
          <a href="/gallery">Gallery</a>
          <a href="#about">About</a>
        </div>
        <div class="footer__col">
          <h2>Elsewhere</h2>
          <a href="${REPO_URL}" rel="noopener">GitHub</a>
          <a href="${STUDIO_URL}" rel="noopener">Python studio</a>
          <a href="https://www.openstreetmap.org" rel="noopener">OpenStreetMap</a>
        </div>
      </nav>
    </div>
    <div class="footer__bottom">
      <p>Diego Ramos Retamal ${new Date().getFullYear()}. Map data © OpenStreetMap contributors.</p>
      <a href="${REPO_URL}" rel="noopener" aria-label="GitHub repository">
        <img src="${socialGithub}" alt="" width="18" height="18" />
      </a>
    </div>
  </footer>`;
}
