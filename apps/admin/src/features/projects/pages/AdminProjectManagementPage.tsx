import { useState } from 'react';

import { Select } from '@cabmora/ui';
import { ChevronLeft, ChevronRight, FolderOpen, Plus, Search } from 'lucide-react';

import type { ProjectStage } from '@/features/projects/api';
import { STAGE_LABEL } from '@/features/projects/display';
import { NewProjectModal } from '@/features/projects/components/NewProjectModal';
import { useAdminAuth } from '@/shared/auth';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { useAdminProjects } from '@/features/projects/hooks/useAdminProjects';

/**
 * Project management.
 *
 * "New project" can also provision the client's account, because an enquiry
 * yields a name and an email but not an account — and making the admin create
 * the person elsewhere, then come back, is friction with no purpose. Enquiry
 * conversion (`EnquiryStatus.CONVERTED`) will call the same endpoint.
 *
 * Budget, thumbnail and deliverable counts are absent rather than seeded —
 * they need `Invoice` and `MediaAsset`, which are not built.
 */
/** How a control looks depending on whether it is doing anything.
 *
 * Gold for active, so the filters in play read at a glance instead of
 * having to be checked one by one. Literal class strings on both
 * branches — Tailwind scans for them statically, so a name built from
 * parts generates no CSS at all. */
const chip = (value: string | undefined) =>
  isSet(value) ? 'bg-gold/10 border-gold/50 text-ink' : 'bg-canvas border-ink/15 text-ink/70';

/** Whether a filter is actually narrowing anything. */
const isSet = (value: string | undefined) => value !== undefined && value !== '' && value !== 'All';

