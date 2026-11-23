import { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiError } from '@cabmora/api-client';

import { getAvailability, type BookedSlot } from '@/features/enquiries/api';

/** Monday of the week containing `day`, at local midnight. */
function startOfWeek(day: Date): Date {
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  // getDay() is 0 for Sunday; shift so Monday leads the week.
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
}

/**
 * A week of booked consultations.
 *
 * The window is built from local midnight and sent as ISO, so the server sees
 * the instants the admin means. Everything is stored UTC; the grid is the only
 * place a timezone is applied, which keeps the conversion in one spot.
 */
export function useAvailability(anchor: Date) {
  const weekStart = useMemo(() => startOfWeek(anchor), [anchor]);
  const weekEnd = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 7);
    return end;
  }, [weekStart]);

  const [booked, setBooked] = useState<BookedSlot[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const page = await getAvailability(weekStart.toISOString(), weekEnd.toISOString());
      setBooked(page.booked);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load the calendar.');
    }
  }, [weekStart, weekEnd]);

  useEffect(() => {
    let cancelled = false;
    getAvailability(weekStart.toISOString(), weekEnd.toISOString())
      .then((page) => {
        if (!cancelled) setBooked(page.booked);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Could not load the calendar.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [weekStart, weekEnd]);

  return { weekStart, weekEnd, booked, error, reload: load };
}
