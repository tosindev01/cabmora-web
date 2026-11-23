# cabmora-web — instructions for Claude Code

Frontends for the **Cabmora** photography & videography platform: public
marketing site, customer portal, creator portal and admin console. npm
workspaces monorepo.

**The backend is a separate repo** (`cabmora-api`, sibling folder). The only
thing shared between the two is the HTTP contract, published at the API's
`/openapi.json`. A change to a request/response shape is a cross-repo change.

## Read these before starting work

| File | Why |
|---|---|
| `docs/PRD.md` | **The requirements.** PRD v1.0 (28/05/2026, Ayo Ogunwole). `[M]` marks minimum-viable. |
| `docs/PROJECT_PLAN.md` | Phases → epics → stories |
| `docs/ARCHITECTURE.md` | Layer conventions for both apps + the honest "Known gaps" list |
| `docs/INTEGRATION_PLAN.md` | Screen inventory → PRD phase, work packages (WP1–WP6), open questions |
| `docs/DEPLOYMENT.md` / `docs/CI_CD.md` | Railway, nginx, branches, environments |
| `../CLAUDE.md` | Shared platform context — product summary, infra, storage economics, open decisions |

## The product in one paragraph

Cabmora Ltd (B2C + B2B2C) needs a greenfield platform where customers discover
services, enquire, preview and comment on media deliverables, track project
progress, approve work and pay — and where partner photographers/videographers
deliver their own clients' projects with secure links, watermarking and light
self-branding. Personas: customer, partner creator, platform admin. Out of
scope per the PRD: native mobile app, complex multi-brand white-labelling,
advanced analytics, social features. **WCAG 2.2 Level AA is a stated
requirement**, not a nice-to-have.

---

## Structure

```
apps/web/         public site: marketing, auth, customer & creator portals
apps/admin/       admin console: users, projects, enquiries, reviews,
                  payments, settings, reporting
packages/ui/      design tokens (theme.css) + shared primitives (Modal, Button…)
packages/api-client/   typed fetch wrapper — the only place HTTP happens
design-source/creator-portal/   the designer's original export — REFERENCE ONLY;
                  its 17 pages are already ported into apps/web/src/features/*/pages
docs/             PRD, plans, architecture, deployment
```

Both apps have the same shape — `app/` + `features/` + `shared/` — because they
turned out to have the same domains. This is deliberate: *"not unifying, but
following the same coding practices for both apps."*

```
apps/web/src/
├── app/                # router, providers, app-level styles
├── features/<name>/    # account, auth, billing, client, content, enquiry,
│   ├── data/           #   marketing, media, messaging, projects
│   ├── components/
│   ├── hooks/
│   └── pages/          # route components for THIS domain
├── shared/
│   ├── portal/         # PortalShell / PortalTopbar / PortalSidebar + nav
│   └── site/           # public Navigation + Footer + their link data
└── assets/

apps/admin/src/
├── app/                # App, router, AdminLayout (a layout route)
├── features/<name>/    # auth, dashboard, users, projects, enquiries,
│   └── pages/          #   reviews, payments, settings, reporting
├── shared/store/       # AdminProvider + entity types + seed rows
└── assets/
```

---

## The rules

### 1. The dependency rule

```
data  ←  features  ←  app
   ↖ shared ↗
```

Arrows point inward, mirroring the backend's `api → application → domain`.

- **`data/`** (web) / **`shared/store`** (admin) — types and, from WP5, API
  calls. **No React**: no hooks, no JSX, no state. The test is whether a unit
  test can import it without a DOM. Icon *identifiers* are fine — which glyph
  labels a row is data.
- **`features/<name>/`** — pages, components, hooks for one domain. May import
  `shared/` and `packages/*`. **Never another feature, never `app/`.**
- **`shared/`** — chrome or infrastructure used by more than one feature. If two
  features both want it, it is not a feature. `shared/` must not import a
  feature.
