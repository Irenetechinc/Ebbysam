FROM node:20-alpine AS base

# Enable corepack — built into Node 20, installs pnpm without npm install -g
RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

# ── Install phase ──────────────────────────────────────────────────────────────
FROM base AS deps

# Copy manifests for workspace dependency resolution
# Note: all workspace package.json files are needed for pnpm --frozen-lockfile
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY lib/api-spec/package.json         ./lib/api-spec/
COPY lib/api-zod/package.json          ./lib/api-zod/
COPY lib/db/package.json               ./lib/db/
COPY scripts/package.json              ./scripts/

# --ignore-scripts bypasses the root preinstall pnpm-guard (safe: we ARE using pnpm)
RUN pnpm install --frozen-lockfile --ignore-scripts

# ── Build phase ────────────────────────────────────────────────────────────────
FROM deps AS builder

# Copy only the source files needed to build the api-server.
# The api-server uses Supabase directly — lib/db (Drizzle/PostgreSQL) is NOT
# included here to prevent it from being accidentally bundled by esbuild.
COPY package.json pnpm-workspace.yaml ./
COPY artifacts/api-server/ ./artifacts/api-server/
COPY lib/api-zod/ ./lib/api-zod/

# Bundle the api-server into artifacts/api-server/dist/index.mjs via esbuild
RUN pnpm --filter @workspace/api-server run build

# ── Production image ───────────────────────────────────────────────────────────
# Minimal image: esbuild bundles all JS libs so we only need Node + the dist file
FROM node:20-alpine AS runner

WORKDIR /app

# Copy only the compiled bundle — no node_modules, no pnpm
COPY --from=builder /app/artifacts/api-server/dist ./dist

ENV NODE_ENV=production

# Railway injects PORT automatically at runtime — never hardcode it
EXPOSE 8080

CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
