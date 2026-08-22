import { defineConfig } from "vite";
import geocode from "./api/geocode.js";
import features from "./api/features.js";

// `vite dev` does not run Vercel functions, so mount the same handlers as
// middleware. One implementation, both runtimes.
function apiRoutes() {
  const routes = { "/api/geocode": geocode, "/api/features": features };

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

export default defineConfig({
  plugins: [apiRoutes()],
});
