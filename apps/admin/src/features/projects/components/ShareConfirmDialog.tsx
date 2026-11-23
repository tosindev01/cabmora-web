import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowRight, Eye, Mail, Stamp, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Modal, nameCase } from '@cabmora/ui';
import type { Project } from '@cabmora/api-client';

import { STAGE_LABEL } from '@/shared/format';
import { WATERMARK_ON_SHARE } from '@/features/projects/display';
import { previewRelease, type ReleasePreview } from '@/features/projects/api';

/** What is about to be shared or taken back, as the gallery asked for it. */
export interface ShareRequest {
  ids: string[];
  released: boolean;
}

interface Props {
  project: Project;
  request: ShareRequest;
  busy: boolean;
  onCancel: () => void;
  /** `message` is only ever set when sharing — withholding is silent. */
  onConfirm: (message?: string) => void;
}

/**
 * The step between deciding to share and the client seeing it.
 *
 * Sharing is not the toggle it looks like: it emails the client, it can move
 * the project into review, and under `all_at_once` it releases photographs
 * that were never selected. None of that is visible from a button, and the
 * email cannot be unsent.
 *
 * What it says comes from `POST …/release/preview` rather than from reading
 * the project's settings here. The numbers are the API's answer about its own
 * rules, so this dialog cannot describe one release while the server performs
 * a different one — which is the single worst thing a confirmation step can
 * do, because it teaches people to trust it.
 */
