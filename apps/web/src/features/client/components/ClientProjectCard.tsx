import { CalendarDays, Camera, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

import { formatMinor, nameCase, sentenceCase } from '@cabmora/ui';

import {
  STAGE_LABEL,
  STAGE_NOTE,
  STAGE_PILL,
  formatDate,
  type ClientProject,
} from '@/features/client/api';

/**
 * One of the client's projects, as a card.
 *
 * Shared by the dashboard and the projects list, which were drawing the same
 * project two different ways — the list had the date, the location and a
 * progress bar, the dashboard had a title and a pill. A client moving between
 * the two screens saw the same job described differently and had to work out
 * that it was the same job.
 *
 * What it answers, in the order a client asks it: what is this, where has it
 * got to, what does that mean for me, and the four facts underneath — how many
 * photographs can I see, who is shooting it, when do I get it, what do I owe.
 * All of it from the API; nothing here is a fixture.
 */
export function ClientProjectCard({ project }: { project: ClientProject }) {
  return (
    <Link
      to={`/client/projects/${project.id}`}
      className="border border-ink/10 bg-white rounded-xl p-6 hover:border-gold/50 transition-colors group flex flex-col"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-4 h-px bg-gold flex-shrink-0" />
          <span className="text-[9.5px] tracking-[0.26em] uppercase text-gold font-medium truncate">
            {project.event_type}
          </span>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-[9.5px] font-bold uppercase tracking-[0.06em] whitespace-nowrap flex-shrink-0 ${STAGE_PILL[project.stage]}`}
        >
          {STAGE_LABEL[project.stage]}
        </span>
      </div>

      <h2 className="font-serif text-[20px] leading-tight truncate group-hover:text-gold transition-colors">
        {sentenceCase(project.title)}
      </h2>

      <dl className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-ink/60 mt-3">
        <div className="flex items-center gap-1.5">
          <CalendarDays size={13} className="text-gold flex-shrink-0" />
          <dt className="sr-only">Event date</dt>
          <dd>{formatDate(project.event_date)}</dd>
        </div>
        {project.location && (
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin size={13} className="text-gold flex-shrink-0" />
            <dt className="sr-only">Location</dt>
            <dd className="truncate">{sentenceCase(project.location)}</dd>
          </div>
        )}
        {project.creator_name && (
          <div className="flex items-center gap-1.5 min-w-0">
            <Camera size={13} className="text-gold flex-shrink-0" />
            <dt className="sr-only">Photographer</dt>
            <dd className="truncate">{nameCase(project.creator_name)}</dd>
          </div>
        )}
      </dl>

      {/* The stage in words. "Editing" tells a client where it is; this tells
          them what it means and whether anything is theirs to do. */}
      <p className="text-[12.5px] text-ink/70 leading-relaxed mt-4">{STAGE_NOTE[project.stage]}</p>

      <div className="mt-5">
        <div className="flex items-center justify-between text-[11px] text-ink/55 mb-1.5">
          <span>Progress</span>
          <span className="font-semibold text-ink tabular-nums">{project.progress}%</span>
        </div>
        <div className="h-[3px] bg-ink/8 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold-dark to-gold rounded-full transition-all duration-700"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      <ProjectFacts project={project} />
    </Link>
  );
}

interface Fact {
  label: string;
  value: string;
  tone?: string;
}

/**
 * The numbers, along the bottom.
 *
 * Built as a list and laid out with wrapping rather than as fixed columns,
 * because which facts exist varies: a project with no price has no balance, a
 * shoot that has not happened has no photographs, and an empty column reads as
 * a number that failed to load rather than as one that does not apply yet.
 */
function ProjectFacts({ project }: { project: ClientProject }) {
  const summary = project.summary;
  const facts: Fact[] = [];

  if (summary && summary.photos > 0) {
    facts.push({
      label: 'Photographs',
      value: summary.released > 0 ? `${summary.released} to view` : 'Being prepared',
      tone: summary.released > 0 ? 'text-ink' : 'text-ink/60',
    });
  }

  if (project.deadline) {
    facts.push({ label: 'Ready by', value: formatDate(project.deadline) });
  }

  if (summary && summary.open_comments > 0) {
    facts.push({
      label: 'Your changes',
      value: summary.open_comments === 1 ? '1 with us' : `${summary.open_comments} with us`,
      tone: 'text-ink',
    });
  }

  // Money, in the order it becomes true: something owed, then something
  // settled, then — before any invoice exists — the agreed price, so a client
  // can always see what the job costs.
  if (summary && summary.outstanding_minor > 0) {
    facts.push({
      label: 'Balance',
      value: `${formatMinor(summary.outstanding_minor)} due`,
      tone: 'text-amber-800',
    });
  } else if (summary && summary.billed_minor > 0) {
    facts.push({ label: 'Balance', value: 'Paid in full', tone: 'text-emerald-700' });
  } else if (project.price_minor !== null) {
    facts.push({ label: 'Agreed price', value: formatMinor(project.price_minor) });
  }

  if (facts.length === 0) return null;

  return (
    <dl className="flex flex-wrap gap-x-8 gap-y-3 mt-5 pt-4 border-t border-ink/8">
      {facts.map((fact) => (
        <div key={fact.label}>
          <dt className="text-[9.5px] tracking-[0.2em] uppercase text-ink/45 font-medium mb-1">
            {fact.label}
          </dt>
          <dd className={`text-[13px] font-medium tabular-nums ${fact.tone ?? 'text-ink'}`}>
            {fact.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
