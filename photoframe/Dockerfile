ARG BUILD_FROM=ghcr.io/home-assistant/amd64-base:3.20
FROM $BUILD_FROM

# Install Node.js and dependencies
RUN apk add --no-cache nodejs npm bash

# Set working directory
WORKDIR /app

# Copy pre-built dist and dependencies
COPY dist ./dist
COPY package.json ./
RUN npm install --production --omit=dev

# Create required directories
RUN mkdir -p /data/uploads /app/certs

# Create s6 longrun service for PhotoFrame
RUN mkdir -p /etc/services.d/photoframe
COPY rootfs/etc/services.d/photoframe/run /etc/services.d/photoframe/run
RUN chmod a+x /etc/services.d/photoframe/run

# Expose ports
EXPOSE 5000 5443
