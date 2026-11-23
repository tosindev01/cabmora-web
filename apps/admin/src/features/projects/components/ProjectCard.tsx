import { CalendarDays, Clock, User } from 'lucide-react';

import { Select } from '@cabmora/ui';
import { motion, useReducedMotion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';

import type { Project, ProjectStage } from '@/features/projects/api';
import { STAGE_LABEL, accentFor, formatDate, projectMonogram } from '@/features/projects/display';
import { STAGE_ORDER, formatMinor, nameCase, nextStage, sentenceCase } from '@/shared/format';

interface Props {
  project: Project;
  /** Position in the grid, for the stagger. */
  index: number;
  onMoveStage: (id: string, stage: ProjectStage) => void;
}

/**
 * How a deadline should read, by how close it is.
 *
 * Quiet by default. A deadline is only worth colouring when somebody can still
 * act on it, so a delivered project never goes red however late it ran — the
 * work is done, and a wall of red on finished jobs is how people learn to stop
 * reading the colour at all.
 */
function deadlineTone(deadline: string | null, stage: ProjectStage) {
  const quiet = { tone: 'text-ink/70', icon: 'text-gold', note: '' };
  if (!deadline || stage === 'delivered' || stage === 'closed') return quiet;

  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) {
    return {
      tone: 'text-red-700',
      icon: 'text-red-600',
      note: `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} late`,
    };
  }
  if (days <= 7) {
    return {
      tone: 'text-amber-800',
      icon: 'text-amber-600',
      note: days === 0 ? 'today' : `${days} day${days === 1 ? '' : 's'} left`,
    };
  }
  return quiet;
}

/** The marketing site's easing. Reused so the admin moves like the product. */
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The cover, for a project with no photographs yet.
 *
 * The aperture turns slowly on hover — a lens opening, which is both the motif
 * and the product. `motion-safe:` gates it so it does not move at all for
 * anyone who has asked the OS for reduced motion; WCAG 2.2 AA is a stated PRD
 * requirement, not a nicety.
 */
function ProjectCover({ project }: { project: Project }) {
  return (
    <div className={`relative h-28 overflow-hidden ${accentFor(project.id)}`}>
      <div className="absolute inset-0 bg-gradient-to-tr from-noir/30 via-transparent to-canvas/15" />

      <svg
        aria-hidden
        viewBox="0 0 100 100"
        className="absolute -right-5 -bottom-9 w-36 h-36 text-canvas/12 origin-center transition-transform duration-[1400ms] ease-out motion-safe:group-hover:rotate-[60deg] motion-safe:group-hover:scale-105"
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
        className="absolute left-5 bottom-4 font-serif text-[30px] leading-none text-canvas/95 select-none transition-transform duration-500 ease-out motion-safe:group-hover:-translate-y-0.5"
      >
        {projectMonogram(project.title)}
      </span>

      <span className="absolute right-5 bottom-4 text-[10.5px] uppercase tracking-[0.18em] text-canvas/45">
        No media yet
      </span>

      {/* Blurred scrim, not a tinted pill: the accents run from near-black to
          gold and no fixed background stays legible across all of them. */}
      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.1em] text-canvas bg-noir/45 backdrop-blur-sm border border-canvas/20">
        {STAGE_LABEL[project.stage]}
      </span>
    </div>
  );
}

