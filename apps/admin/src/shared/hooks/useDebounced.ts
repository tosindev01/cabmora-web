import { useEffect, useState } from 'react';

/**
 * Delays a fast-changing value.
 *
 * Search hits the API, so without this every keystroke is a request — and
 * responses can arrive out of order, briefly showing results for a prefix of
 * what was typed.
 */
export function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
