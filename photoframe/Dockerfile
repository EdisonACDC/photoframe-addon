ARG BUILD_FROM=ghcr.io/home-assistant/amd64-base:3.20
FROM $BUILD_FROM

RUN apk add --no-cache nodejs npm bash

WORKDIR /app

COPY dist ./dist
COPY package.json ./
RUN npm install --production --omit=dev

RUN mkdir -p /data/uploads /app/certs

COPY photoframe/run.sh /
RUN chmod a+x /run.sh

EXPOSE 5000 5443

CMD [ "/run.sh" ]
