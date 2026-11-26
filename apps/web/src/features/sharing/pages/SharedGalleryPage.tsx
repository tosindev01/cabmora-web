import { isVideo } from '@/shared/media';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Link as LinkIcon, Lock } from 'lucide-react';

import { ApiError } from '@cabmora/api-client';
import { Modal, SwipeArea, VideoStage, useArrowSteps } from '@cabmora/ui';
import { ClientScreenSecurityShield } from '@/shared/collaboration/ClientScreenSecurityShield';

import {
  viewSharedGallery,
  formatDate,
  type SharedGallery,
  type SharedPhotograph,
} from '@/features/client/api';

/**
 * A gallery seen by somebody with a link and no account.
 *
 * Its own page with no portal chrome: a visitor has no dashboard, no
 * projects and no billing, and a sidebar full of things that are not theirs
 * reads as a system they have been locked out of rather than a gift someone
 * sent them.
 *
 * Nothing here can act on anything. There is no commenting, no approving and
 * no download — the link is to look at the photographs, and every other
 * capability in this product belongs to somebody who signed in.
 */
export default function SharedGalleryPage() {
  const { token = '' } = useParams();
  const [gallery, setGallery] = useState<SharedGallery | null>(null);
  const [error, setError] = useState<string | null>(null);
  // The whole photograph rather than its url: the lightbox has to know
  // whether to open a player or an image, and a bare string cannot say.
  const [lightbox, setLightbox] = useState<SharedPhotograph | null>(null);

  // Moving on without closing and reopening. Somebody sent this link so the
  // whole set would be looked at; making each photograph a dead end meant
  // forty trips back to the grid.
  const photographs = gallery?.photographs ?? [];
  const step = (by: 1 | -1) => {
    if (!lightbox || photographs.length === 0) return;
    const at = photographs.findIndex((photo) => photo.id === lightbox.id);
    if (at === -1) return;
    setLightbox(photographs[(at + by + photographs.length) % photographs.length]!);
  };

  useArrowSteps(Boolean(lightbox), step);

  useEffect(() => {
    let cancelled = false;
    viewSharedGallery(token)
      .then((result) => !cancelled && setGallery(result))
      .catch((err: unknown) => {
        if (!cancelled)
          setError(err instanceof ApiError ? err.message : 'This link is no longer available.');
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (error) {
    return (
      <main className="min-h-screen bg-canvas flex items-center justify-center p-6">
        <div className="max-w-[420px] text-center">
          <Lock size={28} className="mx-auto mb-4 text-gold" strokeWidth={1.5} />
          <h1 className="font-serif text-[24px] mb-2">This link has expired</h1>
          <p className="text-[14px] text-ink/55 leading-relaxed">
            Links to a gallery stop working after a while, and whoever sent it can turn one off at
            any time. Ask them for a new one.
          </p>
        </div>
      </main>
    );
  }

  if (!gallery) {
    return (
      <main className="min-h-screen bg-canvas flex items-center justify-center">
        <p className="text-ink/50 text-[14px]">Loading…</p>
      </main>
    );
  }

  return (
    <ClientScreenSecurityShield clientLabel={gallery.project_title}>
      <main className="min-h-screen bg-canvas">
      <header className="border-b border-ink/10 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          <p className="text-[10px] tracking-[0.26em] uppercase text-gold font-medium mb-2">
            {gallery.event_type}
          </p>
          <h1 className="font-serif text-[30px] leading-tight">{gallery.project_title}</h1>
          <p className="text-[14px] text-ink/55 mt-2">
            {gallery.photographs.length} photograph
            {gallery.photographs.length === 1 ? '' : 's'}, shared with you by Cabmora Media.
          </p>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {gallery.photographs.length === 0 ? (
          <p className="text-[14px] text-ink/55 py-16 text-center">
            There is nothing to see here yet. Try the link again once the photographs are ready.
          </p>
        ) : (
          <ul className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {gallery.photographs.map((photo) => (
              <li key={photo.id}>
                <button
                  type="button"
                  onClick={() => setLightbox(photo)}
                  className="block w-full aspect-[4/3] rounded-lg overflow-hidden bg-ink/5 cursor-pointer group"
                >
                  {isVideo(photo) ? (
                    <video
                      src={photo.url}
                      preload="metadata"
                      muted
                      playsInline
                      className="w-full h-full object-cover bg-black"
                    />
                  ) : (
                    <img
                      src={photo.url}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}

        <footer className="mt-10 border-t border-ink/10 pt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12.5px] text-ink/50">
          <span className="flex items-center gap-1.5">
            <LinkIcon size={13} className="text-gold" />
            This link stops working on {formatDate(gallery.expires_at)}
          </span>
          {/* Said plainly. A watermark nobody explained reads as a mistake,
              and the honest reason is better than the guess. */}
          {!gallery.hands_over_originals && (
            <span>These are preview copies and carry our mark.</span>
          )}
        </footer>
      </div>

      {lightbox && (
        <Modal
          open
          onOpenChange={(next) => !next && setLightbox(null)}
          title="Photograph"
          hideTitle
          chrome="minimal"
          size="xl"
          overlay="heavy"
        >
          <div className="relative">
            {isVideo(lightbox) ? (
              <VideoStage
                src={lightbox.url}
                className="w-full max-h-[85vh]"
                onSwipe={(direction) => step(direction === 'next' ? 1 : -1)}
              />
            ) : (
              <SwipeArea onSwipe={(direction) => step(direction === 'next' ? 1 : -1)}>
                <img
                  src={lightbox.url}
                  alt=""
                  className="w-full h-auto max-h-[85vh] object-contain select-none"
                  draggable={false}
                />
              </SwipeArea>
            )}

            {photographs.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous photograph"
                  onClick={() => step(-1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-noir/50 hover:bg-noir/70 text-canvas flex items-center justify-center backdrop-blur-sm transition-colors"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  aria-label="Next photograph"
                  onClick={() => step(1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-noir/50 hover:bg-noir/70 text-canvas flex items-center justify-center backdrop-blur-sm transition-colors"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </div>
        </Modal>
      )}
      </main>
    </ClientScreenSecurityShield>
  );
}
