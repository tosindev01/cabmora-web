import { useState } from 'react';
import { Check, MessageSquare, Send, Wrench } from 'lucide-react';

import type { ProjectComment, VisibleAsset } from '@/features/projects/api';
import { Modal } from '@cabmora/ui';

import { PinnedPhotograph } from '@/features/projects/components/PinnedPhotograph';
import { PinnedThumbnail } from '@/features/projects/components/PinnedThumbnail';
import type { ProjectFeedbackState } from '@/features/projects/hooks/useProjectFeedback';

interface Props {
  /** Loaded by the page, because the tab badge needs the count whether or
   *  not anybody has opened this tab — which is the entire point of it. */
  feedback: ProjectFeedbackState;
}

const CARD = 'bg-white border border-ink/10 rounded-xl shadow-xs';

/** A remark's "when" needs the hour — unlike a shoot date, which does not. */
function moment(value: string): string {
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * What the client has said about the work, and the reply.
 *
 * This exists because the loop was open: a client could ask for a change and
 * nobody on the team would ever see it. Change requests sort above chatter
 * and stay there until somebody marks them done, because an outstanding
 * request is the one thing here that is actually owed.
 *
 * The loop was still half open until the client got a Messages screen: they
 * could write, and the console could read and mark things done but never
 * answer. The composer at the foot of this tab is the other half — the
 * endpoint always allowed it, nothing called it.
 */
export function ProjectFeedback({ feedback }: Props) {
  const { comments, byAsset, outstanding, resolving, error, resolve, reply } = feedback;
  const [draft, setDraft] = useState('');
  const [about, setAbout] = useState<string>('');
  const [sending, setSending] = useState(false);
  /** The comment whose photograph is open, if any. */
  const [opening, setOpening] = useState<ProjectComment | null>(null);

  if (comments === null) {
    return <p className="text-center py-16 text-ink/50 text-[15.5px]">Loading feedback…</p>;
  }

  // Requests first, then everything else, each newest last so a thread still
  // reads in the order it was said.
  const ordered = [...comments].sort((a, b) => {
    if (a.needs_action !== b.needs_action) return a.needs_action ? -1 : 1;
    return a.created_at.localeCompare(b.created_at);
  });

  return (
    <div className="space-y-4">
      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-800 px-5 py-3 rounded-xl text-[14.5px]"
        >
          {error}
        </div>
      )}

      <div className={`${CARD} px-6 py-4 flex items-center justify-between gap-4`}>
        <div className="min-w-0">
          <h2 className="text-[16.5px] font-medium text-ink">Client feedback</h2>
          <p className="text-ink/55 text-[14.5px]">
            {comments.length === 0
              ? 'Nothing has been said about this project yet.'
              : outstanding === 0
                ? `${comments.length} remark${comments.length === 1 ? '' : 's'}, nothing outstanding.`
                : `${outstanding} change request${outstanding === 1 ? '' : 's'} still open.`}
          </p>
        </div>
        {outstanding > 0 && (
          <span className="flex-shrink-0 px-3 py-1 rounded-full text-[11.5px] font-bold uppercase tracking-[0.05em] bg-gold/15 text-gold">
            {outstanding} to do
          </span>
        )}
      </div>

      {comments.length === 0 ? (
        <div className={`${CARD} py-16 text-center`}>
          <MessageSquare size={26} className="mx-auto text-ink/20 mb-3" />
          <p className="text-ink/50 text-[14.5px]">
            When your client says anything about this project, it appears here. You can start the
            conversation below.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {ordered.map((comment) => (
            <FeedbackRow
              key={comment.id}
              comment={comment}
              asset={comment.asset_id ? byAsset.get(comment.asset_id) : undefined}
              busy={resolving.includes(comment.id)}
              onResolve={() => void resolve(comment.id)}
              onOpenPhotograph={setOpening}
            />
          ))}
        </ul>
      )}

      {/* Opened at the spot, not just at the photograph. A 64px thumbnail
          says roughly where; an editor needs to see which part of the frame
          the client was looking at, and then be able to get close to it. */}
      {opening && (
        <Modal
          open
          onOpenChange={(next) => !next && setOpening(null)}
          title={opening.body}
          hideTitle
          chrome="none"
          size="xl"
          overlay="heavy"
        >
          <PinnedPhotograph
            url={byAsset.get(opening.asset_id ?? '')?.url ?? ''}
            point={
              opening.point_x != null && opening.point_y != null
                ? { x: opening.point_x, y: opening.point_y }
                : null
            }
            caption={`${opening.author_name}: ${opening.body}`}
          />
        </Modal>
      )}

      {/* Replying is a remark, never a change request: the studio raising
          one against itself would put a number in the outstanding count that
          nobody asked for. */}
      <form
        className={`${CARD} p-4 flex items-end gap-3`}
        onSubmit={async (event) => {
          event.preventDefault();
          if (!draft.trim()) return;
          setSending(true);
          try {
            await reply(draft.trim(), about || undefined);
            setDraft('');
            setAbout('');
          } finally {
            setSending(false);
          }
        }}
      >
        <label className="flex-1 min-w-0">
          <span className="sr-only">Reply to the client</span>
          {/* Which photograph, if any. The client can pin a remark to one
              frame and the console could not, so an answer to "could this be
              warmer?" arrived with no indication of which "this". */}
          {byAsset.size > 0 && (
            <select
              value={about}
              onChange={(event) => setAbout(event.target.value)}
              aria-label="Which photograph this is about"
              className="mb-2 w-full rounded-lg border border-ink/15 bg-canvas px-3 py-2 text-[13.5px] outline-none focus:border-gold"
            >
              <option value="">About the project</option>
              {[...byAsset.values()].map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.filename}
                </option>
              ))}
            </select>
          )}
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={2}
            maxLength={2000}
            placeholder="Reply to your client — they see this in Messages."
            className="w-full rounded-lg border border-ink/15 bg-canvas px-3.5 py-2.5 text-[14.5px] leading-relaxed outline-none focus:border-gold resize-none"
          />
        </label>
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="shrink-0 flex items-center gap-2 bg-ink text-white px-5 py-2.5 rounded-lg text-[12.5px] font-bold uppercase tracking-[0.08em] hover:bg-gold hover:text-ink transition-colors cursor-pointer disabled:opacity-40"
        >
          <Send size={14} />
          {sending ? 'Sending…' : 'Send'}
        </button>
      </form>
    </div>
  );
}

