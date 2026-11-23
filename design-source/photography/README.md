# Source photography

Cabmora's own originals — full resolution, straight off the camera or phone.

**Deliberately not in git.** 156 MB of JPEGs would roughly ten-times the repo
and stay there forever: git keeps every blob it has ever seen, and photographs
do not delta-compress, so deleting them later would not shrink anything. These
live here so the whole project sits in one folder, and they are ignored by
`.gitignore`.

That means **a fresh clone will not have them.** Keep the canonical copy
somewhere backed up. Once the media slice ships they belong in R2, which is
what that storage line in the budget is for.

## What ships instead

`apps/web/public/portfolio/work/` — 25 curated frames, resized to 1400px on the
long edge, progressive JPEG, ~126 KB each. Those *are* committed: 3.5 MB total,
and the marketing site cannot render without them.

Regenerating them is a manual step, not a build step — a script that reprocesses
156 MB on every `npm run build` would be a slow build for a job done once.

## Adding a photograph to the portfolio

1. Drop the original in here
2. Resize to 1400px long edge, quality ~78, progressive
3. Save to `apps/web/public/portfolio/work/<slug>.jpg`
4. Add an entry to `apps/web/src/features/marketing/data/work.ts` with the real
   pixel dimensions and a 20px base64 blur seed

Captions are optional and must come from someone who was at the shoot. An
invented one is a false statement about a real person — see the comment in
`work.ts`.
