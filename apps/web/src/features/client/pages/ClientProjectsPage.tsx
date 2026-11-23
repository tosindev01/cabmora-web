import { useEffect, useMemo, useState } from 'react';
import { FolderOpen } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import { ApiError } from '@cabmora/api-client';

import { ClientPortalShell } from '@/features/client/components/ClientPortalShell';
import { ClientProjectCard } from '@/features/client/components/ClientProjectCard';
import { listMyProjects, type ClientProject } from '@/features/client/api';
import { PROJECT_FILTERS, filterBySlug, matchesFilter } from '@/features/client/data';

/**
 * Every project this client has with us.
 *
 * A list rather than a single project, because a client can come back — a
 * wedding, then a christening, then an anniversary. `GET /projects` returns
 * only theirs, scoped by the session, and only once a project has left draft.
 *
 * The slice on show lives in `?show=`, not in component state, so the
 * dashboard's "In progress" tile can link straight to it — and so the link
 * behaves like one: new tab, reload, bookmark and the back button all work.
 */
export default function ClientProjectsPage() {
  const [projects, setProjects] = useState<ClientProject[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useSearchParams();

  const filter = filterBySlug(params.get('show'));

  useEffect(() => {
    let cancelled = false;
    listMyProjects()
      .then((page) => !cancelled && setProjects(page.items))
      .catch((err: unknown) => {
        if (!cancelled)
          setError(err instanceof ApiError ? err.message : 'Could not load your projects.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const all = projects ?? [];

  /* Counted over everything, so a tab can show zero and still be reachable.
     Hiding an empty tab would mean the dashboard's "Waiting on you: 0" tile
     led to a tab that was not there. */
  const counts = useMemo(() => {
    const totals = new Map<string, number>();
    for (const f of PROJECT_FILTERS) {
      totals.set(f.slug, all.filter((p) => matchesFilter(p.stage, f)).length);
    }
    return totals;
  }, [all]);

  const shown = all.filter((p) => matchesFilter(p.stage, filter));

  return (
    <ClientPortalShell title="Your projects" subtitle={filter.description}>
      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-800 px-5 py-3 rounded-xl text-[13px] mb-6"
        >
          {error}
        </div>
      )}

      {/* `replace`, so stepping through four tabs does not leave four entries
          in the history for the back button to walk out of one at a time. */}
      {projects !== null && all.length > 0 && (
        <div
          role="tablist"
          aria-label="Filter your projects"
          className="flex flex-wrap items-center gap-2 mb-6"
        >
          {PROJECT_FILTERS.map((f) => {
            const current = f.slug === filter.slug;
            return (
              <button
                key={f.slug}
                type="button"
                role="tab"
                aria-selected={current}
                onClick={() =>
                  setParams(f.slug === 'all' ? {} : { show: f.slug }, { replace: true })
                }
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold tracking-[0.04em] uppercase border transition-colors cursor-pointer ${
                  current
                    ? 'bg-ink text-canvas border-ink'
                    : 'bg-white text-ink/60 border-ink/15 hover:border-gold hover:text-ink'
                }`}
              >
                {f.label}
                <span className={`tabular-nums ${current ? 'text-canvas/60' : 'text-ink/35'}`}>
                  {counts.get(f.slug) ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {projects === null ? (
        <p className="text-ink/50 text-[14px] py-12">Loading your projects…</p>
      ) : all.length === 0 ? (
        <div className="border border-ink/10 bg-white rounded-xl p-12 text-center">
          <FolderOpen size={28} className="mx-auto mb-4 text-gold" strokeWidth={1.5} />
          <p className="font-serif text-[20px] mb-2">Nothing here yet</p>
          <p className="text-[14px] text-ink/55 max-w-[420px] mx-auto">
            When we book your shoot it will appear here, and you can follow it through to your final
            gallery.
          </p>
        </div>
      ) : shown.length === 0 ? (
        /* Distinct from having no projects at all. "Nothing here yet" over a
           filtered empty list reads as everything having vanished. */
        <div className="border border-ink/10 bg-white rounded-xl p-12 text-center">
          <p className="font-serif text-[20px] mb-2">Nothing in this view</p>
          <p className="text-[14px] text-ink/55 max-w-[420px] mx-auto">
            You have {all.length} {all.length === 1 ? 'project' : 'projects'} with us — none of them
            are {filter.label.toLowerCase()} right now.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {shown.map((project) => (
            <ClientProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </ClientPortalShell>
  );
}
