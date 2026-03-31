FROM node:20-alpine AS base

# Enable corepack — built into Node 20, installs pnpm without npm install -g
RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

# ── Install phase ──────────────────────────────────────────────────────────────
FROM base AS deps

# Copy manifests for workspace dependency resolution.
# All workspace package.json files are needed for pnpm --frozen-lockfile.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/ebby-sam/package.json   ./artifacts/ebby-sam/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY lib/api-spec/package.json         ./lib/api-spec/
COPY lib/api-zod/package.json          ./lib/api-zod/
COPY lib/db/package.json               ./lib/db/
COPY scripts/package.json              ./scripts/

# --ignore-scripts bypasses the root preinstall pnpm-guard (safe: we ARE using pnpm)
RUN pnpm install --frozen-lockfile --ignore-scripts

# ── Build phase ────────────────────────────────────────────────────────────────
FROM deps AS builder

# Copy source for the api-server and its dependencies.
# lib/db is intentionally excluded — the api-server uses Supabase directly.
COPY package.json pnpm-workspace.yaml ./
COPY artifacts/api-server/ ./artifacts/api-server/
COPY lib/api-zod/ ./lib/api-zod/

# Build the api-server bundle (esbuild → dist/index.mjs)
RUN pnpm --filter @workspace/api-server run build

# Copy frontend source and its workspace dependency
COPY artifacts/ebby-sam/ ./artifacts/ebby-sam/
COPY lib/api-client-react/ ./lib/api-client-react/

# Build the React frontend.
# PORT is required by vite.config validation but only used for the dev server,
# not baked into the static output. BASE_PATH=/ serves the app from the root.
RUN PORT=3000 BASE_PATH=/ pnpm --filter @workspace/ebby-sam run build

# Place the frontend's static output inside the api-server dist so they
# ship together in the runner image: dist/public → served at /
RUN cp -r artifacts/ebby-sam/dist/public artifacts/api-server/dist/public

# ── Production image ───────────────────────────────────────────────────────────
# Minimal image: only Node + the compiled bundle + frontend static files
FROM node:20-alpine AS runner

WORKDIR /app

# Copy the api-server bundle AND the frontend static files (dist/public/)
COPY --from=builder /app/artifacts/api-server/dist ./dist

ENV NODE_ENV=production

# Railway injects PORT automatically at runtime — never hardcode it
EXPOSE 8080

CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
