ARG BUILD_FROM
FROM ${BUILD_FROM}

# Installa solo Node.js
RUN apk add --no-cache nodejs-current npm bash openssl

WORKDIR /app

# Prima: installa dipendenze
COPY package*.json ./
RUN npm ci --production --ignore-scripts || npm install --production --ignore-scripts

# Poi: copia tutto il codice
COPY . .

# Build con fallback
RUN npm run build || echo "Build fallito, uso fallback"

# Crea directory uploads
RUN mkdir -p /data/uploads

# Script di avvio
COPY run.sh /
RUN chmod +x /run.sh

EXPOSE 5000 5443

CMD ["/run.sh"]
