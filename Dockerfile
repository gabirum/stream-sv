FROM node:lts-alpine AS base
RUN apk update && apk upgrade && apk add --no-cache ffmpeg
RUN mkdir -p /home/node/app && chown node:node /home/node/app
WORKDIR /home/node/app
USER node
RUN mkdir tmp

FROM base AS dependencies
COPY --chown=node:node ./package*.json ./
RUN npm i
COPY --chown=node:node . .

FROM dependencies AS build
RUN node ace build

FROM base AS production
ENV NODE_ENV=production
ENV PORT=$PORT
ENV HOST=0.0.0.0
COPY --chown=node:node ./package*.json ./
RUN npm ci --omit=dev
COPY --chown=node:node --from=build /home/node/app/build .
EXPOSE $PORT
CMD [ "node", "bin/server.js" ]
