// SVG / PNG download. The PNG path rasterises the same SVG markup, so
// both formats stay pixel-identical apart from resolution.

const PNG_SIZE = 4096;
const COMBINING_MARKS = /[̀-ͯ]/g;

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export const slugify = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "map";

export function exportSvg(svg, name) {
  download(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), `${slugify(name)}.svg`);
}

export async function exportPng(svg, name, size = PNG_SIZE) {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not rasterise the map"));
      img.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    canvas.getContext("2d").drawImage(image, 0, 0, size, size);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("Could not encode the PNG");
    download(blob, `${slugify(name)}.png`);
  } finally {
    URL.revokeObjectURL(url);
  }
}
