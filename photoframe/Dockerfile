ARG BUILD_FROM
FROM ${BUILD_FROM}

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
RUN npm install

# Copia il codice sorgente
COPY client ./client
COPY server ./server
COPY shared ./shared
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./

# Compila il progetto
RUN npm run build

# Crea directory per upload
RUN mkdir -p /data/uploads

# Copia script di avvio
COPY run.sh /
RUN chmod a+x /run.sh

# Espone porte
EXPOSE 5000 5443

# Avvia applicazione
CMD [ "/run.sh" ]