export function ShareConfirmDialog({ project, request, busy, onCancel, onConfirm }: Props) {
  const [preview, setPreview] = useState<ReleasePreview | null>(null);
  const [failed, setFailed] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    setPreview(null);
    setFailed(false);
    previewRelease(project.id, request.ids, request.released)
      .then((result) => !cancelled && setPreview(result))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [project.id, request]);

  const client = project.customer_name ? nameCase(project.customer_name) : 'the client';
  const count = preview?.affected ?? request.ids.length;
  const noun = `${count} photograph${count === 1 ? '' : 's'}`;

  const title = request.released
    ? `Share ${noun} with ${client}?`
    : `Stop showing ${noun} to ${client}?`;

  return (
    <Modal open onOpenChange={(next) => !next && onCancel()} title={title} size="md">
      {failed ? (
        <p className="text-[13.5px] text-ink/70 leading-relaxed">
          We could not check what this would do. That usually means the connection dropped — close
          this and try again rather than confirming blind.
        </p>
      ) : preview === null ? (
        <p className="text-[13.5px] text-ink/50">Checking what this will do…</p>
      ) : preview.affected === 0 ? (
        <p className="text-[13.5px] text-ink/70 leading-relaxed">
          Nothing would change — {request.ids.length === 1 ? 'it is' : 'they are'} already{' '}
          {request.released ? 'shared' : 'withheld'}.
        </p>
      ) : (
        <div className="space-y-3.5">
          <Consequences
            project={project}
            request={request}
            preview={preview}
            client={client}
            noun={noun}
          />

          {/* Only when sharing, and only when somebody will actually read it. */}
          {request.released && preview.notifies_client && (
            <label className="block border-t border-ink/10 pt-4">
              <span className="block text-[12px] font-bold uppercase tracking-[0.08em] text-ink/50 mb-1.5">
                Add a line to that email
              </span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="The beach ones are still coming — these are the ceremony and the speeches."
                className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-[13.5px] leading-relaxed outline-none focus:border-gold resize-y"
              />
              <span className="block text-[12px] text-ink/40 mt-1.5">
                Optional. It appears above the gallery button, signed as Cabmora — the message reads
                perfectly well without it.
              </span>
            </label>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-ink/10 pt-4 mt-6">
        <button
          type="button"
          disabled={busy || preview === null || failed}
          onClick={() => onConfirm(message.trim() || undefined)}
          className="px-5 py-2.5 text-[12px] font-bold rounded-full uppercase tracking-[0.05em] bg-ink text-white hover:bg-gold hover:text-ink transition-colors cursor-pointer disabled:opacity-50"
        >
          {busy
            ? request.released
              ? 'Sharing…'
              : 'Hiding…'
            : request.released
              ? 'Share with client'
              : 'Hide from client'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-[12px] font-bold rounded-full uppercase tracking-[0.05em] border border-ink/15 text-ink/70 hover:bg-canvas transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}

function Consequences({
  project,
  request,
  preview,
  client,
  noun,
}: {
  project: Project;
  request: ShareRequest;
  preview: ReleasePreview;
  client: string;
  noun: string;
}) {
  if (!request.released) {
    return (
      <>
        <Consequence icon={Eye}>
          {client} will no longer see {preview.affected === 1 ? 'it' : 'them'}, including anything
          they are partway through reviewing.
        </Consequence>
        <Consequence icon={Mail} muted>
          They are not told. Taking work back is a conversation rather than a notification, so if
          they have already looked, tell them yourself.
        </Consequence>
      </>
    );
  }

  return (
    <>
      {preview.affected > preview.selected && (
        <Consequence icon={AlertTriangle} tone="amber">
          This project releases <strong className="font-semibold">all at once</strong>, so every
          photograph still withheld goes out — {noun}, not the{' '}
          {preview.selected === 1 ? 'one' : preview.selected} you picked. Change it under Delivery
          settings to release them in stages.
        </Consequence>
      )}

      <Consequence icon={Eye}>
        {client} can open {preview.affected === 1 ? 'it' : 'them'} in their portal straight away.
      </Consequence>

      <Consequence icon={Stamp}>{WATERMARK_ON_SHARE[project.watermark_policy]}</Consequence>

      {preview.notifies_client ? (
        <Consequence icon={Mail}>
          We email them to say their gallery is ready.{' '}
          <strong className="font-semibold">That cannot be unsent</strong>, so share in one go
          rather than a frame at a time — each share sends its own email.
        </Consequence>
      ) : (
        <Consequence icon={Mail} muted>
          Nobody is told: this project has no client on it yet. Assign one under Details and they
          will see the gallery when they sign in.
        </Consequence>
      )}

      {preview.moves_to_stage && (
        <Consequence icon={ArrowRight}>
          The project moves to{' '}
          <strong className="font-semibold">{STAGE_LABEL[preview.moves_to_stage]}</strong>, because
          photographs with the client means the client is reviewing them.
        </Consequence>
      )}

      {preview.preview_pending > 0 && (
        <Consequence icon={AlertTriangle} tone="amber">
          {preview.preview_pending === 1
            ? 'One photograph is'
            : `${preview.preview_pending} photographs are`}{' '}
          still being prepared. {preview.preview_pending === 1 ? 'It' : 'They'} will be shared, but
          the client sees a gap until the preview is made — usually a few seconds.
        </Consequence>
      )}
    </>
  );
}

/**
 * One thing that will happen, with the icon carrying the kind of thing it is.
 *
 * A list rather than a paragraph: somebody about to send a wedding gallery
 * reads four lines and skips four sentences.
 */
function Consequence({
  icon: Icon,
  tone,
  muted,
  children,
}: {
  icon: LucideIcon;
  tone?: 'amber';
  muted?: boolean;
  children: ReactNode;
}) {
  return (
    <p
      className={`flex gap-3 text-[13.5px] leading-relaxed rounded-lg ${
        tone === 'amber'
          ? 'bg-amber-50 border border-amber-200 text-amber-900 p-3'
          : muted
            ? 'text-ink/55'
            : 'text-ink/75'
      }`}
    >
      <Icon
        size={15}
        className={`flex-shrink-0 mt-[3px] ${tone === 'amber' ? 'text-amber-700' : 'text-gold'}`}
      />
      <span>{children}</span>
    </p>
  );
}
