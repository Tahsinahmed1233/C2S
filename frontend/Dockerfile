# Multi-stage production build for React Frontend
# Stage 1: Build environment
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies with cached layers
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Copy source files and build
COPY . .
RUN npm run build

# Stage 2: Production Nginx Server
FROM nginx:alpine

# Remove default nginx html files
RUN rm -rf /usr/share/nginx/html/*

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

