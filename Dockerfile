# syntax=docker/dockerfile:1
# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:debian as base
WORKDIR /usr/src/app

# For alpine
# RUN apk add nodejs  

# For debain
RUN apt-get -y update; apt-get -y install curl
ARG NODE_VERSION=21
RUN curl -L https://raw.githubusercontent.com/tj/n/master/bin/n -o n \
  && bash n $NODE_VERSION \
  && rm n \
  && npm install -g n

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
# COPY prisma /temp/dev/prisma/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
# COPY prisma /temp/prod/prisma/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install --chown=bun /temp/dev/node_modules node_modules
COPY --chown=bun . .

# [optional] tests & build
# FROM prerelease AS test
ENV NODE_ENV=production NO_DATABASE=1
# USER bun
RUN bunx prisma generate
RUN bun test
# RUN bun test:prod:entry
# USER root

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install --chown=bun /temp/prod/node_modules node_modules
COPY --from=prerelease --chown=bun /usr/src/app/config config
COPY --from=prerelease --chown=bun /usr/src/app/lib lib
COPY --from=prerelease --chown=bun /usr/src/app/prisma prisma
COPY --from=prerelease --chown=bun /usr/src/app/package.json .
COPY --from=prerelease --chown=bun /usr/src/app/index.ts .
COPY --from=prerelease --chown=bun /usr/src/app/bin bin

# run the app
USER bun

ENTRYPOINT [ "bun", "prod:entry" ]