FROM node:20-slim AS base

# Enable corepack — built into Node 20, installs pnpm without npm install -g
RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

# ── Install phase ──────────────────────────────────────────────────────────────
FROM base AS deps

# Copy manifests for workspace dependency resolution.
# All workspace package.json files are needed for pnpm --frozen-lockfile.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY artifacts/api-server/package.json      ./artifacts/api-server/
COPY artifacts/ebby-sam/package.json        ./artifacts/ebby-sam/
COPY lib/api-client-react/package.json      ./lib/api-client-react/
COPY lib/api-spec/package.json              ./lib/api-spec/
COPY lib/api-zod/package.json               ./lib/api-zod/
COPY lib/db/package.json                    ./lib/db/
COPY scripts/package.json                   ./scripts/

# --ignore-scripts bypasses the root preinstall pnpm-guard (safe: we ARE using pnpm)
RUN pnpm install --frozen-lockfile --ignore-scripts

# ── Build phase ────────────────────────────────────────────────────────────────
FROM deps AS builder

# Copy source for the api-server and its dependencies.
# lib/db is intentionally excluded — the api-server uses Supabase directly.
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY artifacts/api-server/ ./artifacts/api-server/
COPY lib/api-zod/ ./lib/api-zod/

# Build the api-server bundle (esbuild → artifacts/api-server/dist/index.mjs)
RUN pnpm --filter @workspace/api-server run build

# Copy frontend source and its workspace dependency
COPY artifacts/ebby-sam/ ./artifacts/ebby-sam/
COPY lib/api-client-react/ ./lib/api-client-react/

# Build the React frontend.
# PORT is required by vite.config validation but only used for the dev server,
# not baked into the static output. BASE_PATH=/ serves the app from root.
RUN PORT=8080 BASE_PATH=/ pnpm --filter @workspace/ebby-sam run build

# ── Production image ───────────────────────────────────────────────────────────
# Minimal image: Node + the compiled server bundle + frontend static files.
# WORKDIR is /app. The server uses process.cwd() === /app to locate /app/public.
FROM node:20-slim AS runner

WORKDIR /app

# API server bundle
COPY --from=builder /app/artifacts/api-server/dist ./dist

# Frontend static files — copied to /app/public (separate from /app/dist).
# app.ts finds these via path.join(process.cwd(), "public") === /app/public.
COPY --from=builder /app/artifacts/ebby-sam/dist/public ./public

ENV NODE_ENV=production

# Railway injects PORT automatically at runtime — never hardcode it
EXPOSE 8080

CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
