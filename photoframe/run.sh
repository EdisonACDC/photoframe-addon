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

# Avvia l'applicazione
bashio::log.info "PhotoFrame avviato su porta 5000"
exec npm start