- **`app/`** — router, providers, layout routes. **Nothing imports from `app/`.**
- **`packages/ui`, `packages/api-client`** — cross-*app* primitives. If web and
  admin both need it, it belongs here, not in either app.

Currently at **zero violations in both apps**, and it should stay that way:
cross-feature imports, features importing `app/`, `shared/` importing a feature,
React in a data module, `../` relative imports, hand-rolled `fixed inset-0`
overlays, route components outside `features/`, pages importing a layout.

### 2. A route component lives with its domain

One answer, both apps. `apps/web/src/pages/` and `apps/admin/src/pages/` were
both **deleted** — they held a few route components while the rest lived under
`features/*/pages/`, so "where does a page go" had two answers that tracked
nothing but the order things were written in.

**`app/router.tsx` is the only file in either app that imports a route
component.**

`AdminLayout` is a **layout route**, not a wrapper each page imports. The router
nests guard + layout once via `<Outlet />`. Never `import AdminLayout` inside a
page — that is a feature reaching up into the app shell, and a new screen could
then ship without chrome by simply forgetting. Same reason `PROTECTED_ROUTES` is
a table: a table can't forget.

### 3. Colour: tokens only, never hex

Use `packages/ui/theme.css` tokens: `canvas`, `ink`, `gold`, `noir`,
`noir-deep`, `forest`, `forest-light`, `forest-dark`, `mist`, `sand`, `stone`,
`panel-*`. Both apps import that stylesheet from `main.tsx`.

~1,600 hardcoded hex values were removed on 2026-08-31. **Five hex literals
remain and are correct** — a macOS traffic-light mockup in
`features/marketing/components/ClientPortal.tsx`. Don't "fix" those; don't add
new ones.

### 4. Every overlay is `<Modal>` from `@cabmora/ui`

It wraps `@radix-ui/react-dialog`, so you get a focus trap, Escape, and the
right ARIA role. A hand-rolled `fixed inset-0` gets you none of those. Props:
`layout` (center|drawer|fullscreen), `chrome` (full|minimal|none), `size`,
`tone`, `overlay`. `chrome="none"` paints no surface, so a lightbox can own its
own background.

**A nullable condition stays OUTSIDE the Modal:**

```tsx
{selectedProject && <Modal open …>{selectedProject.name}</Modal>}   // ✅
<Modal open={Boolean(selectedProject)}>{selectedProject.name}</Modal> // ❌ crashes
```

Children are evaluated even when the modal is closed, so the second form throws
on null.

### 5. Tailwind v4 source scanning — the silent failure

Tailwind v4 auto-detects source files from each **app's Vite root**
(`apps/web`, `apps/admin`). `packages/ui` sits outside both, so a utility used
*only* in a shared component is silently never generated — no error, no warning,
the class just does nothing at runtime. This shipped every hero and CTA button
with zero vertical padding for weeks, because the classes that *happened* to
also appear in `apps/web/src` worked and the unique ones didn't.

`packages/ui/src/theme.css` now carries `@source "./**/*.{ts,tsx}";` right after
`@import 'tailwindcss';`. **Any new shared package that ships Tailwind classes
needs the same line.** When a shared component looks *partly* right, suspect
source scanning before you suspect the markup.

### 5b. Two mobile traps, both found by real UAT reports

**`hover:` does not exist on a phone, and `opacity-0` still takes the tap.**
Tailwind v4 wraps every `hover:` utility in `@media (hover: hover)`. So
`opacity-0 group-hover:opacity-100` — the standard reveal-on-hover pattern — is
`opacity: 0` *for ever* on a touch device, and `opacity: 0` does **not** remove
an element from hit testing. The client gallery's approve and reject buttons sat
invisible in the bottom-right of every photograph, calling `stopPropagation()`:
tapping a photograph "did nothing" because the tap was being eaten, and the same
bug meant nobody on a phone could reach those controls at all.

If a hover-revealed control is interactive, it needs a touch answer. Either
reveal it where there is no hover —

```
opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100
```

