# WADI Frontend - Production Dockerfile
# Multi-stage build for optimized image size

# Stage 1: Build
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@10.21.0

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend/package.json ./apps/frontend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/frontend ./apps/frontend

# Build application
WORKDIR /app/apps/frontend
RUN pnpm build

# Stage 2: Production with Nginx
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

# Copy Nginx configuration
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
