# Cabmora Web

Frontends for the Cabmora photography & videography platform — public site and
admin console. npm workspaces monorepo.

**The backend lives in a separate repo** (`cabmora-api`). The only thing shared
between the two is the HTTP contract, published at the API's `/openapi.json`.
See `docs/PROJECT_PLAN.md` and `docs/ARCHITECTURE.md` for product and layer
conventions.

> **Not split yet?** If `cabmora-api/` is still a folder here, follow
> `SPLIT_INSTRUCTIONS.md` first.

## Structure

- `apps/web/` — public site: marketing, auth, customer & creator portals (React 19)
- `apps/admin/` — admin console: users, projects, enquiries, reviews, payments, reporting (React 19)
- `packages/ui/` — design tokens (`theme.css`) + shared primitives
- `packages/api-client/` — typed fetch wrapper, auth token handling
- `design-source/creator-portal/` — designer's 17 portal pages, pending the WP4 port into `apps/web`
- `docs/` — project plan, architecture conventions, integration & deployment plans

**First time?** Run `npm install` at the repo root to generate `package-lock.json`
(required by the Docker builds), then commit it.

## Run with Docker

The API is a separate repo and is **not** built by this stack. Start it first:

```bash
cd ../cabmora-api && docker compose up -d     # publishes :8000
```

Then the frontends:

```bash
docker compose up --build
```

- Web: http://localhost:5173 (Vite dev server, hot reload)
- Admin: http://localhost:5174

Both proxy `/api` to `host.docker.internal:8000`. To skip the local API entirely
and point at a deployed one:

```bash
API_TARGET=https://api-staging.cabmora.com docker compose up
```

Production-shaped run (nginx serving the built SPAs):

```bash
cp .env.example .env      # set API_UPSTREAM
docker compose -f docker-compose.prod.yml up --build -d
# web → http://localhost:8080 · admin → http://localhost:8081
```

See **`docs/DEPLOYMENT.md`** for the architecture, gotchas, and what still needs
doing before this is genuinely production-ready.

## Run locally (without Docker)

### Frontends (Node 22+)

```bash
npm install            # once, at the repo root — installs all workspaces
npm run dev:web        # http://localhost:5173
npm run dev:admin      # http://localhost:5174
```

Both proxy `/api` to the backend.

## What's built so far

- **Marketing site** — 14 tokenised sections, live on `/`
- **Auth screens** — login / signup, presentational only; `AuthProvider` is not
  yet mounted (see `docs/INTEGRATION_PLAN.md` §5.3)
- **Enquiry form** — wired to the API
- **Admin console** — 9 screens ported from the designer's build, not yet
  typechecked or connected to real endpoints

Pending: the creator portal's 17 pages in `design-source/` still need porting
into `apps/web` (WP4).
