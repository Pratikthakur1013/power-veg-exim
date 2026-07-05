# ── STAGE 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency configs
COPY package*.json tsconfig.json vite.config.ts vercel.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy the rest of the application source code
COPY api/ ./api
COPY src/ ./src
COPY scripts/ ./scripts
COPY index.html ./
COPY server-prod.ts ./

# Build the Vite frontend application (output to dist/)
RUN npm run build:vercel

# Bundle the production server backend using esbuild to CJS output
RUN npx esbuild server-prod.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server-prod.cjs

# ── STAGE 2: Runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Copy production assets and backend bundles
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies (no devDependencies)
RUN npm ci --only=production

EXPOSE 8080

# Run the production bundle
CMD ["node", "dist/server-prod.cjs"]
