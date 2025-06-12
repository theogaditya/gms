# 1) builder stage
FROM node:23-alpine AS builder

# create a /build context that mirrors your repo layout
WORKDIR /build

# bring in Prisma schema & any existing generated client folder
COPY prisma                 ./prisma
COPY generated/prisma       ./generated/prisma

# bring in the user-be project folder verbatim
COPY apps/api/user-be       ./apps/api/user-be

# switch into your user-be folder
WORKDIR /build/apps/api/user-be

# install dependencies
RUN npm install

# generate Prisma client (reads ../../../../prisma/schema.prisma
# and writes into ../../../../generated/prisma)
RUN npx prisma generate --schema /build/prisma/schema.prisma

# compile your TypeScript
RUN npm run build

# strip out devDependencies
RUN npm prune --production

# 2) production stage
FROM node:23-alpine AS production

WORKDIR /app

# pull in only what we need from the builder
COPY --from=builder /build/apps/api/user-be/dist        ./dist
COPY --from=builder /build/apps/api/user-be/node_modules ./node_modules
COPY --from=builder /build/apps/api/user-be/package.json .
COPY --from=builder /build/prisma                        ./prisma
COPY --from=builder /build/generated                     ./generated

# any runtime deps
RUN apk add --no-cache openssl

EXPOSE 3001
CMD ["node", "dist/index.js"]
