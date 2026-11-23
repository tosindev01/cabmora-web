import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ApiError, type Page } from '@cabmora/api-client';

import { useDebounced } from '@/shared/hooks/useDebounced';

/** Anything a filter can be, before it becomes a query parameter. */
export type FilterValue = string | number | boolean | undefined;

interface Options<T, F extends Record<string, FilterValue>> {
  /** Usually a thin wrapper around `fetchPage`. Must be stable (useCallback). */
  fetcher: (params: Record<string, FilterValue>) => Promise<Page<T>>;
  initialFilters: F;
  /** Filters whose value should settle before a request — search boxes. */
  debounceKeys?: (keyof F)[];
  pageSize?: number;
  /** Filter values meaning "no filter"; dropped rather than sent. */
  emptyValues?: FilterValue[];
}

/**
 * Server-driven list state: paging, filtering, search, and the ordering hazards
 * that come with them.
 *
 * Shared because every admin collection needs the same behaviour — users and
 * projects today, enquiries, reviews and payments behind them. It lives in the
 * app rather than a package because only `apps/admin` consumes it; promote it
 * when `apps/web` needs it too.
 */
export function usePaginatedList<T, F extends Record<string, FilterValue>>({
  fetcher,
  initialFilters,
  debounceKeys = [],
  pageSize = 30,
  emptyValues = ['All', ''],
}: Options<T, F>) {
  const [items, setItems] = useState<T[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<F>(initialFilters);
  const [error, setError] = useState<string | null>(null);

  // Only the newest request may write to state. Without this an earlier,
  // slower response can land after a later one and overwrite it, leaving the
  // list showing results for a filter the user has already moved off.
  const requestId = useRef(0);

  // Serialised so the debounce carries whole values. Joining on a separator
  // would corrupt any value containing it, and joining on '' makes a
  // multi-character search unrecoverable.
  const settled = useDebounced(JSON.stringify(debounceKeys.map((key) => filters[key] ?? null)));

  const query = useMemo(() => {
    const debouncedValues = JSON.parse(settled) as FilterValue[];
    const out: Record<string, FilterValue> = {};

    // Immediate filters (dropdowns) apply on change; debounced ones (search)
    // wait for a pause, so typing costs one request rather than one per key.
    for (const [key, value] of Object.entries(filters)) {
      if (debounceKeys.includes(key as keyof F)) continue;
      if (!emptyValues.includes(value)) out[key] = value;
    }
    debounceKeys.forEach((key, index) => {
      const value = debouncedValues[index] ?? undefined;
      if (!emptyValues.includes(value)) out[key as string] = value;
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, settled]);

  const queryKey = JSON.stringify(query);

  // Changing a filter must return to the first page: narrowing to three
  // results while sitting on page five yields an empty table, which reads as a
  // bug rather than as "you are past the end".
  useEffect(() => {
    setPage(0);
  }, [queryKey]);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    try {
      const result = await fetcher({
        ...(JSON.parse(queryKey) as Record<string, FilterValue>),
        limit: pageSize,
        offset: page * pageSize,
      });
      if (id !== requestId.current) return;
      setItems(result.items);
      setTotal(result.total);
      setError(null);
    } catch (err) {
      if (id !== requestId.current) return;
      setError(err instanceof ApiError ? err.message : 'Could not load this list.');
    }
  }, [fetcher, queryKey, page, pageSize]);

  useEffect(() => {
    void load();
  }, [load]);

  const setFilter = useCallback(<K extends keyof F>(key: K, value: F[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  /** Replace one row in place, from a server response. */
  const replaceItem = useCallback((match: (item: T) => boolean, next: T) => {
    setItems((prev) => prev?.map((item) => (match(item) ? next : item)) ?? null);
  }, []);

  return {
    items,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
    filters,
    error,
    setPage,
    setFilter,
    setError,
    replaceItem,
    refresh: load,
  };
}
