import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Columns2, Layers, MessageSquareQuote } from 'lucide-react';

import { Modal } from '@cabmora/ui';

import {
  listAssetVersions,
  type AssetVersion,
  type ProjectComment,
  type VisibleAsset,
} from '@/features/projects/api';
import { formatDate } from '@/features/projects/display';

interface Props {
  projectId: string;
  assetId: string;
  filename: string;
  /** Every corrected photograph on the project, so a round of changes can be
   *  reviewed in a run rather than one dialog at a time. */
  corrected: VisibleAsset[];
  /** Move to another corrected photograph without leaving the dialog. */
  onShow: (asset: VisibleAsset) => void;
  /** The conversation on this project. Used to find what was asked for on the
   *  frame that got replaced — the request and the fix are the same story,
   *  and the gallery is where somebody is looking when they want it. */
  comments: ProjectComment[];
  onClose: () => void;
}

type Mode = 'flick' | 'side';

/**
 * What a photograph looked like before it was corrected, against what it
 * looks like now.
 *
 * Two ways of looking, because they answer different questions. **Flick**
 * swaps versions in the same frame at the same size: the eye registers the
 * two and the difference jumps out, which is the only way to judge an
 * exposure or a white balance. **Side by side** shows both at once, which is
 * what you want for "is this even the right photograph" and for showing
 * somebody else.
 *
 * Every version is rendered and hidden with opacity rather than swapped into
 * one `<img>`. That is the whole trick: a src swap fetches on the first
 * switch and flashes, and a comparison with a flash in the middle of it
 * compares nothing.
 */
