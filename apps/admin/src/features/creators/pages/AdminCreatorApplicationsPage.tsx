import { useState } from 'react';
import { Check, ExternalLink, Users, X } from 'lucide-react';

import { Modal } from '@cabmora/ui';

import type { CreatorApplication } from '@/features/creators/api';
import {
  BOTTLENECK_LABEL,
  DISCIPLINE_LABEL,
  STATUS_LABEL,
  STATUS_PILL,
  formatDate,
  readable,
} from '@/features/creators/display';
import {
  useCreatorApplications,
  type StatusFilter,
} from '@/features/creators/hooks/useCreatorApplications';

const CARD = 'bg-white border border-ink/10 rounded-xl shadow-xs';

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'pending', label: 'Awaiting review' },
  { value: 'approved', label: 'Approved' },
  { value: 'declined', label: 'Declined' },
  { value: 'All', label: 'All' },
];

/**
 * The queue of studios asking to join Flow.
 *
 * Approving is the only act in the system that creates a creator, so it is
 * deliberately a considered one: the whole application is on screen — what
 * they shoot, how much they shoot, what is going wrong for them now — rather
 * than a name and a tick. The decision is irreversible from here, which is
 * why the confirm step names the studio back.
 */
export default function AdminCreatorApplicationsPage() {
  const { items, total, error, filters, setFilter, deciding, setupLinks, approve, decline } =
    useCreatorApplications();

  const [declining, setDeclining] = useState<CreatorApplication | null>(null);
  const [note, setNote] = useState('');

  return (
    <div className="max-w-[980px] mx-auto space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-sans font-medium text-ink">Creator applications</h1>
          <p className="text-ink/60 text-[14.5px]">
            Studios asking to deliver their work through Cabmora Flow.
          </p>
        </div>
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter('status', f.value)}
              aria-pressed={filters.status === f.value}
              className={`px-3 py-1.5 rounded-lg text-[13.5px] font-semibold transition-colors cursor-pointer ${
                filters.status === f.value
                  ? 'bg-ink text-canvas'
                  : 'bg-white border border-ink/10 text-ink/60 hover:text-ink'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-800 px-5 py-3 rounded-xl text-[14.5px]"
        >
          {error}
        </div>
      )}

      {items === null ? (
        <p className="text-center py-16 text-ink/50 text-[15.5px]">Loading applications…</p>
      ) : items.length === 0 ? (
        <div className={`${CARD} py-16 text-center`}>
          <Users size={26} className="mx-auto text-ink/20 mb-3" />
          <p className="text-ink/50 text-[14.5px]">
            {filters.status === 'pending'
              ? 'Nothing waiting. Applications from /flow/apply arrive here.'
              : 'No applications with that status.'}
          </p>
        </div>
      ) : (
        <>
          <p className="text-[13.5px] uppercase tracking-[0.1em] text-ink/40">
            {total} application{total === 1 ? '' : 's'}
          </p>

          <ul className="space-y-3">
            {items.map((a) => (
              <li key={a.id} className={`${CARD} p-5`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-[17.5px] font-medium text-ink">{a.studio_name}</h2>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11.5px] font-bold uppercase tracking-[0.05em] ${STATUS_PILL[a.status]}`}
                      >
                        {STATUS_LABEL[a.status]}
                      </span>
                    </div>
                    <p className="text-[14.5px] text-ink/60 mt-0.5">
                      {a.applicant_name} · {a.email}
                    </p>
                  </div>

                  {a.status === 'pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={deciding.includes(a.id)}
                        onClick={() => void approve(a.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gold text-ink text-[13px] font-semibold uppercase tracking-[0.08em] hover:bg-gold-dark transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <Check size={14} />
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={deciding.includes(a.id)}
                        onClick={() => {
                          setNote('');
                          setDeclining(a);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-ink/15 text-ink/70 text-[13px] font-semibold uppercase tracking-[0.08em] hover:bg-canvas transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <X size={14} />
                        Decline
                      </button>
                    </div>
                  )}
                </div>

                {/* What they told us. All of it, because this is what the
                    decision is actually made on. */}
                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-3 mt-4 pt-4 border-t border-ink/8">
                  <Fact label="Discipline" value={readable(DISCIPLINE_LABEL, a.discipline)} />
                  <Fact label="Volume" value={a.annual_volume || '—'} />
                  <Fact label="Storage" value={a.storage_needs || '—'} />
                  <Fact label="Plan chosen" value={a.plan ? a.plan.toUpperCase() : '—'} />
                  <div className="col-span-2">
                    <Fact
                      label="Biggest problem"
                      value={readable(BOTTLENECK_LABEL, a.bottleneck)}
                    />
                  </div>
                  <div className="col-span-2">
                    <dt className="text-[11.5px] uppercase tracking-[0.1em] text-ink/40 mb-0.5">
                      Portfolio
                    </dt>
                    <dd className="text-[14.5px]">
                      {a.portfolio_url ? (
                        <a
                          href={a.portfolio_url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1.5 text-gold hover:text-ink transition-colors break-all"
                        >
                          {a.portfolio_url}
                          <ExternalLink size={12} className="shrink-0" />
                        </a>
                      ) : (
                        <span className="text-ink/40">Not given</span>
                      )}
                    </dd>
                  </div>
                </dl>

                <p className="text-[12.5px] text-ink/35 mt-3">
                  Applied {formatDate(a.created_at)}
                  {a.reviewed_at && ` · decided ${formatDate(a.reviewed_at)}`}
                </p>

                {a.decision_note && (
                  <p className="mt-2 text-[13.5px] text-ink/55 bg-canvas rounded-lg px-3 py-2">
                    <span className="font-medium text-ink/70">Note:</span> {a.decision_note}
                  </p>
                )}

                {setupLinks[a.id] && (
                  <p className="mt-3 text-[13.5px] text-ink/60 bg-canvas rounded-lg px-3 py-2 break-all">
                    <span className="font-medium text-ink/70">Setup link</span> — emailed to them,
                    shown here once in case it did not arrive:{' '}
                    <span className="font-mono">{setupLinks[a.id]}</span>
                  </p>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {declining && (
        <Modal
          open
          onOpenChange={(next) => {
            if (!next) setDeclining(null);
          }}
          size="sm"
          chrome="minimal"
          title="Decline application"
        >
          <div className="p-8">
            <h2 className="font-serif text-[21.5px] text-ink mb-2">
              Decline {declining.studio_name}?
            </h2>
            <p className="text-[14.5px] text-ink/60 leading-relaxed mb-5">
              They will be told we are not taking them on, in the same wording every declined studio
              receives. Your note stays with us.
            </p>

            <label
              htmlFor="decline-note"
              className="text-[12.5px] uppercase tracking-[0.1em] font-bold text-ink/50 block mb-1.5"
            >
              Why (optional)
            </label>
            <textarea
              id="decline-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Portfolio is strong but we are full this quarter."
              className="w-full bg-canvas border border-ink/15 rounded-lg px-3 py-2 text-[14.5px] outline-none focus:border-gold transition-colors resize-none"
            />

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setDeclining(null)}
                className="px-4 py-2 rounded-lg border border-ink/15 text-ink/70 text-[13.5px] font-semibold uppercase tracking-[0.08em] hover:bg-canvas transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  void decline(declining.id, note.trim() || undefined);
                  setDeclining(null);
                }}
                className="px-4 py-2 rounded-lg bg-ink text-canvas text-[13.5px] font-semibold uppercase tracking-[0.08em] hover:bg-ink/85 transition-colors cursor-pointer"
              >
                Decline
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11.5px] uppercase tracking-[0.1em] text-ink/40 mb-0.5">{label}</dt>
      <dd className="text-[14.5px] text-ink/80">{value}</dd>
    </div>
  );
}
