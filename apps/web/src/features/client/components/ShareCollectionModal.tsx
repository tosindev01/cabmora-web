import { useCallback, useEffect, useState } from 'react';
import { Check, Copy, Link2, Trash2 } from 'lucide-react';

import { ApiError } from '@cabmora/api-client';
import { Modal } from '@cabmora/ui';

import {
  createShare,
  listShares,
  revokeShare,
  formatDate,
  type GalleryShare,
} from '@/features/client/api';

/** Only what the picker draws. A narrow shape rather than `ClientAsset`, so
 *  this component cannot start depending on the rest of it. */
export interface ShareablePhotograph {
  id: string;
  filename: string;
  url: string;
}

interface Props {
  projectId: string;
  /** Whether the studio has allowed links on this project. When they have
   *  not, the modal says so rather than failing on the first attempt. */
  allowed: boolean;
  /** True once the invoice is settled — which is what decides whether the
   *  link hands out originals or marked proofs. */
  handsOverOriginals: boolean;
  /** What this person may pass on: exactly the frames already on screen in
   *  their gallery. The server checks the chosen ids again, so this list is
   *  a convenience and not the gate. */
  photographs: ShareablePhotograph[];
  onClose: () => void;
}

/** Everything, or a chosen few. Two values rather than a boolean so the
 *  radio group reads as what it is. */
type Scope = 'all' | 'some';

/**
 * Handing the gallery to somebody who has no account.
 *
 * Deliberately a list rather than a single link. One shareable URL per
 * gallery cannot be taken back from one person without taking it back from
 * everybody, so each is its own link with its own label — "Mum", "the group
 * chat" — and revoking one leaves the others working.
 */
/** What one link holds, in words.
 *
 * `null` is the whole gallery and `0` is a chosen few that have since been
 * deleted — distinct answers, and a list that printed "0 photographs" for
 * both would be the same confusion this feature was raised to fix.
 */
function scopeOf(share: GalleryShare): string {
  if (share.photograph_count === null) return 'Whole gallery';
  if (share.photograph_count === 0) return 'No photographs left';
  return `${share.photograph_count} photograph${share.photograph_count === 1 ? '' : 's'}`;
}

