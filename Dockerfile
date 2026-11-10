# Multi-stage production build for Truvaer Aviation Platform
# Supports AWS EC2, AWS App Runner, ECS, Azure App Service, and Azure VM

# Stage 1: Build static assets
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Production runtime environment
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy server code and built assets from builder
COPY server.js ./
COPY --from=builder /app/dist ./dist
COPY public ./public

# Expose standard web application port
EXPOSE 3000

# Health check endpoint for AWS ALB and Azure Health Probes
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/_healthz || exit 1

# Start production server
CMD ["node", "server.js"]
