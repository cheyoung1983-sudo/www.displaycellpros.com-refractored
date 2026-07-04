# Build stage
FROM node:22-slim AS builder
WORKDIR /app
# Copy package files and install ALL dependencies
COPY package*.json ./
RUN npm install
# Copy source code and build
COPY . .
RUN npm run build

# Final stage
FROM node:22-slim
ENV NODE_ENV=production
WORKDIR /app
# Copy package files
COPY package*.json ./
# Install only production dependencies
RUN npm ci --omit=dev
# Copy the build output
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/server.cjs"]
