# Cabmora — Integration & Deployment Plan

**Date:** 2026-08-01 · *Updated after WP0 landed and the backend was split into the `cabmora-api` repo.*
**Supersedes nothing** — extends `PROJECT_PLAN.md` (phasing) and `ARCHITECTURE.md` (conventions).
**Trigger:** designer delivered two additional builds (creator/client portal, admin console). Cabmora is a **two-site product**, not one.

---

## 1. What we actually have

| Source | Contents | Stack | Status |
|---|---|---|---|
| `frontend/` | Marketing site (14 tokenised sections), auth stubs, enquiry form, app shell | React 18, router 6, Tailwind v4, semantic tokens | **Real code.** Build passes. Follows `ARCHITECTURE.md`. |
| `remix_-cabmora-media-creator-002/` | **17 page files** (10,332 LOC), + 1,559-line `App.tsx` holding a duplicate landing page; 12,099 LOC across `src/` | React 19, router 7, Tailwind v4 | Designer output. Flat structure, mock data inline. |
| `remix_-cabmora-media-admin-1/` | **9 page files** (2,931 LOC), 3,952 LOC across `src/`; `AdminContext` (630 LOC) + `ProtectedAdminRoute` | React 19, router 7, Tailwind v4 | Designer output. Flat structure, mock data inline. |
| `cabmora-api/` (was `backend/`) | FastAPI clean-arch, auth + enquiries slices, 7 passing tests | Python, SQLAlchemy async | Real code. **Now a separate repo** — see `SPLIT_INSTRUCTIONS.md`. |

### Critical finding — the landing page is NOT new work

The creator remix's `App.tsx` (1,559 lines) contains a `LandingPage` composed of exactly the **same 14 sections already extracted** into `frontend/src/features/marketing/components/`: Hero, Stats, FeaturedStories, Services, Pricing, WhyCabmora, HowItWorks, ClientPortal, CreatorPlatform, Testimonials, LatestStories, FinalCTA, Navigation, Footer.

**Consequence:** the extracted marketing feature stands. We discard the remix's `App.tsx` landing entirely and harvest only its `pages/`. This removes ~1,600 lines from the port and eliminates the "which landing wins" question.

Also discard `remix_-cabmora-media-creator-002/src/components/` — a *third* set of stub sections (Hero, Navigation, Footer, Services, Gallery; 30–50 LOC each) that `App.tsx` never imports. Dead on arrival.

---

## 2. Answering the structural question

> *"if it was a monorepo would that be okay — the admin site should be hidden right, so would it not be nicer to have them deployed separately?"*

**Monorepo and separate deployment are orthogonal.** A monorepo is a *source* decision; deployment is a *build artifact* decision. One repo can produce three independently-deployed images. You get isolation without paying the multi-repo tax.

| Concern | One repo, separate builds | Separate repos |
|---|---|---|
| Admin on its own subdomain | ✅ separate Dockerfile → separate image | ✅ |
| Admin JS never sent to public users | ✅ separate bundle | ✅ |
| Deploy admin without touching web | ✅ | ✅ |
| Design tokens stay in sync | ✅ one `packages/ui` | ❌ copy-paste drift |
| Shared `Button`/`FadeIn` fixed once | ✅ | ❌ fixed 2–3× |
| API contract change lands atomically | ✅ one PR | ❌ 2 PRs, version skew |
| Independent CI / permissions / cadence | ❌ shared pipeline | ✅ |

### Decision (revised 2026-08-01)

**Two repos: `cabmora-api` and `cabmora-web`.**

The first version of this document recommended a single repo for everything.
That was wrong, and the distinction it missed is *what the parties actually
share*:

- **`apps/web` + `apps/admin` share code** — `packages/ui` (design tokens,
  primitives) and `packages/api-client`. Separating them would mean publishing
  those packages to a registry or duplicating them, and duplication is exactly
  what caused the token drift catalogued in §5.1. **They stay together.**
