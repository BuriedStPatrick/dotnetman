ARG DOCKER_USER=bun

FROM oven/bun:1 as base
ARG DOCKER_USER
RUN apt-get update && apt-get install -y wget
RUN mkdir -p /tmp && chown ${DOCKER_USER} -R /tmp
RUN mkdir -p /build && chown ${DOCKER_USER} -R /build
RUN mkdir -p /src && chown ${DOCKER_USER} -R /src
USER ${DOCKER_USER}

FROM base as source
ARG DOCKER_USER
WORKDIR /src
COPY package.json bun.lockb ./
RUN bun install \
  --frozen-lockfile \
  --production
COPY . .

FROM source as build
ARG DOCKER_USER
ENTRYPOINT ["bun", "build", "--compile", "--file", "./index.ts", "--outfile", "./bin/dotnetman"]

FROM source as run
ARG DOCKER_USER
ENTRYPOINT ["bun", "run", "index.ts"]
