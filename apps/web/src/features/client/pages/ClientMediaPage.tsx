import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Image as ImageIcon,
  Images,
  Play,
  X,
} from 'lucide-react';

import { ApiError } from '@cabmora/api-client';

import { DownloadButton } from '@/features/client/components/DownloadButton';
import { Modal, SwipeHint, VideoStage, ZoomableImage, useArrowSteps } from '@cabmora/ui';

import { ClientPortalShell } from '@/features/client/components/ClientPortalShell';
import { listMyMedia, type LibraryItem } from '@/features/client/api';
import { isVideo } from '@/shared/media';

/**
 * Everything the client has been handed, across every project.
 *
 * Deliberately not a second gallery. The project gallery is where work is
 * reviewed — comment, ask for a change, approve. This is the other half: what
 * has been delivered and what may be taken away. Nothing unreleased appears
 * here at all, because a tile you cannot open is the opposite of a library.
 *
 * Two rows of chips, the same arrangement the gallery uses: which shoot, then
 * what kind of thing. Both narrow the same grid, and a chip is hidden when it
 * would divide nothing — a control that can only disappoint is worse than no
 * control.
 */
type Kind = 'all' | 'photos' | 'films' | 'saveable';

const KINDS: {
  id: Kind;
  label: string;
  icon: typeof Images;
  match: ((i: LibraryItem) => boolean) | null;
}[] = [
  { id: 'all', label: 'All', icon: Images, match: null },
  { id: 'photos', label: 'Photos', icon: ImageIcon, match: (i) => !isVideo(i) },
  { id: 'films', label: 'Films', icon: Play, match: isVideo },
  { id: 'saveable', label: 'Can save', icon: Download, match: (i) => i.downloadable },
];

const CHIP =
  'shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold';
const ON = 'bg-ink text-white';
const OFF = 'bg-white border border-ink/10 text-ink/70 hover:bg-canvas';

