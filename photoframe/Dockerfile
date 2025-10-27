ARG BUILD_FROM=ghcr.io/home-assistant/amd64-base:3.20
FROM $BUILD_FROM

# Install dependencies
RUN apk add --no-cache nodejs npm bash

WORKDIR /app

# Copy application
COPY dist ./dist
COPY package.json ./
RUN npm install --production --omit=dev

# Create directories
RUN mkdir -p /data/uploads /app/certs

# Set environment
ENV NODE_ENV=production
ENV PORT=5000
ENV HTTPS_PORT=5443
ENV UPLOAD_DIR=/data/uploads
ENV MAX_UPLOAD_FILES=50
ENV MAX_FILE_SIZE_MB=10

EXPOSE 5000 5443

# Run Node.js directly (no scripts, no s6)
CMD ["/bin/sh", "-c", "mkdir -p /data/uploads && chmod 777 /data/uploads && exec node dist/index.js"]
