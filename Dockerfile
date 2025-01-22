FROM node:20-alpine AS base
RUN apk update && apk upgrade && apk add --no-cache ffmpeg
ARG APP_DIR=/srv/app
WORKDIR ${APP_DIR}
RUN chown -R node:node ${APP_DIR}
USER node
RUN mkdir tmp
COPY --chown=node:node ./package*.json .

FROM base AS build
RUN npm i
COPY --chown=node:node . .
RUN node ace build

FROM base AS production
ENV NODE_ENV=production
ENV PORT=3333
ENV HOST=0.0.0.0
RUN npm ci --omit=dev
COPY --chown=node:node --from=build ${APP_DIR}/build ./
EXPOSE $PORT
CMD [ "node", "bin/server.js" ]