ARG BUILD_FROM
FROM $BUILD_FROM

# Installa Node.js e dipendenze
RUN apk add --no-cache \
    nodejs-current \
    npm \
    bash \
    openssl

# Crea directory di lavoro
WORKDIR /app

# Copia package files
COPY package*.json ./

# Installa dipendenze
RUN npm install --verbose

# Copia il codice
COPY client ./client
COPY server ./server
COPY shared ./shared
COPY public ./public
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./

# Fai il build
RUN npm run build || (cat /root/.npm/_logs/*.log 2>/dev/null && exit 1)

# Crea directory per upload e certificati
RUN mkdir -p /data/uploads
RUN mkdir -p /app/certs

# Copia script di avvio nella root e rendilo eseguibile
COPY run.sh /
RUN chmod a+x /run.sh

# Espone porte
EXPOSE 5000
EXPOSE 5443

# Avvia applicazione
CMD [ "/run.sh" ]
