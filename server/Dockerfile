#base
FROM node:20-alpine3.21 AS builder

RUN apk add --no-cache shadow

RUN useradd -ms /bin/sh -u 1001 app

USER app

WORKDIR /app

COPY --chown=app:app package*.json ./
COPY --chown=app:app ./public ./public


FROM builder AS base

RUN npm i

COPY --chown=app:app . .

RUN npm run lint && npm run build

#for dev
FROM base AS dev

EXPOSE 8000

ENTRYPOINT [ "npm", "run", "dev" ]

# for production
FROM builder AS prod

ARG PORT

ENV NODE_ENV=production

RUN npm ci

COPY --from=base /app/dist ./

EXPOSE ${PORT}

ENTRYPOINT ["npm", "run", "prod"]