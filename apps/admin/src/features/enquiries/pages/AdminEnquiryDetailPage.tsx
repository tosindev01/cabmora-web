import { nameCase } from '@/shared/format';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  CalendarPlus,
  Check,
  ExternalLink,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  UserCheck,
  Video,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { ApiError } from '@cabmora/api-client';
import { Modal, Select } from '@cabmora/ui';

import { AvailabilityGrid } from '@/features/enquiries/components';
import {
  addNote,
  getEnquiry,
  confirmConsultation,
  scheduleConsultation,
  updateEnquiry,
  type EnquiryPatch,
  type EnquiryDetail,
  type EnquiryStatus,
} from '@/features/enquiries/api';
import { ConvertEnquiryModal } from '@/features/enquiries/components/ConvertEnquiryModal';
import {
  EVENT_LABEL,
  STATUS_LABEL,
  STATUS_PILL,
  formatBudget,
  formatDate,
  formatDateTime,
} from '@/features/enquiries/display';

/** One entry in the merged history, so events and calls read as one story. */
interface TimelineItem {
  id: string;
  at: string;
  title: string;
  body?: string;
  href?: string;
}

/** `datetime-local` wants "YYYY-MM-DDTHH:mm" in *local* time. `toISOString()`
 *  returns UTC and would silently shift a picked slot by the offset. */
