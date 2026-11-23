# Cabmora — Docker & Deployment

Deployment across **two repositories**.

```
cabmora-web/                      cabmora-api/
├── apps/web/      React 19       ├── app/         FastAPI, clean arch
├── apps/admin/    React 19       ├── tests/
├── packages/ui/                  ├── Dockerfile
├── packages/api-client/          └── docker-compose.yml   (api + postgres)
├── design-source/creator-portal/
├── docker-compose.yml            (web + admin only)
└── docker-compose.prod.yml
```

The two repos share **no code** — only the HTTP contract at the API's
`/openapi.json`. They build, version, and deploy independently.

The frontends stay together because they genuinely share `packages/ui` and
`packages/api-client`; splitting them would mean publishing those to a registry
or duplicating them, and duplication is what produced the token drift that
`INTEGRATION_PLAN.md` §5.1 exists to clean up.

## ⚠️ One-time step before the first build

The root `package-lock.json` is required by `npm ci` in both frontend
Dockerfiles and **has not been generated yet** — the environment this was set up
in could not reach the npm registry reliably. Run once, at the repo root:

```bash
npm install
```

Commit the resulting `package-lock.json`. Until it exists, `docker compose
build web` fails with *"npm ci can only install with an existing
package-lock.json"*.

---

## Quick start

### Development — hot reload

Two stacks, started independently.

```bash
cd cabmora-api  && docker compose up -d --build    # api + postgres
cd cabmora-web  && docker compose up --build       # web + admin
```

| | URL |
|---|---|
| Web (Vite dev server, HMR) | http://localhost:5173 |
| Admin (Vite dev server, HMR) | http://localhost:5174 |
| API | http://localhost:8000 · docs at `/docs` |
| Postgres | `localhost:5432` — `cabmora` / `cabmora` |

Source is bind-mounted, so host edits reload inside the containers.

The frontend containers reach the API via `host.docker.internal:8000` — they are
in a different compose project, so a service name would not resolve. Frontend
work needing no local backend can skip the API stack entirely:

```bash
API_TARGET=https://api-staging.cabmora.com docker compose up
```

### Production shape — locally

```bash
cp .env.example .env      # set API_UPSTREAM
docker compose -f docker-compose.prod.yml up --build -d
```

The public site is served from **http://localhost:8080** and the admin console
from **http://localhost:8081** — each runs its own nginx, serving its built SPA
and proxying `/api` to `API_UPSTREAM` — the separately deployed cabmora-api.

The admin port is bound to `127.0.0.1` on purpose, so it is not reachable from
outside the host without an explicit edge proxy in front of it.

**Run this before every deploy.** It catches production-only breakage — SPA
fallback, asset cache headers, proxy wiring — that the dev stack structurally
cannot reproduce.

```bash
docker compose -f docker-compose.prod.yml down          # stop
docker compose -f docker-compose.prod.yml down -v       # stop + wipe the database
```

---

## Why there is no `VITE_API_URL`

`packages/api-client/src/client.ts` uses a **relative** base URL:

```ts
const BASE_URL = '/api/v1';
```

The browser therefore calls whatever origin served the page, and nginx proxies
`/api` to the API container. Three consequences, all good:

1. **No API URL is baked at build time.** Vite inlines `import.meta.env` at build
   time, so an absolute URL would mean one image per environment. Instead the
   nginx upstream is `${API_UPSTREAM}`, substituted by the nginx image's
   `envsubst` entrypoint at **container start**. One image runs unchanged in
   staging and production — only the env var differs. This matters far more now
   that the API is a separately deployed repo.
2. **No CORS in production.** Requests are same-origin. `CORS_ORIGINS` stays `[]`
   unless a client is later served from a different origin — which is exactly what
   happens when the admin console gets its own subdomain.
3. **Dev and prod behave identically.** The Vite dev proxy and the nginx proxy
   present the same URL surface to the app.

Keep it this way. Switching to an absolute API URL reintroduces all three problems.

---

## Architecture

```
  ── cabmora-web repo ──────────────┐   ── cabmora-api repo ──────────────┐
                                    │                                     │
  public ────► ┌──────────────────┐ │                                     │
               │ web  (nginx)     │─┼──┐                                  │
               └──────────────────┘ │  │                                  │
                                    │  │  /api → ${API_UPSTREAM}          │
  operators ─► ┌──────────────────┐ │  │                                  │
  (edge proxy  │ admin (nginx)    │─┼──┤     ┌───────────────────────┐    │
   + allowlist)└──────────────────┘ │  └────►│  api  (uvicorn :8000) │    │
                                    │        └───────────┬───────────┘    │
                                    │                    ▼                │
                                    │        ┌───────────────────────┐    │
                                    │        │  db  (postgres)       │    │
                                    └────────┴───────────────────────┴────┘
```

