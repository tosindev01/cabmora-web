# Cabmora — Railway deployment, branching & CI/CD

How code gets from a laptop to production. Two GitHub repos, one Railway
project, two environments.

---

## 1. Railway project layout

**Put all four services in ONE Railway project**, even though they come from two
GitHub repos. Railway services in the same project + environment can talk over
[private networking](https://docs.railway.com/networking/private-networking) —
which means the API never needs a public domain, and the frontends reach it at
an internal hostname that costs nothing in egress.

```
Railway project: cabmora
├── environment: production        ← branch: main
│   ├── web       (cabmora-web repo, apps/web/Dockerfile)
│   ├── admin     (cabmora-web repo, apps/admin/Dockerfile)
│   ├── api       (cabmora-api repo)
│   └── Postgres
└── environment: staging           ← branch: staging
    └── (same four services, separate data)
```

Only `web` and `admin` get public domains. `api` and Postgres stay internal.

---

## 2. Service configuration

### The monorepo trap — do NOT set Root Directory

Railway's [monorepo docs](https://docs.railway.com/deployments/monorepo)
describe two kinds. `cabmora-web` is a **shared** monorepo: `apps/web` imports
`packages/ui` and `packages/api-client` from the repo root.

Setting **Root Directory** to `apps/web` would make Railway pull down only that
directory, and the build would die on `COPY packages/ packages/` — the files
would not exist in the context.

Leave Root Directory empty. Point at the Dockerfile with a variable instead.

### `web` service

| Setting | Value |
|---|---|
| Repo | `Cabmoramedia/cabmora-web` |
| Root Directory | *(empty — leave at repo root)* |
| Variable `RAILWAY_DOCKERFILE_PATH` | `apps/web/Dockerfile` |
| Variable `API_UPSTREAM` | `api.railway.internal:8000` |
| Watch paths | `apps/web/**`, `packages/**`, `package.json`, `package-lock.json` |
| Public domain | generate, then map `cabmora.com` |

### `admin` service

Identical, except:

| Setting | Value |
|---|---|
| Variable `RAILWAY_DOCKERFILE_PATH` | `apps/admin/Dockerfile` |
| Watch paths | `apps/admin/**`, `packages/**`, `package.json`, `package-lock.json` |
| Public domain | generate, then map `admin.cabmora.com` |

**Watch paths matter here.** Without them every push rebuilds *both* services,
doubling build minutes and deploying an app that did not change. The
`packages/**` entry is deliberate — a token change there genuinely does affect
both.

### `api` service

| Setting | Value |
|---|---|
| Repo | `Cabmoramedia/cabmora-api` |
| Variable `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` — Railway reference, do not paste a literal |
| Variable `JWT_SECRET_KEY` | `openssl rand -hex 32`, **different per environment** |
| Variable `ENVIRONMENT` | `production` / `staging` |
| Variable `CORS_ORIGINS` | `[]` — see below |
| Public domain | **none** |

`CORS_ORIGINS` stays empty because the browser never calls the API directly:
`web`'s nginx proxies `/api` to it, so requests are same-origin. If you ever
give the API a public domain and call it cross-origin, this becomes
`["https://cabmora.com","https://admin.cabmora.com"]` — as a **JSON array**,
because pydantic-settings parses `list[str]` as JSON and a bare string throws a
validation error on boot.

> Railway's `DATABASE_URL` for Postgres is `postgresql://...`. SQLAlchemy async
> needs the driver in the scheme: `postgresql+asyncpg://...`. Either transform
> it in `config.py` or set `DATABASE_URL` manually from the reference
> variables. **This will bite on first deploy if skipped.**

---

## 3. Two things that had to change for Railway

Both were real bugs, found by reading Railway's docs rather than by deploying.

### `PORT` — Railway picks the port, not you

Railway injects `PORT` and routes to it. A container listening on a hardcoded
port gets *"Application failed to respond"* (502). Fixed in three places:

- both `nginx.conf.template`s now `listen ${PORT};`
- `NGINX_ENVSUBST_FILTER` widened to `(API_UPSTREAM|PORT)` — with only
  `API_UPSTREAM` listed, envsubst would skip `PORT` and nginx would die parsing
  `listen ;`
- the API's `CMD` is **shell form** so `${PORT}` expands. Exec form
  (`["uvicorn", ..., "--port", "$PORT"]`) passes the literal string `$PORT`

### The nginx `resolver` was Docker-only

I had `resolver 127.0.0.11` — Docker's embedded DNS — to defer upstream
resolution to request time. That address does not exist on Railway, so the
config was unportable. `proxy_pass` now uses the envsubst-substituted literal,
which needs no resolver at all.

The trade-off, stated plainly: nginx now resolves the upstream at startup and
exits if the host is not in DNS. Compose handles that with `depends_on`;
Railway's internal domains are stable. Worth it for one config that works in
both.

---

## 4. Branching

```
feature/* ──PR──► staging ──auto deploy──► staging environment
                     │
                     └──PR──► main ──auto deploy──► production
```

**Why `staging` as a real branch rather than trunk-based?** Railway maps an
environment to a *branch*. Trunk-based would need manual image promotion via
the API — more machinery than this team needs. A staging branch gets you the
same safety with a `git merge`.

The cost is that `staging` can drift ahead of `main`. Keep it small: merge to
`main` often, and never let staging accumulate work that is not going to ship.

### Branch protection

On **both** `main` and `staging` (Settings → Branches):

- Require a pull request before merging
- Require status checks to pass → select the **`build`** job from CI
- Require branches to be up to date before merging
- On `main` only: require 1 approval

Protecting `staging` too is what stops someone bypassing CI by pushing straight
to the branch that deploys.

### Releasing

```bash
git checkout staging && git pull
# verify on the staging URL
git checkout main && git merge --no-ff staging
git push                      # Railway deploys production
git tag -a v0.1.0 -m "..." && git push --tags
```

`--no-ff` keeps a merge commit per release, so `git log --first-parent main`
reads as a release history.

---

## 5. What CI does

`.github/workflows/ci.yml` runs on every PR and on pushes to `main`/`staging`.

| Job | Step | Blocking |
|---|---|---|
| `build` | `npm ci` | ✅ |
| | typecheck web (`tsc --noEmit`) | ✅ |
| | typecheck admin | ❌ — see below |
| | build web, build admin | ✅ |
| `docker` | build both images with buildx | ✅ |

**CI does not deploy.** Railway watches the repo and deploys itself; a deploy
step here would mean two systems racing to ship the same commit. CI decides
whether a commit is *fit* to deploy, and branch protection enforces the answer.

**Admin typecheck is non-blocking** because `apps/admin` was ported from a build
that was never typechecked — it would report a pre-existing backlog, not a
regression. Drop `continue-on-error` once WP2 clears it; that flag flipping is
the signal admin has caught up with web.

---

## 6. Patch still needed in `cabmora-api`

That repo has already been moved out, so apply this by hand. In its
`Dockerfile`, replace the final `CMD` with:

```dockerfile
# Local default; Railway injects its own PORT at runtime.
ENV PORT=8000

# NOTE: shell form, deliberately. Exec form does NOT expand ${PORT} — it would
# pass the literal string and bind a port Railway does not route to, surfacing
# as "Application failed to respond".
#
# Single worker: app/main.py's lifespan calls create_tables() on boot, so
# multiple workers would race on DDL. Raise the count only once Alembic
# migrations replace create_tables().
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
```

And update the healthcheck line to:

```dockerfile
    CMD curl -fsS "http://localhost:${PORT}/api/v1/health" || exit 1
```

---

## 7. Order of operations

1. `npm install` at the repo root, commit `package-lock.json` — the Docker
   builds run `npm ci` and fail without it
2. Push `cabmora-web` to GitHub; create the `staging` branch from `main`
3. Create the Railway project; add Postgres first
4. Add the `api` service from `cabmora-api`, set its variables, confirm
   `/api/v1/health` responds on its internal domain
5. Add `web` and `admin` from `cabmora-web` with the settings in §2
6. Generate public domains; check the SPA loads and `/api/v1/health` proxies
7. Duplicate the environment to `staging`, point it at the `staging` branch,
   give it its own `JWT_SECRET_KEY` and database
8. Turn on branch protection once CI has run green at least once

---

## 8. Before real users

Carried over from `DEPLOYMENT.md`, unchanged by the move to Railway:

1. **Alembic migrations.** `create_tables()` cannot alter existing tables, so
   the first schema change against real data has no safe path. Also what blocks
   running more than one worker.
2. **Role-based authorisation.** `require_role(Role.ADMIN)` on `/api/v1/admin/*`
   does not exist. Until it does, the admin console is unprotected no matter
   what domain it sits on — a Railway domain is obscurity, not access control.
3. **Database backups.** Railway Postgres supports backups; turn them on and
   verify a restore.
4. **Error tracking** — Sentry or equivalent, in both frontends and the API.
