# Cabmora — Architecture & Conventions

## Backend (FastAPI, Clean Architecture)

```
backend/app/
├── core/                  # cross-cutting: config, security, exceptions
├── domain/                # PURE Python. No FastAPI, no SQLAlchemy imports.
│   ├── entities/          # business objects (dataclasses)
│   └── repositories/      # abstract repository interfaces (ABCs)
├── application/           # use cases — one class per business action
│   └── use_cases/         # depend ONLY on domain (entities + repo interfaces)
├── infrastructure/        # implementations of domain interfaces
│   ├── database.py        # SQLAlchemy async engine/session
│   ├── models/            # ORM models (mapped to/from entities)
│   └── repositories/      # concrete repos implementing domain ABCs
└── api/                   # presentation layer
    ├── deps.py            # DI wiring (session → repo → use case)
    ├── schemas/           # pydantic request/response models
    └── v1/routers/        # thin routers: validate → call use case → respond
```

**Dependency rule:** `api → application → domain ← infrastructure`. Domain imports nothing outward. Infrastructure implements domain interfaces. Routers never touch the ORM; use cases never touch HTTP.

Conventions:
- One use case class per action (`RegisterUser`, `SubmitEnquiry`), single `execute()` method
- Repositories are ABCs in `domain/repositories`, implemented in `infrastructure/repositories`
- Domain raises domain exceptions (`core/exceptions.py`); api layer maps them to HTTP codes centrally
- Async everywhere (SQLAlchemy 2.0 async, asyncpg in prod / aiosqlite locally)
- Settings via pydantic-settings (`core/config.py`, `.env`)
- Alembic for migrations (add when schema stabilises; dev uses `create_all`)
- Tests: pytest + httpx `AsyncClient` against the app with an in-memory DB

## Frontend (React + Vite + TypeScript)

Two apps — `apps/web` is the client-facing site (marketing, creator portal,
customer portal), `apps/admin` is the internal console. They follow the same
practices and, as of 2026-08-31, the same shape: `app/` + `features/` +
`shared/`, with route components living inside the feature they belong to.

Admin is smaller (nine screens against eighteen) but it has the same domains —
users, projects, enquiries, reviews, payments, settings, reporting — so there
was never a good reason for it to be flat. The only structural difference left
is where entity data sits, explained under `apps/admin` below, and it comes
from a real difference in the two apps rather than from history.

### The rule

```
data  ←  features  ←  app
   ↖ shared ↗
```

- **`data/`** — types and, once WP5 lands, the API calls. **No React**: no
  hooks, no JSX, no state. The test is whether a unit test can import it
  without a DOM. Icon identifiers are fine — which glyph labels a row is data.
- **`features/<name>/`** (web) or `pages/` + `context/` (admin) — hooks and
  components. May import `data/` and `shared/`. **Never another feature.**
- **`shared/`** — chrome and helpers used by more than one feature. If two
  features both want it, it is not a feature.
- **`app/`** — router, providers, shell. Both apps have this; nothing else
  imports from it.
- **`packages/ui`, `packages/api-client`** — cross-*app* primitives. Design
  tokens, the `<Modal>`, the fetch wrapper. If web and admin both need it, it
  belongs here, not in either app.

Arrows point inward, same as the backend: `app → features → data`. A data
module importing a component is the frontend equivalent of `domain` importing
SQLAlchemy.

### apps/web

```
apps/web/src/
├── app/                   # router, providers, app-level styles
├── features/<name>/       # account, auth, billing, client, content, enquiry,
│   ├── data/              #   marketing, media, messaging, projects
│   ├── components/
│   ├── hooks/
│   └── pages/             # route components for THIS domain
├── shared/
│   ├── portal/            # PortalShell / PortalTopbar / PortalSidebar + nav
│   └── site/              # public Navigation + Footer + their link data
└── assets/
```

There is **no app-level `pages/`**. It used to hold three route components
while the other fifteen lived under `features/*/pages/`, which meant "where
does a page go" had two answers and the split tracked nothing but the order
things were written in. One rule now: **a route component lives with its
domain**, and `app/router.tsx` is the only file that imports one.

### apps/admin

