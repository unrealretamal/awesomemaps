import { mkdir, writeFile } from "node:fs/promises";
import { CITY_TRANSIT, normalizePlace } from "../src/metro-cities.js";

const COMMONS = "https://commons.wikimedia.org/w/api.php";
const OUTPUT = new URL("../src/generated/metro-logos.js", import.meta.url);
const ATTRIBUTION = new URL("../public/metro-logos/ATTRIBUTION.md", import.meta.url);
const USER_AGENT = "AwesomeMaps/0.1 (https://github.com/unrealretamal/awesomemaps)";

const exactFiles = {
  "london": "Underground.svg",
  "greater london": "Underground.svg",
  "paris": "Metro-M.svg",
  "new york": "MTA New York City Subway logo.svg",
  "tokyo": "Tokyo Metro logo (full).svg",
  "東京都": "Tokyo Metro logo (full).svg",
  "berlin": "U-Bahn Berlin logo.svg",
  "madrid": "MetroMadridLogo.svg",
  "barcelona": "Barcelona Metro Logo.svg",
  "lisboa": "Metropolitano Lisboa logo.svg",
  "lisbon": "Metropolitano Lisboa logo.svg",
  "budapest": "Budapest metro logo 2004.svg",
  "oslo": "OSLO T-bane orange icon.png",
  "bucharest": "Bucharest Metro M logo.png",
  "riyadh": "Riyadh metro logo.png",
  "mumbai": "Mumbai metro Logo.png",
  "bangkok": "MRT (Bangkok) logo.svg",
  "seoul": "Seoul metro logo.png",
  "osaka": "Osaka Metro logo.svg",
  "melbourne": "Metro Trains Melbourne Logo.png",
  "montreal": "Montreal Metro Logo (with text).svg",
  "montréal": "Montreal Metro Logo (with text).svg",
  "atlanta": "Metro Atlanta Rapid Transit Authority (logo).png",
  "buenos aires": "Subterráneos de Buenos Aires - Antiguo logo.svg",
  "santo domingo": "Logo Metro de Santo Domingo.png",
  "vienna": "U-Bahn Wien.svg",
  "wien": "U-Bahn Wien.svg",
  "prague": "Prague metro logo without padding.svg",
  "praha": "Metro Prague logo.svg",
  "warsaw": "Warsaw Metro logo.svg",
  "amsterdam": "Amsterdam metro logo.svg",
  "brussels": "Brussels Metro Logo.svg",
  "copenhagen": "Copenhagen metro logo.svg",
  "stockholm": "Stockholm metro symbol.svg",
  "helsinki": "Helsinki metro logo round edges.svg",
  "athens": "Athens Metro Logo.svg",
  "istanbul": "Istanbul Metro Logo.svg",
  "moscow": "Moscow Metro.svg",
  "kyiv": "Kyiv metro logo 2.svg",
  "sofia": "Sofia Metro Logo.svg",
  "doha": "Metro Doha Logo 10.2018.svg",
  "cairo": "Cairo metro logo2012.svg",
  "delhi": "Delhi Metro logo.svg",
  "kolkata": "Kolkata Metro Logo.svg",
  "chennai": "Chennai Metro logo.svg",
  "jakarta": "MRT Jakarta logo.svg",
  "shanghai": "Shanghai Metro logo.svg",
  "guangzhou": "Guangzhou Metro logo.svg",
  "seoul": "Seoul metro logo.png",
  "sydney": "Sydney metro logo.svg",
  "washington": "WMATA Metro Logo.svg",
  "san francisco": "Bart-logo.svg",
  "mexico city": "Metro de la Ciudad de México logo.svg",
  "ciudad de méxico": "Metro de la Ciudad de México logo.svg",
  "monterrey": "Metrorreylogo2021.svg",
  "são paulo": "Sao Paulo Metro Logo.svg",
  "santiago": "Santiago Metro logo.svg",
  "lima": "Lima Metro Logo.svg",
  "bogotá": "Metro de Bogotá logo.png",
  "caracas": "Metro de Caracas (Venezuela) logo.svg",
  "lagos": "Lagos Metro logo.svg",
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const clean = (value = "") => value.replace(/<[^>]+>/g, " ").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim();

async function findLogo(city) {
  if (!exactFiles[city]) return null;
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    titles: `File:${exactFiles[city]}`,
    prop: "imageinfo",
    iiprop: "url|mime|extmetadata",
    iiurlwidth: "96",
  });
  const response = await fetch(`${COMMONS}?${params}`, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok) throw new Error(`Commons lookup ${response.status}`);
  const page = Object.values((await response.json()).query?.pages || {})[0];
  if (!page || page.missing) return null;
  return downloadPage(page);
}

async function downloadPage(page) {
  const info = page.imageinfo?.[0];
  const imageUrl = info?.thumburl || info?.url;
  if (!imageUrl) return null;
  const image = await fetch(imageUrl, { headers: { "User-Agent": USER_AGENT } });
  if (!image.ok) return null;
  const bytes = Buffer.from(await image.arrayBuffer());
  const mime = image.headers.get("content-type")?.split(";")[0] || "image/png";
  const metadata = info.extmetadata || {};
  return {
    data: `data:${mime};base64,${bytes.toString("base64")}`,
    title: page.title.replace(/^File:/, ""),
    source: info.descriptionurl,
    author: clean(metadata.Artist?.value || metadata.Credit?.value || "Wikimedia Commons contributor"),
    license: clean(metadata.LicenseShortName?.value || metadata.UsageTerms?.value || "See source"),
  };
}

const logos = {};
const records = [];
const cities = Object.keys(CITY_TRANSIT);
for (const [index, city] of cities.entries()) {
  try {
    const logo = await findLogo(city);
    if (logo) {
      logos[normalizePlace(city)] = logo;
      records.push({ city, ...logo, data: undefined });
      console.log(`${index + 1}/${cities.length} ✓ ${city}: ${logo.title}`);
    } else {
      console.log(`${index + 1}/${cities.length} · ${city}: fallback`);
    }
  } catch (error) {
    console.warn(`${index + 1}/${cities.length} ! ${city}: ${error.message}`);
  }
  await sleep(80);
}

await mkdir(new URL("../src/generated/", import.meta.url), { recursive: true });
await mkdir(new URL("../public/metro-logos/", import.meta.url), { recursive: true });
await writeFile(
  OUTPUT,
  `// Generated by scripts/fetch-metro-logos.mjs. Do not edit manually.\nexport const METRO_LOGOS = ${JSON.stringify(logos)};\n`,
);
await writeFile(
  ATTRIBUTION,
  `# Metro logo attribution\n\nGenerated from Wikimedia Commons on ${new Date().toISOString()}.\n\n` +
    `| City | Asset | Author | License | Source |\n|---|---|---|---|---|\n` +
    records.map(({ city, title, author, license, source }) =>
      `| ${city} | ${clean(title).replaceAll("|", "\\|")} | ${clean(author).replaceAll("|", "\\|")} | ${clean(license).replaceAll("|", "\\|")} | [Commons](${source}) |`
    ).join("\n") + "\n",
);
console.log(`Resolved ${records.length}/${cities.length} city aliases.`);
