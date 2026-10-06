# ============================================
# Stage 1: Builder
# ============================================
FROM node:22-slim  AS builder

RUN apt-get update -y && apt-get install -y wget curl openssl libssl-dev

# Thêm biến môi trường này để ép Prisma dùng đúng cơ chế OpenSSL trên Alpine
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Cài dependencies (bao gồm dev)
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build
RUN npm run build

# ============================================
# Stage 2: Production
# ============================================
FROM node:22-slim

RUN apt-get update -y && apt-get install -y openssl wget

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Chỉ cài production dependencies
RUN npm install --omit=dev

# Generate Prisma Client cho production
RUN npx prisma generate

# Copy build output từ builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/products || exit 1

# Chạy migration, seed dữ liệu mẫu và start server
CMD ["sh", "-c", "npx prisma migrate deploy && node prisma/seed.mjs && node dist/main"]