function FeedbackRow({
  comment,
  asset,
  busy,
  onResolve,
  onOpenPhotograph,
}: {
  comment: ProjectComment;
  asset: VisibleAsset | undefined;
  busy: boolean;
  onResolve: () => void;
  /** Opens the frame at the marked spot. */
  onOpenPhotograph?: (comment: ProjectComment) => void;
}) {
  const isRequest = comment.kind === 'amendment';

  return (
    <li className={`${CARD} p-4 flex gap-4 ${comment.needs_action ? 'border-gold/40' : ''}`}>
      {/* The frame being talked about, with the spot the client pointed at.
          "Make it warmer" is unreadable on its own; "the shadow here is
          heavy" is worse, because *here* was the missing half of the
          sentence until pins existed. */}
      <PinnedThumbnail
        url={asset?.url}
        filename={asset?.filename}
        point={
          comment.point_x != null && comment.point_y != null
            ? { x: comment.point_x, y: comment.point_y }
            : null
        }
        onOpen={asset?.url ? () => onOpenPhotograph?.(comment) : undefined}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-[14.5px] font-medium text-ink">{comment.author_name}</span>
          {isRequest && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-[0.08em] bg-gold/15 text-gold">
              <Wrench size={10} />
              Change requested
            </span>
          )}
          {comment.resolved && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-[0.08em] bg-forest/10 text-forest">
              <Check size={10} />
              Done
            </span>
          )}
          <span className="text-[12.5px] text-ink/40">{moment(comment.created_at)}</span>
        </div>

        <p className="text-[14.5px] text-ink/80 break-words">{comment.body}</p>

        <p className="text-[12.5px] text-ink/40 mt-1">
          {asset ? asset.filename : 'About the project'}
        </p>
      </div>

      {comment.needs_action && (
        <button
          type="button"
          onClick={onResolve}
          disabled={busy}
          className="self-start flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13.5px] font-medium border border-ink/15 text-ink hover:border-gold hover:text-gold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check size={14} />
          {busy ? 'Saving…' : 'Mark done'}
        </button>
      )}
    </li>
  );
}
