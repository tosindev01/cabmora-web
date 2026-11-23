# Cabmora — Project Plan & Phasing

Source: Cabmora PRD v1.0 (28/05/2026, Ayo Ogunwole). Stack: **FastAPI (Python) backend + React (TypeScript) frontend**, clean architecture.

## Phases

### Phase 0 — Foundation (now)
Local dev environment, repo structure, CI-ready scaffold, core conventions.

- Monorepo: `backend/` + `frontend/` + `docs/`
- Backend clean-architecture skeleton (domain / application / infrastructure / api)
- Frontend feature-based skeleton (Vite + React + TS)
- Auth vertical slice (register/login, JWT) — proves the architecture end-to-end
- Enquiry vertical slice (public enquiry form → API)

### Phase 1 — Public Website MVP
All [M] website items.

| Epic | Stories |
|---|---|
| Homepage | Hero, services overview (benchmark: bigdayproductions.co.uk) |
| Promo banner | Admin-configurable event/promotion banner |
| Portfolio showcase | Gallery grid, media detail view |
| Google Reviews | Display reviews section (Google Places API) |
| Enquiry | Enquiry form, admin notification, enquiry list in admin |
| Header/nav | Our Work, Packages, Deals, Seminar, Events, Blog, Contact, How It Works, Login |

### Phase 2 — Customer Portal MVP
| Epic | Stories |
|---|---|
| Accounts | Register, login, guest access (view without account) |
| Dashboard | Project list, progress tracking/status timeline |
| Media review | Preview photos/video, comment on media, request amendments |
| Secure sharing | Encrypted non-download share links (registered friends/family) |
| Ratings | Rate deliverable → auto-post/link to Google Review |
| Acceptance & payment | Accept work, pay (Stripe recommended — confirm with Kenny) |

### Phase 3 — Creator (Partner) Platform
| Epic | Stories |
|---|---|
| Storage plans | Purchase 3/5/7GB tiers, usage metering |
| Media management | Upload (large files — multipart/resumable), organise per project |
| Client access | Manage customer access, configure permissions |
| Delivery | Secure links, watermarking |
| Branding | Simple white-labelling (logo/colours) |

### Phase 4 — Administration
User management; project & content management; banner/promo config.

**Out of scope (per PRD):** native mobile app, complex multi-brand white-labelling, advanced analytics, social features.

## Key technical decisions needed (flag to Kenny)
1. **Media storage** — object storage (S3/R2/GCS) + CDN; signed URLs for non-download preview; watermark pipeline (on-upload vs on-the-fly)
2. **Video preview** — transcoding (HLS) vs progressive MP4 preview renditions
3. **Payments** — provider (Stripe?), one-off vs subscriptions (creator storage plans)
4. **Google Reviews integration** — API limits; "auto-post" likely means deep-link to review flow, not literal posting
5. **Auth model** — customers, creators, creators' clients, admins → role/tenant design early
6. **Hosting/infra** — containers, Postgres, storage, CI/CD

## Non-functional (from PRD)
WCAG 2.2 Level AA · secure media (encrypted, non-downloadable links) · scalable storage · phased delivery.
