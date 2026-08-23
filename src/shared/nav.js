// Site navigation (Figma node 5:315). One implementation for every page:
// call mountNav("home" | "generator" | "gallery" | "about") and it renders into
// <header class="site-nav" id="site-nav">.
//
// The design draws the brand as a plain teal dot; we use the real brand mark
// instead so the logo reads the same on every page.
import "./nav.css";
import brandMark from "../assets/icons/brand-mark.png";

const LINKS = [
  { id: "home", label: "Home", href: "/" },
  { id: "generator", label: "Generator", href: "/generator" },
  { id: "gallery", label: "Gallery", href: "/gallery" },
  { id: "about", label: "About", href: "/#about" },
];

export function navMarkup(current) {
  const links = LINKS.map(
    ({ id, label, href }) =>
      `<a class="site-nav__link" href="${href}"${
        id === current ? ' aria-current="page"' : ""
      }>${label}</a>`
  ).join("");

  return `
    <a class="site-nav__brand" href="/">
      <img class="site-nav__mark" src="${brandMark}" alt="" width="20" height="20" />
      <span class="site-nav__name">AwesomeMaps</span>
    </a>
    <nav class="site-nav__links" aria-label="Primary">${links}</nav>
    <a class="site-nav__cta" href="/generator">Generate Map</a>`;
}

/** @param {"home"|"generator"|"gallery"|"about"} current */
export function mountNav(current) {
  const host = document.getElementById("site-nav");
  if (!host) return;
  host.classList.add("site-nav");
  host.innerHTML = navMarkup(current);
}
