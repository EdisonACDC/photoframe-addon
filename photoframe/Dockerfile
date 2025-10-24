ARG BUILD_FROM
FROM $BUILD_FROM

# Installa Node.js e dipendenze
RUN apk add --no-cache \
    nodejs \
    npm \
    bash

# Crea directory di lavoro
WORKDIR /app

# Copia package.json e installa TUTTE le dipendenze (incluse dev per build)
COPY package*.json ./
RUN npm ci

# Copia il codice dell'applicazione
COPY client ./client
COPY server ./server
COPY shared ./shared
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./

# Fai il build del frontend e backend
RUN npm run build

# Rimuovi devDependencies per ridurre dimensione
RUN npm prune --production

# Crea directory per upload
RUN mkdir -p /data/uploads

# Copia script di avvio
COPY run.sh /
RUN chmod a+x /run.sh

# Espone porta
EXPOSE 5000

# Avvia l'applicazione
CMD [ "/run.sh" ]
