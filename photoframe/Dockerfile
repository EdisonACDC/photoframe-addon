ARG BUILD_FROM
FROM $BUILD_FROM

# Installa Node.js 20 e dipendenze
RUN apk add --no-cache \
    nodejs-current \
    npm \
    bash

# Crea directory di lavoro
WORKDIR /app

# Copia TUTTO il codice
COPY . .

# Installa dipendenze (usa install invece di ci per essere più flessibile)
RUN npm install --verbose

# Fai il build
RUN npm run build || (cat /root/.npm/_logs/*.log 2>/dev/null && exit 1)

# Rimuovi devDependencies per ridurre dimensione
RUN npm prune --production

# Crea directory per upload
RUN mkdir -p /data/uploads

# Rendi eseguibile lo script di avvio
RUN chmod a+x /run.sh

# Espone porta
EXPOSE 5000

# Avvia l'applicazione
CMD [ "/run.sh" ]
