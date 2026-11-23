import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Copy, Check, Search, UserPlus, UserX, Users } from 'lucide-react';

import { Modal } from '@cabmora/ui';
import { ApiError, type User } from '@cabmora/api-client';

import { createProject, listEventTypes, type Project } from '@/features/projects/api';
import { createAccount, listUsers } from '@/features/users/api';
import { displayName } from '@/features/users/display';
import { useDebounced } from '@/shared/hooks/useDebounced';

type CustomerMode = 'existing' | 'new' | 'none';

const MODES: { id: CustomerMode; label: string; icon: typeof Users; hint: string }[] = [
  { id: 'existing', label: 'Existing client', icon: Users, hint: 'They already have an account.' },
  {
    id: 'new',
    label: 'Create their account',
    icon: UserPlus,
    hint: 'We email them a link to set a password — they never have to sign up.',
  },
  { id: 'none', label: 'Decide later', icon: UserX, hint: 'Assign a client once you know them.' },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (project: Project) => void;
}

/**
 * Book a project, optionally provisioning the client's account at the same
 * time.
 *
 * The three modes exist because an enquiry gives you a name and an email but
 * not an account: making the admin create the person separately, then come
 * back, is the friction this removes.
 */
export function NewProjectModal({ open, onOpenChange, onCreated }: Props) {
  /* Loaded when the modal opens rather than with the page: it is one small
     query and it has to be current, because somebody may have invented a
     category on another project a minute ago. */
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  useEffect(() => {
    let cancelled = false;
    listEventTypes()
      .then((types) => !cancelled && setEventTypes(types))
      // A picker that cannot load its suggestions still accepts typing, which
      // is the part that matters.
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const [mode, setMode] = useState<CustomerMode>('existing');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Existing-client search
  const [search, setSearch] = useState('');
  const [matches, setMatches] = useState<User[]>([]);
  const [picked, setPicked] = useState<User | null>(null);
  const debounced = useDebounced(search);

  // Shown once after provisioning, because the logging email sender does not
  // actually deliver yet.
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (mode !== 'existing' || debounced.trim().length < 2) {
      setMatches([]);
      return;
    }
    let cancelled = false;
    listUsers({ role: 'customer', q: debounced.trim(), limit: 8 })
      .then((page) => !cancelled && setMatches(page.items))
      .catch(() => !cancelled && setMatches([]));
    return () => {
      cancelled = true;
    };
  }, [debounced, mode]);

  const reset = useCallback(() => {
    setMode('existing');
    setSearch('');
    setMatches([]);
    setPicked(null);
    setError(null);
    setInviteUrl(null);
    setCopied(false);
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);

    if (mode === 'existing' && !picked) {
      setError('Choose a client, or pick another option.');
      return;
    }

    setSubmitting(true);
    try {
      let customerId: string | undefined;

      if (mode === 'existing') {
        customerId = picked!.id;
      } else if (mode === 'new') {
        // Provisioned first: if this fails the project is not created, so we
        // never leave a project orphaned from a client that does not exist.
        const account = await createAccount({
          email: String(form.get('new_email')),
          first_name: String(form.get('new_first_name')),
          last_name: String(form.get('new_last_name')),
        });
        customerId = account.id;
        setInviteUrl(account.invite_url);
      }

      const project = await createProject({
        title: String(form.get('title')),
        event_type: String(form.get('event_type')),
        location: String(form.get('location')) || undefined,
        event_date: String(form.get('event_date')) || null,
        customer_id: customerId,
      });

      onCreated(project);

      // With an invite to hand over, the modal stays open so the link can be
      // copied — it is shown once and cannot be recovered.
      if (mode !== 'new') {
        onOpenChange(false);
        reset();
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create the project.');
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
      title="New project"
      description="Book a project and, if you like, set up the client's account at the same time."
      size="lg"
    >
      {inviteUrl ? (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-[14.5px] text-amber-900 font-medium mb-1">
              Send this link to the client
            </p>
            <p className="text-[13.5px] text-amber-900/80">
              We have emailed it to them, but email is not wired up yet — copy it now, because it is
              shown once and cannot be recovered.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input readOnly value={inviteUrl} className={`${field} font-mono text-[12.5px]`} />
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
            <div className="sm:col-span-2">
              <label htmlFor="np-title" className={label}>
                Project title
              </label>
              <input id="np-title" name="title" className={field} required autoFocus />
            </div>
            <div>
              <label htmlFor="np-type" className={label}>
                Event type
              </label>
              {/* A datalist, not a select.
              
                  The categories are whatever projects already use, so the
                  list has to suggest without constraining: picking an
                  existing one keeps the spelling consistent, and typing a new
                  one *is* how a category gets created. A `<select>` would
                  make new categories impossible; a plain input is what let
                  "Wedding", "wedding" and "Weddings" all into the data. */}
              <input
                id="np-type"
                name="event_type"
                list="np-type-options"
                className={field}
                placeholder="Wedding"
                autoComplete="off"
                required
              />
              <datalist id="np-type-options">
                {eventTypes.map((type) => (
                  <option key={type} value={type} />
                ))}
              </datalist>
              <p className="text-[12px] text-ink/40 mt-1.5">
                Pick one that exists, or type a new one to create it.
              </p>
            </div>
            <div>
              <label htmlFor="np-date" className={label}>
                Event date
              </label>
              <input id="np-date" name="event_date" type="date" className={field} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="np-location" className={label}>
                Location
              </label>
              <input id="np-location" name="location" className={field} />
            </div>
          </div>

          {/* Client */}
          <fieldset className="border-t border-ink/10 pt-4">
            <legend className={label}>Client</legend>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
              {MODES.map(({ id, label: modeLabel, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id)}
                  aria-pressed={mode === id}
                  className={`px-3 py-2 rounded-lg border text-[13.5px] font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    mode === id
                      ? 'bg-ink text-white border-ink'
                      : 'bg-canvas text-ink/70 border-ink/15 hover:border-gold/50'
                  }`}
                >
                  <Icon size={14} />
                  {modeLabel}
                </button>
              ))}
            </div>
            <p className="text-[13.5px] text-ink/55 mb-3">
              {MODES.find((m) => m.id === mode)!.hint}
            </p>

            {mode === 'existing' && (
              <div className="space-y-2">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40"
                  />
                  <input
                    value={picked ? displayName(picked.full_name) : search}
                    onChange={(e) => {
                      setPicked(null);
                      setSearch(e.target.value);
                    }}
                    placeholder="Search clients by name or email..."
                    aria-label="Search clients"
                    className={`${field} pl-9`}
                  />
                </div>
                {!picked && matches.length > 0 && (
                  <ul className="border border-ink/15 rounded-lg divide-y divide-ink/5 max-h-44 overflow-y-auto">
                    {matches.map((user) => (
                      <li key={user.id}>
                        <button
                          type="button"
                          onClick={() => setPicked(user)}
                          className="w-full text-left px-3 py-2 hover:bg-canvas transition-colors cursor-pointer"
                        >
                          <span className="text-[14.5px] text-ink block">
                            {displayName(user.full_name)}
                          </span>
                          <span className="text-[12.5px] text-ink/50">{user.email}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {mode === 'new' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="np-first" className={label}>
                    First name
                  </label>
                  <input id="np-first" name="new_first_name" className={field} required />
                </div>
                <div>
                  <label htmlFor="np-last" className={label}>
                    Last name
                  </label>
                  <input id="np-last" name="new_last_name" className={field} required />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="np-email" className={label}>
                    Email
                  </label>
                  <input id="np-email" name="new_email" type="email" className={field} required />
                </div>
              </div>
            )}
          </fieldset>

          <button
            type="submit"
            disabled={submitting}
            aria-busy={submitting}
            className="w-full bg-ink text-white px-5 py-2.5 rounded-full text-[13.5px] font-bold tracking-[0.05em] uppercase hover:bg-gold hover:text-ink transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating…' : 'Create project'}
          </button>
        </form>
      )}
    </Modal>
  );
}