- **The backend shares nothing** with either frontend except the HTTP contract
  at `/openapi.json`. Co-locating it buys almost nothing and costs a shared CI,
  shared permissions, and coupled release tagging. **It gets its own repo.**

The cost of the split is that an API change touching both clients is now two
PRs instead of one. That is a real cost, paid deliberately in exchange for
independent deploy cadence between backend and frontend teams.

### Hiding the admin site properly

Frontend separation is *obscurity*, not security. Layer it:

1. **Separate origin** — `admin.cabmora.com`, its own container. Not a route on the public site.
2. **Not discoverable** — no inbound links, `X-Robots-Tag: noindex`, excluded from sitemap.
3. **Network gate (the real hiding)** — Cloudflare Access / IP allowlist / VPN in front of the admin origin. Optional but cheap.
4. **Backend authorisation (the actual security)** — admin endpoints live under `/api/v1/admin/*` behind a `require_role(Role.ADMIN)` FastAPI dependency that reads the JWT role claim. **The API must reject a non-admin token even if someone reconstructs the admin UI from scratch.** `ProtectedAdminRoute` in the remix is a UX convenience only, and the plan treats it as such.

---

## 3. Target repo structure

```
cabmora-web/                    ← this repo (frontends only)
├── apps/
│   ├── web/                    ← public marketing + creator portal + client portal
│   │   └── src/
│   │       ├── app/            router, layouts, providers
│   │       ├── features/
│   │       │   ├── marketing/  (exists — 14 sections + data/)
│   │       │   ├── auth/       (exists — wire the stubs up)
│   │       │   ├── enquiry/    (exists)
│   │       │   ├── content/    blog, help centre, contact
│   │       │   ├── projects/   projects, project details
│   │       │   ├── media/      galleries, upload, storage
│   │       │   ├── billing/    billing, plans
│   │       │   ├── messaging/  messages
│   │       │   ├── account/    profile, settings
│   │       │   └── client/     client portal
│   │       └── pages/          thin route components only
│   └── admin/                  ← admin console
│       └── src/
│           ├── app/
│           └── features/
│               ├── auth/       admin login
│               ├── users/      ├ projects/   ├ enquiries/
│               ├── reviews/    ├ payments/   ├ settings/
│               └── reporting/
├── packages/
│   ├── ui/                     theme.css tokens + Button, EyebrowLabel, FadeIn, SectionHeading
│   └── api-client/             fetch wrapper, auth/token handling, shared DTO types
├── design-source/creator-portal/  ← designer's 17 pages, pending WP4
├── docker-compose.yml          local dev (web + admin)
├── docker-compose.prod.yml
└── docs/

cabmora-api/                    ← separate repo
├── app/ tests/ Dockerfile
└── docker-compose.yml          local dev (api + postgres)
```

**Note:** the original plan put `backend/` in this same repo. That was changed
on 2026-08-01 — the backend shares no code with the frontends, so it gets its
own repo, CI, permissions and release cadence. The frontends stay together
because they genuinely share `packages/`.

Tooling: **npm workspaces** (already on npm — no new tool to learn; pnpm is a fine upgrade later, not now). Each app keeps its own `vite.config.ts` and `package.json`.