/** An ISO instant as a `<input type="date">` value, or '' for nothing set. */
function toDateInputValue(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  // Local parts, not `toISOString().slice(0,10)`: a date stored as midnight
  // UTC is the previous day in most of the world, and the field would show
  // yesterday.
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

export default function AdminEnquiryDetailPage() {
  const { id = '' } = useParams();
  const [enquiry, setEnquiry] = useState<EnquiryDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  //: Set from an action's return value, so the confirmation can name what
  //: actually happened rather than saying "Saved".
  const [notice, setNotice] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pickedSlot, setPickedSlot] = useState('');
  // The week grid is closed until somebody needs it. It is tall enough to
  // push everything else off the screen, and most visits to this page are not
  // about the diary.
  const [pickingTime, setPickingTime] = useState(false);
  // The slot clicked in the diary, waiting to be confirmed. A click is a
  // proposal, not a booking — this is the only place in the console where one
  // click would email a client, and it should be deliberate.
  const [proposed, setProposed] = useState<Date | null>(null);
  const [proposedMinutes, setProposedMinutes] = useState(30);
  const [proposedUrl, setProposedUrl] = useState('');
  const [editingDates, setEditingDates] = useState(false);
  // The earliest slot still waiting on us. More than one is unusual but
  // possible if somebody enquired twice, and the oldest is the one they have
  // been waiting on longest.
  const requested = enquiry?.consultations
    .filter((c) => c.status === 'requested' && !c.cancelled_at)
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))[0];

  // The soonest confirmed call still ahead of us. Past ones belong in the
  // timeline; a "join" button for last Tuesday is noise.
  const nextCall = enquiry?.consultations
    .filter(
      (c) => c.status === 'confirmed' && !c.cancelled_at && new Date(c.scheduled_at) > new Date(),
    )
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))[0];
  const [converting, setConverting] = useState(false);

  const load = useCallback(async () => {
    try {
      setEnquiry(await getEnquiry(id));
      setError(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) setNotFound(true);
      else setError(err instanceof ApiError ? err.message : 'Could not load this enquiry.');
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const run = useCallback(
    async (action: () => Promise<string | void>) => {
      setBusy(true);
      setError(null);
      setNotice(null);
      try {
        const confirmation = await action();
        // Re-read rather than patch locally: notes, consultations and status
        // changes each append to the timeline, and only the server knows what
        // the whole history now looks like.
        await load();
        // After the reload, so the confirmation and the timeline it refers to
        // appear together rather than the banner arriving first.
        if (confirmation) setNotice(confirmation);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'That did not work.');
      } finally {
        setBusy(false);
      }
    },
    [load],
  );

  if (notFound) {
    return (
      <div className="max-w-[720px] mx-auto text-center py-20">
        <h1 className="text-[24px] font-sans font-medium text-ink mb-2">Enquiry not found</h1>
        <Link
          to="/admin/enquiries"
          className="text-[13.5px] font-bold uppercase tracking-[0.05em] text-gold hover:text-ink"
        >
          Back to enquiries
        </Link>
      </div>
    );
  }

  if (!enquiry) {
    return <p className="text-center py-20 text-ink/50 text-[15.5px]">Loading enquiry…</p>;
  }

  const timeline: TimelineItem[] = [
    ...enquiry.events.map((e) => ({
      id: e.id,
      at: e.occurred_at,
      title: EVENT_LABEL[e.kind] ?? e.kind.replaceAll('_', ' '),
      body:
        typeof e.payload.body === 'string'
          ? e.payload.body
          : Object.keys(e.payload).length
            ? Object.entries(e.payload)
                .map(([k, v]) => `${k}: ${String(v)}`)
                .join(' · ')
            : undefined,
    })),
    // A requested call reads differently from a booked one, and a timeline
    // that called both "Consultation" would say a call exists that does not.
    ...enquiry.consultations.map((c) => ({
      id: c.id,
      at: c.scheduled_at,
      title: `${c.status === 'requested' ? 'Requested' : 'Consultation'} — ${formatDateTime(
        c.scheduled_at,
      )} (${c.duration_minutes} min)`,
      body:
        c.status === 'requested'
          ? 'The client asked for this time. Not confirmed.'
          : c.meeting_url
            ? undefined
            : 'No meeting link was added.',
      href: c.meeting_url ?? undefined,
    })),
  ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  const budget = formatBudget(enquiry.budget_min_minor, enquiry.budget_max_minor);
  const field =
    'bg-canvas border border-ink/15 px-3 py-2 text-[14.5px] outline-none focus:border-gold rounded-lg w-full';
  const label = 'text-[12.5px] uppercase tracking-[0.1em] font-bold text-ink/50 block mb-1.5';

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      <Link
        to="/admin/enquiries"
        className="inline-flex items-center gap-2 text-[13.5px] font-bold uppercase tracking-[0.05em] text-ink/60 hover:text-gold transition-colors"
      >
        <ArrowLeft size={16} />
        Enquiries
      </Link>

      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-800 px-5 py-3 rounded-xl text-[14.5px]"
        >
          {error}
        </div>
      )}

      {/* `status`, not `alert`: a confirmation is announced politely rather
          than interrupting whatever a screen reader is already saying. */}
      {notice && (
        <div
          role="status"
          className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-3 rounded-xl text-[14.5px]"
        >
          {notice}
        </div>
      )}

      {/* The call that has not happened yet, with the link to join it. Above
          everything else because it is the only thing on this page that is
          time-critical — in the timeline it sat in date order among months of
          notes and status changes. */}
      {nextCall && (
        <div className="bg-ink text-canvas rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[11.5px] uppercase tracking-[0.14em] text-gold font-medium mb-1">
              Next call
            </p>
            <p className="text-[16px] text-canvas">
              {formatDateTime(nextCall.scheduled_at)}{' '}
              <span className="text-canvas/50">· {nextCall.duration_minutes} min</span>
            </p>
          </div>
          {nextCall.meeting_url ? (
            <a
              href={nextCall.meeting_url}
              target="_blank"
              rel="noreferrer"
              className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold text-ink rounded-full text-[12.5px] font-bold uppercase tracking-[0.08em] hover:bg-canvas transition-colors"
            >
              <Video size={15} />
              Join call
            </a>
          ) : (
            <span className="flex-shrink-0 text-[13px] text-canvas/50">No link on this one.</span>
          )}
        </div>
      )}

      <div className="bg-white border border-ink/10 rounded-xl shadow-xs p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-[26px] leading-tight text-ink truncate">
            {nameCase(enquiry.full_name)}
          </h1>
          <p className="text-ink/55 text-[14.5px] truncate">
            {enquiry.event_type} · received {formatDate(enquiry.created_at)}
          </p>
          {/* Set when a signed-in client submitted this, so a second shoot
              for somebody we already have reads as one rather than as a new
              lead who happens to know their own email address. Converting
              reuses that account instead of inviting them again. */}
          {enquiry.customer_id && (
            <p className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
              <UserCheck size={12} />
              Existing client
            </p>
          )}
        </div>
        <span
          className={`px-3 py-1 rounded-full text-[11.5px] font-bold uppercase tracking-[0.06em] whitespace-nowrap ${STATUS_PILL[enquiry.status]}`}
        >
          {STATUS_LABEL[enquiry.status]}
        </span>
        {enquiry.converted_project_id ? (
          <Link
            to={`/admin/projects/${enquiry.converted_project_id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[12.5px] font-bold uppercase tracking-[0.05em] border border-ink/15 text-ink/70 hover:border-gold hover:text-ink transition-colors whitespace-nowrap"
          >
            View project
            <ExternalLink size={13} />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setConverting(true)}
            className="px-5 py-2.5 rounded-full text-[13.5px] font-bold tracking-[0.05em] uppercase bg-ink text-white hover:bg-gold hover:text-ink transition-colors cursor-pointer whitespace-nowrap"
          >
            Convert to project
          </button>
        )}
      </div>

      <ConvertEnquiryModal
        enquiry={enquiry}
        open={converting}
        onOpenChange={setConverting}
        onConverted={() => void load()}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* What they sent — evidence, not editable. */}
        <div className="space-y-6">
          <section className="bg-white border border-ink/10 rounded-xl shadow-xs p-6">
            <h2 className="text-[12.5px] uppercase tracking-[0.12em] font-bold text-ink/50 mb-4">
              The enquiry
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[14.5px] mb-4">
              <div className="min-w-0">
                <dt className="text-ink/50 mb-0.5 flex items-center gap-1.5">
                  <Mail size={13} /> Email
                </dt>
                <dd className="text-ink truncate">{enquiry.email}</dd>
              </div>
              <div>
                <dt className="text-ink/50 mb-0.5 flex items-center gap-1.5">
                  <Phone size={13} /> Phone
                </dt>
                <dd className="text-ink">{enquiry.phone || '—'}</dd>
              </div>
              <div>
                <dt className="text-ink/50 mb-0.5 flex items-center gap-1.5">
                  <MessageCircle size={13} /> WhatsApp
                </dt>
                <dd className="text-ink">{enquiry.whatsapp || '—'}</dd>
              </div>
              <div>
                <dt className="text-ink/50 mb-0.5">Event type</dt>
                <dd className="text-ink">{enquiry.event_type}</dd>
              </div>
              <div>
                <dt className="text-ink/50 mb-0.5">Event date</dt>
                <dd className="text-ink">{formatDate(enquiry.event_date)}</dd>
              </div>
              <div>
                <dt className="text-ink/50 mb-0.5">Deadline</dt>
                <dd className="text-ink">{formatDate(enquiry.deadline)}</dd>
              </div>
            </dl>

            {/* Behind a dialog rather than sitting open. The card is something
                you read; two date pickers in it make it something you operate,
                and nothing else on this page is editable in place. */}
            <button
              type="button"
              onClick={() => setEditingDates(true)}
              className="text-[13px] text-ink/55 hover:text-gold transition-colors cursor-pointer inline-flex items-center gap-1.5 mb-4"
            >
              <Pencil size={14} />
              Edit details
            </button>

            <p className="text-[14.5px] text-ink/70 whitespace-pre-wrap border-t border-ink/10 pt-4">
              {enquiry.message}
            </p>
          </section>

          <Modal
            open={editingDates}
            onOpenChange={setEditingDates}
            title="Edit this enquiry"
            description="Every change is written to the history below, with what it was before."
            size="md"
          >
            <form
              className="space-y-5"
              onSubmit={(e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                void run(async () => {
                  // Only what actually changed. Sending the whole form every
                  // time would write nine entries to the history for one edit.
                  const patch: EnquiryPatch = {};
                  /** Only sent when it differs from what is on the record. */
                  const text = (
                    name:
                      'first_name' | 'last_name' | 'phone' | 'whatsapp' | 'event_type' | 'message',
                    was: string | null,
                  ) => {
                    const value = String(data.get(name) ?? '').trim();
                    if (value !== (was ?? '')) patch[name] = value;
                  };
                  text('first_name', enquiry.first_name);
                  text('last_name', enquiry.last_name);
                  text('phone', enquiry.phone);
                  text('whatsapp', enquiry.whatsapp);
                  text('event_type', enquiry.event_type);
                  text('message', enquiry.message);

                  for (const [name, was] of [
                    ['event_date', enquiry.event_date],
                    ['deadline', enquiry.deadline],
                  ] as const) {
                    const value = String(data.get(name) ?? '');
                    if (value && value !== toDateInputValue(was)) {
                      patch[name] = new Date(value).toISOString();
                    }
                  }

                  if (Object.keys(patch).length === 0) {
                    setEditingDates(false);
                    return;
                  }
                  await updateEnquiry(id, patch);
                  setEditingDates(false);
                  return 'Enquiry updated. The change is in the history below.';
                });
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="e-first" className={label}>
                    First name
                  </label>
                  <input
                    id="e-first"
                    name="first_name"
                    className={field}
                    defaultValue={enquiry.first_name}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="e-last" className={label}>
                    Last name
                  </label>
                  <input
                    id="e-last"
                    name="last_name"
                    className={field}
                    defaultValue={enquiry.last_name}
                    required
                  />
                </div>
              </div>

              {/* Shown, not editable. It is the address every message has
                  already gone to and the one conversion matches an account
                  on, so changing it here would point the record at somebody
                  else. A wrong address is a reason to ask them. */}
              <div>
                <span className={label}>Email</span>
                <p className="text-[13.5px] text-ink/55 bg-canvas border border-ink/10 px-3 py-2 rounded-lg truncate">
                  {enquiry.email}
                </p>
                <p className="text-[12px] text-ink/40 mt-1.5">
                  Fixed. This is what identifies the lead and where everything has been sent.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="e-phone" className={label}>
                    Phone
                  </label>
                  <input
                    id="e-phone"
                    name="phone"
                    className={field}
                    defaultValue={enquiry.phone ?? ''}
                  />
                </div>
                <div>
                  <label htmlFor="e-whatsapp" className={label}>
                    WhatsApp
                  </label>
                  <input
                    id="e-whatsapp"
                    name="whatsapp"
                    className={field}
                    defaultValue={enquiry.whatsapp ?? ''}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="e-event-date" className={label}>
                    Event date
                  </label>
                  <input
                    id="e-event-date"
                    name="event_date"
                    type="date"
                    className={field}
                    defaultValue={toDateInputValue(enquiry.event_date)}
                  />
                </div>
                <div>
                  <label htmlFor="e-deadline" className={label}>
                    Deadline
                  </label>
                  <input
                    id="e-deadline"
                    name="deadline"
                    type="date"
                    className={field}
                    defaultValue={toDateInputValue(enquiry.deadline)}
                  />
                </div>
              </div>
              <p className="text-[12px] text-ink/40 -mt-2">
                Both carry to the project when this lead is converted.
              </p>

              <div>
                <label htmlFor="e-type" className={label}>
                  Event type
                </label>
                <input
                  id="e-type"
                  name="event_type"
                  className={field}
                  defaultValue={enquiry.event_type}
                  required
                />
              </div>

              <div>
                <label htmlFor="e-message" className={label}>
                  What they said
                </label>
                <textarea
                  id="e-message"
                  name="message"
                  rows={4}
                  className={`${field} resize-y`}
                  defaultValue={enquiry.message}
                  required
                />
              </div>

              <div className="flex items-center gap-2 border-t border-ink/10 pt-4">
                {/* Disabled while the request is in flight, and says so.
                    Without it a slow save looks like a dead button and gets
                    pressed again. */}
                <button
                  type="submit"
                  disabled={busy}
                  className="px-5 py-2.5 text-[12px] font-bold rounded-full uppercase tracking-[0.05em] bg-ink text-white hover:bg-gold hover:text-ink transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {busy && (
                    <span
                      aria-hidden
                      className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    />
                  )}
                  {busy ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setEditingDates(false)}
                  className="px-5 py-2.5 text-[12px] font-bold rounded-full uppercase tracking-[0.05em] border border-ink/15 text-ink/70 hover:bg-canvas transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Modal>

          {/* One story: events and calls merged and ordered by time. */}
          <section className="bg-white border border-ink/10 rounded-xl shadow-xs p-6">
            <h2 className="text-[12.5px] uppercase tracking-[0.12em] font-bold text-ink/50 mb-4">
              History
            </h2>
            <ol className="space-y-4 mb-6">
              {timeline.map((item) => (
                <li key={item.id} className="flex gap-4">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <span className="w-2 h-2 rounded-full bg-gold mt-1.5" />
                    <span className="w-px flex-1 bg-ink/10" />
                  </div>
                  <div className="min-w-0 pb-1">
                    <p className="text-[14.5px] text-ink font-medium">{item.title}</p>
                    {item.body && (
                      <p className="text-[13.5px] text-ink/60 whitespace-pre-wrap break-words">
                        {item.body}
                      </p>
                    )}
                    {/* The same button as the banner at the top, smaller.
                        One treatment for one action: a link here and a button
                        there would read as two different things. */}
                    {item.href && (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 mt-1.5 bg-gold text-ink rounded-full text-[11.5px] font-bold uppercase tracking-[0.08em] hover:bg-ink hover:text-canvas transition-colors w-fit"
                      >
                        <Video size={13} />
                        Join call
                      </a>
                    )}
                    <p className="text-[12.5px] text-ink/40">{formatDateTime(item.at)}</p>
                  </div>
                </li>
              ))}
            </ol>

            <form
              className="border-t border-ink/10 pt-4 flex items-start gap-2"
              onSubmit={(e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                const form = e.currentTarget;
                const body = String(new FormData(form).get('body')).trim();
                if (!body) return;
                void run(async () => {
                  await addNote(id, body);
                  form.reset();
                  setPickedSlot('');
                });
              }}
            >
              <label htmlFor="note-body" className="sr-only">
                Add a note
              </label>
              <textarea
                id="note-body"
                name="body"
                rows={2}
                placeholder="Called, no answer…"
                className={field}
                required
              />
              <button
                type="submit"
                disabled={busy}
                className="px-4 py-2 rounded-lg text-[13.5px] font-semibold bg-ink text-white hover:bg-gold hover:text-ink transition-colors cursor-pointer disabled:opacity-50 flex-shrink-0"
              >
                Add note
              </button>
            </form>
          </section>
        </div>

        {/* What staff change. */}
        <div className="space-y-6">
          <section className="bg-white border border-ink/10 rounded-xl shadow-xs p-6 space-y-4">
            <h2 className="text-[12.5px] uppercase tracking-[0.12em] font-bold text-ink/50">
              Pipeline
            </h2>

            <div>
              <label htmlFor="detail-status" className={label}>
                Status
              </label>
              {enquiry.allowed_next_statuses.length === 0 ? (
                <p className="text-[14.5px] text-ink/50 italic">
                  {enquiry.status === 'won'
                    ? 'Won — a project exists for this enquiry.'
                    : 'No further moves.'}
                </p>
              ) : (
                <Select
                  id="detail-status"
                  value={enquiry.status}
                  disabled={busy}
                  onChange={(e) =>
                    void run(async () => {
                      await updateEnquiry(id, { status: e.target.value as EnquiryStatus });
                    })
                  }
                  className={`${field} pr-9`}
                >
                  <option value={enquiry.status}>{STATUS_LABEL[enquiry.status]}</option>
                  {enquiry.allowed_next_statuses.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABEL[status]}
                    </option>
                  ))}
                </Select>
              )}
            </div>

            <div>
              <span className={label}>Assigned to</span>
              <p
                className={`text-[14.5px] ${enquiry.assigned_to_name ? 'text-ink' : 'text-ink/40 italic'}`}
              >
                {enquiry.assigned_to_name ?? 'Unassigned'}
              </p>
            </div>

            <div>
              <span className={label}>Budget</span>
              <p className={`text-[14.5px] ${budget ? 'text-ink' : 'text-ink/40 italic'}`}>
                {budget ?? 'Not recorded'}
              </p>
            </div>
          </section>

          <section className="bg-white border border-ink/10 rounded-xl shadow-xs p-6">
            <h2 className="text-[12.5px] uppercase tracking-[0.12em] font-bold text-ink/50 mb-4">
              {requested ? 'They asked to talk' : 'Book a consultation'}
            </h2>

            {/* What the client picked on the website, and the two things an
                admin does about it. Shown before the form, because on a lead
                that asked for a time this is the whole job. */}
            {requested && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-5">
                <p className="text-[14.5px] text-amber-900">
                  <strong className="font-semibold">{nameCase(enquiry.full_name)}</strong> asked for{' '}
                  <strong className="font-semibold">
                    {formatDateTime(requested.scheduled_at)}
                  </strong>{' '}
                  ({requested.duration_minutes} min). Nothing is booked yet and they have not been
                  sent a link.
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() =>
                      void run(async () => {
                        await confirmConsultation(id, requested.id);
                        setPickingTime(false);
                        return `Confirmed for ${formatDateTime(requested.scheduled_at)}. We have emailed ${enquiry.email} with the link.`;
                      })
                    }
                    className="px-4 py-2 text-[12.5px] font-bold rounded uppercase tracking-[0.05em] bg-emerald-100 text-emerald-900 hover:bg-emerald-200 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Check size={14} />
                    Accept this time
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPickedSlot(toLocalInputValue(new Date(requested.scheduled_at)));
                      setPickingTime(true);
                    }}
                    className="px-4 py-2 text-[12.5px] font-bold rounded uppercase tracking-[0.05em] border border-amber-300 text-amber-900 hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    Offer another time
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setPickingTime(true)}
              className="text-[13.5px] text-ink/55 hover:text-gold transition-colors cursor-pointer mb-5 inline-flex items-center gap-1.5"
            >
              <CalendarDays size={14} />
              Open the diary
            </button>

            {/* In a dialog, not in this column. The grid is seven days wide and
                twelve hours tall; in a sidebar it showed two days behind a
                horizontal scrollbar, which is a worse way to answer "is that
                Thursday free?" than not showing it at all.

                The calendar is a convenience, not the rule: an empty cell is a
                suggestion, and the API still refuses a clash on submit. That is
                what keeps two admins in two tabs from double-booking. */}
            <Modal
              open={pickingTime}
              onOpenChange={(next) => {
                setPickingTime(next);
                // Closing abandons the proposal rather than keeping it for the
                // next time the diary opens.
                if (!next) setProposed(null);
              }}
              title="The week's diary"
              description={
                proposed
                  ? 'Check the details, then confirm.'
                  : requested
                    ? 'Showing the week they asked for. Click a free slot to offer it instead.'
                    : 'Click a free slot to book it.'
              }
              size="xl"
            >
              {proposed ? (
                <div className="space-y-5">
                  <div className="bg-canvas border border-ink/10 rounded-lg p-5">
                    <p className="text-[12.5px] uppercase tracking-[0.12em] font-bold text-ink/45 mb-1.5">
                      {requested ? 'Offer this instead' : 'Book this time'}
                    </p>
                    <p className="font-serif text-[22px] text-ink leading-tight">
                      {formatDateTime(proposed.toISOString())}
                    </p>
                    <p className="text-[14.5px] text-ink/55 mt-2">
                      with {nameCase(enquiry.full_name)} · {enquiry.email}
                    </p>
                    {requested && (
                      <p className="text-[14px] text-amber-900 bg-amber-50 border border-amber-200 rounded px-3 py-2 mt-3">
                        They asked for {formatDateTime(requested.scheduled_at)}. Confirming this
                        moves their call, and the email they get will say the new time.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="d-mins" className={label}>
                        Length (minutes)
                      </label>
                      <input
                        id="d-mins"
                        type="number"
                        min={5}
                        max={480}
                        value={proposedMinutes}
                        onChange={(e) => setProposedMinutes(Number(e.target.value))}
                        className={field}
                      />
                    </div>
                    <div>
                      <label htmlFor="d-url" className={label}>
                        Meeting link (optional)
                      </label>
                      <input
                        id="d-url"
                        type="url"
                        value={proposedUrl}
                        onChange={(e) => setProposedUrl(e.target.value)}
                        placeholder="Left blank, Google makes one"
                        title="Google makes the link when this is empty. Paste your own and the call is confirmed without the calendar — useful when Google is unavailable."
                        className={field}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        void run(async () => {
                          const when = proposed.toISOString();
                          const body = {
                            scheduled_at: when,
                            duration_minutes: proposedMinutes,
                            meeting_url: proposedUrl || undefined,
                          };
                          // One endpoint or the other, by whether they asked.
                          // Confirming their request moves it rather than
                          // leaving a stale "requested" beside a new booking.
                          if (requested) await confirmConsultation(id, requested.id, body);
                          else await scheduleConsultation(id, body);
                          setProposed(null);
                          setProposedUrl('');
                          setPickingTime(false);
                          return `Booked for ${formatDateTime(when)} (${proposedMinutes} min). We have emailed ${enquiry.email} with the link.`;
                        })
                      }
                      className="px-5 py-2.5 text-[12.5px] font-bold rounded uppercase tracking-[0.05em] bg-ink text-white hover:bg-gold hover:text-ink transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Check size={14} />
                      {requested ? 'Offer this time' : 'Book it'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setProposed(null)}
                      className="px-5 py-2.5 text-[12.5px] font-bold rounded uppercase tracking-[0.05em] border border-ink/15 text-ink/70 hover:bg-canvas transition-colors cursor-pointer"
                    >
                      Pick another
                    </button>
                  </div>
                </div>
              ) : (
                <AvailabilityGrid
                  currentEnquiryId={id}
                  startOn={requested ? new Date(requested.scheduled_at) : undefined}
                  // A click proposes; the step after it books. The form below
                  // is filled too, so somebody who closes the dialog still has
                  // the time they chose.
                  onPick={(start) => {
                    setPickedSlot(toLocalInputValue(start));
                    setProposed(start);
                  }}
                />
              )}
            </Modal>
            <form
              className="space-y-3"
              onSubmit={(e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                const form = e.currentTarget;
                const data = new FormData(form);
                void run(async () => {
                  const when = new Date(String(data.get('scheduled_at')));
                  const minutes = Number(data.get('duration_minutes')) || 30;
                  await scheduleConsultation(id, {
                    scheduled_at: when.toISOString(),
                    duration_minutes: minutes,
                    meeting_url: String(data.get('meeting_url')) || undefined,
                  });
                  form.reset();
                  setPickedSlot('');
                  // Naming the email matters more than naming the booking: the
                  // client being told is the part the admin cannot see.
                  return `Consultation booked for ${formatDateTime(when.toISOString())} (${minutes} min). We have emailed ${enquiry.email} to confirm.`;
                });
              }}
            >
              <div>
                <label htmlFor="c-when" className={label}>
                  Date and time
                </label>
                <input
                  id="c-when"
                  name="scheduled_at"
                  type="datetime-local"
                  className={field}
                  value={pickedSlot}
                  onChange={(e) => setPickedSlot(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="c-mins" className={label}>
                  Length (minutes)
                </label>
                <input
                  id="c-mins"
                  name="duration_minutes"
                  type="number"
                  min={5}
                  max={480}
                  defaultValue={30}
                  className={field}
                />
              </div>
              <div>
                <label htmlFor="c-url" className={label}>
                  Google Meet link
                </label>
                <input
                  id="c-url"
                  name="meeting_url"
                  type="url"
                  placeholder="https://meet.google.com/…"
                  className={field}
                />
                {/* Says what leaving it blank does, and what filling it in
                    does — the second matters when Google is unavailable,
                    because a pasted link is what gets the booking through. */}
                <p className="text-[12.5px] text-ink/45 mt-1.5">
                  Leave it blank and Google creates one. Paste your own and the call is confirmed
                  without the calendar, which is how to book when Google is unavailable.
                </p>
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-[13.5px] font-bold uppercase tracking-[0.05em] bg-ink text-white hover:bg-gold hover:text-ink transition-colors cursor-pointer disabled:opacity-50"
              >
                <CalendarPlus size={14} />
                Book consultation
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
