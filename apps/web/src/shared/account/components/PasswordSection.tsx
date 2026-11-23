import { useState, type FormEvent } from 'react';

import { accountApi, ApiError } from '@cabmora/api-client';

import { Field } from './Field';

/** Matches the server and the reset flow. Two different minimums would mean a
 *  password this form accepts and the API refuses. */
const MIN_LENGTH = 8;

/**
 * Change your password, having proved you know the current one.
 *
 * The confirmation field is checked here and never sent: the server has
 * nothing to compare it against, since a broken client simply sends the same
 * string twice. It exists to catch a typo, which is a client-side job.
 */
export function PasswordSection() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const mismatch = confirm.length > 0 && next !== confirm;
  const ready = current.length > 0 && next.length >= MIN_LENGTH && next === confirm;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready || saving) return;

    setSaving(true);
    setError(null);
    setDone(false);
    try {
      await accountApi.changePassword(current, next);
      setCurrent('');
      setNext('');
      setConfirm('');
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Your password could not be changed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-8 max-w-[520px]">
      <Field
        label="Current password"
        type="password"
        value={current}
        onChange={setCurrent}
        autoComplete="current-password"
      />
      <Field
        label="New password"
        type="password"
        value={next}
        onChange={setNext}
        autoComplete="new-password"
        hint={`At least ${MIN_LENGTH} characters.`}
      />
      <Field
        label="Confirm new password"
        type="password"
        value={confirm}
        onChange={setConfirm}
        autoComplete="new-password"
      />

      {mismatch && (
        <p role="alert" className="text-[13px] text-red-700">
          The two new passwords do not match.
        </p>
      )}
      {error && (
        <p role="alert" className="text-[13px] text-red-700">
          {error}
        </p>
      )}
      {done && (
        <p role="status" className="text-[13px] text-emerald-700">
          Your password has been changed. You are still signed in here.
        </p>
      )}

      <button
        type="submit"
        disabled={!ready || saving}
        className="text-[11px] tracking-[0.15em] uppercase font-medium bg-ink text-canvas px-7 py-3.5 hover:bg-ink/85 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {saving ? 'Changing…' : 'Change password'}
      </button>
    </form>
  );
}