**Layer rule for the frontends** (mirrors the backend's dependency rule):
`pages → features → packages/ui + packages/api-client`. A feature never imports another feature's internals; cross-feature sharing gets promoted to `packages/ui`. Data stays in `features/*/data`, logic in hooks, sections as components composed by pages — same convention that worked for `marketing/`.

---

## 4. Screen inventory → PRD phase

### `apps/web` (18 screens from creator remix)

| Screen | Feature | PRD phase |
|---|---|---|
| LandingPage | *discard — already extracted* | Phase 1 ✅ done |
| BlogPage, BlogPostPage | `content` | Phase 1 |
| HelpCenterPage, ContactPage | `content` | Phase 1 |
| LoginPage, SignupPage | `auth` — **replace the presentational stubs, wire to `useAuth`** | Phase 0/2 |
| ClientPortalPage (`/client/dashboard`) | `client` | Phase 2 |
| DashboardPage | `projects` | Phase 3 |
| ProjectsPage, ProjectDetailsPage | `projects` | Phase 3 |
| GalleriesPage (1,308 LOC) | `media` | Phase 3 |
| MediaUploadPage | `media` | Phase 3 |
| StoragePage (991 LOC) | `media` | Phase 3 |
| BillingPage | `billing` | Phase 3 |
| MessagesPage | `messaging` | Phase 3 |
| SettingsPage, ProfilePage | `account` | Phase 3 |

### `apps/admin` (9 screens) — all Phase 4

AdminLogin, AdminDashboard, AdminUserManagement (529 LOC), AdminProjectManagement, AdminEnquiryManagement, AdminReviewModeration, AdminPaymentManagement, AdminPlatformSettings, AdminReportingDashboard.

Actual routes registered (11 `<Route>` entries, not 9):
`/login` · `/admin` · `/admin/dashboard` · `/admin/users` · `/admin/projects` · `/admin/enquiries` · `/admin/reviews` · `/admin/payments` · `/admin/settings` · `/admin/reports` · `*` → redirect.

Two quirks to fix during the port: admin login sits at **`/login`, not `/admin/login`** (inconsistent with every other route), and **`/admin` duplicates `/admin/dashboard`** rather than redirecting to it. The creator remix, by contrast, registers 18 routes and has **no catch-all** — add one.

**Bonus:** `AdminContext.tsx` (630 LOC) already declares typed domain models — `UserRole`, `UserStatus`, `User`, `ProjectStage`, `Project`, `EnquiryStatus`, `Enquiry`, `ReviewStatus`, `CustomerReview`, `PaymentStatus`, `Transaction`, `PlatformSettings`. **Use these as the first draft of the backend domain entities.** The designer has effectively specified the data model; reconcile it against the PRD and promote it into `cabmora-api/app/domain/entities/`. Note `PlatformSettings` implies a settings-persistence slice that appears nowhere in `PROJECT_PLAN.md` — scope it explicitly.

---

## 5. Reconciliation work

### 5.1 Design tokens — the biggest cleanup

- **1,599 hardcoded hex** in the creator remix, **284** in admin (1,883 total). Every one violates the "never hardcode hex" rule.
- **Good news:** those 1,883 occurrences resolve to only **41 unique values** in creator and **17** in admin. This is a near-fully scriptable find-and-replace, not a manual slog — build the unique-value → token map once, then sweep.
- Both remixes ship a shadcn-style `index.css`: 38 `:root` vars, 34 `.dark` vars, a 40-entry `@theme inline` map, 51 `oklch()` values — including `--sidebar-*` and `--chart-1..5`. These **do not correspond** to the Cabmora palette in `theme.css`. Two competing token systems in one codebase is not survivable.
- The two `index.css` files are **not identical** to each other, so they can't be replaced with one blind shared change — diff them before deleting.

**Plan:** delete the shadcn var block. Extend the existing `@theme` in `packages/ui/theme.css` with the app-surface tokens the dashboards genuinely need (`--color-surface`, `--color-border-subtle`, `--color-muted-fg`, `--color-success`, `--color-warning`, `--color-danger`, `--color-chart-1..5`), mapped to the Cabmora palette. Then sweep hex → token utility (`#0E0C0A` → `bg-noir`, `#C9A86A` → `text-gold`, etc.) using the 58-entry unique-value map.

### 5.2 Dependencies

| | `frontend/` | remixes | Resolution |
|---|---|---|---|
| React | 18.3 | 19.0 | **Adopt 19.** Upgrading ~2k LOC of marketing beats porting 16k LOC backwards. |
| react-router | 6.26 | 7.18 | **Adopt 7.** Mostly import-compatible; check `Navigate`/loader usage. |
| motion | 11.18 | 12.23 | Adopt 12. |
| lucide-react | 0.460 | 0.546 | Adopt 0.546. |
| **Vite** | **5.4** | **6.2** | **Adopt 6** — major bump, not mentioned in the original assessment. |
| **@vitejs/plugin-react** | **4.3** | **5.0** | **Adopt 5.** Pairs with the Vite 6 bump. |

The Vite 5→6 and plugin-react 4→5 jumps are the least-obvious part of WP0; do them in the same commit as React 19 so there's one build-config bisect point, not three.

**Delete from remixes:** `@google/genai`, `express`, `@types/express`, `dotenv`, `tsx`, `esbuild`, `autoprefixer`, `postcss.config.js` — AI Studio scaffolding, unused by a Vite+Tailwind v4 app.

**Delete files:** `fix_fonts.py`, `fix_login_link.py`, `rewrite_app.py`, `untitled.tsx`, `metadata.json`, `assets/.aistudio/` in both remixes.

### 5.3 The auth layer is more broken than "stubs" suggests

Worth calling out before WP3 gets estimated as a small job. `LoginScreen.tsx` and `SignupScreen.tsx` are presentational with TODOs — known. But underneath:

- **`AuthProvider` is never mounted.** `frontend/src/app/App.tsx` renders only `<BrowserRouter><AppRouter/></BrowserRouter>`. The only reference to `AuthProvider` anywhere in `src/` is its own definition in `useAuth.tsx`.
- **Three files would crash if reached.** `pages/RegisterPage.tsx`, `pages/DashboardPage.tsx` and `app/Layout.tsx` all call `useAuth()` and would throw *"useAuth must be used within AuthProvider"*. They don't crash today only because `router.tsx` routes just `/`, `/login`, `/signup`, `*` — so they're unreachable.
- **Dead code:** `frontend/src/pages/` holds 6 files including both `LandingPage.tsx` and an unrouted `HomePage.tsx`.

So WP3 is: mount the provider → delete/merge the dead pages → add the protected routes → add a route guard → *then* wire the stub handlers. Fold the dead-code deletion into WP0 while files are moving anyway.

### 5.4 Mock data

Every remix page hardcodes its fixtures inline. Extract to `features/*/data/` (matching what was done for `marketing/data/content.ts`) so swapping mock → API call is a one-file change per feature. Do this *during* the port, not after.

---

## 6. Docker & deployment

Nothing is containerised today. Four artifacts:

**`cabmora-api/Dockerfile`** — multi-stage, non-root user, `uvicorn` workers behind gunicorn. `requirements.txt` already carries `asyncpg` for Postgres and `aiosqlite` for tests, so no dependency change is needed to move off SQLite — only `DATABASE_URL`.

⚠️ **Python version is undecided and the repo contradicts itself.** There is no `pyproject.toml`, `.python-version`, `runtime.txt` or CI config. `README.md` says "Python 3.11+", while `docs/BACKEND_PLAN.md` says "sandbox is Python 3.10" — the constraint that led existing code to use `Enum(str, Enum)` instead of `StrEnum`. **Pin this explicitly in WP1** before writing the Dockerfile. Recommend `python:3.12-slim` and dropping the 3.10 constraint (the sandbox note was about the authoring environment, not the deploy target), but that is a decision, not a default — and if taken, the `StrEnum` guidance in `BACKEND_PLAN.md` should be revisited in the same PR.

**`apps/web/Dockerfile`** and **`apps/admin/Dockerfile`** — identical shape: `node:22-alpine` build stage → `nginx:alpine` runtime serving `dist/`. SPA fallback (`try_files $uri /index.html`), long-cache hashed assets, no-cache `index.html`. `VITE_API_URL` is a **build arg** (Vite inlines env at build time — this is the single most common deployment mistake here).

**`infra/docker-compose.yml`** (local dev): `postgres:16` + `api` + `web` + `admin`, with volume mounts and hot reload.
**`infra/docker-compose.prod.yml`**: same services, built images, no mounts, healthchecks, restart policies.

**Production topology**

```
cabmora.com        → nginx → apps/web  (public + portals)
admin.cabmora.com  → nginx → apps/admin  [+ Cloudflare Access / IP allowlist]
api.cabmora.com    → uvicorn → FastAPI
                             ├── Postgres
                             └── S3/R2 object storage (Phase 3 media)
```

Deferred but should be decided before Phase 3: object storage provider, video transcoding, CDN. These are already flagged as open questions for Kenny in `PROJECT_PLAN.md` §"Key technical decisions".

---

## 7. Sequenced work packages

Each is independently shippable and reviewable.

| # | Package | Why this order |
|---|---|---|
| **WP0** | Restructure to `apps/` + `packages/` monorepo. Move `frontend/` → `apps/web/`. Extract `packages/ui` + `packages/api-client`. Upgrade React 19 / router 7 / Vite 6 / plugin-react 5. Delete dead pages (§5.3). Green build + tests. | Nothing else is safe to land until the destination exists. Pure move + upgrade — no new features, so regressions are obvious. |
| **WP1** | Dockerise what exists: 3 Dockerfiles + both compose files. Deploy the marketing site + API. | Unblocks deployment *now* and de-risks infra while the UI merge is still in flight. Gives the team a live URL early. |
| **WP2** | Port `apps/admin` (9 pages). Tokens reconciled, data extracted, `AdminContext` split into per-feature state. | Smallest surface (~4k LOC), cleanest boundary, proves the port methodology on low-risk code. |
| **WP3** | Port public content pages (Blog, BlogPost, Help, Contact) + **repair and wire the auth layer** (see §5.4). | Completes Phase 1 of the PRD; auth wiring unblocks every protected screen after it. Bigger than it looks — read §5.4 before estimating. |
| **WP4** | Port creator portal (Dashboard, Projects, Galleries, Upload, Storage, Billing, Messages, Settings, Profile). | Largest chunk (~10k LOC). Split into 2–3 PRs by feature folder. |
| **WP5** | Port ClientPortalPage + backend domain work: promote `AdminContext` types to real entities, add role-based auth, build the API slices the ported screens are calling. | The screens define the contract; build the API against a known shape rather than guessing. |

**WP0 and WP1 are prerequisites for everything.** WP2–WP5 can partly parallelise across people once the structure lands.

---

## 8. Risks

| Risk | Mitigation |
|---|---|
| React 19 **+ Vite 6** upgrade breaks the marketing site | WP0 is move + upgrade only, with `npm run build` (`tsc && vite build`) green before any porting. Four major bumps land in one commit so there's a single bisect point. |
| 1,883 hardcoded hex values → inconsistent UI | Only 58 unique values — build the value→token map first, sweep by script, review the diff. Add a lint rule banning raw hex in `.tsx` so it can't regress. |
| WP3 underestimated because "auth is just stubs" | §5.3 documents the unmounted provider and three would-crash files. Estimate against that, not against the TODOs. |
| Ported screens call APIs that don't exist | Keep extracted mock data in `features/*/data` behind the same interface the API client will expose. UI stays shippable while the backend catches up. |
| Admin exposed via a guessable URL | Backend `require_role` dependency is mandatory and non-negotiable; frontend guards are UX only. |
| `VITE_API_URL` baked wrong into the image | Build arg per environment; document in `infra/README.md`. Separate image tags per env. |

---

## 9. Open questions for Kenny / Ayo

1. Hosting target — VPS + compose, or a managed platform? Changes how much of `docker-compose.prod.yml` we actually use.
2. Object storage provider and whether watermarking happens on upload or on-the-fly (blocks WP4 galleries/upload).
3. Payment provider confirmation (Stripe?) — blocks Billing + AdminPaymentManagement.
4. Does the client portal need a *separate* origin too, or is it fine as protected routes on `apps/web`? Current plan assumes the latter.
5. Are the designer's `AdminContext` domain types authoritative, or a mockup? Determines how much they drive the backend model — and whether `PlatformSettings` (a slice absent from `PROJECT_PLAN.md`) is in scope.
6. **Python version — needs a decision, not a default.** `README.md` says 3.11+; `BACKEND_PLAN.md` says 3.10. Pick one before the backend Dockerfile is written (WP1).
