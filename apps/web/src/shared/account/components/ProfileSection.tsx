import { useState, type FormEvent } from 'react';

import { accountApi, ApiError, type ProfileChanges, type User } from '@cabmora/api-client';

import { AvatarField } from './AvatarField';
import { Field, ReadOnlyField } from './Field';

interface ProfileSectionProps {
  user: User;
  /** Called with the account the server returned after any successful write. */
  onSaved: (user: User) => void;
}

/**
 * Profile — picture, name, email address and phone number.
 *
 * Sends only what changed. A PATCH that always carried every field would let
 * a stale form overwrite something edited in another tab, and would re-submit
 * the email address on every save, which makes the server re-check uniqueness
 * for no reason.
 */
export function ProfileSection({ user, onSaved }: ProfileSectionProps) {
  const [firstName, setFirstName] = useState(user.first_name);
  const [lastName, setLastName] = useState(user.last_name);
  const [phone, setPhone] = useState(user.phone ?? '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const changes: ProfileChanges = {};
  if (firstName.trim() !== user.first_name) changes.first_name = firstName.trim();
  if (lastName.trim() !== user.last_name) changes.last_name = lastName.trim();
  if (phone.trim() !== (user.phone ?? '')) changes.phone = phone.trim();
  const dirty = Object.keys(changes).length > 0;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!dirty || saving) return;

    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      onSaved(await accountApi.updateProfile(changes));
      setSaved(true);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Your details could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <AvatarField user={user} onUploaded={onSaved} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field
          label="First name"
          value={firstName}
          onChange={setFirstName}
          autoComplete="given-name"
        />
        <Field
          label="Last name"
          value={lastName}
          onChange={setLastName}
          autoComplete="family-name"
        />
        {/* Read-only, and shown rather than hidden: people need to see which
            address their account is under. Changing it moves the login, the
            password-reset destination and the invite target at once, so it is
            something the studio does, not something the form does. */}
        <ReadOnlyField
          label="Email address"
          value={user.email}
          hint="This is how you sign in. Contact us if it needs changing."
        />
        <Field
          label="Phone number"
          type="tel"
          value={phone}
          onChange={setPhone}
          autoComplete="tel"
          hint="Optional. Leave blank to remove it."
        />
      </div>

      {error && (
        <p role="alert" className="text-[13px] text-red-700">
          {error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={!dirty || saving}
          className="text-[11px] tracking-[0.15em] uppercase font-medium bg-ink text-canvas px-7 py-3.5 hover:bg-ink/85 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {/* Announced, because the button it replaces is not where the eye is
            after a save and a silent success reads as nothing happening. */}
        {saved && !dirty && (
          <span role="status" className="text-[13px] text-emerald-700">
            Saved.
          </span>
        )}
      </div>
    </form>
  );
}
