import { formatMinor, nameCase, sentenceCase } from '@/shared/format';
import { describeEvent } from '@/features/projects/timeline';
import { ProjectPayments } from '@/features/projects/components/ProjectPayments';
import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  CreditCard,
  History,
  Images,
  Info,
  Mail,
  MessageCircle,
  MessageSquare,
  Pencil,
  Phone,
  Settings2,
  Users,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { ApiError } from '@cabmora/api-client';
import { Modal, Select } from '@cabmora/ui';

import { ProjectFeedback } from '@/features/projects/components/ProjectFeedback';
import { ProjectTeam } from '@/features/projects/components/ProjectTeam';
import { useAdminAuth } from '@/shared/auth';
import { ProjectGallery } from '@/features/projects/components/ProjectGallery';
import { useProjectFeedback } from '@/features/projects/hooks/useProjectFeedback';
import {
  CURRENCIES,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABEL,
  changeStage,
  getProject,
  listEventTypes,
  updateProject,
  type PaymentMethod,
  type ProjectDetail,
  type ProjectStage,
  type ReleaseMode,
  type WatermarkPolicy,
} from '@/features/projects/api';
import {
  RELEASE_EFFECT,
  RELEASE_LABEL,
  STAGE_LABEL,
  STAGE_PILL,
  WATERMARK_EFFECT,
  WATERMARK_LABEL,
  accentFor,
  formatDate,
  projectMonogram,
} from '@/features/projects/display';

type Tab = 'details' | 'settings' | 'team' | 'timeline' | 'galleries' | 'feedback' | 'payments';

/** `adminOnly` mirrors the endpoint behind the tab — `PUT .../members` is
 *  admin-guarded, deliberately: a coordinator who could add themselves to a
 *  project could reach every client in the system. */
const TABS: { id: Tab; label: string; icon: typeof Info; built: boolean; adminOnly?: boolean }[] = [
  { id: 'details', label: 'Details', icon: Info, built: true },
  { id: 'settings', label: 'Delivery settings', icon: Settings2, built: true },
  { id: 'team', label: 'Team', icon: Users, built: true, adminOnly: true },
  { id: 'timeline', label: 'Timeline', icon: History, built: true },
  { id: 'galleries', label: 'Galleries', icon: Images, built: true },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare, built: true },
  { id: 'payments', label: 'Payments', icon: CreditCard, built: true },
];

/**
 * One project, with settings and payments in the same place because they
 * decide the same thing between them: when the client gets the work.
 *
 * Galleries is where photographs are uploaded; they go straight to storage and
 * never through the API. Payments shows what has been billed against this
 * project and confirms the money that arrives — which matters more here than
 * it reads, since settling a balance is what lifts the watermark.
 */
