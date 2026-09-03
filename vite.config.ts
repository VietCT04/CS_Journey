import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

const dataFilePath = fileURLToPath(new URL("./public-data.json", import.meta.url));

function journeyDataPlugin(): Plugin {
  return {
    name: "journey-data",
    configureServer(server) {
      server.middlewares.use("/public-data.json", (_request, response) => {
        response.setHeader("Content-Type", "application/json");
        response.setHeader("Cache-Control", "no-store");
        response.end(fs.readFileSync(dataFilePath, "utf8"));
      });

      server.middlewares.use("/api/journey/save", (request, response, next) => {
        if (request.method !== "POST") {
          next();
          return;
        }

        let body = "";
        request.setEncoding("utf8");
        request.on("data", (chunk: string) => { body += chunk; });
        request.on("end", () => {
          try {
            const parsed = JSON.parse(body) as { profile?: unknown; nodes?: unknown };
            if (!parsed?.profile || !Array.isArray(parsed.nodes)) throw new Error("Invalid journey data");
            fs.writeFileSync(dataFilePath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
            response.statusCode = 200;
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ ok: true, path: path.basename(dataFilePath) }));
          } catch (error) {
            response.statusCode = 400;
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ error: error instanceof Error ? error.message : "Invalid journey data" }));
          }
        });
      });
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "public-data.json", source: fs.readFileSync(dataFilePath, "utf8") });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), journeyDataPlugin()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: { port: 5173 },
});
