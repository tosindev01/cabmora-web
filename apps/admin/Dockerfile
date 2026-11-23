# syntax=docker/dockerfile:1
#
# Cabmora Admin Console — React + Vite SPA
#
# IMPORTANT: build context is the REPO ROOT, not this directory, because the
# app imports workspace packages from ../../packages. See docker-compose.yml.
#
#   docker build -f apps/admin/Dockerfile .

FROM node:22-alpine AS builder
WORKDIR /repo

# Manifests first so `npm ci` is cached until dependencies actually change.
# All workspace manifests are needed for the lockfile to resolve.
COPY package.json package-lock.json ./
COPY apps/web/package.json            apps/web/
COPY apps/admin/package.json          apps/admin/
COPY packages/ui/package.json         packages/ui/
COPY packages/api-client/package.json packages/api-client/
RUN npm ci

COPY packages/ packages/
COPY apps/admin/ apps/admin/

# NOTE: this is `vite build` only — no typecheck gate. The ported remix code
# does not yet typecheck clean, so `npm run typecheck --workspace @cabmora/admin`
# is available but not blocking. WP2 tightens this to "tsc && vite build" to
# match apps/web.
RUN npm run build --workspace @cabmora/admin


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
COPY apps/admin/nginx.conf.template /etc/nginx/templates/cabmora.conf.template

# Sourced by the nginx entrypoint before envsubst runs, so NGINX_RESOLVER is
# set by the time the template is rendered. `.envsh` matters: the entrypoint
# sources those and merely executes `.sh`, which would export nothing.
COPY apps/shared-nginx/15-resolver.envsh /docker-entrypoint.d/15-resolver.envsh
RUN chmod +x /docker-entrypoint.d/15-resolver.envsh

COPY --from=builder /repo/apps/admin/dist /usr/share/nginx/html

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- "http://localhost:${PORT}/healthz" || exit 1
CMD ["nginx", "-g", "daemon off;"]
