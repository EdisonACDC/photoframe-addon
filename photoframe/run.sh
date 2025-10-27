#!/usr/bin/env bashio

# Start PhotoFrame addon
bashio::log.info "Starting PhotoFrame..."

cd /app

# Set environment variables
export NODE_ENV=production
export PORT=5000

# Start the application
exec node dist/index.js
