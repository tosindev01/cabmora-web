import { AlertTriangle, ArrowRight, Inbox } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { getEnquiryTriage, type TriagedEnquiry, type UrgencyBand } from '@/features/enquiries/api';
import {
  BAND_LABEL,
  BAND_NOTE,
  BAND_ORDER,
  BAND_RULE,
  STATUS_LABEL,
  STATUS_PILL,
  formatDate,
  formatDaysUntil,
  formatWaiting,
} from '@/features/enquiries/display';

/**
 * Open leads, grouped by how soon the client's event is.
 *
 * The dashboard already answers "what arrived most recently" — that is the
 * inbox. This answers the different and harder question: **what will somebody
 * regret not having replied to.** A wedding three weeks away that nobody has
 * touched is urgent; the same enquiry for next June is not, and a table sorted
 * by arrival time treats them identically.
 *
 * Won and lost leads are absent by construction — the API only returns open
 * ones. A work queue padded with rows nobody can act on stops being read.
 */

/** Enough to triage from. More than this is the Enquiry Management screen's job. */
const SHOWING = 25;

export function EnquiryTriageTable() {
  const [rows, setRows] = useState<TriagedEnquiry[] | null>(null);
  const [openTotal, setOpenTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getEnquiryTriage(SHOWING)
      .then((triage) => {
        if (cancelled) return;
        setRows(triage.items);
        setOpenTotal(triage.open_total);
      })
      .catch(() => !cancelled && setError('The enquiry queue could not be loaded.'));
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Grouped in `BAND_ORDER`, not in whatever order the bands happen to appear.
   *
   * The API already returns rows soonest-first, so the groups come out in the
   * right order anyway — but relying on that would make the heading order an
   * accident of the query's ORDER BY, and the next person to add a band would
   * have no way to know where it goes.
   */
  const grouped = useMemo(() => {
    if (!rows) return [];
    return BAND_ORDER.map((band) => ({
      band,
      items: rows.filter((row) => row.band === band),
    })).filter((group) => group.items.length > 0);
  }, [rows]);

  const chasing = rows?.filter((row) => row.needs_chasing).length ?? 0;

  return (
    <section className="bg-white border border-ink/10 rounded-xl overflow-hidden">
      <header className="px-5 sm:px-6 py-4 border-b border-ink/10 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-serif text-[18px] text-ink">Enquiry queue</h3>
          <p className="text-[12.5px] text-ink/50 mt-0.5">
            Open leads — soonest event first, then longest waiting
            {chasing > 0 && (
              <>
                {' · '}
                <span className="text-red-700 font-semibold">
                  {chasing} need{chasing === 1 ? 's' : ''} chasing
                </span>
              </>
            )}
          </p>
        </div>
        <Link
          to="/admin/enquiries"
          className="shrink-0 inline-flex items-center gap-1.5 text-[12px] text-gold hover:underline"
        >
          All enquiries
          <ArrowRight size={13} />
        </Link>
      </header>

      {error && <p className="px-6 py-8 text-[13px] text-red-700">{error}</p>}

      {!error && rows === null && (
        <p className="px-6 py-10 text-center text-[13px] text-ink/45">Loading…</p>
      )}

      {!error && rows !== null && rows.length === 0 && (
        <div className="px-6 py-12 text-center">
          <Inbox size={28} className="mx-auto mb-3 text-ink/30" />
          <p className="text-[14px] font-medium text-ink">Nothing open</p>
          <p className="text-[12.5px] text-ink/45 mt-1">Every enquiry has been won or closed.</p>
        </div>
      )}

      {grouped.map((group) => (
        <BandGroup key={group.band} band={group.band} items={group.items} />
      ))}

      {rows !== null && openTotal > rows.length && (
        /* Said out loud rather than left implied. A table that silently shows
           25 of 60 teaches people the queue is shorter than it is. */
        <p className="px-5 sm:px-6 py-3 border-t border-ink/10 text-[12px] text-ink/45">
          Showing {rows.length} of {openTotal} open enquiries.{' '}
          <Link to="/admin/enquiries" className="text-gold hover:underline">
            See the rest
          </Link>
        </p>
      )}
    </section>
  );
}

function BandGroup({ band, items }: { band: UrgencyBand; items: TriagedEnquiry[] }) {
  const note = BAND_NOTE[band];
  return (
    <div>
      <h4 className="sticky top-0 bg-canvas px-5 sm:px-6 py-2 border-y border-ink/8 flex items-baseline gap-2 flex-wrap">
        <span className="text-[11px] tracking-[0.14em] uppercase font-semibold text-ink/60">
          {BAND_LABEL[band]}
        </span>
        <span className="text-[11px] text-ink/40">({items.length})</span>
        {note && <span className="text-[11.5px] text-ink/40 normal-case">{note}</span>}
      </h4>
      <ul className="divide-y divide-ink/6">
        {items.map((row) => (
          <li key={row.id}>
            <Link
              to={`/admin/enquiries/${row.id}`}
              className={`flex items-center gap-3 sm:gap-4 px-5 sm:px-6 py-3.5 border-l-4 hover:bg-canvas transition-colors ${BAND_RULE[band]}`}
            >
              {/* `min-w-0` so the name truncates instead of shoving the dates
                  off the right edge of a narrow console window. */}
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-[14px] text-ink font-medium truncate">{row.full_name}</span>
                  {row.needs_chasing && (
                    <span
                      className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.08em] text-red-700"
                      /* Not colour alone: the icon and the word both carry it,
                         so it survives a monochrome screen and a reader who
                         cannot distinguish red. */
                    >
                      <AlertTriangle size={11} />
                      Chase
                    </span>
                  )}
                </span>
                <span className="block text-[12px] text-ink/50 truncate mt-0.5">
                  {row.event_type}
                  {row.assigned_to_name ? ` · ${row.assigned_to_name}` : ' · unassigned'}
                </span>
              </span>

              {/* The date column has to say something on every row.
                  
                  It used to print the event date and the countdown, which for a
                  lead with no event date meant two em-dashes — and almost every
                  lead has no event date, because the public form only started
                  asking in October 2026. Eleven rows of "— —" is not a table.
                  
                  So: the event where we know it, and how long they have been
                  waiting where we do not. The second is always knowable, and a
                  wedding enquiry ignored for nine days is just as much a
                  problem as a wedding nine days away. */}
              <span className="shrink-0 text-right hidden sm:block">
                {row.event_date ? (
                  <>
                    <span className="block text-[13px] text-ink tabular-nums">
                      {formatDate(row.event_date)}
                    </span>
                    <span className="block text-[11.5px] text-ink/45">
                      {formatDaysUntil(row.days_until)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="block text-[13px] text-ink/70 tabular-nums">
                      {formatDate(row.created_at)}
                    </span>
                    <span
                      className={`block text-[11.5px] ${
                        row.needs_chasing ? 'text-red-700 font-semibold' : 'text-ink/45'
                      }`}
                    >
                      {formatWaiting(row.days_waiting)}
                    </span>
                  </>
                )}
              </span>

              <span
                className={`shrink-0 px-2.5 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-[0.06em] whitespace-nowrap ${STATUS_PILL[row.status]}`}
              >
                {STATUS_LABEL[row.status]}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
