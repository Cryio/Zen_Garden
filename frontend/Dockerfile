# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
# Install dependencies and update package-lock.json
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app
RUN npm install -g serve

# Copy only the built files from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"] 