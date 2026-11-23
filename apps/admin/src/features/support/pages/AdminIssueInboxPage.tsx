import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, CircleDot, Clock, LifeBuoy } from 'lucide-react';

import { ApiError, supportApi, type AdminIssue, type IssueStatus } from '@cabmora/api-client';

type Filter = IssueStatus | 'all';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'open', label: 'Open' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'all', label: 'Everything' },
];

const STATUS: Record<IssueStatus, { label: string; pill: string; icon: typeof CircleDot }> = {
  open: { label: 'Open', pill: 'bg-amber-50 text-amber-900', icon: CircleDot },
  in_progress: { label: 'In progress', pill: 'bg-blue-50 text-blue-900', icon: Clock },
  resolved: { label: 'Resolved', pill: 'bg-emerald-50 text-emerald-800', icon: CheckCircle2 },
};

/** What a reader can do next, given where the report is. */
const NEXT: Record<IssueStatus, IssueStatus[]> = {
  open: ['in_progress', 'resolved'],
  in_progress: ['resolved', 'open'],
  // Resolved is not final: something reported fixed and still broken has to be
  // able to come back, which is why the entity allows it too.
  resolved: ['open'],
};

function when(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Everything anyone has reported as broken.
 *
 * Administrators only: the inbox is not one of the grantable sections, so a
 * coordinator cannot reach it without widening the permission union. Worth
 * revisiting once somebody other than an admin is triaging.
 */
export default function AdminIssueInboxPage() {
  const [filter, setFilter] = useState<Filter>('open');
  const [issues, setIssues] = useState<AdminIssue[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setIssues(await supportApi.listIssues(filter === 'all' ? {} : { status: filter }));
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'The inbox could not be loaded.');
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function move(issue: AdminIssue, status: IssueStatus) {
    setBusy(issue.id);
    try {
      await supportApi.updateIssue(issue.id, status);
      await load();
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'That could not be updated.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <LifeBuoy size={22} className="text-gold" />
          <h1 className="font-serif text-[28px] text-ink">Reported issues</h1>
        </div>
        <p className="text-[14px] text-ink/50 mb-8">
          What customers, creators and staff have told us is broken.
        </p>

        <div className="flex flex-wrap gap-2 mb-8">
          {FILTERS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setFilter(option.id)}
              aria-pressed={filter === option.id}
              className={`text-[11px] tracking-[0.12em] uppercase font-medium px-4 py-2.5 border transition-colors ${
                filter === option.id
                  ? 'bg-ink text-canvas border-ink'
                  : 'bg-white text-ink/60 border-ink/12 hover:border-ink/30'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {error && (
          <p role="alert" className="text-[13px] text-red-700 mb-6">
            {error}
          </p>
        )}

        {issues === null && <p className="text-[14px] text-ink/45">Loading…</p>}

        {issues?.length === 0 && (
          <p className="text-[14px] text-ink/45 bg-white border border-ink/8 p-8 text-center">
            Nothing here. {filter === 'open' ? 'No open reports.' : 'No reports match that.'}
          </p>
        )}

        <div className="space-y-3">
          {issues?.map((issue) => {
            const badge = STATUS[issue.status];
            const Icon = badge.icon;
            return (
              <article key={issue.id} className="bg-white border border-ink/8 p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h2 className="font-serif text-[18px] text-ink leading-snug">
                    {issue.summary}
                  </h2>
                  <span
                    className={`shrink-0 inline-flex items-center gap-1.5 text-[10px] tracking-[0.12em] uppercase font-semibold px-2.5 py-1 rounded ${badge.pill}`}
                  >
                    <Icon size={12} />
                    {badge.label}
                  </span>
                </div>

                {/* `pre-line`, because somebody describing a bug uses line
                    breaks and flattening them turns steps into a paragraph. */}
                <p className="text-[14px] leading-[1.7] text-ink/70 whitespace-pre-line mb-4">
                  {issue.detail}
                </p>

                <dl className="flex flex-wrap gap-x-6 gap-y-1 text-[12px] text-ink/45 mb-4">
                  <div className="flex gap-1.5">
                    <dt>From</dt>
                    <dd className="text-ink/65">
                      {issue.reporter_name} ({issue.reporter_email})
                    </dd>
                  </div>
                  <div className="flex gap-1.5">
                    <dt>When</dt>
                    <dd className="text-ink/65">{when(issue.created_at)}</dd>
                  </div>
                  {issue.page_path && (
                    <div className="flex gap-1.5">
                      <dt>Page</dt>
                      <dd className="text-ink/65 font-mono">{issue.page_path}</dd>
                    </div>
                  )}
                </dl>

                {issue.resolution && (
                  <p className="text-[13px] text-emerald-800 bg-emerald-50 px-4 py-3 mb-4">
                    {issue.resolution}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {NEXT[issue.status].map((target) => (
                    <button
                      key={target}
                      type="button"
                      disabled={busy === issue.id}
                      onClick={() => void move(issue, target)}
                      className="text-[10.5px] tracking-[0.12em] uppercase font-medium border border-ink/15 px-4 py-2 hover:border-ink hover:bg-ink hover:text-canvas transition-colors disabled:opacity-40"
                    >
                      {target === 'open' ? 'Reopen' : `Mark ${STATUS[target].label}`}
                    </button>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
