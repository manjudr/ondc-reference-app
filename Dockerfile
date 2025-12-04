# ONDC Reference App
# React + Vite frontend application

# Build stage
FROM node:23-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies (including devDependencies for build)
# Using npm install instead of npm ci since package-lock.json is gitignored
# and may not be available in Docker build context
RUN npm install

# Copy application source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:23-alpine

# Set working directory
WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy package files
COPY package.json ./

# Install vite locally for preview server (needed to load vite.config.ts if present)
RUN npm install vite@^4.4.5

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/vite.config.ts ./vite.config.ts

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port (Vite dev server default port)
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5173 || exit 1

# Start the application using vite preview
# --no-open prevents vite from trying to open a browser (not available in container)
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "5173", "--no-open"]

