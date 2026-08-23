import { resolve } from "node:path";
import { defineConfig } from "vite";
import geocode from "./api/geocode.js";
import features from "./api/features.js";
import note from "./api/note.js";

// `vite dev` does not run Vercel functions, so mount the same handlers as
// middleware. One implementation, both runtimes.
function apiRoutes() {
  const routes = { "/api/geocode": geocode, "/api/features": features, "/api/note": note };

  return {
    name: "api-routes",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = req.url.split("?")[0];
        const handler = routes[path];
        if (!handler) return next();
        handler(req, res).catch((error) => {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: error.message }));
        });
      });
    },
  };
}

// In dev, Vercel's clean URLs do not apply, so map /generator → /generator.html.
function cleanUrls(pages) {
  return {
    name: "clean-urls",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const [path, query = ""] = req.url.split("?");
        const page = path.replace(/\/$/, "");
        if (pages.includes(page.slice(1))) {
          req.url = `${page}.html${query ? `?${query}` : ""}`;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  appType: "mpa",
  plugins: [apiRoutes(), cleanUrls(["generator", "gallery"])],
  build: {
    rollupOptions: {
      input: {
        home: resolve(process.cwd(), "index.html"),
        generator: resolve(process.cwd(), "generator.html"),
        gallery: resolve(process.cwd(), "gallery.html"),
      },
    },
  },
});
