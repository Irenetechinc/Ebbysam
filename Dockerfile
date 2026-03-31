FROM node:20-alpine AS base

# Enable corepack — built into Node 20, installs pnpm without npm install -g
RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

# ── Install phase ──────────────────────────────────────────────────────────────
FROM base AS deps

# Copy manifests for workspace dependency resolution
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

# Copy the full source tree
COPY . .

# Bundle everything into artifacts/api-server/dist/index.mjs via esbuild
# All workspace libs (db, api-zod, etc.) are compiled in — no runtime node_modules needed
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
