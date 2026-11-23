import { useEffect, useState } from 'react';
import { ArrowRight, Check, FolderOpen, Video, X } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ApiError, collaborationApi, type ProjectCallDto } from '@cabmora/api-client';
import { nameCase, sentenceCase } from '@cabmora/ui';

import { ClientPortalShell } from '@/features/client/components/ClientPortalShell';
import { ClientProjectCard } from '@/features/client/components/ClientProjectCard';
import { listMyProjects, type ClientProject } from '@/features/client/api';
import { filterBySlug, matchesFilter } from '@/features/client/data';
import { useAuth } from '@/shared/auth';

/**
 * Where a client lands.
 *
 * Leads with whatever is waiting on *them* — a project in review needs looking
 * at, everything else is us working. Real data throughout; nothing here is a
 * fixture.
 */
export default function ClientOverviewPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ClientProject[] | null>(null);
  const [calls, setCalls] = useState<ProjectCallDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listMyProjects()
      .then((page) => !cancelled && setProjects(page.items))
      .catch((err: unknown) => {
        if (!cancelled)
          setError(err instanceof ApiError ? err.message : 'Could not load your projects.');
      });
    collaborationApi
      .listMyCalls()
      .then((rows) => !cancelled && setCalls(rows))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const all = projects ?? [];
  const inProgress = filterBySlug('in-progress');
  const review = filterBySlug('review');
  const needsYou = all.filter((p) => matchesFilter(p.stage, review));
  const active = all.filter((p) => matchesFilter(p.stage, inProgress));
  // Counts, not money. Figures in minor units are summed by the API or not at
  // all — see `formatMinor`. A balance belongs to one project, and it is shown
  // on that project's card.
  const readyToView = all.reduce((total, p) => total + (p.summary?.released ?? 0), 0);

  /* Each figure leads somewhere, because each one is a question with an
     answer elsewhere in the portal. These were four static squares: a client
     reading "12 photographs ready" then had to work out for themselves which
     part of the navigation held them. A number that names something you can
     look at should take you to it.
  
     Two of them carry a slice rather than just a page. "Projects" and "In
     progress" both pointed at the bare list, so the second tile looked
     broken — same destination, smaller number, no explanation. The counts
     here and the tabs on that page are computed from one set of
     definitions in `data/project-filters`, so a tile reading 3 cannot open
     a tab reading 5. */
  const stats = [
    { label: 'Projects', value: all.length, to: '/client/projects' },
    { label: 'In progress', value: active.length, to: '/client/projects?show=in-progress' },
    { label: 'Photographs ready', value: readyToView, to: '/client/media' },
    { label: 'Waiting on you', value: needsYou.length, to: '/client/projects?show=review' },
  ];

  return (
    <ClientPortalShell
      title={`Welcome back${user?.first_name ? `, ${nameCase(user.first_name)}` : ''}`}
      subtitle="Here is where everything stands"
    >
      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-800 px-5 py-3 rounded-xl text-[13px] mb-6"
        >
          {error}
        </div>
      )}

      {projects === null ? (
        <p className="text-ink/50 text-[14px] py-12">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {stats.map(({ label, value, to }) => (
              <Link
                key={label}
                to={to}
                className="group border border-ink/10 bg-white rounded-xl p-5 block transition-colors hover:border-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                <p className="text-[10px] tracking-[0.22em] uppercase text-ink/45 font-medium mb-2 group-hover:text-ink/70 transition-colors">
                  {label}
                </p>
                <p className="font-serif text-[32px] leading-none tabular-nums">{value}</p>
              </Link>
            ))}
          </div>

          {/* Upcoming & Pending Video Calls */}
          {calls.length > 0 && (
            <div className="bg-white border border-ink/10 rounded-xl p-5 mb-8 space-y-3">
              <div className="flex items-center gap-2 font-serif text-[18px]">
                <Video size={17} className="text-gold" />
                <span>Video Calls & Meeting Requests ({calls.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {calls.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl border border-ink/10 bg-sand/40 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-semibold truncate">{c.title}</div>
                      <div className="text-[11.5px] text-ink/60">
                        {c.project_title} •{' '}
                        {new Date(c.proposed_at).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </div>
                      <span className="text-[10.5px] uppercase font-bold text-gold">{c.status}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {c.status === 'pending' && c.recipient_id === user?.id && (
                        <>
                          <button
                            type="button"
                            onClick={async () => {
                              const upd = await collaborationApi.respondToProjectCall(c.id, {
                                action: 'accept',
                              });
                              setCalls((prev) => prev.map((x) => (x.id === c.id ? upd : x)));
                            }}
                            className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                            title="Accept Call"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              const upd = await collaborationApi.respondToProjectCall(c.id, {
                                action: 'decline',
                              });
                              setCalls((prev) => prev.map((x) => (x.id === c.id ? upd : x)));
                            }}
                            className="p-2 rounded-lg border border-rose-500/30 text-rose-600 hover:bg-rose-500/10"
                            title="Decline Call"
                          >
                            <X size={14} />
                          </button>
                        </>
                      )}
                      {c.status === 'accepted' && c.meeting_url && (
                        <a
                          href={c.meeting_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-gold text-ink text-[11.5px] font-semibold"
                        >
                          Join Call
                        </a>
                      )}
                      <Link
                        to={`/client/projects/${c.project_id}`}
                        className="px-2.5 py-1.5 rounded-lg border border-ink/15 text-[11.5px]"
                      >
                        Project
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* The thing that actually needs them, first. */}
          {needsYou.length > 0 && (
            <section className="border border-gold/40 bg-gold/8 rounded-xl p-6 mb-8">
              <h2 className="font-serif text-[20px] mb-1">Ready for your review</h2>
              <p className="text-[13px] text-ink/60 mb-4">
                {needsYou.length === 1
                  ? 'One project is waiting for you to take a look.'
                  : `${needsYou.length} projects are waiting for you to take a look.`}
              </p>
              <div className="space-y-2">
                {needsYou.map((project) => (
                  <Link
                    key={project.id}
                    to={`/client/projects/${project.id}`}
                    className="flex items-center justify-between gap-4 bg-white border border-ink/10 rounded-lg px-4 py-3 hover:border-gold transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="font-medium truncate block">
                        {sentenceCase(project.title)}
                      </span>
                      {/* How much there is to look at, so the link is a
                          decision rather than a surprise. */}
                      {project.summary && project.summary.released > 0 && (
                        <span className="text-[12px] text-ink/55">
                          {project.summary.released}{' '}
                          {project.summary.released === 1 ? 'photograph' : 'photographs'} to go
                          through
                        </span>
                      )}
                    </div>
                    <ArrowRight size={16} className="text-gold flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-[20px]">Your projects</h2>
              <Link
                to="/client/projects"
                className="text-[11px] tracking-[0.15em] uppercase text-gold hover:text-ink font-semibold"
              >
                See all
              </Link>
            </div>

            {all.length === 0 ? (
              <div className="border border-ink/10 bg-white rounded-xl p-12 text-center">
                <FolderOpen size={28} className="mx-auto mb-4 text-gold" strokeWidth={1.5} />
                <p className="text-[14px] text-ink/55">
                  Your first project will appear here once we have booked it.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {all.slice(0, 4).map((project) => (
                  <ClientProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </ClientPortalShell>
  );
}
