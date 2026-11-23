import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Check, ChevronLeft, ChevronRight } from 'lucide-react';

import { Modal } from '@cabmora/ui';

import { fetchOpenSlots } from '@/features/enquiry/api';

interface Props {
  /** The chosen instant, ISO, or null for "no preference". */
  value: string | null;
  onChange: (slot: string | null) => void;
}

const TZ = 'Europe/London';

/** Matches MAX_HORIZON_DAYS on the API. Beyond it nothing is offered. */
const HORIZON_DAYS = 60;

/** Monday first — this is a UK studio, and a Sunday-first grid misreads. */
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const dayKey = (value: Date | string) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(typeof value === 'string' ? new Date(value) : value);

const timeLabel = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
    .format(new Date(iso))
    .replace(/\s?([ap])m/i, (_, p: string) => p.toLowerCase() + 'm');

const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: TZ,
  });

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);

/**
 * Pick a time to talk, in a month calendar.
 *
 * A dialog rather than part of the form: a calendar is a decision of its own,
 * and inlining one pushes everything after it — the message box, the send
 * button — below the fold on a phone. The trigger says what is chosen, so the
 * form still reads as a single column of answers.
 *
 * A month grid rather than a strip of the next fortnight, because people book
 * weddings around a date they already have in mind, and that date is often
 * further out than the next fortnight.
 *
 * Nothing here books anything, and it says so twice. The calendar behind it
 * only knows about calls made through this website — not shoots, not travel,
 * not anything in somebody's own diary — so Cabmora confirms the slot before
 * it is real.
 */
