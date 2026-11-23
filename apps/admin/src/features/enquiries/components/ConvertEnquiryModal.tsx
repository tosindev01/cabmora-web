import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { AlertTriangle, ArrowRight, Check, Copy, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ApiError } from '@cabmora/api-client';
import { Modal } from '@cabmora/ui';

import {
  convertEnquiry,
  type EnquiryDetail,
  type ConversionResult,
} from '@/features/enquiries/api';

interface Props {
  enquiry: EnquiryDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConverted: () => void;
}

/**
 * Win a lead: create the project, and the client's account if they need one.
 *
 * The outcome is shown explicitly rather than as a generic toast, because there
 * are three genuinely different ones and the admin has to act on two of them.
 */
/** A `<input type="date">` value as an ISO instant, or undefined if unset. */
function asInstant(value: string): string | undefined {
  return value ? new Date(`${value}T12:00:00`).toISOString() : undefined;
}

/** An ISO instant as a `<input type="date">` value. Local parts, so a date
 *  stored at midnight UTC does not display as the day before. */
function toDateInputValue(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

export function ConvertEnquiryModal({ enquiry, open, onOpenChange, onConverted }: Props) {
  // What they typed, not a split of what they typed.
  const { first_name: first, last_name: last } = enquiry;
  const existing = enquiry.existing_account;
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Asked of the form itself rather than mirrored into state. The fields
  // already carry `required`; re-stating which ones in a second place is how
  // a new field gets added and the button stays enabled without it.
  const formRef = useRef<HTMLFormElement>(null);
  const [complete, setComplete] = useState(false);
  const recheck = useCallback(() => {
    setComplete(formRef.current?.checkValidity() ?? false);
  }, []);
  // Once on mount too: most of this form arrives prefilled from the lead, so
  // it is often valid before anybody types anything.
  useEffect(recheck, [recheck, result]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);
    setSubmitting(true);
    try {
      setResult(
        await convertEnquiry(enquiry.id, {
          // Sent as a fallback the API ignores when the address already has an
          // account — it only names a user it is about to create.
          first_name: String(form.get('first_name') ?? first),
          last_name: String(form.get('last_name') ?? last),
          title: String(form.get('title')),
          event_type: String(form.get('event_type')) || undefined,
          // Midday, not midnight: a date stored as 00:00 UTC is the previous
          // day for anyone west of here, and the project would show it a day
          // early.
          event_date: asInstant(String(form.get('event_date') ?? '')),
          deadline: asInstant(String(form.get('deadline') ?? '')),
        }),
      );
      onConverted();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not convert this enquiry.');
      setSubmitting(false);
    }
  }

  const field =
    'bg-canvas border border-ink/15 px-3 py-2 text-[14.5px] outline-none focus:border-gold rounded-lg w-full';
  const label = 'text-[12.5px] uppercase tracking-[0.1em] font-bold text-ink/50 block mb-1.5';

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          setResult(null);
          setError(null);
          setSubmitting(false);
          setCopied(false);
        }
      }}
      title="Convert to project"
      description="Creates the project and, if they do not have one, the client's account."
      size="lg"
    >
      {result ? (
        <div className="space-y-4">
          {/* 1. A new account was created — the link is shown once. */}
          {result.invite_url && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
              <p className="text-[14.5px] text-amber-900 font-medium">
                Send this link to {enquiry.full_name}
              </p>
              <p className="text-[13.5px] text-amber-900/80">
                We have emailed it to them. Copy it anyway — it is shown once here and cannot be
                recovered if the message does not arrive.
              </p>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={result.invite_url}
                  className={`${field} font-mono text-[12.5px]`}
                />
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(result.invite_url!);
                    setCopied(true);
                  }}
                  aria-label="Copy invite link"
                  className="px-3 py-2 rounded-lg border border-ink/15 text-ink/70 hover:bg-canvas cursor-pointer flex-shrink-0"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* 2. An existing account was reused — no invite, nothing to send. */}
          {!result.invite_url && result.customer_id && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-2.5">
              <UserCheck size={16} className="text-emerald-700 flex-shrink-0 mt-0.5" />
              <p className="text-[14.5px] text-emerald-900">
                Linked to their existing account — they can sign in with the password they already
                have.
              </p>
            </div>
          )}

          {/* 3. The address belonged to staff. The project exists but has no
                 client, and that has to be acted on rather than dismissed. */}
          {result.warning && (
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[14.5px] text-amber-900 mb-2">{result.warning}</p>
                <Link
                  to={`/admin/projects/${result.project_id}`}
                  className="text-[13.5px] font-bold uppercase tracking-[0.05em] text-amber-900 hover:text-ink inline-flex items-center gap-1"
                >
                  Open project settings
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Link
              to={`/admin/projects/${result.project_id}`}
              className="flex-1 text-center bg-ink text-white px-5 py-2.5 rounded-full text-[13.5px] font-bold tracking-[0.05em] uppercase hover:bg-gold hover:text-ink transition-colors"
            >
              Go to project
            </Link>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-5 py-2.5 rounded-full text-[13.5px] font-bold tracking-[0.05em] uppercase text-ink/60 border border-ink/15 hover:border-ink/30 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          onInput={recheck}
          onChange={recheck}
          className="space-y-5"
        >
          {error && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 text-red-800 px-4 py-2.5 rounded-lg text-[14.5px]"
            >
              {error}
            </div>
          )}

          <div className="bg-canvas border border-ink/10 rounded-lg p-3 text-[13.5px] text-ink/60">
            Enquiry from <strong className="text-ink">{enquiry.full_name}</strong> · {enquiry.email}
          </div>

          {/* Told before the form, not after it: the name fields below are only
              used when an account is created, so an admin converting a
              returning client would otherwise type a name that is discarded. */}
          {existing && (
            <div
              className={`border rounded-lg p-3 flex items-start gap-2.5 text-[13.5px] ${
                existing.is_customer
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              {existing.is_customer ? (
                <UserCheck size={15} className="flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
              )}
              {existing.is_customer ? (
                <p>
                  This address already has an account —{' '}
                  <strong>
                    {existing.first_name} {existing.last_name}
                  </strong>
                  . The project will be linked to it. No new account, no invite.
                </p>
              ) : (
                <p>
                  This address belongs to a <strong>{existing.role}</strong> account, not a client.
                  The project will be created without a client and you will need to assign one.
                </p>
              )}
            </div>
          )}

          {!existing && (
            <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <legend className={label}>Client name</legend>
              <div>
                <label htmlFor="cv-first" className={label}>
                  First name
                </label>
                <input
                  id="cv-first"
                  name="first_name"
                  defaultValue={first}
                  className={field}
                  required
                />
              </div>
              <div>
                <label htmlFor="cv-last" className={label}>
                  Last name
                </label>
                <input
                  id="cv-last"
                  name="last_name"
                  defaultValue={last}
                  className={field}
                  required
                />
              </div>
              <p className="sm:col-span-2 text-[13.5px] text-ink/50 -mt-2">
                As they entered it. Correct it if needed — this becomes the name on their account.
              </p>
            </fieldset>
          )}

          <div>
            <label htmlFor="cv-title" className={label}>
              Project title
            </label>
            <input
              id="cv-title"
              name="title"
              defaultValue={`${last || first} ${enquiry.event_type}`.trim()}
              className={field}
              required
            />
          </div>

          <div>
            <label htmlFor="cv-type" className={label}>
              Event type
            </label>
            <input
              id="cv-type"
              name="event_type"
              defaultValue={enquiry.event_type}
              className={field}
            />
          </div>

          {/* Asked for here rather than assumed. A lead often arrives with no
              date — people fill in forms before they have decided — and a
              project that reaches the client with no event date and no
              deadline is one nobody can schedule around, by which point
              everyone has moved on and nobody goes back to fill it in. */}
          <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cv-event-date" className={label}>
                Event date
              </label>
              <input
                id="cv-event-date"
                name="event_date"
                type="date"
                defaultValue={toDateInputValue(enquiry.event_date)}
                className={field}
                required
              />
            </div>
            <div>
              <label htmlFor="cv-deadline" className={label}>
                Deadline
              </label>
              <input
                id="cv-deadline"
                name="deadline"
                type="date"
                defaultValue={toDateInputValue(enquiry.deadline)}
                className={field}
                required
              />
            </div>
            <p className="sm:col-span-2 text-[13.5px] text-ink/50 -mt-2">
              {enquiry.event_date || enquiry.deadline
                ? 'From the enquiry. Change them if the call settled on something else.'
                : 'Not on the enquiry yet — the client sees these on their project.'}
            </p>
          </fieldset>

          <div>
            <button
              type="submit"
              disabled={submitting || !complete}
              aria-busy={submitting}
              className="w-full bg-ink text-white px-5 py-2.5 rounded-full text-[13.5px] font-bold tracking-[0.05em] uppercase hover:bg-gold hover:text-ink transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-ink disabled:hover:text-white"
            >
              {submitting ? 'Converting…' : 'Create project'}
            </button>
            {/* Said, not just shown. A disabled button with no explanation
                leaves somebody hunting for which box is empty. */}
            {!complete && !submitting && (
              <p className="text-[13px] text-ink/45 text-center mt-2">
                Fill in every field to create the project.
              </p>
            )}
          </div>
        </form>
      )}
    </Modal>
  );
}
