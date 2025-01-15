#base
FROM node:20-alpine AS base

RUN apk add --no-cache shadow

RUN useradd -ms /bin/sh -u 1001 app
USER app

WORKDIR /app

COPY --chown=app:app package*.json ./public/* ./

RUN npm i

COPY --chown=app:app . .

RUN npm run lint && npm run build

#for dev
FROM base AS dev

EXPOSE 8000

ENTRYPOINT [ "npm", "run", "dev" ]

# for production

# FROM node:17.9.0-alpine3.15 AS prod

# WORKDIR /usr/src/app

# COPY package*.json ./

# RUN npm install --only=production

# COPY --from=builder /app/dist ./

# EXPOSE 8000

# ENTRYPOINT ["node","./index.js"]