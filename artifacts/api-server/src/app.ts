import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

const ALLOWED_ORIGINS_ENV = process.env.ALLOWED_ORIGINS;
const corsOptions: cors.CorsOptions = ALLOWED_ORIGINS_ENV
  ? {
      origin: (origin, callback) => {
        const allowed = ALLOWED_ORIGINS_ENV.split(",").map(s => s.trim());
        if (!origin || allowed.some(o => origin.startsWith(o))) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: origin '${origin}' not allowed`));
        }
      },
      credentials: true,
    }
  : { origin: true, credentials: true };

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Resolve the directory of this bundle at runtime.
// In the compiled output, import.meta.url points to dist/index.mjs,
// so publicDir resolves to dist/public — where the frontend build is copied.
const thisDir = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(thisDir, "public");

// Serve the compiled React frontend (only present in production/Railway builds)
if (existsSync(publicDir)) {
  app.use(express.static(publicDir));
}

// All API routes
app.use("/api", router);

// SPA fallback — send index.html for any non-API route so client-side
// routing (wouter) can handle the path on the frontend
app.get("*", (_req, res) => {
  const indexHtml = path.join(publicDir, "index.html");
  if (existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    res.status(404).json({ error: "Not found" });
  }
});

export default app;
