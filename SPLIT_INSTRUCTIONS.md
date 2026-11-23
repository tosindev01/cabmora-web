# Repo split — finish these steps locally

The backend has been separated. `cabmora-api/` is currently staged **inside**
this folder because the sandbox cannot write outside it. Move it out and give it
its own repo.

## 1. Move the API out and initialise it

```bash
cd ~/Documents
mv cabmora/cabmora-api ./cabmora-api

cd cabmora-api
git init
git add -A
git commit -m "Initial commit: Cabmora FastAPI backend, split from monorepo"
```

## 2. Clean up and commit the web repo

```bash
cd ~/Documents/cabmora

# git's lockfile could not be removed from the sandbox
rm -f .git/index.lock

# staged deletions — review first, they are not recoverable afterwards
rm -rf .trash

# required by `npm ci` in both Dockerfiles; commit the result
npm install

git add -A
git commit -m "WP0: monorepo restructure (apps/web, apps/admin, packages/); split backend into cabmora-api"
```

Optionally rename the folder to match its new scope:

```bash
cd ~/Documents && mv cabmora cabmora-web
```

## 3. Verify

```bash
# terminal 1 — API
cd ~/Documents/cabmora-api && docker compose up --build

# terminal 2 — frontends
cd ~/Documents/cabmora-web && docker compose up --build
```

- web → http://localhost:5173
- admin → http://localhost:5174
- api → http://localhost:8000/docs

The frontend dev servers proxy `/api` to `host.docker.internal:8000`, which
reaches the API compose project running on your host.

Then the production shape:

```bash
cd ~/Documents/cabmora-web
cp .env.example .env      # API_UPSTREAM=host.docker.internal:8000
docker compose -f docker-compose.prod.yml up --build -d
# web → http://localhost:8080 · admin → http://localhost:8081
```

## What I could not verify

Neither Docker nor a usable package registry was available in the sandbox, so:

- **no image was ever built** — `docker compose build` is unrun for all three
- **the backend's 7 tests were not run** — PyPI was unreachable
- **`apps/admin` has never been typechecked or built**; its build script is
  `vite build` with no `tsc` gate, deliberately, because the remix code it came
  from was never typechecked. Run `npm run typecheck --workspace @cabmora/admin`
  to see the backlog.

`apps/web` **was** verified: clean `npm ci && npm run build` passes (2,056
modules). That run is also what surfaced the `lucide-react@0.460.0` bug — the
published tarball ships no `.d.ts` files at all, so `tsc` failed across 13
files. Fixed by bumping to `0.546.0`.
