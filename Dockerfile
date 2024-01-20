# syntax=docker/dockerfile:1
# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1-alpine as base
RUN apk add nodejs
WORKDIR /usr/src/app

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
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production
RUN bun test

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

ENTRYPOINT [ "bun", "prod-entry" ]