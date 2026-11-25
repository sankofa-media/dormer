# syntax=docker/dockerfile:1
# The site is static, so it is built once on the build platform and copied
# into every target platform's nginx image.
FROM --platform=$BUILDPLATFORM node:24-bookworm-slim AS build
ARG SITE_URL=https://dormer.sankofa.workshop.aenix.io
ENV SITE_URL=$SITE_URL
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Move media out of dist/ so art and site land in separate layers.
RUN npm run build && mv dist/media /media

FROM nginxinc/nginx-unprivileged:1.29-alpine
COPY --from=build /media /usr/share/nginx/html/media
COPY --from=build /src/dist /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
