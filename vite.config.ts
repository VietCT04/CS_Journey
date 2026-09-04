import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { createHash } from "node:crypto";
import { fileURLToPath, URL } from "node:url";
import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

const dataFilePath = fileURLToPath(new URL("./public-data.json", import.meta.url));
const uploadsDirectoryPath = fileURLToPath(new URL("./public/uploads", import.meta.url));
const imageTokenPattern = /\[\[image:([^|\]\r\n]+)(?:\|([^\]\r\n]*))?\]\]/g;
const supportedImageExtensions: Record<string, string> = {
  "image/avif": "avif",
  "image/bmp": "bmp",
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function materializeJourneyImages(value: unknown): unknown {
  if (typeof value === "string") {
    return materializeImageTokens(value);
  }
  if (Array.isArray(value)) {
    return value.map(materializeJourneyImages);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, materializeJourneyImages(item)]));
  }
  return value;
}

function materializeImageTokens(value: string) {
  return value.replace(imageTokenPattern, (token, source: string, alt = "Pasted image") => {
    if (!source.startsWith("data:")) return token;

    const dataUrl = source.match(/^data:(image\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/i);
    const mimeType = dataUrl?.[1].toLowerCase();
    const extension = mimeType ? supportedImageExtensions[mimeType] : undefined;
    if (!dataUrl || !extension) {
      throw new Error("Only PNG, JPEG, GIF, WebP, AVIF, and BMP images can be saved");
    }

    const imageBuffer = Buffer.from(dataUrl[2], "base64");
    const hash = createHash("sha256").update(imageBuffer).digest("hex").slice(0, 12);
    const fileName = `pasted-${hash}.${extension}`;
    fs.mkdirSync(uploadsDirectoryPath, { recursive: true });
    fs.writeFileSync(path.join(uploadsDirectoryPath, fileName), imageBuffer);

    const safeAlt = alt.replace(/[\r\n\]|]/g, " ").trim() || "Pasted image";
    return `[[image:/uploads/${fileName}|${safeAlt}]]`;
  });
}

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
            const materialized = materializeJourneyImages(parsed) as { profile?: unknown; nodes?: unknown };
            fs.writeFileSync(dataFilePath, `${JSON.stringify(materialized, null, 2)}\n`, "utf8");
            response.statusCode = 200;
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ ok: true, path: path.basename(dataFilePath), journey: materialized }));
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