export default function AdminProjectDetailPage() {
  const { id = '' } = useParams();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [tab, setTab] = useState<Tab>('details');
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editingMoney, setEditingMoney] = useState(false);
  /* The categories in use, for the picker above. Fetched here rather than
     with the project: it is a tiny query and it has to be current, because
     somebody may have invented one on another project a minute ago. */
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  useEffect(() => {
    let cancelled = false;
    listEventTypes()
      .then((types) => !cancelled && setEventTypes(types))
      // Without suggestions the field still accepts typing, which is the part
      // that matters.
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);
  const isAdmin = useAdminAuth().staff?.role === 'admin';
  const visibleTabs = TABS.filter((t) => isAdmin || !t.adminOnly);
  // Loaded at page level so the tab can carry the outstanding count: a change
  // request nobody clicks through to find is the bug this view exists to fix.
  const feedback = useProjectFeedback(id);
  // Settled drives the watermark now, so the summary has to read the money
  // rather than the sign-off. Same rule the API applies: nothing billed is
  // not paid, and an overpayment still settles it.
  const settled = Boolean(
    project?.summary && project.summary.billed_minor > 0 && project.summary.outstanding_minor === 0,
  );

  // Named rather than inline in the effect, because uploading needs to
  // re-read the project afterwards and two copies of this would drift.
  const load = useCallback(async () => {
    try {
      setProject(await getProject(id));
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) setNotFound(true);
      else setError(err instanceof ApiError ? err.message : 'Could not load this project.');
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  /* The stage is published with `allowed_next_stages`, so the control offers
     only moves the API will accept — and takes the project back from the
     response rather than guessing, since a refused transition must not leave
     the page showing one that never happened. A stage change writes a
     timeline event, so the whole record is refetched rather than merged. */
  const moveStage = useCallback(
    async (stage: ProjectStage) => {
      setBusy(true);
      setError(null);
      try {
        await changeStage(id, stage);
        setProject(await getProject(id));
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Could not change the stage.');
      } finally {
        setBusy(false);
      }
    },
    [id],
  );

  const patch = useCallback(
    async (changes: Record<string, unknown>) => {
      setBusy(true);
      setError(null);
      try {
        const updated = await updateProject(id, changes);
        // Merge rather than replace: PATCH returns the project without its
        // events, and dropping the timeline on every settings change would
        // empty a tab the user can see.
        setProject((prev) => (prev ? { ...prev, ...updated } : prev));
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Could not save that change.');
      } finally {
        setBusy(false);
      }
    },
    [id],
  );

  if (notFound) {
    return (
      <div className="max-w-[720px] mx-auto text-center py-20">
        <h1 className="text-[24px] font-sans font-medium text-ink mb-2">Project not found</h1>
        <Link
          to="/admin/projects"
          className="text-[13.5px] font-bold uppercase tracking-[0.05em] text-gold hover:text-ink"
        >
          Back to projects
        </Link>
      </div>
    );
  }

  if (!project) {
    return <p className="text-center py-20 text-ink/50 text-[15.5px]">Loading project…</p>;
  }

  const field =
    'bg-canvas border border-ink/15 pl-3 pr-3 py-2 text-[14.5px] outline-none focus:border-gold rounded-lg w-full';
  const legend = 'text-[12.5px] uppercase tracking-[0.1em] font-bold text-ink/50 block mb-1.5';

  return (
    <div className="max-w-[980px] mx-auto space-y-6">
      <Link
        to="/admin/projects"
        className="inline-flex items-center gap-2 text-[13.5px] font-bold uppercase tracking-[0.05em] text-ink/60 hover:text-gold transition-colors"
      >
        <ArrowLeft size={16} />
        Projects
      </Link>

      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-800 px-5 py-3 rounded-xl text-[14.5px]"
        >
          {error}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-ink/10 rounded-xl shadow-xs overflow-hidden">
        {/* Same designed empty state as the card: a lens motif, an anchored
            monogram and a caption saying why there is no photograph, rather
            than a flat block that reads as a stalled image load. */}
        <div className={`relative h-32 overflow-hidden ${accentFor(project.id)}`}>
          <div className="absolute inset-0 bg-gradient-to-tr from-noir/25 via-transparent to-canvas/15" />
          <svg
            aria-hidden
            viewBox="0 0 100 100"
            className="absolute -right-6 -bottom-10 w-44 h-44 text-canvas/12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="50" cy="50" r="34" />
            <circle cx="50" cy="50" r="22" />
            <circle cx="50" cy="50" r="10" />
            <path d="M50 16 L50 84 M16 50 L84 50 M26 26 L74 74 M74 26 L26 74" />
          </svg>
          <span
            aria-hidden
            className="absolute left-6 bottom-5 font-serif text-[34px] leading-none text-canvas/95 select-none"
          >
            {projectMonogram(project.title)}
          </span>
          <span className="absolute right-6 bottom-5 text-[10.5px] uppercase tracking-[0.18em] text-canvas/45">
            No media yet
          </span>
        </div>
        <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-[24px] font-sans font-medium text-ink truncate">
              {sentenceCase(project.title)}
            </h1>
            <p className="text-ink/60 text-[14.5px] truncate">
              {project.event_type}
              {project.location ? ` · ${project.location}` : ''}
              {project.customer_name ? ` · ${project.customer_name}` : ' · No client yet'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full text-[11.5px] font-bold uppercase tracking-[0.05em] whitespace-nowrap ${STAGE_PILL[project.stage]}`}
            >
              {STAGE_LABEL[project.stage]}
            </span>

            {/* A dropdown of every stage, not a button per legal move. The
                transition rules were opened up so an admin can set whatever is
                true — backfilling a wedding that already happened used to mean
                clicking through four stages that never applied.

                Options still come from `allowed_next_stages` rather than the
                local label map: the API decides what is offerable, and a
                second list here would be a second rule that drifts. */}
            <label className="sr-only" htmlFor="project-stage">
              Change stage
            </label>
            <Select
              id="project-stage"
              value=""
              disabled={busy}
              onChange={(event) => {
                const next = event.target.value as ProjectStage;
                if (next) void moveStage(next);
              }}
              className="text-[11px] tracking-[0.05em] uppercase font-semibold text-ink/70 border border-ink/15 rounded-full pl-3 pr-8 py-1.5 bg-white hover:border-ink hover:text-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {/* Resets to this after each change, so the control reads as an
                  action rather than claiming to show the current stage — the
                  pill beside it already does that. */}
              <option value="">Change stage…</option>
              {project.allowed_next_stages.map((next) => (
                <option key={next} value={next}>
                  {STAGE_LABEL[next]}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-ink/10 flex gap-1 overflow-x-auto">
        {visibleTabs.map(({ id: tabId, label, icon: Icon, built }) => (
          <button
            key={tabId}
            type="button"
            onClick={() => setTab(tabId)}
            aria-current={tab === tabId ? 'page' : undefined}
            className={`px-4 py-2.5 text-[13.5px] font-semibold tracking-[0.03em] whitespace-nowrap border-b-2 -mb-px transition-colors cursor-pointer inline-flex items-center gap-2 ${
              tab === tabId
                ? 'border-gold text-ink'
                : 'border-transparent text-ink/50 hover:text-ink'
            }`}
          >
            <Icon size={14} />
            {label}
            {tabId === 'feedback' && feedback.outstanding > 0 && (
              <span
                className="text-[10.5px] font-bold bg-gold text-white min-w-[16px] h-4 px-1 rounded-full grid place-items-center"
                aria-label={`${feedback.outstanding} outstanding`}
              >
                {feedback.outstanding}
              </span>
            )}
            {!built && (
              <span className="text-[10.5px] uppercase tracking-[0.08em] bg-ink/10 text-ink/50 px-1.5 py-0.5 rounded">
                soon
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Details */}
      {tab === 'details' && (
        <div className="bg-white border border-ink/10 rounded-xl shadow-xs p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label htmlFor="p-title" className={legend}>
              Title
            </label>
            <input
              id="p-title"
              className={field}
              defaultValue={sentenceCase(project.title)}
              disabled={busy}
              onBlur={(e) =>
                e.target.value !== project.title && void patch({ title: e.target.value })
              }
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="p-desc" className={legend}>
              Description
            </label>
            <textarea
              id="p-desc"
              rows={3}
              className={field}
              defaultValue={project.description}
              disabled={busy}
              onBlur={(e) =>
                e.target.value !== project.description &&
                void patch({ description: e.target.value })
              }
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="p-type" className={legend}>
              Category
            </label>
            {/* Suggests without constraining, like the create modal. Picking
                an existing one keeps the spelling consistent; typing a new one
                is how a category gets created — there is no list to manage,
                because the categories are simply whatever projects use. */}
            <input
              id="p-type"
              list="p-type-options"
              className={field}
              defaultValue={project.event_type}
              disabled={busy}
              autoComplete="off"
              onBlur={(e) => {
                const next = e.target.value.trim();
                // An empty category is not a category, and the API requires
                // one — put the old value back rather than sending a refusal.
                if (!next) {
                  e.target.value = project.event_type;
                  return;
                }
                if (next !== project.event_type) void patch({ event_type: next });
              }}
            />
            <datalist id="p-type-options">
              {eventTypes.map((type) => (
                <option key={type} value={type} />
              ))}
            </datalist>
          </div>
          <div>
            <span className={legend}>Assigned creator</span>
            <p className="text-[14.5px] text-ink">{project.creator_name ?? 'Cabmora (in-house)'}</p>
          </div>
          <div>
            <span className={legend}>Event date</span>
            <p className="text-[14.5px] text-ink">{formatDate(project.event_date)}</p>
          </div>
          <div>
            <span className={legend}>Deadline</span>
            <p className="text-[14.5px] text-ink">{formatDate(project.deadline)}</p>
          </div>

          {/* The client, with the ways to reach them. Read from their account
              rather than stored here, so somebody who changes their number
              changes it once. Each one is a real link: an admin reading this
              page is usually about to ring or message them. */}
          <div className="sm:col-span-2 border-t border-ink/10 pt-5">
            <span className={legend}>Client</span>
            {project.customer_name ? (
              <>
                <p className="text-[16px] text-ink">{nameCase(project.customer_name)}</p>
                <div className="flex flex-wrap gap-x-6 gap-y-1.5 mt-2">
                  {project.customer_email && (
                    <a
                      href={`mailto:${project.customer_email}`}
                      className="text-[13.5px] text-ink/70 hover:text-gold transition-colors inline-flex items-center gap-1.5"
                    >
                      <Mail size={13} className="text-gold" />
                      {project.customer_email}
                    </a>
                  )}
                  {project.customer_phone && (
                    <a
                      href={`tel:${project.customer_phone.replace(/\s/g, '')}`}
                      className="text-[13.5px] text-ink/70 hover:text-gold transition-colors inline-flex items-center gap-1.5"
                    >
                      <Phone size={13} className="text-gold" />
                      {project.customer_phone}
                    </a>
                  )}
                  {project.customer_whatsapp && (
                    <a
                      href={`https://wa.me/${project.customer_whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[13.5px] text-ink/70 hover:text-gold transition-colors inline-flex items-center gap-1.5"
                    >
                      <MessageCircle size={13} className="text-gold" />
                      {project.customer_whatsapp}
                    </a>
                  )}
                </div>
                {!project.customer_phone && !project.customer_whatsapp && (
                  <p className="text-[13px] text-ink/40 mt-2">No phone number on their account.</p>
                )}
              </>
            ) : (
              <p className="text-[14.5px] text-ink/40 italic">Not assigned yet</p>
            )}
          </div>

          {/* What the job costs and how it gets paid. Intent, not money that
              has moved — what has actually been invoiced and received is on
              the Payments tab. */}
          <div className="sm:col-span-2 border-t border-ink/10 pt-5 flex flex-wrap items-end justify-between gap-4">
            <div className="flex gap-10">
              <div>
                <span className={legend}>Price</span>
                <p
                  className={`text-[20px] font-serif ${
                    project.price_minor === null ? 'text-ink/35 italic' : 'text-ink'
                  }`}
                >
                  {project.price_minor === null
                    ? 'Not agreed'
                    : formatMinor(project.price_minor, project.currency)}
                </p>
              </div>
              <div>
                <span className={legend}>Paying by</span>
                <p
                  className={`text-[14.5px] ${
                    project.payment_method ? 'text-ink' : 'text-ink/35 italic'
                  }`}
                >
                  {project.payment_method
                    ? PAYMENT_METHOD_LABEL[project.payment_method]
                    : 'Not decided'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEditingMoney(true)}
              className="text-[13px] text-ink/55 hover:text-gold transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <Pencil size={14} />
              Edit price
            </button>
          </div>
        </div>
      )}

      {/* Price in pounds, stored in pence. The conversion happens here and
          nowhere else: a number that is sometimes major and sometimes minor
          is how an invoice ends up a hundred times too big. */}
      <Modal
        open={editingMoney}
        onOpenChange={setEditingMoney}
        title="Price and payment"
        description="What the job costs and how this client is expected to pay. Change it whenever it changes — a quote is not a contract."
        size="sm"
      >
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const pounds = String(data.get('price') ?? '').trim();
            const method = String(data.get('payment_method') ?? '');
            void patch({
              price_minor: pounds === '' ? null : Math.round(Number(pounds) * 100),
              currency: String(data.get('currency') ?? '') || undefined,
              payment_method: (method || null) as PaymentMethod | null,
            }).then(() => setEditingMoney(false));
          }}
        >
          <div>
            <label htmlFor="p-price" className={legend}>
              Price
            </label>
            <input
              id="p-price"
              name="price"
              type="number"
              min={0}
              step="0.01"
              className={field}
              defaultValue={project.price_minor === null ? '' : project.price_minor / 100}
              placeholder="Not agreed"
            />
            <p className="text-[12px] text-ink/40 mt-1.5">
              Leave empty if it has not been agreed. That is not the same as free.
            </p>
          </div>

          {/* Per project, not per client. A studio shooting abroad bills that
              job in the local currency and the rest in sterling — and before
              this the price had no currency at all, so 150000 could have been
              pounds or dollars and nothing recorded which. Any invoice raised
              for this project inherits whatever is chosen here. */}
          <div>
            <label htmlFor="p-currency" className={legend}>
              Billed in
            </label>
            <Select
              id="p-currency"
              name="currency"
              className={`${field} pr-9`}
              defaultValue={project.currency}
            >
              {CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </Select>
            <p className="text-[12px] text-ink/40 mt-1.5">
              Invoices for this project are raised in this currency.
            </p>
          </div>

          <div>
            <label htmlFor="p-method" className={legend}>
              Paying by
            </label>
            <Select
              id="p-method"
              name="payment_method"
              className={`${field} pr-9`}
              defaultValue={project.payment_method ?? ''}
            >
              <option value="">Not decided</option>
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {PAYMENT_METHOD_LABEL[method]}
                </option>
              ))}
            </Select>
            <p className="text-[12px] text-ink/40 mt-1.5">
              What you expect. What actually arrives is recorded against each payment.
            </p>
          </div>

          <div className="flex items-center gap-2 border-t border-ink/10 pt-4">
            <button
              type="submit"
              disabled={busy}
              className="px-5 py-2.5 text-[12px] font-bold rounded-full uppercase tracking-[0.05em] bg-ink text-white hover:bg-gold hover:text-ink transition-colors cursor-pointer disabled:opacity-50"
            >
              {busy ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setEditingMoney(false)}
              className="px-5 py-2.5 text-[12px] font-bold rounded-full uppercase tracking-[0.05em] border border-ink/15 text-ink/70 hover:bg-canvas transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Delivery settings */}
      {tab === 'settings' && (
        <div className="space-y-5">
          {/* What this project's settings add up to, in a sentence. The four
              controls below are each clear on their own and say nothing about
              what they mean together, which is the question somebody opening
              this tab actually has. */}
          <div className="bg-ink text-canvas rounded-xl p-5">
            <p className="text-[11.5px] uppercase tracking-[0.14em] text-gold font-medium mb-2">
              What the client will see
            </p>
            <p className="text-[15px] leading-relaxed text-canvas/85">
              {project.release_mode === 'all_at_once'
                ? 'Releasing any photograph shows them every photograph on this project. '
                : 'They see only the photographs you release, when you release them. '}
              {project.watermark_policy === 'always'
                ? 'All of them stay watermarked, so the originals never reach them here.'
                : project.watermark_policy === 'never'
                  ? 'They are the originals, unmarked, from the first release.'
                  : settled
                    ? 'The invoice is settled, so they are seeing the unmarked originals.'
                    : 'They stay watermarked until the invoice is settled, then become the originals automatically.'}
              {project.require_payment_before_delivery && !settled
                ? ' Nothing is visible to them at all until the balance is paid.'
                : ''}
              {project.allow_client_sharing
                ? ' They can hand out a link to this gallery, and whoever opens it sees exactly the same thing.'
                : ''}
            </p>
          </div>

          <div className="bg-white border border-ink/10 rounded-xl shadow-xs p-6 space-y-7">
            {/* Options as rows, not a dropdown. A select shows the help for
                the one already chosen and hides what the others would do —
                which is the only thing you need when you are deciding. */}
            <fieldset>
              <legend className={legend}>Watermarking</legend>
              <p className="text-[13.5px] text-ink/50 mb-3">
                Whether the client is handed the real file or a marked copy.
              </p>
              <div className="space-y-2">
                {(Object.keys(WATERMARK_LABEL) as WatermarkPolicy[]).map((policy) => {
                  const on = project.watermark_policy === policy;
                  return (
                    <label
                      key={policy}
                      className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                        on ? 'border-gold bg-gold/5' : 'border-ink/10 hover:border-ink/25'
                      }`}
                    >
                      <input
                        type="radio"
                        name="watermark"
                        className="mt-0.5 accent-gold"
                        checked={on}
                        disabled={busy}
                        onChange={() => void patch({ watermark_policy: policy })}
                      />
                      <span className="min-w-0">
                        <span className="text-[14.5px] text-ink font-medium block">
                          {WATERMARK_LABEL[policy]}
                        </span>
                        <span className="text-[13.5px] text-ink/55 block mt-0.5">
                          {WATERMARK_EFFECT[policy]}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="border-t border-ink/10 pt-6">
              <legend className={legend}>Gallery release</legend>
              <p className="text-[13.5px] text-ink/50 mb-3">
                How much becomes visible when you release something.
              </p>
              <div className="space-y-2">
                {(Object.keys(RELEASE_LABEL) as ReleaseMode[]).map((mode) => {
                  const on = project.release_mode === mode;
                  return (
                    <label
                      key={mode}
                      className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                        on ? 'border-gold bg-gold/5' : 'border-ink/10 hover:border-ink/25'
                      }`}
                    >
                      <input
                        type="radio"
                        name="release"
                        className="mt-0.5 accent-gold"
                        checked={on}
                        disabled={busy}
                        onChange={() => void patch({ release_mode: mode })}
                      />
                      <span className="min-w-0">
                        <span className="text-[14.5px] text-ink font-medium block">
                          {RELEASE_LABEL[mode]}
                        </span>
                        <span className="text-[13.5px] text-ink/55 block mt-0.5">
                          {RELEASE_EFFECT[mode]}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="border-t border-ink/10 pt-6 space-y-3">
              <legend className={legend}>Before final delivery</legend>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 accent-gold"
                  checked={project.require_payment_before_delivery}
                  disabled={busy}
                  onChange={(e) =>
                    void patch({ require_payment_before_delivery: e.target.checked })
                  }
                />
                <span>
                  <span className="text-[14.5px] text-ink font-medium block">
                    Hold the gallery until the balance is paid
                  </span>
                  <span className="text-[13.5px] text-ink/55">
                    Stronger than the watermark setting, and a different thing: watermarking decides
                    what they are handed, this decides whether they are handed anything. With it on,
                    an unpaid client sees the project but no photographs at all.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 accent-gold"
                  checked={project.require_approval_before_delivery}
                  disabled={busy}
                  onChange={(e) =>
                    void patch({ require_approval_before_delivery: e.target.checked })
                  }
                />
                <span>
                  <span className="text-[14.5px] text-ink font-medium block">
                    Require the client to approve the work
                  </span>
                  {/* Still the honest answer. Approval is recorded and it
                      moves the project to Delivered, but since the watermark
                      moved onto payment nothing refuses a delivery for want
                      of a sign-off. */}
                  <span className="text-[13.5px] text-amber-800">
                    Recorded, and not enforced. Approval is kept as the record of who signed off,
                    but nothing is withheld for the want of it.
                  </span>
                </span>
              </label>
            </fieldset>

            <fieldset className="border-t border-ink/10 pt-6 space-y-3">
              <legend className={legend}>Downloads</legend>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 accent-gold"
                  checked={project.allow_downloads}
                  disabled={busy}
                  onChange={(e) => void patch({ allow_downloads: e.target.checked })}
                />
                <span>
                  <span className="text-[14.5px] text-ink font-medium block">
                    Let the client download what they can see
                  </span>
                  <span className="text-[13.5px] text-ink/55">
                    Off by default — a gallery is for looking at. This decides whether a save button
                    appears at all; the watermark setting above still decides which file is behind
                    it, so with downloads on and the job unpaid they save the watermarked copy, not
                    the original.
                  </span>
                </span>
              </label>
            </fieldset>

            <fieldset className="border-t border-ink/10 pt-6 space-y-3">
              <legend className={legend}>Sharing</legend>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 accent-gold"
                  checked={project.allow_client_sharing}
                  disabled={busy}
                  onChange={(e) => void patch({ allow_client_sharing: e.target.checked })}
                />
                <span>
                  <span className="text-[14.5px] text-ink font-medium block">
                    Let the client share a link to this gallery
                  </span>
                  <span className="text-[13.5px] text-ink/55">
                    Anybody holding the link can see the photographs without an account. Links
                    expire after 30 days and the client can take one back at any time. The watermark
                    setting above applies to them exactly as it does to the client, so nothing
                    unmarked goes out before the job is paid for.
                  </span>
                </span>
              </label>
            </fieldset>
          </div>
        </div>
      )}

      {/* Timeline */}
      {tab === 'timeline' && (
        <div className="bg-white border border-ink/10 rounded-xl shadow-xs p-6">
          <ol className="space-y-4">
            {project.events.map((event) => {
              const entry = describeEvent(event);
              return (
                <li key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <span className="w-2 h-2 rounded-full bg-gold mt-1.5" />
                    <span className="w-px flex-1 bg-ink/10" />
                  </div>
                  <div className="pb-2 min-w-0">
                    <p className="text-[14.5px] text-ink font-medium">{entry.title}</p>
                    {entry.detail && (
                      <p className="text-[13.5px] text-ink/55 break-words">{entry.detail}</p>
                    )}
                    <p className="text-[12.5px] text-ink/40">
                      {new Date(event.occurred_at).toLocaleString('en-GB')}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* `load` re-reads the project, so the checkboxes reflect what the
          server stored rather than what was clicked. */}
      {tab === 'team' && isAdmin && <ProjectTeam project={project} onSaved={load} />}

      {tab === 'galleries' && (
        <ProjectGallery
          project={project}
          comments={feedback.comments ?? []}
          onResolveComment={feedback.resolve}
          onUploaded={load}
        />
      )}

      {tab === 'feedback' && <ProjectFeedback feedback={feedback} />}

      {/* Not built yet — named, empty, and honest about why. */}
      {tab === 'payments' && <ProjectPayments project={project} onConfirmed={load} />}
    </div>
  );
}