export function ShareCollectionModal({
  projectId,
  allowed,
  handsOverOriginals,
  photographs,
  onClose,
}: Props) {
  const [shares, setShares] = useState<GalleryShare[] | null>(null);
  const [label, setLabel] = useState('');
  /* Defaults to the whole gallery, which is what the button has always done.
     A picker that opened pre-filtered would quietly change what "Create
     link" means for somebody who has used this before. */
  const [scope, setScope] = useState<Scope>('all');
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [issued, setIssued] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setShares(await listShares(projectId));
    } catch {
      setShares([]);
    }
  }, [projectId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function create() {
    setBusy(true);
    setError(null);
    try {
      // null, not an empty array, when sharing everything — the two mean
      // opposite things to the API and only one of them is "all".
      const share = await createShare(
        projectId,
        label.trim(),
        scope === 'some' ? [...picked] : null,
      );
      // Held in state because it is the only time it exists: the server keeps
      // a hash, so closing this without copying means making another.
      setIssued(share.url);
      setCopied(false);
      setLabel('');
      setPicked(new Set());
      setScope('all');
      await reload();
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Could not create that link.');
    } finally {
      setBusy(false);
    }
  }

  async function revoke(shareId: string) {
    setBusy(true);
    try {
      await revokeShare(projectId, shareId);
      await reload();
    } finally {
      setBusy(false);
    }
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Clipboard access is refused in plenty of ordinary situations. The
      // link is on screen and selectable, so this is not worth an error.
    }
  }

  return (
    <Modal open onOpenChange={(next) => !next && onClose()} title="Share this gallery" size="md">
      {!allowed ? (
        <p className="text-[14px] text-ink/70 leading-relaxed">
          Sharing is switched off for this project. Ask your photographer to turn it on and you will
          be able to send a link to anyone, without them needing an account.
        </p>
      ) : (
        <div className="space-y-5">
          <p className="text-[13.5px] text-ink/60 leading-relaxed">
            Anyone with the link can look at these photographs, with no account and no sign-in. Each
            link expires after 30 days, and you can stop one at any time without affecting the
            others.
            {handsOverOriginals
              ? ' They will see the full-resolution files.'
              : ' They will see watermarked copies, the same as you, until the balance is settled.'}
          </p>

          {issued && (
            <div className="border border-gold/40 bg-gold/8 rounded-xl p-4 space-y-2">
              <p className="text-[11px] uppercase tracking-[0.14em] font-bold text-ink/55">
                Copy this now
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 min-w-0 truncate text-[12.5px] bg-white border border-ink/10 rounded-lg px-3 py-2">
                  {issued}
                </code>
                <button
                  type="button"
                  onClick={() => void copy(issued)}
                  className="shrink-0 flex items-center gap-1.5 bg-ink text-white px-4 py-2 rounded-lg text-[12px] font-medium hover:bg-gold hover:text-ink transition-colors cursor-pointer"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-[12px] text-ink/50">
                We keep only a scrambled copy of this link, so it cannot be shown again. If you lose
                it, make another and stop this one.
              </p>
            </div>
          )}

          {/* What the link is for, before who it is for. Hidden entirely when
              there is nothing to choose between — a radio group offering
              "all" and "some" over a gallery of one is a decision nobody
              has. */}
          {photographs.length > 1 && (
            <fieldset className="border-t border-ink/10 pt-4">
              <legend className="text-[12px] font-bold uppercase tracking-[0.08em] text-ink/50 mb-2">
                What should it show?
              </legend>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {(
                  [
                    ['all', `The whole gallery (${photographs.length})`],
                    ['some', 'Only the ones I pick'],
                  ] as const
                ).map(([value, text]) => (
                  <label key={value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="share-scope"
                      value={value}
                      checked={scope === value}
                      onChange={() => setScope(value)}
                      className="accent-gold"
                    />
                    <span className="text-[13.5px]">{text}</span>
                  </label>
                ))}
              </div>

              {scope === 'some' && (
                <div className="mt-3">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-[12.5px] text-ink/55">
                      {picked.size === 0
                        ? 'Tap the ones you want to send.'
                        : `${picked.size} chosen`}
                    </p>
                    {picked.size > 0 && (
                      <button
                        type="button"
                        onClick={() => setPicked(new Set())}
                        className="text-[11.5px] uppercase tracking-[0.1em] font-semibold text-ink/50 hover:text-gold cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* A real checkbox behind each thumbnail rather than a
                      click handler on a div: it arrives in the tab order,
                      announces its own state, and works with the keyboard
                      without any of that being rebuilt here. */}
                  <ul className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[220px] overflow-y-auto pr-1">
                    {photographs.map((photo) => {
                      const chosen = picked.has(photo.id);
                      return (
                        <li key={photo.id}>
                          <label
                            className={`relative block aspect-square rounded-lg overflow-hidden cursor-pointer ring-2 transition-[box-shadow] ${
                              chosen ? 'ring-gold' : 'ring-transparent hover:ring-ink/20'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={chosen}
                              onChange={() =>
                                setPicked((previous) => {
                                  const next = new Set(previous);
                                  if (!next.delete(photo.id)) next.add(photo.id);
                                  return next;
                                })
                              }
                              className="sr-only peer"
                            />
                            <img
                              src={photo.url}
                              alt={photo.filename}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                            {/* Outside the `peer-checked` idiom on purpose:
                                the tick has to be visible on a dark
                                photograph as well as a light one, so it
                                carries its own backing. */}
                            {chosen && (
                              <span className="absolute inset-0 bg-ink/35 flex items-center justify-center">
                                <span className="bg-gold text-ink rounded-full p-1">
                                  <Check size={14} strokeWidth={3} />
                                </span>
                              </span>
                            )}
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </fieldset>
          )}

          <div className="flex items-end gap-2">
            <label className="flex-1 min-w-0">
              <span className="block text-[12px] font-bold uppercase tracking-[0.08em] text-ink/50 mb-1.5">
                Who is it for?
              </span>
              <input
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                maxLength={80}
                placeholder="Mum, the group chat…"
                className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-[13.5px] outline-none focus:border-gold"
              />
            </label>
            <button
              type="button"
              onClick={() => void create()}
              /* Nothing picked is not a link to nothing — the API refuses an
                 empty selection — so the button is disabled rather than
                 letting somebody find that out from an error. */
              disabled={busy || (scope === 'some' && picked.size === 0)}
              className="shrink-0 flex items-center gap-2 bg-ink text-white px-5 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-[0.05em] hover:bg-gold hover:text-ink transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Link2 size={14} />
              {scope === 'some' && picked.size > 0 ? `Share ${picked.size}` : 'Create link'}
            </button>
          </div>

          {error && <p className="text-[13px] text-red-700">{error}</p>}

          {shares !== null && shares.length > 0 && (
            <ul className="border-t border-ink/10 pt-4 space-y-2">
              {shares.map((share) => (
                <li
                  key={share.id}
                  className="flex items-center gap-3 border border-ink/10 rounded-lg px-3.5 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-medium truncate">
                      {share.label || 'Untitled link'}
                    </p>
                    <p className="text-[12px] text-ink/50">
                      {!share.active
                        ? 'Stopped'
                        : `${scopeOf(share)} · expires ${formatDate(share.expires_at)} · ${
                            share.views === 0
                              ? 'not opened yet'
                              : `opened ${share.views} time${share.views === 1 ? '' : 's'}`
                          }`}
                    </p>
                  </div>
                  {share.active && (
                    <button
                      type="button"
                      onClick={() => void revoke(share.id)}
                      disabled={busy}
                      aria-label={`Stop the link for ${share.label || 'this recipient'}`}
                      className="shrink-0 p-2 rounded-lg text-ink/40 hover:text-red-700 hover:bg-red-50 cursor-pointer transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Modal>
  );
}