— or give it `pointer-events-none` while hidden so it cannot steal a tap. Never
leave it at `opacity-0` alone. (Those variants are literal strings; see §5 for
why an assembled one compiles to nothing.)

**Safari has no scroll anchoring.** Chrome and Firefox silently adjust the scroll
offset when content *above* the viewport changes height; WebKit does not. So any
accordion, "show more", or collapsing panel that is fine on a laptop will jerk
the page on an iPhone or iPad — and if the shrunken document is now shorter than
your scroll offset, the browser clamps you to the end of the page. That is the
"opening Profile jumps the page to the bottom" report, and it was landscape-only
because a 768px-tall viewport is what makes the clamp bite.

`shared/account/useAnchoredToggle.ts` is the remedy: measure the element you
tapped before the toggle, correct the drift in a `useLayoutEffect` after it. It
is a no-op where the browser already anchors, so it costs nothing on Chrome.
**Reuse it for the next collapsible thing rather than rediscovering this.**

### 6. Auth — do not put a token in `localStorage`

The browser session is an **HttpOnly cookie** (`cabmora_session`; `Secure`,
`SameSite=Lax`) set by the API at login. Nothing in the frontend reads, stores
or attaches a token — `apiFetch` just sends `credentials: 'same-origin'`, which
works because nginx makes the SPA and the API share an origin.

The login response still returns a bearer token, but that is **for non-browser
clients** (mobile, CI, curl, tests). Copying it into `localStorage` hands the
session to any XSS and undoes the entire reason for the cookie.

### 7. Other conventions

- All HTTP through `@cabmora/api-client`, never a bare `fetch`. Its base URL is
  a **relative** `/api/v1` — nginx proxies `/api` to `${API_UPSTREAM}` at
  container start. Never hardcode an absolute API URL; it breaks the
  one-image-per-environment deployment and re-engages CORS.
- Imports use the `@/` alias, not `../..`.
- A page inside a feature imports `@/features/x/components`, never its own
  barrel.
- Portal chrome: `shared/portal` — `PortalShell` (render prop giving
  `{ toggleSidebar }`), `PortalTopbar` (`title`, `subtitle`, `leading`, `icon`,
  children = right cluster), `PortalNotificationBell`, `PortalAvatar`.
  `variant="light" | "dark"` in `components/variant.ts`; widths are literal
  strings there because Tailwind v4 reads class names statically.
- `design-source/creator-portal/` is reference only — never import from it.

---

## Commands

```bash
npm install            # once, at the repo root — installs all workspaces
npm run dev:web        # http://localhost:5173
npm run dev:admin      # http://admin.localhost:5174  ← note the hostname
npm run build          # both apps
npm run format         # prettier
npm run format:check
```

**Open the admin console on `admin.localhost:5174`, not `localhost:5174`.**
Cookies are scoped by host and **ignore the port**, so both consoles on plain
`localhost` share one `cabmora_session` — signing into either one silently
signs you out of the other, which looks like broken auth and is not. Anything
under `*.localhost` resolves to 127.0.0.1 with no setup, so this costs nothing
and mirrors production, where `admin.` and `www.` are genuinely separate hosts.

Do **not** "fix" this by giving the cookie a `domain` of `.cabmoramedia.com`:
that would make the two share a cookie in production too, turning a local
annoyance into a real one. `set_session_cookie` deliberately sets no domain.

Both dev servers proxy `/api` to the backend on :8000. Start it first:

```bash
cd ../cabmora-api && docker compose up -d
```

Or point at a deployed one: `API_TARGET=https://api-staging.cabmora.com docker compose up`

**Gate:** `tsc --noEmit` blocks the build and CI in **both** apps. Run it before
declaring anything done.

**Prettier is configured but may not be installed** — `npm install` from a
sandbox cannot rename host-created directories in `node_modules`. Run it on the
Mac.

**Git:** never run `git add` / `git commit` / `git status` from a sandbox
against this folder — it leaves `.lock` files the sandbox cannot delete. Hand
git write commands to Taiwo. See `../CLAUDE.md` §5.