The browser only ever talks to `web` or `admin`; each proxies `/api` onward, so
requests stay **same-origin** and CORS never engages. `admin` publishes on
`127.0.0.1` only. In the API repo, Postgres publishes no port in production.

---

## Images

### `cabmora-api/Dockerfile` — `python:3.12-slim`

Two stages. The builder carries `build-essential` and compiles wheels
(`bcrypt`, `asyncpg`, and `cryptography` may need it on arm64, where prebuilt
wheels are less consistently available); the runtime installs those wheels and
ships no compiler. Runs as non-root uid 1000. `HEALTHCHECK` hits
`/api/v1/health`.

> **Python version:** pinned to **3.12** here. `README.md` previously said
> "3.11+" and `docs/BACKEND_PLAN.md` says "sandbox is Python 3.10" — the
> constraint behind using `Enum(str, Enum)` rather than `StrEnum`. 3.12 runs that
> code fine, so nothing breaks, but `BACKEND_PLAN.md`'s `StrEnum` guidance is now
> stale and should be revisited.

### `apps/web/Dockerfile` and `apps/admin/Dockerfile` — `node:22-alpine` → `nginx:1.27-alpine`

**Both build from the repo root as context**, with an explicit `dockerfile:`
path — the apps import workspace packages from `packages/`, which a context
scoped to `apps/web` could not see. Building one by hand therefore looks like:

```bash
docker build -f apps/web/Dockerfile .      # note the trailing "."
```

All four workspace manifests are copied before `npm ci` so the layer cache
survives source edits. The runtime image contains only `dist/` and nginx: no
Node, no `node_modules`, no source.

> **The two apps do not have the same build gate.** `apps/web` runs
> `tsc && vite build`, so a type error fails the build. `apps/admin` runs
> `vite build` only — the remix code it was ported from has never been
> typechecked (its original `tsconfig.json` had no `include` and no `strict`).
> `npm run typecheck --workspace @cabmora/admin` reports the damage; WP2 fixes
> it and tightens the build script to match web.

Listens on **8080**, not 80, so the container can drop to a non-root user later.
It currently still runs the nginx master as root; switching the base image to
`nginxinc/nginx-unprivileged:1.27-alpine` completes that, and is the recommended
next hardening step.

---

## Things that will bite you

**`index.html` must never be cached.** `nginx.conf` sends
`no-cache, no-store, must-revalidate` for it, while `/assets/*` — content-hashed
by Vite — gets `immutable` for a year. Cache `index.html` and browsers pin to a
stale asset manifest after a deploy and the app white-screens.

**`packages/` is consumed as TypeScript source, not as a built artefact.** Each
app compiles it with its own Vite. A change to `packages/ui` needs no rebuild
step, but does require both apps to be rebuilt to pick it up.

> **Both apps must stay on the same React major.** An earlier version of this
> document claimed `apps/web` (React 18) and `apps/admin` (React 19) could
> coexist because each app aliases `packages/` through its own Vite config.
> That is true for *runtime bundling* and false for *TypeScript*: `tsc`
> resolves `@types/react` by ordinary node resolution, so npm hoists one major
> to the repo root and nests the other. Library types (`lucide-react`,
> `react-router-dom`) then resolve against the hoisted copy while the app's own
> files compile against the nested one, and every library JSX element fails
> with **TS2786 — "cannot be used as a JSX component"**. The tell is
> `Type 'bigint' is not assignable to type 'ReactNode'`; `bigint` was added to
> `ReactNode` in `@types/react` 19, so it names the version boundary.
>
> `apps/web` was upgraded to React 19 / router 7 / Vite 6 on 2026-08-01 to fix
> this. Keep the two aligned.

**The API upstream is resolved per-request, on purpose.** `nginx.conf.template`
puts the upstream in a variable (`set $cabmora_api ${API_UPSTREAM};`) behind a
`resolver` directive, rather than a literal `proxy_pass` or an `upstream {}`
block. Two reasons, and the second cost us three outages before it was fixed:

1. nginx resolves a literal hostname **once, at config-load time**, and exits
   with *"host not found in upstream"* if the name isn't in DNS yet — a
   restarting API would take the whole web container down with it.
