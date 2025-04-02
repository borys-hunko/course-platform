#base
FROM node:20-alpine3.21 AS builder

RUN apk add --no-cache shadow

RUN useradd -ms /bin/sh -u 1001 client

USER client

WORKDIR /client

COPY --chown=client:client package*.json ./
COPY --chown=client:client ./public ./public

FROM builder AS base

RUN npm i

COPY --chown=client:client . .

RUN npm run lint && npm run build

#for dev
FROM base AS dev

EXPOSE 8000

ENTRYPOINT [ "npm", "run", "dev" ]