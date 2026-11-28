# syntax=docker/dockerfile:1
#
# Cabmora Web — React + Vite SPA
#
# ── Why this file sits at the repo root ───────────────────────────────────
# It is a byte-for-byte copy of apps/web/Dockerfile. Railway auto-detects a
# builder by looking for `Dockerfile` at the repo root ONLY; with the real one
# nested under apps/web it silently falls back to Railpack and runs the Vite
# dev server in production, ignoring RAILWAY_DOCKERFILE_PATH.
#
# Having it here means zero Railway configuration is needed for the web
# service. apps/admin still needs RAILWAY_DOCKERFILE_PATH=apps/admin/Dockerfile
# on its own service, which overrides this default.
#
# If you edit apps/web/Dockerfile, copy it here too — or delete this file once
# Railway is reliably honouring the variable.
#
#   docker build -f Dockerfile .

FROM node:22-alpine AS builder
WORKDIR /repo

# Manifests first so `npm ci` is cached until dependencies actually change.
COPY package.json package-lock.json ./
COPY apps/web/package.json        apps/web/
COPY apps/admin/package.json      apps/admin/
COPY packages/ui/package.json     packages/ui/
COPY packages/api-client/package.json packages/api-client/
RUN npm ci

# Build both web and admin so a single Railway service can serve both `/` (web)
# and `/admin/*` (or `admin.*` hostnames) without redirecting `/admin/team` to
# the public marketing landing page.
COPY packages/ packages/
COPY apps/web/ apps/web/
COPY apps/admin/ apps/admin/

# "tsc && vite build" — a type error fails the build, which is intended.
RUN npm run build --workspace @cabmora/web && npm run build --workspace @cabmora/admin


FROM nginx:1.27-alpine AS runtime
RUN rm /etc/nginx/conf.d/default.conf

# The config is a TEMPLATE. The nginx image's entrypoint runs envsubst over
# /etc/nginx/templates/*.template at container start and writes the result to
# /etc/nginx/conf.d/. That is how API_UPSTREAM gets injected without rebuilding
# the image — the same artefact runs against a local API or a production one.
#
# NGINX_ENVSUBST_FILTER restricts substitution to these three so nginx's own
# runtime variables ($host, $uri, $request_uri, $cabmora_api, ...) are left
# untouched. Every var must be listed, or envsubst silently skips the missing
# one and nginx fails to start on an unparsable `listen ;` or `resolver ;`.
ENV NGINX_ENVSUBST_FILTER="(API_UPSTREAM|PORT|NGINX_RESOLVER)"
ENV API_UPSTREAM="api:8000"
# Local default. Railway overrides PORT at runtime.
ENV PORT=8080
COPY apps/web/nginx.conf.template /etc/nginx/templates/cabmora.conf.template

# Sourced by the nginx entrypoint before envsubst runs, so NGINX_RESOLVER is
# set by the time the template is rendered. `.envsh` matters: the entrypoint
# sources those and merely executes `.sh`, which would export nothing.
COPY apps/shared-nginx/15-resolver.envsh /docker-entrypoint.d/15-resolver.envsh
RUN chmod +x /docker-entrypoint.d/15-resolver.envsh

COPY --from=builder /repo/apps/web/dist /usr/share/nginx/html
COPY --from=builder /repo/apps/admin/dist /usr/share/nginx/admin
COPY --from=builder /repo/apps/admin/dist/assets/ /usr/share/nginx/html/assets/

# See apps/web/nginx.conf.template for why 8080 rather than 80.
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- "http://localhost:${PORT}/healthz" || exit 1
CMD ["nginx", "-g", "daemon off;"]
