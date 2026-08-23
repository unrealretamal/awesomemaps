// Icons exported from Figma (node 1:2) and committed under src/assets/icons.
// They ship with hardcoded Figma colors; we swap those for `currentColor`
// so the same asset can render in the muted and the accent state.
import pin from "./assets/icons/pin.svg?raw";
import dot from "./assets/icons/dot.svg?raw";
import download from "./assets/icons/download.svg?raw";
import chevron from "./assets/icons/chevron.svg?raw";
import generate from "./assets/icons/generate.svg?raw";
import circle from "./assets/icons/shape-circle.svg?raw";
import square from "./assets/icons/shape-square.svg?raw";
import hexagon from "./assets/icons/shape-hexagon.svg?raw";
import portrait from "./assets/icons/shape-portrait.svg?raw";
import landscape from "./assets/icons/shape-landscape.svg?raw";
import panorama from "./assets/icons/shape-panorama.svg?raw";
import diamond from "./assets/icons/shape-diamond.svg?raw";
import arch from "./assets/icons/shape-arch.svg?raw";

const FIGMA_COLORS = /#(636B78|4ECDC4|0B0C0E)/gi;

const raw = {
  pin, dot, download, chevron, generate,
  circle, square, hexagon, portrait, landscape, panorama, diamond, arch,
};

export const icons = Object.fromEntries(
  Object.entries(raw).map(([name, svg]) => [name, svg.replace(FIGMA_COLORS, "currentColor")])
);

// The brand mark is a raster logo exported from Figma (node 1:8), not a
// monochrome glyph, so it ships as an image rather than an inline SVG.
export { default as brandMark } from "./assets/icons/brand-mark.png";

/** Fill every `<i class="icon" data-icon="…">` inside `root`. */
export function mountIcons(root = document) {
  root.querySelectorAll(".icon[data-icon]").forEach((el) => {
    if (el.firstElementChild) return;
    const svg = icons[el.dataset.icon];
    if (svg) el.innerHTML = svg;
  });
}
