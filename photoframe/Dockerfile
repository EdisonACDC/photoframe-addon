ARG BUILD_FROM
FROM ${BUILD_FROM}

# Installa Node.js e dipendenze
RUN apk add --no-cache \
    nodejs-current \
    npm \
    bash \
    openssl

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY vite.config.ts tsconfig.json tailwind.config.ts postcss.config.js ./

RUN mkdir -p /data/uploads

COPY run.sh /
RUN chmod a+x /run.sh

EXPOSE 5000 5443

CMD [ "/run.sh" ]