---

## Current state — honest version

*Checked 2026-10-07. The entry below about `api.ts` modules was wrong for weeks
— it named two features when there were ten. If you change what is here, change
this too.*

**Built:** the marketing site, carrying Cabmora's own copy; the customer portal
(dashboard, projects, gallery with per-photograph feedback, messages, billing,
settings); the creator portal; the admin console; public share links; the design
system in `packages/ui`; cookie auth end to end; the notification bell, shared
by both apps.

### The notification bell

`packages/ui` owns both halves — `NotificationPanel` (presentational, and a
bottom sheet below `sm` because an anchored 384px popover is clipped at phone
width) and `useNotifications` (the polling, the optimistic marking). The hook
takes its **transport as an argument** rather than importing `@cabmora/api-client`,
for the same reason `ReportIssueDialog` takes an `onSubmit`: this package is the
design system and stays HTTP-free. Each app supplies one module-level transport
object and does its own routing — `apps/admin/src/app/AdminLayout.tsx` and
`apps/web/src/shared/portal/components/PortalBell.tsx`.

Both replaced controls that lied. The console's bell counted pending enquiries
plus pending reviews — two things that layout happened to have loaded — so a
message or an invoice raised no badge. The portal's `PortalNotificationBell` was
worse: seven pages each passed `count={2}`, and the button had no click handler
at all.

`notification.url` is always a path, so it goes straight to `navigate()`.

**Known gaps — don't mistake aspiration for fact:**

- Portal pages still hold their own state and logic. "Components stay
  presentational, logic lives in hooks" is the *direction*, not the current
  state — `features/projects/pages/ProjectsPage.tsx` is ~1,400 lines.
- **Ten features have real `api.ts` modules** — web: `billing`, `client`,
  `enquiry`, `flow`; admin: `billing`, `creators`, `enquiries`, `projects`,
  `reviews`, `users`, plus `marketing` for public reviews. What is still
  fixtures: the marketing site's content (deliberately — it is copy that
  happens to be data), storage plans, and the homepage's **statistics**, which
  are invented and sit on the live site. The testimonials no longer are — they
  come from published, consented ratings, and the section renders nothing when
  there are none.
- `AuthProvider` **is** mounted in `app/App.tsx`, and `useLoginForm` /
  `useSignupForm` call `useAuth()`'s `login` / `register` for real.
  `docs/ARCHITECTURE.md`'s "Known gaps" still says these screens are
  presentational — that entry is **stale**; fix it next time you touch that file.
- `apps/web` ships one ~780 kB JS chunk; no code splitting yet.
- The homepage says *8 years / 200+ events*; `/about` says *12+ years / 453+
  projects / 310+ countries*. Both are live, one scroll apart, and 310 is more
  countries than there are. Ayo has been asked which numbers are true.
- **The public site is a client-rendered SPA.** `apps/web/scripts/seo.mjs`
  runs after the build and writes `robots.txt`, `sitemap.xml` and a flat
  `<route>.html` per public page carrying that page's own title, description,
  canonical, Open Graph and structured data — so a crawler gets distinct
  documents. The `<body>` is still an empty root: this is metadata, not
  pre-rendering, and rendering the content would need a headless browser at
  build time.

  **Write `<route>.html`, never `<route>/index.html`.** A directory makes nginx
  issue its own 301 from `/about` to `/about/`, and because Railway terminates
  TLS and proxies over plain HTTP on an internal port that redirect came out as
  `http://cabmoramedia.com:8080/about/` — wrong scheme, unreachable port, and a
  canonical tag pointing back at the URL that redirected. `absolute_redirect
  off` and `port_in_redirect off` are in the nginx template as a second line of
  defence.
- Storage plans live in `features/media/data/storage.ts` as a TS fixture, which
  means a price change is a frontend deploy. They belong in a DB table — and
  two of the four tiers are currently priced below cost (see `../CLAUDE.md` §3).