export function AssetVersionsDialog({
  projectId,
  assetId,
  filename,
  comments,
  corrected,
  onShow,
  onClose,
}: Props) {
  const [versions, setVersions] = useState<AssetVersion[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [showing, setShowing] = useState(0);
  const [mode, setMode] = useState<Mode>('flick');

  useEffect(() => {
    let cancelled = false;
    listAssetVersions(projectId, assetId)
      .then((result) => !cancelled && setVersions(result))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [projectId, assetId]);

  const total = versions?.length ?? 0;
  const place = Math.max(
    0,
    corrected.findIndex((asset) => asset.id === assetId),
  );
  const step = useCallback(
    (by: number) => setShowing((current) => (current + by + total) % Math.max(total, 1)),
    [total],
  );

  // Arrow keys, because comparing is a repeated gesture and reaching for a
  // button between every look breaks the rhythm it depends on.
  useEffect(() => {
    if (mode !== 'flick' || total < 2) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') step(-1);
      if (event.key === 'ArrowRight') step(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, total, step]);

  return (
    <Modal open onOpenChange={(next) => !next && onClose()} title={filename} size="xl">
      {failed ? (
        <p className="text-[13.5px] text-ink/70">Could not load this photograph&rsquo;s history.</p>
      ) : versions === null ? (
        <p className="text-[13.5px] text-ink/50">Loading earlier versions…</p>
      ) : versions.length < 2 ? (
        <p className="text-[13.5px] text-ink/70">This photograph has not been corrected.</p>
      ) : (
        <div className="space-y-4">
          <Request comments={comments} assetId={versions[1]!.id} />

          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Where this photograph sits in the round. Shown only when there
                is a round — one correction needs no counter. */}
            {corrected.length > 1 ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    onShow(corrected[(place - 1 + corrected.length) % corrected.length]!)
                  }
                  aria-label="Previous corrected photograph"
                  className="p-1.5 rounded-lg text-ink/50 hover:text-ink hover:bg-canvas cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-ink/50">
                  {place + 1} of {corrected.length} corrected
                </span>
                <button
                  type="button"
                  onClick={() => onShow(corrected[(place + 1) % corrected.length]!)}
                  aria-label="Next corrected photograph"
                  className="p-1.5 rounded-lg text-ink/50 hover:text-ink hover:bg-canvas cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            ) : (
              <span />
            )}

            <button
              type="button"
              onClick={() => setMode((current) => (current === 'flick' ? 'side' : 'flick'))}
              className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.08em] text-ink/50 hover:text-ink cursor-pointer"
            >
              {mode === 'flick' ? <Columns2 size={14} /> : <Layers size={14} />}
              {mode === 'flick' ? 'Side by side' : 'Flick'}
            </button>
          </div>

          {mode === 'flick' ? (
            <>
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                {/* Every version as a thumbnail, so what is behind the current
                  frame is visible rather than something you have to click to
                  discover. The strip runs down the side on a wide screen and
                  along the bottom on a narrow one, where a column would eat
                  the width the photograph needs. */}
                <ul className="flex sm:flex-col gap-2 sm:w-[104px] shrink-0 overflow-x-auto sm:overflow-visible">
                  {versions.map((version, index) => (
                    <li key={version.id} className="shrink-0 w-[88px] sm:w-full">
                      <button
                        type="button"
                        onClick={() => setShowing(index)}
                        aria-current={index === showing}
                        aria-label={`Show ${label(versions, index)}`}
                        className={`block w-full rounded-lg overflow-hidden border-2 cursor-pointer transition-colors ${
                          index === showing
                            ? 'border-gold'
                            : 'border-transparent hover:border-ink/20'
                        }`}
                      >
                        {version.url ? (
                          <img
                            src={version.url}
                            alt={label(versions, index)}
                            className="w-full aspect-[4/3] object-cover bg-canvas"
                          />
                        ) : (
                          <span className="block w-full aspect-[4/3] bg-canvas" />
                        )}
                      </button>
                      <span
                        className={`block text-center text-[10.5px] font-bold uppercase tracking-[0.08em] mt-1 ${
                          index === showing ? 'text-ink' : 'text-ink/45'
                        }`}
                      >
                        {label(versions, index)}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => step(1)}
                  title="Click to switch versions"
                  className="relative block flex-1 min-w-0 h-[58vh] rounded-lg border border-ink/10 bg-canvas overflow-hidden cursor-pointer"
                >
                  {versions.map((version, index) =>
                    version.url ? (
                      <img
                        key={version.id}
                        src={version.url}
                        alt={`${label(versions, index)} — ${version.filename}`}
                        /* All of them mounted, one visible. The others are
                         decoded and waiting, so switching is instant. */
                        className={`absolute inset-0 w-full h-full object-contain ${
                          index === showing ? '' : 'opacity-0'
                        }`}
                      />
                    ) : null,
                  )}
                  {/* On the photograph, not only on the strip beside it. Two
                    versions of one frame look alike, and somebody mid-compare
                    must never have to remember which they are looking at. */}
                  <span className="absolute top-3 left-3 bg-noir/80 text-canvas text-[11px] font-bold uppercase tracking-[0.12em] px-3 py-1.5 rounded-full">
                    {label(versions, showing)}
                  </span>
                  <span className="absolute bottom-3 right-3 bg-noir/70 text-canvas text-[11px] px-3 py-1.5 rounded-full">
                    {formatDate(versions[showing]!.uploaded_at)}
                  </span>
                </button>
              </div>
              <p className="text-[12.5px] text-ink/45 text-center">
                Click a version, click the photograph, or use ← → to switch between them.
              </p>
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {versions.map((version, index) => (
                <Frame key={version.id} version={version} label={label(versions, index)} />
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

/**
 * Names for the versions. "Now" and "Before" while there are only two, since
 * that is what somebody comparing calls them; numbered once there have been
 * several corrections, because then "before" is ambiguous.
 */
function label(versions: AssetVersion[], index: number): string {
  if (index === 0) return 'Now';
  if (versions.length === 2) return 'Before';
  return `Version ${versions.length - index}`;
}

function Request({ comments, assetId }: { comments: ProjectComment[]; assetId: string }) {
  const asked = comments.filter((comment) => comment.asset_id === assetId);
  if (asked.length === 0) return null;
  return (
    <div className="space-y-2">
      {asked.map((comment) => (
        <p
          key={comment.id}
          className="flex gap-3 text-[13.5px] leading-relaxed text-ink/75 bg-canvas rounded-lg p-3"
        >
          <MessageSquareQuote size={15} className="text-gold flex-shrink-0 mt-[3px]" />
          <span>
            <strong className="font-semibold">{comment.author_name}</strong> asked: {comment.body}
          </span>
        </p>
      ))}
    </div>
  );
}

function Frame({ version, label: caption }: { version: AssetVersion; label: string }) {
  return (
    <figure className="min-w-0">
      <figcaption className="flex items-baseline justify-between gap-2 mb-1.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink/50">
          {caption}
        </span>
        <span className="text-[12px] text-ink/40">{formatDate(version.uploaded_at)}</span>
      </figcaption>
      {version.url ? (
        <img
          src={version.url}
          alt={`${caption} — ${version.filename}`}
          className="w-full rounded-lg border border-ink/10 bg-canvas object-contain max-h-[52vh]"
        />
      ) : (
        <p className="rounded-lg border border-dashed border-ink/15 bg-canvas p-8 text-center text-[13px] text-ink/45">
          This version is no longer viewable.
        </p>
      )}
    </figure>
  );
}