export function ProjectCard({ project, index, onMoveStage }: Props) {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  // One step forward, if there is one. `allowed_next_stages` arrives in enum
  // order, which puts a backward move first — so the forward one is found by
  // position in the pipeline rather than by taking the first entry.
  const forward = nextStage(project.stage, project.allowed_next_stages);

  const due = deadlineTone(project.deadline, project.stage);
  const summary = project.summary;

  return (
    <motion.div
      // `false` rather than a hidden state when motion is reduced: the card
      // must appear, not fade from nothing at zero duration.
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE, delay: reduce ? 0 : index * 0.06 }}
      whileHover={reduce ? undefined : { y: -3 }}
      onClick={(e) => {
        // Controls inside the card must not also navigate.
        if ((e.target as HTMLElement).closest('button, select, a, [data-no-card-nav]')) return;
        navigate(`/admin/projects/${project.id}`);
      }}
      className="group bg-white border border-ink/10 rounded-xl overflow-hidden flex flex-col cursor-pointer transition-[border-color,box-shadow] duration-300 hover:border-gold/50 hover:shadow-[0_6px_28px_rgba(17,17,17,0.07)]"
    >
      <ProjectCover project={project} />

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="min-w-0">
          {/* The gold rule + letterspaced micro-label that precedes every
              heading on the marketing site. Inline rather than <EyebrowLabel>
              because that component ships a 24px bottom margin sized for
              full-width sections. */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-4 h-px bg-gold transition-all duration-500 ease-out motion-safe:group-hover:w-7" />
            <span className="text-[11px] tracking-[0.26em] uppercase text-gold font-medium truncate">
              {project.event_type}
            </span>
          </div>

          <Link
            to={`/admin/projects/${project.id}`}
            className="font-serif text-[20.5px] leading-tight text-ink truncate block hover:text-gold transition-colors"
          >
            {sentenceCase(project.title)}
          </Link>
          {project.description && (
            <p className="text-[13.5px] text-ink/55 line-clamp-2 mt-1 font-light">
              {sentenceCase(project.description)}
            </p>
          )}
        </div>

        <dl className="text-[13.5px] space-y-1.5">
          <div className="flex items-center gap-2 text-ink/70 min-w-0">
            <User size={14} className="text-gold flex-shrink-0" />
            <dt className="sr-only">Client</dt>
            <dd className={`truncate ${project.customer_name ? '' : 'text-ink/40 italic'}`}>
              {project.customer_name ? nameCase(project.customer_name) : 'No client yet'}
            </dd>
          </div>
          <div className="flex items-center gap-2 text-ink/70">
            <CalendarDays size={14} className="text-gold flex-shrink-0" />
            <dt className="sr-only">Event date</dt>
            <dd>{formatDate(project.event_date)}</dd>
          </div>
          {/* A deadline nobody can see is one nobody works to. Coloured only
              when it matters — a date in red on every card teaches people to
              stop seeing red. */}
          <div className={`flex items-center gap-2 ${due.tone}`}>
            <Clock size={14} className={`flex-shrink-0 ${due.icon}`} />
            <dt className="sr-only">Deadline</dt>
            <dd>
              {project.deadline ? (
                <>
                  Due {formatDate(project.deadline)}
                  {due.note && <span className="font-semibold"> · {due.note}</span>}
                </>
              ) : (
                <span className="text-ink/35 italic">No deadline set</span>
              )}
            </dd>
          </div>
        </dl>

        {/* Photographs, feedback and money — the three things that decide
            whether this project needs you today. Without them a card said
            only what the project was called, so every one had to be opened to
            find out if anything was waiting. */}
        {summary && (
          <div
            className={`grid gap-2 py-3 border-y border-ink/8 text-center ${
              summary.open_comments > 0 ? 'grid-cols-3' : 'grid-cols-2'
            }`}
          >
            <div>
              <p className="text-[15px] font-semibold text-ink tabular-nums leading-none">
                {summary.photos}
              </p>
              <p className="text-[10px] tracking-[0.12em] uppercase text-ink/40 mt-1">
                {summary.photos === 1 ? 'Photo' : 'Photos'}
              </p>
              {summary.photos > 0 && (
                <p className="text-[10px] text-ink/35 mt-0.5 tabular-nums">
                  {summary.released} shared
                </p>
              )}
            </div>

            {/* Only when there are some. A permanent zero took a third of the
                strip to say nothing, which is most of the time — and when it
                is not zero it is the most actionable number on the card, so it
                earns the space exactly then. */}
            {summary.open_comments > 0 && (
              <div>
                <p className="text-[15px] font-semibold tabular-nums leading-none text-amber-700">
                  {summary.open_comments}
                </p>
                <p className="text-[10px] tracking-[0.12em] uppercase text-ink/40 mt-1">Changes</p>
                <p className="text-[10px] text-amber-700 mt-0.5 font-medium">client asked</p>
              </div>
            )}

            <div>
              <p
                className={`text-[15px] font-semibold tabular-nums leading-none ${
                  summary.outstanding_minor > 0 ? 'text-ink' : 'text-emerald-700'
                }`}
              >
                {summary.billed_minor === 0
                  ? '—'
                  : formatMinor(summary.outstanding_minor || summary.billed_minor)}
              </p>
              <p className="text-[10px] tracking-[0.12em] uppercase text-ink/40 mt-1">
                {summary.billed_minor === 0
                  ? 'Unbilled'
                  : summary.outstanding_minor > 0
                    ? 'Owed'
                    : 'Paid'}
              </p>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] tracking-[0.2em] uppercase text-ink/40 font-medium">
              Progress
            </span>
            <span className="text-[12.5px] font-semibold text-ink tabular-nums">
              {project.progress}%
            </span>
          </div>
          <div className="h-[3px] bg-ink/8 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-gold-dark to-gold rounded-full"
              initial={reduce ? false : { width: 0 }}
              animate={{ width: `${project.progress}%` }}
              transition={{
                duration: 0.9,
                ease: EASE,
                delay: reduce ? 0 : 0.25 + index * 0.06,
              }}
            />
          </div>
        </div>

        {/* The current stage, editable. Shows where the project *is* rather
            than only where it could go next — "Booked" on the control answers
            the question somebody actually has, and changing it is the
            correction.

            Most moves happen on their own now: an upload sets Editing, a
            release sets Client Review, the client's approval sets Delivered.
            This is for the ones a person decides, and for putting right the
            ones that went wrong. */}
        <div className="mt-auto pt-3 border-t border-ink/8" data-no-card-nav>
          <label htmlFor={`stage-${project.id}`} className="sr-only">
            Stage for {project.title}
          </label>
          <Select
            id={`stage-${project.id}`}
            value={project.stage}
            disabled={project.allowed_next_stages.length === 0}
            onChange={(e) => {
              const next = e.target.value as ProjectStage;
              if (next !== project.stage) onMoveStage(project.id, next);
            }}
            className="w-full bg-canvas border border-ink/12 pl-3 pr-9 py-2 text-[12px] font-semibold tracking-[0.12em] uppercase text-ink/75 outline-none focus:border-gold hover:border-gold/50 transition-colors rounded-lg disabled:opacity-60"
          >
            {/* Every stage, in pipeline order, so the whole shape is visible
                and you can see where this project sits in it. The ones it
                cannot move to are disabled rather than hidden — a list that
                shows only two options tells you nothing about the other five,
                and "why can't I go there" is answered by seeing it greyed.

                Which ones are reachable comes from the API, derived from the
                same map it enforces, so this cannot offer a refused move. */}
            {STAGE_ORDER.map((stage) => {
              const here = stage === project.stage;
              const reachable = project.allowed_next_stages.includes(stage);
              return (
                <option key={stage} value={stage} disabled={!reachable}>
                  {here
                    ? `${STAGE_LABEL[stage]} — now`
                    : reachable
                      ? `${forward === stage ? '→' : '←'} ${STAGE_LABEL[stage]}`
                      : STAGE_LABEL[stage]}
                </option>
              );
            })}
          </Select>
        </div>
      </div>
    </motion.div>
  );
}
