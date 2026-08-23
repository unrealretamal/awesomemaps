// Site navigation (Figma node 5:315). One implementation for every page:
// call mountNav("home" | "generator" | "gallery" | "about").
//
// The generator is a full-screen tool: it drops both the brand and the link
// list, leaving one left-aligned "Back to home" action. Every other page
// carries the full nav with the "Generate Map" call to action.
//
// The design draws the brand as a plain teal dot; we use the real brand mark
// instead so the logo reads the same on every page.
import "./nav.css";
import brandMark from "../assets/icons/brand-mark.png";
import arrow from "../assets/icons/arrow-right.svg";
// Inlined rather than used as an <img> so it inherits the link's colour.
import homeIcon from "../assets/icons/home.svg?raw";

const LINKS = [
  { id: "home", label: "Home", href: "/" },
  { id: "generator", label: "Generator", href: "/generator" },
  { id: "gallery", label: "Gallery", href: "/gallery" },
  { id: "about", label: "About", href: "/#about" },
];

const brand = () => `
    <a class="site-nav__brand" href="/">
      <img class="site-nav__mark" src="${brandMark}" alt="" width="20" height="20" />
      <span class="site-nav__name">AwesomeMaps</span>
    </a>`;

export function navMarkup(current) {
  // Focused mode: no brand, just the way out, sitting where the brand would be.
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

  return `${brand()}
    <nav class="site-nav__links" aria-label="Primary">${links}</nav>
    <a class="site-nav__cta" href="/generator">
      Generate Map
      <img class="site-nav__arrow" src="${arrow}" alt="" width="14" height="14" />
    </a>`;
}

/** @param {"home"|"generator"|"gallery"|"about"} current */
export function mountNav(current) {
  const host = document.getElementById("site-nav");
  if (!host) return;
  host.classList.add("site-nav");
  host.classList.toggle("site-nav--focused", current === "generator");
  host.innerHTML = navMarkup(current);
}
