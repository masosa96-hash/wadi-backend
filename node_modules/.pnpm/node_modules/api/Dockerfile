# WADI API - Production Dockerfile
# Multi-stage build for optimized image size

# Stage 1: Build
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@10.21.0

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/api ./apps/api

# Build TypeScript
WORKDIR /app/apps/api
RUN pnpm tsc

# Stage 2: Production
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm@10.21.0

# Set working directory
WORKDIR /app

# Copy package files
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/api/package.json ./apps/api/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/src ./apps/api/src

# Create temp directory for file operations
RUN mkdir -p /app/apps/api/temp/zips

# Expose port
EXPOSE 4000

# Set environment to production
ENV NODE_ENV=production

# Start the application
WORKDIR /app/apps/api
CMD ["node", "dist/index.js"]
