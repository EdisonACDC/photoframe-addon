#!/usr/bin/with-contenv bashio

bashio::log.info "Avvio PhotoFrame Add-on..."

# Leggi configurazione
UPLOAD_LIMIT=$(bashio::config 'upload_limit')
MAX_FILE_SIZE=$(bashio::config 'max_file_size')

bashio::log.info "Limite upload: ${UPLOAD_LIMIT} file"
bashio::log.info "Dimensione massima file: ${MAX_FILE_SIZE}MB"

# Crea directory uploads se non esiste
mkdir -p /data/uploads

# Export variabili ambiente
export UPLOAD_DIR=/data/uploads
export PORT=5000
export APP_ROOT=/app

cd /app

# Debug: verifica file esistenti
bashio::log.info "=== DEBUG INFO ==="
bashio::log.info "Contenuto /app:"
ls -la /app | head -10
bashio::log.info "Contenuto /app/dist:"
ls -la /app/dist 2>/dev/null || bashio::log.warning "/app/dist NON ESISTE"
bashio::log.info "Contenuto /app/dist/public:"
ls -la /app/dist/public 2>/dev/null || bashio::log.warning "/app/dist/public NON ESISTE"
bashio::log.info "==================="

# Avvia l'applicazione
bashio::log.info "PhotoFrame avviato su porta 5000"
exec npm start