export default function AdminProjectManagementPage() {
  const {
    items,
    total,
    page,
    pageSize,
    pageCount,
    filters,
    error,
    setPage,
    setFilter,
    moveStage,
    refresh,
  } = useAdminProjects();
  const [creating, setCreating] = useState(false);
  const isAdmin = useAdminAuth().staff?.role === 'admin';

  const rows = items ?? [];
  const firstShown = total === 0 ? 0 : page * pageSize + 1;
  const lastShown = page * pageSize + rows.length;

  return (
    <div className="max-w-[1320px] mx-auto space-y-6">
      <div className="border-b border-ink/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-6 h-px bg-gold" />
            <span className="text-[11.5px] tracking-[0.3em] uppercase text-gold font-medium">
              Administration
            </span>
          </div>
          <h1 className="font-serif text-[32px] leading-tight text-ink">Project Management</h1>
          <p className="text-ink/55 text-[15.5px] font-light mt-1">
            Track production stages, assign creators, and open a project to change its delivery
            settings.
          </p>
        </div>
        {/* Admin only, because `POST /admin/projects` is: booking work is a
            business act, not a shoot task. A button that 403s is worse than
            no button. */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="bg-ink text-white px-5 py-2.5 rounded-full text-[13.5px] font-bold tracking-[0.05em] uppercase hover:bg-gold hover:text-ink transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Plus size={16} />
            New project
          </button>
        )}
      </div>

      {/* A nullable condition stays OUTSIDE the modal; children are evaluated
          even when closed. Here there is no nullable state, so the modal owns
          its own open flag. */}
      <NewProjectModal
        open={creating}
        onOpenChange={setCreating}
        onCreated={() => void refresh()}
      />

      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-800 px-5 py-3 rounded-xl text-[14.5px]"
        >
          {error}
        </div>
      )}

      {/* Filters
      
          The labels are gone, not restyled. STAGE / DEADLINE / EVENT in bold
          uppercase shouted three times over controls that already say what
          they are — "All stages" and "Any deadline" name themselves, so the
          label was repeating the value underneath it. Dropping them frees the
          width that was forcing a second row.
      
          What is left carries meaning instead: a control that is narrowing
          something goes gold, so the filters in play are visible at a glance
          rather than needing to be read one by one. */}
      <div className="bg-white border border-ink/10 p-4 rounded-xl shadow-xs space-y-3">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            type="search"
            value={filters.q}
            onChange={(e) => setFilter('q', e.target.value)}
            placeholder="Search by project, client, email, phone or category…"
            aria-label="Search projects"
            className="w-full h-11 bg-canvas border border-ink/15 rounded-lg pl-10 pr-4 text-[14.5px] outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            aria-label="Filter by stage"
            value={filters.stage}
            onChange={(e) => setFilter('stage', e.target.value as 'All' | ProjectStage)}
            className={`h-10 rounded-lg border pl-3 pr-9 text-[13.5px] font-medium outline-none focus:border-gold transition-colors ${chip(
              filters.stage,
            )}`}
          >
            <option value="All">All stages</option>
            {(Object.keys(STAGE_LABEL) as ProjectStage[]).map((stage) => (
              <option key={stage} value={stage}>
                {STAGE_LABEL[stage]}
              </option>
            ))}
          </Select>

          {/* Before the event range: "what is nearly due" is what this page
              gets opened with far more often than "what happened in June". */}
          <Select
            aria-label="Filter by deadline"
            value={filters.due_within_days}
            onChange={(e) => setFilter('due_within_days', e.target.value)}
            className={`h-10 rounded-lg border pl-3 pr-9 text-[13.5px] font-medium outline-none focus:border-gold transition-colors ${chip(
              filters.due_within_days,
            )}`}
          >
            <option value="All">Any deadline</option>
            <option value="0">Overdue or due today</option>
            <option value="7">Due within a week</option>
            <option value="30">Due within a month</option>
          </Select>

          {/* One bordered group, not two loose inputs with a stray "to"
              between them. Two bare dates side by side do not say what they
              are, and the word carried no weight on its own. */}
          <div
            className={`h-10 flex items-center gap-1 rounded-lg border pl-3 pr-2 transition-colors ${chip(
              filters.event_from || filters.event_to,
            )}`}
          >
            <span className="text-[13px] text-ink/45 shrink-0">Event</span>
            <input
              type="date"
              value={filters.event_from}
              onChange={(e) => setFilter('event_from', e.target.value)}
              className="bg-transparent text-[13.5px] outline-none w-[8.5rem]"
              aria-label="Events from"
            />
            <span className="text-ink/30 text-[13px]">–</span>
            <input
              type="date"
              value={filters.event_to}
              onChange={(e) => setFilter('event_to', e.target.value)}
              className="bg-transparent text-[13.5px] outline-none w-[8.5rem]"
              aria-label="Events to"
            />
          </div>

          {[
            filters.stage,
            filters.due_within_days,
            filters.event_from,
            filters.event_to,
            /* `isSet` rather than `!== 'All'` on each: a key missing from
               state reads as `undefined`, and `undefined !== 'All'` is true —
               so the button appeared over an unfiltered list. Unset, empty and
               "All" all mean the same thing here. */
          ].some(isSet) && (
            <button
              type="button"
              onClick={() => {
                setFilter('stage', 'All');
                setFilter('due_within_days', 'All');
                setFilter('event_from', '');
                setFilter('event_to', '');
              }}
              className="h-10 px-3 text-[13px] text-ink/50 hover:text-gold transition-colors cursor-pointer ml-auto"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Cards */}
      {items === null ? (
        <p className="text-center py-16 text-ink/50 text-[15.5px]">Loading projects…</p>
      ) : rows.length === 0 ? (
        <div className="text-center py-16 text-ink/50 text-[15.5px]">
          <FolderOpen size={28} className="mx-auto mb-3 opacity-40" />
          No projects match these filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {rows.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} onMoveStage={moveStage} />
          ))}
        </div>
      )}

      {/* Pager */}
      <div className="flex items-center justify-between gap-4 bg-white border border-ink/10 rounded-xl px-4 py-3">
        <p className="text-[13.5px] text-ink/60 tabular-nums">
          {total === 0 ? 'No projects' : `Showing ${firstShown}–${lastShown} of ${total}`}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
            aria-label="Previous page"
            className="p-1.5 rounded border border-ink/15 text-ink/70 hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[13.5px] text-ink/70 tabular-nums">
            Page {page + 1} of {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage(page + 1)}
            disabled={page + 1 >= pageCount}
            aria-label="Next page"
            className="p-1.5 rounded border border-ink/15 text-ink/70 hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