```
apps/admin/src/
├── app/                   # App, router, AdminLayout (a layout route)
├── features/<name>/       # auth, dashboard, users, projects, enquiries,
│   └── pages/             #   reviews, payments, settings, reporting
├── shared/
│   └── store/             # AdminProvider + entity types + seed rows
└── assets/
```

Same shape as web, and the same rule: a page lives with its domain.

The one real difference is where the data sits. Web's features own their own
fixtures and never reference each other's — billing knows nothing about media.
Admin's screens genuinely share one entity set: the dashboard reads users,
projects, enquiries, reviews *and* transactions together; enquiries and
projects both read users. So the entities live in `shared/store` — it is the
in-memory stand-in for the API, which is infrastructure rather than a feature,
and putting it there is what keeps `features/*` from importing each other.
At WP5 it becomes real API calls and can move to per-feature `data/` modules if
the aggregation screens no longer need one store.

`AdminLayout` is a **layout route**, not a wrapper each page imports. Every
screen used to `import AdminLayout` and wrap itself, which meant a feature
reached up into the app shell, and a new screen could ship without the chrome
by simply forgetting. The router nests the guard and the layout once.

### Auth

The browser session is an **HttpOnly cookie** the API sets at login
(`cabmora_session`; `Secure`, `SameSite=Lax`). Nothing in the frontend reads,
stores or attaches a token — `apiFetch` just sends `credentials: 'same-origin'`,
which works because nginx makes the SPA and the API share an origin.

Two security schemes are declared server-side and both are supported: the
cookie for browsers, and `Authorization: Bearer` for anything without a cookie
jar (mobile, CI, curl, the existing tests). `/docs` benefits — call
`POST /auth/login` from the Swagger UI once and every later "Try it out" is
authenticated automatically.

Do not copy the token from the login response into `localStorage`. It is
returned for non-browser clients; putting it back in script-readable storage
hands the session to any XSS and undoes the reason for the cookie.

### Conventions that apply to both

- No hex in class names — use `packages/ui/theme.css` tokens (`canvas`, `ink`,
  `gold`, `noir`, `forest`, `panel-*`)
- Every overlay is `<Modal>` from `@cabmora/ui` — never a hand-rolled
  `fixed inset-0`, which gets you no focus trap, no Escape and no `role`
- All HTTP through `@cabmora/api-client`, never a bare `fetch`
- Imports use the `@/` alias, not `../..`
- `tsc --noEmit` gates the build in both apps and blocks CI in both
- `npm run format` (prettier) before committing

### Known gaps

Honest list, so nobody mistakes aspiration for fact:

- **Throttling is per-account and in-process.** `app/api/throttle.py` counts
  failed sign-ins and link redemptions per email address, held in the API
  process's memory. Two consequences, neither hidden: the counts reset on
  every deploy, and a second replica would keep its own. It also does **not**
  catch an attempt spread thinly across many accounts, which needs
  address-level limiting and a shared store (Redis) — deliberately not
  half-built. Keying is per-account rather than per-IP because behind
  Railway's router and nginx the apparent client address is a proxy's: see
  the next item.
- **`limit_req_zone $binary_remote_addr` in `apps/web/nginx.conf.template`
  may not be per-visitor.** nginx's `$remote_addr` is whatever connected to
  it, which on Railway is the platform's router rather than the browser — in
  which case the enquiry form's 5/min is one bucket shared by everyone, not
  5/min each. Unverified. To settle it, log `$remote_addr` and
  `$http_x_forwarded_for` on one real request and read the chain.

- Portal pages still hold their own state and logic; "components stay
  presentational, logic lives in hooks" is the direction, not the current
  state. `features/*/pages/ProjectsPage.tsx` is ~1,400 lines.
- Only `auth` and `enquiry` have real `api.ts` modules. Every other `data/`
  module is fixtures waiting for WP5.
- The login and signup screens are still presentational — `AuthProvider` is
  mounted and the session works, but the forms do not call `useAuth()` yet.
- `apps/web` ships one ~780 kB JS chunk; no code splitting yet.

## Local dev
- Backend: `uvicorn app.main:app --reload` on :8000 (SQLite by default, Postgres via `DATABASE_URL`)
- Frontend: `npm run dev` on :5173, proxied `/api` → :8000 (vite.config.ts)
- API docs: http://localhost:8000/docs
