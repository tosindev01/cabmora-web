import { ApiError } from '@cabmora/api-client';

/**
 * The lifecycle of one form submission.
 *
 * A single value rather than separate `submitting` / `error` booleans, which
 * would let `submitting && error` — a state that means nothing — be
 * representable and therefore eventually rendered.
 */
export type SubmitState =
  { status: 'idle' } | { status: 'submitting' } | { status: 'error'; message: string };

/**
 * Turn a thrown value into something safe to show a user.
 *
 * `ApiError` carries the API's own `detail` ("Invalid email or password"),
 * which is written for humans. Anything else is a network or parse failure and
 * would leak an implementation detail if rendered raw.
 */
export function toErrorState(err: unknown): SubmitState {
  return {
    status: 'error',
    message:
      err instanceof ApiError ? err.message : 'Could not reach the server. Please try again.',
  };
}
