ARG BUILD_FROM=ghcr.io/home-assistant/amd64-base:3.20
FROM $BUILD_FROM

RUN apk add --no-cache \
    nodejs \
    npm \
    bash \
    openssl

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY client ./client
COPY server ./server
COPY shared ./shared
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./

RUN npm run build

RUN mkdir -p /data/uploads
RUN mkdir -p /app/certs

COPY run.sh /
RUN chmod a+x /run.sh

EXPOSE 5000
EXPOSE 5443

CMD [ "/run.sh" ]
