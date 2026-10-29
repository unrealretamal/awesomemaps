// Site navigation. Marketing pages (home, gallery) carry the editorial bar
// plus a status strip. The generator is a full-screen tool: brand and links
// drop, leaving one "Back to home" action.
import "./nav.css";
import brandMark from "../assets/icons/brand-mark.png";
import arrow from "../assets/icons/arrow-right.svg";
import homeIcon from "../assets/icons/home.svg?raw";

const LINKS = [
  { id: "home", label: "Home", href: "/" },
  { id: "generator", label: "Generator", href: "/generator" },
  { id: "gallery", label: "Gallery", href: "/gallery" },
  { id: "about", label: "About", href: "/#about" },
];

const TZ = "Europe/Berlin";

const brand = () => `
    <a class="site-nav__brand" href="/">
      <img class="site-nav__mark" src="${brandMark}" alt="AwesomeMaps" width="20" height="20" />
      <span class="site-nav__name">AwesomeMaps</span>
    </a>`;

function formatStatus(now = new Date()) {
  const date = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(now);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
  return { date, time };
}

function statusMarkup() {
  const { date, time } = formatStatus();
  return `
    <p class="site-nav__status">
      <time datetime="${new Date().toISOString()}" data-status-date>${date}</time>
      <span>Berlin</span>
      <span data-status-time>${time}</span>
      <span class="site-nav__status-flag">Side product by Diego Ramos Retamal</span>
    </p>`;
}

function tickStatus(root) {
  const dateEl = root.querySelector("[data-status-date]");
  const timeEl = root.querySelector("[data-status-time]");
  if (!dateEl || !timeEl) return;
  const { date, time } = formatStatus();
  dateEl.textContent = date;
  timeEl.textContent = time;
}

export function navMarkup(current) {
  if (current === "generator") {
    return `<a class="site-nav__cta site-nav__cta--back" href="/">
      <span class="site-nav__icon">${homeIcon}</span>
      Back to home
    </a>`;
  }

  const links = LINKS.map(
    ({ id, label, href }) =>
      `<a class="site-nav__link" href="${href}"${
        id === current ? ' aria-current="page"' : ""
      }>${label}</a>`
  ).join("");

  return `<div class="site-nav__row">
    ${brand()}
    <nav class="site-nav__links" aria-label="Primary">${links}</nav>
    <a class="site-nav__cta" href="/generator">
      Open generator
      <img class="site-nav__arrow" src="${arrow}" alt="" width="14" height="14" />
    </a>
  </div>
  ${statusMarkup()}`;
}

/** @param {"home"|"generator"|"gallery"|"about"} current */
export function mountNav(current) {
  const host = document.getElementById("site-nav");
  if (!host) return;
  host.classList.add("site-nav");
  host.classList.toggle("site-nav--focused", current === "generator");
  host.classList.toggle("site-nav--marketing", current !== "generator");
  host.innerHTML = navMarkup(current);
  if (current !== "generator") {
    tickStatus(host);
    window.setInterval(() => tickStatus(host), 30_000);
  }
}
