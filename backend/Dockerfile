# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["npm", "start"] 