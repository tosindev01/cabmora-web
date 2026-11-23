import { useState, type FormEvent } from 'react';

import { Check, Copy } from 'lucide-react';

import { Modal, Select } from '@cabmora/ui';
import { ApiError, type UserRole } from '@cabmora/api-client';

import { createAccount } from '@/features/users/api';
import { ROLE_OPTIONS, type RoleGroup } from '@/features/users/display';

interface Props {
  group: RoleGroup;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Re-read the list so the new row appears with everything else. */
  onCreated: () => void;
}

const COPY: Record<RoleGroup, { title: string; description: string; hint: string }> = {
  client: {
    title: 'Add a client',
    description: 'Create an account for someone who booked without signing up.',
    hint: 'They get an email with a link to choose their own password. Nobody here ever sees it.',
  },
  team: {
    title: 'Add a colleague',
    description: 'Create an account for someone at Cabmora.',
    hint: 'They get an email with a link to choose a password, and it brings them to this console rather than the public site.',
  },
};

/**
 * Create an account from a name and an email.
 *
 * No password field, deliberately. The alternative — an admin types a
 * temporary password and reads it down the phone — means a second person
 * knows it, and it is usually still working a year later.
 *
 * The role choices are this screen's own group, because that is the list the
 * new account will appear in and an add button that files someone elsewhere
 * is a surprise. Moving them afterwards is the row's own role control.
 */
export function NewAccountModal({ group, open, onOpenChange, onCreated }: Props) {
  const roles = ROLE_OPTIONS.filter((r) => r.group === group);
  const [role, setRole] = useState<UserRole>(roles[0]!.value);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Shown once after creating, because the logging email sender does not
  // actually deliver outside production.
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function reset() {
    setRole(roles[0]!.value);
    setError(null);
    setInviteUrl(null);
    setCopied(false);
    setSubmitting(false);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);
    setSubmitting(true);

    try {
      const account = await createAccount({
        email: String(form.get('email')).trim(),
        first_name: String(form.get('first_name')).trim(),
        last_name: String(form.get('last_name')).trim(),
        role,
      });
      onCreated();

      if (account.invite_url) {
        // Stay open so the link can be copied: it is shown once and cannot be
        // recovered, and closing over it would strand the new account.
        setInviteUrl(account.invite_url);
      } else {
        onOpenChange(false);
        reset();
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create the account.');
    } finally {
      setSubmitting(false);
    }
  }

  const field =
    'bg-canvas border border-ink/15 px-3 py-2 text-[14.5px] outline-none focus:border-gold rounded-lg w-full';
  const label = 'text-[12.5px] uppercase tracking-[0.1em] font-bold text-ink/50 block mb-1.5';

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
      title={COPY[group].title}
      description={COPY[group].description}
      size="md"
    >
      {inviteUrl ? (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-[14.5px] text-amber-900 font-medium mb-1">Send them this link</p>
            <p className="text-[13.5px] text-amber-900/80">
              We have emailed it, but email is not delivering outside production — copy it now,
              because it is shown once and cannot be recovered.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              readOnly
              value={inviteUrl}
              aria-label="Invite link"
              className={`${field} font-mono text-[12.5px]`}
            />
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(inviteUrl);
                setCopied(true);
              }}
              className="px-3 py-2 rounded-lg border border-ink/15 text-ink/70 hover:bg-canvas cursor-pointer flex-shrink-0"
              aria-label="Copy invite link"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              reset();
            }}
            className="w-full bg-ink text-white px-5 py-2.5 rounded-full text-[13.5px] font-bold tracking-[0.05em] uppercase hover:bg-gold hover:text-ink transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 text-red-800 px-4 py-2.5 rounded-lg text-[14.5px]"
            >
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="new-first-name" className={label}>
                First name
              </label>
              <input id="new-first-name" name="first_name" required className={field} />
            </div>
            <div>
              <label htmlFor="new-last-name" className={label}>
                Last name
              </label>
              <input id="new-last-name" name="last_name" required className={field} />
            </div>
          </div>

          <div>
            <label htmlFor="new-email" className={label}>
              Email
            </label>
            <input id="new-email" name="email" type="email" required className={field} />
          </div>

          <div>
            <label htmlFor="new-role" className={label}>
              Role
            </label>
            <Select
              id="new-role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className={`${field} pr-9`}
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Select>
            {group === 'team' && role === 'admin' && (
              <p className="text-[13.5px] text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
                An administrator can open every project and every client&rsquo;s photographs, and
                can change anyone&rsquo;s role — including yours.
              </p>
            )}
          </div>

          <p className="text-[13.5px] text-ink/55 border-t border-ink/10 pt-4">
            {COPY[group].hint}
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-ink text-white px-5 py-2.5 rounded-full text-[13.5px] font-bold tracking-[0.05em] uppercase hover:bg-gold hover:text-ink transition-colors cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Creating…' : 'Create account and send invite'}
          </button>
        </form>
      )}
    </Modal>
  );
}
