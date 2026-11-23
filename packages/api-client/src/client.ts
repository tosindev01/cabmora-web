const BASE_URL = '/api/v1';

/**
 * The address of an endpoint, for the few things a `fetch` cannot do.
 *
 * A file download is a navigation, not a request whose body we parse: the
 * browser streams it, names it from Content-Disposition and offers to save
 * it. That needs an href, and an href still has to agree with where the API
 * lives — so it is built here rather than typed out in a component, where it
 * would be the one absolute path that survives a base-URL change.
 */
export function apiUrl(path: string): string {
  return `${BASE_URL}${path}`;
}

/** Per-field detail from a 422, for forms that highlight individual inputs. */
export interface FieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    /** Present on schema failures; `message` is always the human summary. */
    public fieldErrors?: FieldError[],
  ) {
    super(message);
  }
}

/**
 * Fetch wrapper for the Cabmora API.
 *
 * The session is an HttpOnly cookie the API sets at login, so there is no token
 * to read, store or attach here — and deliberately so. The previous version
 * kept a JWT in `localStorage`, which meant any injected script on a portal
 * page could read the session and walk off with it. Script cannot touch an
 * HttpOnly cookie.
 *
 * `credentials: 'same-origin'` is what makes the browser send it. It works
 * because the SPA and the API share an origin in every environment — nginx
 * proxies `/api` to the API container, which is also why `BASE_URL` is
 * relative and why CORS never engages.
 */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  /* `FormData` sets its own content type, and it has to: the header carries
     the multipart boundary, which only the browser knows. Declaring JSON over
     the top produces a request the server cannot parse and an error that
     blames the file. */
  const sendingForm = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(sendingForm ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };

  const resp = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'same-origin',
  });

  if (!resp.ok) {
    let detail = resp.statusText;
    let fieldErrors: FieldError[] | undefined;
    try {
      const body = await resp.json();
      // The API guarantees `detail` is a human-readable string on every error —
      // domain rule, schema violation or crash alike. This used to
      // `JSON.stringify` a non-string, which put raw pydantic output in
      // user-facing error banners. The fallback now stays generic instead.
      detail = typeof body.detail === 'string' ? body.detail : resp.statusText;
      fieldErrors = Array.isArray(body.errors) ? body.errors : undefined;
    } catch {
      /* keep statusText */
    }
    throw new ApiError(resp.status, detail, fieldErrors);
  }

  // 204 and other empty bodies: `resp.json()` would throw on an empty stream,
  // which is how a successful logout used to look like a failure.
  if (resp.status === 204 || resp.headers.get('content-length') === '0') {
    return undefined as T;
  }

  return (await resp.json()) as T;
}
