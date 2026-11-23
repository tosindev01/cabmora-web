import { useEffect, useState, type FormEvent } from 'react';

import { Modal } from './Modal';

/** Matches the server, so an over-long summary is caught before a round trip. */
const MAX_SUMMARY = 160;
const MAX_DETAIL = 4000;

export interface ReportIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Send it. Resolves on success, throws with a message on failure.
   *
   * A callback rather than a call: this package is the design system and knows
   * nothing about HTTP. Giving it an API client would make every consumer of a
   * button depend on the backend contract.
   */
  onSubmit: (summary: string, detail: string) => Promise<void>;
}

/**
 * "Something is wrong here" — two fields and a send.
 *
 * Deliberately short. A support form with ten fields collects nine blanks; the
 * path the reader was on is captured by the caller rather than asked for,
 * because it is the most useful field and the one nobody fills in by hand.
 */
export function ReportIssueDialog({ open, onOpenChange, onSubmit }: ReportIssueDialogProps) {
  const [summary, setSummary] = useState('');
  const [detail, setDetail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  // Cleared on open, not on close: wiping on close throws away what somebody
  // typed the instant they tap outside the dialog by accident.
  useEffect(() => {
    if (open) {
      setError(null);
      setSent(false);
    }
  }, [open]);

  const ready = summary.trim().length > 0 && detail.trim().length > 0 && !sending;

  async function send(event: FormEvent) {
    event.preventDefault();
    if (!ready) return;

    setSending(true);
    setError(null);
    try {
      await onSubmit(summary.trim(), detail.trim());
      setSent(true);
      setSummary('');
      setDetail('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'That could not be sent. Please try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Report an issue"
      description="Tell us what went wrong and we will look into it."
      size="md"
    >
      {sent ? (
        <div className="space-y-6">
          <p role="status" className="text-[14px] leading-[1.7] text-ink/70">
            Thank you, that has reached us. We will look into it, and you can see it under your own
            reports.
          </p>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-[11px] tracking-[0.15em] uppercase font-medium bg-ink text-canvas px-7 py-3.5 hover:bg-ink/85 transition-colors"
          >
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={send} className="space-y-6">
          <div>
            <label
              htmlFor="issue-summary"
              className="block text-[10px] tracking-[0.2em] uppercase text-ink/45 font-medium mb-2"
            >
              What went wrong?
            </label>
            <input
              id="issue-summary"
              value={summary}
              maxLength={MAX_SUMMARY}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="In one line"
              className="w-full bg-white border border-ink/12 px-4 py-3 text-[14px] text-ink outline-none focus:border-gold transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="issue-detail"
              className="block text-[10px] tracking-[0.2em] uppercase text-ink/45 font-medium mb-2"
            >
              What were you doing?
            </label>
            <textarea
              id="issue-detail"
              value={detail}
              rows={5}
              maxLength={MAX_DETAIL}
              onChange={(event) => setDetail(event.target.value)}
              placeholder="What you expected, and what happened instead."
              className="w-full bg-white border border-ink/12 px-4 py-3 text-[14px] text-ink outline-none focus:border-gold transition-colors resize-y"
            />
          </div>

          {error && (
            <p role="alert" className="text-[13px] text-red-700">
              {error}
            </p>
          )}

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={!ready}
              className="text-[11px] tracking-[0.15em] uppercase font-medium bg-ink text-canvas px-7 py-3.5 hover:bg-ink/85 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending…' : 'Send report'}
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-[11px] tracking-[0.15em] uppercase font-medium text-ink/50 hover:text-ink transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
