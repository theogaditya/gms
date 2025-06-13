# ─────────────────────────────────────────────────
# Stage 1: Build
# ─────────────────────────────────────────────────
FROM node:23-alpine AS builder

# Install build tools
RUN apk add --no-cache python3 make g++

WORKDIR /app

# 1) Copy just the user-be manifest and tsconfig
COPY apps/api/user-be/package.json     apps/api/user-be/package-lock.json  apps/api/user-be/tsconfig.json ./

# 2) Install dev + prod deps
RUN npm install

# 3) Pull in the Prisma schema from the repo root
COPY prisma ./prisma

# 4) Generate the Prisma client
RUN npx prisma generate

# 5) Copy and compile your TS source
COPY apps/api/user-be/src ./src
RUN npm run build

# ─────────────────────────────────────────────────
# Stage 2: Production image
# ─────────────────────────────────────────────────
FROM node:23-alpine

WORKDIR /app

# 1) Only install production deps
COPY apps/api/user-be/package.json package-lock.json ./
RUN npm install --omit=dev

# 2) Copy over build output and node_modules from builder
COPY --from=builder /app/dist       ./dist
COPY --from=builder /app/node_modules ./node_modules

# 3) Copy the generated Prisma client (and your schema, if you need it at runtime)
COPY --from=builder /app/prisma     ./prisma

COPY apps/api/user-be/.env.prod .env

# 4) Runtime configuration
ARG PORT=3001
ENV NODE_ENV=production \
    PORT=${PORT}
EXPOSE ${PORT}

# 5) Launch
CMD ["node", "dist/index.js"]
