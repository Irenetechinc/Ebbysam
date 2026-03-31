import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { existsSync } from "fs";
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

// In production (Railway/Docker), the frontend static files are copied to
// /app/public by the Dockerfile. WORKDIR is /app so process.cwd() === /app.
// In local dev this directory won't exist — static serving is simply skipped.
const publicDir = path.join(process.cwd(), "public");
const indexHtml = path.join(publicDir, "index.html");
const hasFrontend = existsSync(indexHtml);

logger.info({ publicDir, hasFrontend }, "Static frontend serving");

if (hasFrontend) {
  app.use(express.static(publicDir));
}

// All API routes
app.use("/api", router);

// SPA fallback — send index.html for any non-API route so that
// client-side routing (wouter) handles the path in the browser
if (hasFrontend) {
  app.get("/{*path}", (_req, res) => {
    res.sendFile(indexHtml);
  });
}

export default app;