2. It then **caches that address for the life of the process**. Railway gives a
   service a new private IP on every deploy, so after the API redeployed, the
   frontends kept dialling an address that no longer answered. Every `/api`
   request hung until *both frontends* were redeployed by hand.

`valid=10s` caps how long a resolved address is trusted.

**The resolver's own address is discovered, not hard-coded.** It differs per
environment — `127.0.0.11` under Docker Compose, something else on Railway, and
an IPv6 address on Railway's private network. `apps/shared-nginx/15-resolver.envsh`
reads the first `nameserver` out of `/etc/resolv.conf`, brackets it if it is
IPv6, and exports `NGINX_RESOLVER` for envsubst. It must keep the `.envsh`
extension: the nginx entrypoint *sources* those and merely *executes* `.sh`
files, which would export nothing.

Any new variable must also be added to `NGINX_ENVSUBST_FILTER` in both
Dockerfiles, or envsubst silently skips it and nginx dies on `resolver ;`.

**`CORS_ORIGINS` is parsed as JSON.** pydantic-settings reads `list[str]` as
JSON, so the brackets are mandatory:

```bash
CORS_ORIGINS=["https://admin.cabmora.com"]   # correct
CORS_ORIGINS=https://admin.cabmora.com       # ValidationError on boot
```

**The API runs a single uvicorn worker.** `app/main.py`'s lifespan calls
`create_tables()` on boot; concurrent workers would race on `CREATE TABLE`.
Raise the worker count only once Alembic migrations replace `create_tables()`
— see below.

**`client_max_body_size` is set to 512m** on `/api/`. nginx's 1 MB default would
reject Phase 3 media uploads with a confusing 413.

---

## Before this is genuinely production-ready

Deliberately out of scope for this pass, in rough priority order:

1. **Alembic migrations.** `create_tables()` is flagged in the code as dev
   convenience. It cannot alter existing tables, so the first schema change
   against real data has no safe path. This blocks multi-worker too.
2. **TLS.** Terminate at a reverse proxy in front of `web` (Caddy, Traefik, or
   Cloudflare). Nothing here does TLS.
3. **Secrets management.** `.env` is fine for a single VPS; move to the
   platform's secret store beyond that. `JWT_SECRET_KEY` must be rotated off the
   placeholder — `openssl rand -hex 32`.
4. **Database backups.** `postgres_data` is a bare Docker volume with no backup
   schedule.
5. **Object storage.** Phase 3 media does not belong on a container filesystem.
6. **Log aggregation and error tracking** (Sentry or equivalent).

---

## Serving the admin console publicly

The `admin` service is already in both compose files. To put it on
`admin.cabmora.com`, route that hostname to the admin container at your edge
proxy and put Cloudflare Access or an IP allowlist in front of it. Its nginx
already sends `X-Robots-Tag: noindex, nofollow, noarchive`.

**All of that is obscurity, not authorisation.** The actual control is the
backend `require_role(Role.ADMIN)` dependency on `/api/v1/admin/*`, which does
not exist yet — it is WP5. Until it does, treat the admin console as
unprotected regardless of where it is hosted. See `INTEGRATION_PLAN.md` §2.

## What moved, and what is still pending

| Was | Now |
|---|---|
| `backend/` | **`cabmora-api/`** — its own repo |
| `frontend/` | `apps/web/` |
| `remix_-cabmora-media-admin-1/` | `apps/admin/` |
| `remix_-cabmora-media-creator-002/` | `design-source/creator-portal/` |
| `frontend/src/shared/ui/`, `app/theme.css` | `packages/ui/src/` |
| `frontend/src/shared/api/client.ts` | `packages/api-client/src/` |

Removed files are staged in `.trash/` rather than deleted — the sandbox could
not delete files on the mounted volume. **Review and `rm -rf .trash/` yourself.**
It contains the superseded `cabmora-media-front-end/` AI Studio build, the
frontend extract tarball, the macOS `node_modules`, and the admin remix's AI
Studio scaffolding (`fix_fonts.py`, `rewrite_app.py`, `untitled.tsx`, …).

`cabmora-api/` is staged inside this folder only because the sandbox could not
write outside it — see `SPLIT_INSTRUCTIONS.md` to move it out and initialise it.

Still pending, in order: complete the repo split, generate the root lockfile,
port the creator portal pages out of `design-source/` into `apps/web` (WP4),
reconcile the ~1,600 hex values in that code against `packages/ui` tokens, and
upgrade `apps/web` to React 19 so both apps match.
