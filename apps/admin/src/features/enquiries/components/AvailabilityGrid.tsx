import { useMemo, useState } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { BookedSlot } from '@/features/enquiries/api';
import { useAvailability } from '@/features/enquiries/hooks/useAvailability';

/** The working day the grid renders. Outside this, bookings still show — see below. */
const DAY_START_HOUR = 8;
const DAY_END_HOUR = 20;
const SLOT_MINUTES = 30;
const ROWS = ((DAY_END_HOUR - DAY_START_HOUR) * 60) / SLOT_MINUTES;

interface Props {
  /** Pre-fills the booking form when an empty slot is clicked. */
  onPick: (start: Date) => void;
  /** Highlighted as "this client", so an admin can see their other calls. */
  currentEnquiryId?: string;
  /** The week to open on. Defaults to this one; set to the week a client
   *  asked for, so "is that free?" is answered without any paging. */
  startOn?: Date;
}

function minutesFromDayStart(date: Date): number {
  return (date.getHours() - DAY_START_HOUR) * 60 + date.getMinutes();
}

/**
 * A week of consultations, so a slot is picked against what is already booked.
 *
 * Shows what is **taken**, never computing "free" — the API deliberately does
 * not either. An empty cell is a suggestion; the server still refuses a clash
 * on submit, which is what makes two admins in two tabs safe.
 *
 * Times are the admin's local timezone. Everything is stored UTC and converted
 * here, in one place, so the conversion cannot drift between screens.
 */
export function AvailabilityGrid({ onPick, currentEnquiryId, startOn }: Props) {
  const [anchor, setAnchor] = useState(() => startOn ?? new Date());
  const { weekStart, booked, error } = useAvailability(anchor);

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const day = new Date(weekStart);
        day.setDate(day.getDate() + i);
        return day;
      }),
    [weekStart],
  );

  const byDay = useMemo(() => {
    const map = new Map<string, BookedSlot[]>();
    for (const slot of booked ?? []) {
      const key = new Date(slot.starts_at).toDateString();
      map.set(key, [...(map.get(key) ?? []), slot]);
    }
    return map;
  }, [booked]);

  const shift = (weeks: number) => {
    const next = new Date(anchor);
    next.setDate(next.getDate() + weeks * 7);
    setAnchor(next);
  };

  const today = new Date().toDateString();

  return (
    <div className="border border-ink/10 rounded-xl bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-ink/10 bg-canvas">
        <div>
          <p className="text-[14.5px] font-semibold text-ink">
            {weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })} —{' '}
            {days[6]!.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
          <p className="text-[12.5px] text-ink/45">
            Times shown in your local timezone. Click a slot to book it.
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => shift(-1)}
            aria-label="Previous week"
            className="p-1.5 rounded border border-ink/15 text-ink/70 hover:bg-white cursor-pointer"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            type="button"
            onClick={() => setAnchor(new Date())}
            className="px-3 py-1.5 rounded border border-ink/15 text-ink/70 text-[12.5px] uppercase tracking-[0.08em] font-semibold hover:bg-white cursor-pointer"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            aria-label="Next week"
            className="p-1.5 rounded border border-ink/15 text-ink/70 hover:bg-white cursor-pointer"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="px-4 py-3 text-[13.5px] text-red-800 bg-red-50">
          {error}
        </p>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-ink/10">
            <div />
            {days.map((day) => {
              const isToday = day.toDateString() === today;
              return (
                <div
                  key={day.toISOString()}
                  className={`px-2 py-2 text-center border-l border-ink/5 ${isToday ? 'bg-gold/10' : ''}`}
                >
                  <p className="text-[11.5px] uppercase tracking-[0.1em] text-ink/45 font-bold">
                    {day.toLocaleDateString('en-GB', { weekday: 'short' })}
                  </p>
                  <p
                    className={`text-[16.5px] font-semibold ${isToday ? 'text-gold' : 'text-ink'}`}
                  >
                    {day.getDate()}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-[56px_repeat(7,1fr)] relative">
            <div>
              {Array.from({ length: ROWS }, (_, row) => {
                const hour = DAY_START_HOUR + Math.floor((row * SLOT_MINUTES) / 60);
                const onTheHour = (row * SLOT_MINUTES) % 60 === 0;
                return (
                  <div
                    key={row}
                    className="h-7 text-[11.5px] text-ink/40 text-right pr-2 -translate-y-1.5 tabular-nums"
                  >
                    {onTheHour ? `${String(hour).padStart(2, '0')}:00` : ''}
                  </div>
                );
              })}
            </div>

            {days.map((day) => {
              const slots = byDay.get(day.toDateString()) ?? [];
              return (
                <div key={day.toISOString()} className="relative border-l border-ink/5">
                  {Array.from({ length: ROWS }, (_, row) => {
                    const start = new Date(day);
                    start.setHours(
                      DAY_START_HOUR + Math.floor((row * SLOT_MINUTES) / 60),
                      (row * SLOT_MINUTES) % 60,
                      0,
                      0,
                    );
                    const past = start.getTime() < Date.now();
                    return (
                      <button
                        key={row}
                        type="button"
                        disabled={past}
                        onClick={() => onPick(start)}
                        aria-label={`Book ${start.toLocaleString('en-GB')}`}
                        className={`block w-full h-7 border-b ${
                          (row * SLOT_MINUTES) % 60 === 0 ? 'border-ink/10' : 'border-ink/5'
                        } ${
                          past ? 'bg-ink/3 cursor-not-allowed' : 'hover:bg-gold/15 cursor-pointer'
                        } transition-colors`}
                      />
                    );
                  })}

                  {/* Bookings sit above the clickable grid, positioned by real
                      time rather than snapped to a row — a 45-minute call at
                      10:20 would otherwise render as if it were 10:30–11:00. */}
                  {slots.map((slot) => {
                    const from = new Date(slot.starts_at);
                    const to = new Date(slot.ends_at);
                    const top = (minutesFromDayStart(from) / SLOT_MINUTES) * 28;
                    const height = Math.max(
                      ((to.getTime() - from.getTime()) / 60000 / SLOT_MINUTES) * 28,
                      18,
                    );
                    const mine = slot.enquiry_id === currentEnquiryId;
                    // A call outside the rendered day would float off the grid.
                    if (top < 0 || top > ROWS * 28) return null;
                    return (
                      <div
                        key={slot.consultation_id}
                        title={`${slot.client_name} — ${slot.event_type}, ${slot.duration_minutes} min`}
                        style={{ top, height }}
                        className={`absolute left-0.5 right-0.5 rounded px-1.5 py-0.5 overflow-hidden pointer-events-none border ${
                          mine
                            ? 'bg-gold/30 border-gold text-ink'
                            : 'bg-forest/90 border-forest text-canvas'
                        }`}
                      >
                        <p className="text-[11.5px] font-semibold leading-tight truncate">
                          {slot.client_name}
                        </p>
                        <p className="text-[10.5px] leading-tight truncate opacity-75">
                          {from.toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {booked !== null && booked.length === 0 && (
        <p className="px-4 py-3 text-[13.5px] text-ink/45 border-t border-ink/10">
          Nothing booked this week.
        </p>
      )}
    </div>
  );
}
