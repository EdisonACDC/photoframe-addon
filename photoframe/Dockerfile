ARG BUILD_FROM=ghcr.io/home-assistant/amd64-base:latest
FROM $BUILD_FROM

# Installa Node.js e dipendenze
RUN apk add --no-cache \
    nodejs \
    npm \
    bash

# Crea directory di lavoro
WORKDIR /app

# Copia package.json e installa dipendenze
COPY package*.json ./
RUN npm ci --only=production

# Copia il codice dell'applicazione
COPY client ./client
COPY server ./server
COPY shared ./shared
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./

# Crea directory per upload e build
RUN mkdir -p /data/uploads /app/dist

# Copia script di avvio
COPY run.sh /
RUN chmod a+x /run.sh

# Espone porta
EXPOSE 5000

# Avvia l'applicazione
CMD [ "/run.sh" ]
