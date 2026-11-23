import { apiFetch } from './client';

/**
 * The response shape for every paginated collection, matching `Page[T]` on the
 * API. One contract for all of them: a client that can read one can read them
 * all, rather than each endpoint inventing its own envelope.
 */
export interface Page<T> {
  items: T[];
  /** Matches the current filters, never the grand total. */
  total: number;
  limit: number;
  offset: number;
}

export type QueryValue = string | number | boolean | undefined | null | readonly string[];

/**
 * Build a query string, dropping empties.
 *
 * `undefined`, `null` and `''` are omitted rather than sent — otherwise
 * clearing a search box posts `?q=` and the API treats it as a filter that
 * matches nothing.
 */
export function buildQuery(params: Record<string, QueryValue>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      // A repeated key — `?role=admin&role=coordinator` — because that is how
      // FastAPI reads a list. Joining on a comma would arrive as one value
      // the API has never heard of, and it ignores parameters it does not
      // know, so the filter would silently do nothing.
      for (const item of value) if (item !== '') search.append(key, item);
      continue;
    }
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

/** Any paginated collection: `fetchPage<User>('/admin/users', { limit, offset })`. */
export function fetchPage<T>(path: string, params: Record<string, QueryValue> = {}) {
  return apiFetch<Page<T>>(`${path}${buildQuery(params)}`);
}

/** Non-paginated GETs, with the same query handling. */
export function fetchList<T>(path: string, params: Record<string, QueryValue> = {}) {
  return apiFetch<T[]>(`${path}${buildQuery(params)}`);
}
