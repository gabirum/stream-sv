FROM node:lts-slim AS base
RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg \
  && apt-get purge -y --auto-remove \
  && rm -rf /var/lib/apt/lists/*
RUN mkdir -p /home/node/app && chown node:node /home/node/app
WORKDIR /home/node/app
USER node
RUN mkdir tmp

FROM base AS build
COPY --chown=node:node ./package*.json ./
RUN npm i
COPY --chown=node:node . .
RUN node ace build

FROM base AS production
ENV NODE_ENV=production
ENV PORT=$PORT
ENV HOST=0.0.0.0
COPY --chown=node:node ./package*.json ./
RUN npm i --omit=dev
COPY --chown=node:node --from=build /home/node/app/build .
EXPOSE $PORT
CMD [ "node", "bin/server.js" ]