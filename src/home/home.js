// Homepage entry (Figma node 5:314). The nav is shared; everything below it
// is assembled from the section builders in sections.js.
import "../shared/tokens.css";
import "./home.css";
import { mountNav } from "../shared/nav.js";
import {
  hero,
  featured,
  howItWorks,
  stats,
  mapStyles,
  galleryPreview,
  about,
  footer,
} from "./sections.js";
import { inject } from '@vercel/analytics';

mountNav("home");
inject();

const host = document.getElementById("home");
if (host) {
  host.innerHTML = [
    hero(),
    featured(),
    howItWorks(),
    stats(),
    mapStyles(),
    galleryPreview(),
    about(),
    footer(),
  ].join("");
}