export default function ClientMediaPage() {
  const [items, setItems] = useState<LibraryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<string>('all');
  const [kind, setKind] = useState<Kind>('all');
  /** Which photograph is open, by id rather than index: the grid filters
   *  underneath, and an index would point at a different picture the moment
   *  a chip was tapped. */
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listMyMedia()
      .then((page) => !cancelled && setItems(page))
      .catch((err: unknown) => {
        if (cancelled) return;
        // The server's sentence. An empty grid is what a client with no
        // delivered work sees, so a failure must never look like one.
        setError(err instanceof ApiError ? err.message : 'Could not load your media.');
        setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const all = items ?? [];

  /** One chip per shoot, in the order the work arrived. */
  const projects = useMemo(() => {
    const seen = new Map<string, { id: string; title: string; count: number }>();
    for (const item of all) {
      const row = seen.get(item.project_id);
      if (row) row.count += 1;
      else seen.set(item.project_id, { id: item.project_id, title: item.project_title, count: 1 });
    }
    return [...seen.values()];
  }, [all]);

  const shown = all.filter((item) => {
    if (project !== 'all' && item.project_id !== project) return false;
    const match = KINDS.find((k) => k.id === kind)?.match;
    return match ? match(item) : true;
  });

  const kinds = KINDS.filter((k) => k.id === 'all' || (all.some(k.match!) && !all.every(k.match!)));

  /* The reel is what the chips left, not the whole library: somebody who
     filtered to Films expects the next film, not the next of everything. */
  const at = shown.findIndex((item) => item.id === openId);
  const open = at === -1 ? null : shown[at];
  const step = (by: 1 | -1) => {
    if (shown.length === 0) return;
    setOpenId(shown[(at + by + shown.length) % shown.length]!.id);
  };

  // A photograph filtered out from under the viewer closes it, rather than
  // leaving an empty frame nobody can step out of.
  useEffect(() => {
    if (openId !== null && at === -1) setOpenId(null);
  }, [openId, at]);

  useArrowSteps(open !== null, step);

  return (
    <ClientPortalShell
      title="Media library"
      subtitle="Everything that has been delivered to you, across all of your projects."
    >
      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-800 px-5 py-3 rounded-xl text-[13px] mb-6"
        >
          {error}
        </div>
      )}

      {items === null ? (
        <p className="text-[13.5px] text-ink/50 py-16 text-center">Loading…</p>
      ) : all.length === 0 ? (
        <div className="border border-ink/10 bg-white rounded-xl py-16 text-center">
          <Images size={26} className="mx-auto mb-3 text-gold" strokeWidth={1.5} />
          <p className="text-[14px] font-medium mb-1">Nothing delivered yet</p>
          <p className="text-[13px] text-ink/55">
            Photographs appear here once your photographer releases them.
          </p>
        </div>
      ) : (
        <>
          {projects.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar -mx-1 px-1">
              <button
                type="button"
                onClick={() => setProject('all')}
                aria-pressed={project === 'all'}
                className={`${CHIP} ${project === 'all' ? ON : OFF}`}
              >
                All
                <span className={project === 'all' ? 'text-white/55' : 'text-ink/40'}>
                  {all.length}
                </span>
              </button>
              {projects.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => setProject(row.id)}
                  aria-pressed={project === row.id}
                  className={`${CHIP} ${project === row.id ? ON : OFF}`}
                >
                  {row.title}
                  <span className={project === row.id ? 'text-white/55' : 'text-ink/40'}>
                    {row.count}
                  </span>
                </button>
              ))}
            </div>
          )}

          {kinds.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar -mx-1 px-1 mt-1">
              {kinds.map((chip) => {
                const Icon = chip.icon;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setKind(chip.id)}
                    aria-pressed={kind === chip.id}
                    className={`${CHIP} ${kind === chip.id ? ON : OFF}`}
                  >
                    <Icon size={14} />
                    {chip.label}
                  </button>
                );
              })}
            </div>
          )}

          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-5">
            {shown.map((item) => (
              <li key={item.id} className="group">
                {/* Opens here. Looking at a delivered photograph large is
                    what this page is for; reviewing it — commenting, asking
                    for a change — still belongs in the project gallery, and
                    the caption below links there. */}
                <button
                  type="button"
                  onClick={() => setOpenId(item.id)}
                  className="block w-full aspect-[4/3] rounded-lg overflow-hidden bg-ink/5 relative cursor-pointer"
                >
                  {isVideo(item) ? (
                    <video
                      src={item.url}
                      preload="metadata"
                      muted
                      playsInline
                      className="w-full h-full object-cover bg-black"
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </button>

                <div className="flex items-center justify-between gap-2 mt-2">
                  <Link
                    to={`/client/projects/${item.project_id}`}
                    className="text-[12px] text-ink/55 truncate hover:text-gold transition-colors"
                  >
                    {item.project_title}
                  </Link>
                  {/* The shared button, not an `<a download>` — that
                      attribute is ignored cross-origin, and a presigned
                      storage link is always cross-origin, so the anchor
                      first written here opened the photograph in a tab.
                      `DownloadButton` asks the API for a link that carries a
                      signed `attachment` disposition instead. */}
                  {item.downloadable && (
                    <DownloadButton assetId={item.id} isOriginal={item.is_original} compact />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {open && (
        <Modal
          open
          onOpenChange={(next) => !next && setOpenId(null)}
          title={open.filename}
          hideTitle
          chrome="none"
          layout="fullscreen"
          overlay="heavy"
        >
          {/* A definite size, not shrink-to-fit. ZoomableImage measures its
              frame to size the picture inside it, so a parent that sizes to
              its content would leave the two measuring each other — the loop
              that shrank the gallery a little on every step. */}
          <div className="w-full h-full flex flex-col bg-noir-deep">
            <div className="flex items-center justify-between gap-3 px-4 py-3 shrink-0 text-canvas">
              <div className="min-w-0">
                <p className="text-[13px] font-medium truncate">{open.project_title}</p>
                <p className="text-[11px] text-canvas/50 truncate">
                  {at + 1} of {shown.length}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {open.downloadable && (
                  <DownloadButton assetId={open.id} isOriginal={open.is_original} />
                )}
                <button
                  type="button"
                  onClick={() => setOpenId(null)}
                  aria-label="Close"
                  className="p-2.5 rounded-full text-canvas/70 hover:text-canvas transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* `min-h-0` lets this shrink below its content, which is what
                makes the picture fit the space left rather than pushing past
                the bottom of the screen. */}
            <div className="flex-1 min-h-0 relative flex items-center justify-center">
              {shown.length > 1 && <SwipeHint storageKey="cabmora.hint.media-swipe" />}

              {isVideo(open) ? (
                <VideoStage
                  src={open.url}
                  className="w-full h-full"
                  onSwipe={(direction) => step(direction === 'next' ? 1 : -1)}
                />
              ) : (
                <ZoomableImage
                  src={open.url}
                  alt=""
                  className="w-full h-full"
                  onSwipe={(direction) => step(direction === 'next' ? 1 : -1)}
                />
              )}

              {shown.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous"
                    onClick={() => step(-1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-noir/50 hover:bg-noir/70 text-canvas flex items-center justify-center backdrop-blur-sm transition-colors"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    aria-label="Next"
                    onClick={() => step(1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-noir/50 hover:bg-noir/70 text-canvas flex items-center justify-center backdrop-blur-sm transition-colors"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}
    </ClientPortalShell>
  );
}