export function SlotPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  /** Free slots by month key, so paging back does not refetch. */
  const [byMonth, setByMonth] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [day, setDay] = useState<string | null>(value ? dayKey(value) : null);

  const key = monthKey(month);
  const known = byMonth[key];

  useEffect(() => {
    if (!open || known !== undefined) return;
    let cancelled = false;
    setLoading(true);
    /* The whole month, clipped to the horizon by the API itself.
    
       Ends at the last instant of the month rather than the first of the
       next. Local midnight to local midnight is 31 days *and an hour* in a
       month where the clocks go back — one hour past the API's limit, so
       every UK visitor was refused the whole of October and shown an empty
       calendar, while anyone in a zone that does not change its clocks saw
       the same month normally. The API tolerates the hour now; not sending
       it is the other half. */
    const from = new Date(month);
    const to = new Date(addMonths(month, 1).getTime() - 1);
    fetchOpenSlots(from.toISOString(), to.toISOString())
      .then((result) => {
        if (!cancelled) setByMonth((prev) => ({ ...prev, [key]: result.slots }));
      })
      .catch(() => {
        // The enquiry must still be sendable. Somebody who cannot pick a time
        // should not be stopped from telling us about their wedding.
        if (!cancelled) setFailed(true);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [open, month, key, known]);

  /** Which days in the shown month have anything free, and what. */
  const slotsByDay = useMemo(() => {
    const grouped: Record<string, string[]> = {};
    for (const slot of known ?? []) {
      const dk = dayKey(slot);
      (grouped[dk] ??= []).push(slot);
    }
    return grouped;
  }, [known]);

  /** Leading blanks then every day, Monday first. */
  const cells = useMemo(() => {
    const first = startOfMonth(month);
    const blanks = (first.getDay() + 6) % 7;
    const length = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [
      ...Array.from({ length: blanks }, () => null),
      ...Array.from({ length }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
    ];
  }, [month]);

  const horizon = useMemo(() => {
    const end = new Date();
    end.setDate(end.getDate() + HORIZON_DAYS);
    return startOfMonth(end);
  }, []);
  const canGoBack = month > startOfMonth(new Date());
  const canGoForward = month < horizon;

  const choose = useCallback(
    (slot: string) => {
      onChange(slot);
      setOpen(false);
    },
    [onChange],
  );

  const chosenTimes = day ? (slotsByDay[day] ?? []) : [];

  return (
    <div>
      <span className="block text-[11px] tracking-[0.15em] uppercase text-ink/60 font-medium mb-3">
        Preferred Time <span className="text-ink/35 normal-case tracking-normal">(optional)</span>
      </span>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full bg-canvas border border-ink/10 px-4 py-3 text-left text-[14px] hover:border-ink/35 focus:border-gold outline-none transition-colors duration-300 cursor-pointer flex items-center gap-3"
      >
        <CalendarDays size={16} className="text-gold flex-shrink-0" aria-hidden />
        {value ? (
          <span className="text-ink">
            {longDate(value)} at {timeLabel(value)}
          </span>
        ) : (
          <span className="text-ink/40">Choose a date and time</span>
        )}
      </button>

      <div className="flex items-center justify-between gap-4 mt-2">
        <p className="text-[12px] text-ink/40">
          {value
            ? 'Nothing is booked until we confirm it by email.'
            : 'Or leave it and we will suggest a time when we reply.'}
        </p>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-[12px] text-ink/45 hover:text-gold transition-colors cursor-pointer flex-shrink-0 underline underline-offset-2"
          >
            Clear
          </button>
        )}
      </div>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Choose a time"
        description="Pick when suits you. We will confirm by email, and offer another time if we cannot make it."
        size="md"
      >
        <div className="space-y-5">
          {/* Month */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMonth(addMonths(month, -1))}
              disabled={!canGoBack}
              aria-label="Previous month"
              className="p-2 rounded-lg border border-ink/10 text-ink/60 hover:bg-canvas disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-serif text-[19px] text-ink">
              {month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={() => setMonth(addMonths(month, 1))}
              disabled={!canGoForward}
              aria-label="Next month"
              className="p-2 rounded-lg border border-ink/10 text-ink/60 hover:bg-canvas disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Grid */}
          <div>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((w) => (
                <span
                  key={w}
                  className="text-[9.5px] tracking-[0.12em] uppercase text-ink/35 text-center py-1"
                >
                  {w}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {cells.map((date, i) => {
                if (!date) return <span key={`blank-${i}`} />;
                const dk = dayKey(date);
                const free = (slotsByDay[dk] ?? []).length;
                const on = dk === day;
                return (
                  <button
                    key={dk}
                    type="button"
                    disabled={free === 0}
                    onClick={() => setDay(dk)}
                    aria-label={`${date.toLocaleDateString('en-GB', { dateStyle: 'full' })}${
                      free ? `, ${free} times free` : ', nothing free'
                    }`}
                    aria-pressed={on}
                    className={`aspect-square text-[13.5px] transition-colors duration-150 rounded-lg ${
                      on
                        ? 'bg-ink text-canvas font-medium'
                        : free
                          ? 'text-ink hover:bg-canvas border border-ink/10 cursor-pointer'
                          : 'text-ink/20 cursor-not-allowed'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            {loading && <p className="text-[12.5px] text-ink/40 mt-3">Checking the diary…</p>}
            {failed && (
              <p className="text-[12.5px] text-ink/55 mt-3">
                We could not load our diary just now. Send the enquiry and we will offer you some
                times.
              </p>
            )}
            {!loading && !failed && known !== undefined && Object.keys(slotsByDay).length === 0 && (
              <p className="text-[12.5px] text-ink/45 mt-3">Nothing free this month.</p>
            )}
          </div>

          {/* Times on the chosen day */}
          {day && chosenTimes.length > 0 && (
            <div className="border-t border-ink/10 pt-5">
              <p className="text-[11px] tracking-[0.15em] uppercase text-ink/50 font-medium mb-3">
                {new Date(chosenTimes[0]!).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  timeZone: TZ,
                })}
              </p>
              <div className="flex flex-wrap gap-2">
                {chosenTimes.map((slot) => {
                  const on = slot === value;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => choose(slot)}
                      aria-pressed={on}
                      className={`px-4 py-2.5 text-[13px] border rounded-lg transition-colors duration-200 cursor-pointer inline-flex items-center gap-1.5 ${
                        on
                          ? 'bg-gold text-ink border-gold font-medium'
                          : 'bg-canvas border-ink/10 text-ink/75 hover:border-ink/35'
                      }`}
                    >
                      {on && <Check size={13} />}
                      {timeLabel(slot)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
