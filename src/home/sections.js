import { STEPS, STATS, STYLES } from "./data.js";
import { FEATURED, GALLERY_PREVIEW, generatorHref } from "../catalog.js";
import { PORTFOLIO_URL, PRETTYMAPS_URL, REPO_URL, STUDIO_URL } from "../shared/site.js";

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
      <h1 class="hero__headline">Maps, made personal.</h1>
      <p class="hero__subtitle">
        A side product by Diego Ramos Retamal. Generate poster-style maps from
        OpenStreetMap — pick a palette and a crop, then export SVG or a 4096 px PNG.
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
        <p>Berlin in Nori, Madrid in Terracotta, Tokyo in Midnight — same engine, different adaptations.</p>
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
        <p>From a place name to a print-ready file. I check what gets generated, then you decide what to hang.</p>
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
        <h2>What the crops emphasise.</h2>
        <p>Circle, square and the other frames are genuine crops of the same map, not squashed squares.</p>
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
        <h2>Adapted posters.</h2>
        <p>Each card is a real render — city, palette and crop — and opens in the generator.</p>
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
      <h2>Built outside the brief.</h2>
      <p>
        AwesomeMaps is a map generator I ship myself — designed with the same
        judgment as client work. Every map is drawn from OpenStreetMap, a free
        world map built and corrected by human editors. This site reads OSM
        geometry from vector tiles, projects it into SVG, and hands you the layers.
      </p>
      <p>
        The plotting idea started as a Streamlit studio I forked from
        <a href="${PRETTYMAPS_URL}" rel="noopener">prettymaps by Marcelo Prates</a>
        — that Python editor still lives at
        <a href="${STUDIO_URL}" rel="noopener">unrealretamal/prettymaps-studio</a>.
        This implementation is independent JavaScript, in
        <a href="${REPO_URL}" rel="noopener">unrealretamal/awesomemaps</a>.
      </p>
      <p>
        <a href="${PORTFOLIO_URL}" rel="author">Diego Ramos Retamal</a>
        · Senior Product Designer in Berlin.
      </p>
    </div>
  </section>`;
}

export function footer() {
  return `
  <footer class="footer">
    <div class="footer__top">
      <div class="footer__brand">
        <span class="footer__logo">AwesomeMaps</span>
        <p>A map generator exploring open geographic data and poster composition.</p>
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
          <a href="${PORTFOLIO_URL}" rel="author">retamal.xyz</a>
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
