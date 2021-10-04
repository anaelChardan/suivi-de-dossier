FROM node:14.15.1-alpine as build
ARG BUILD_ENV
ARG NPM_TOKEN
EXPOSE 80
WORKDIR /app
# Install dependencies
RUN apk add git bash
ADD ./package*.json ./
ADD ./.npmrc ./
RUN yarn install
## Build
ADD ./ ./
RUN yarn run build
FROM build as dev
WORKDIR /app/dist
CMD ["node", "src/index.js"]
FROM node:14.15.1-alpine as production
ARG NPM_TOKEN
WORKDIR /app
COPY --from=dev /app/package*.json ./
COPY --from=dev /app/.npmrc ./
RUN yarn install --production
COPY --from=dev /app/dist ./
CMD ./node_modules/.bin/knex --knexfile knexfile.js migrate:latest && node src/index.js
