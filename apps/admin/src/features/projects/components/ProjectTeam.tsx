import { Check, UserPlus } from 'lucide-react';

import type { ProjectDetail } from '@/features/projects/api';
import { useProjectTeam } from '@/features/projects/hooks/useProjectTeam';

interface Props {
  project: ProjectDetail;
  /** Re-read the project so `member_ids` reflects what was saved. */
  onSaved: () => void;
}

const CARD = 'bg-white border border-ink/10 rounded-xl shadow-xs';

const ROLE_LABEL: Record<string, string> = {
  coordinator: 'Coordinator',
  creator: 'Partner creator',
};

/**
 * Who from Cabmora is on this shoot.
 *
 * This is the only control in the console that grants sight of a client's
 * photographs, so it says so plainly rather than presenting a tidy list of
 * names. A coordinator sees a project because their name is ticked here and
 * for no other reason.
 */
export function ProjectTeam({ project, onSaved }: Props) {
  const { staff, selected, toggle, dirty, saving, error, savedAt, save } = useProjectTeam(project);

  if (staff === null) {
    return <p className="text-center py-16 text-ink/50 text-[15.5px]">Loading people…</p>;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-800 px-5 py-3 rounded-xl text-[14.5px]"
        >
          {error}
        </div>
      )}

      <div className={`${CARD} p-6`}>
        <h2 className="text-[16.5px] font-medium text-ink">Who is on this shoot</h2>
        <p className="text-ink/55 text-[14.5px] mt-0.5 mb-5">
          Everyone ticked here can open this project — the gallery, the client&rsquo;s details and
          their photographs. Nobody else at Cabmora can, apart from administrators.
        </p>

        {staff.length === 0 ? (
          <p className="text-[14.5px] text-ink/50 py-6 text-center">
            No coordinators or partner creators yet. Change someone&rsquo;s role under User
            Management and they will appear here.
          </p>
        ) : (
          <ul className="divide-y divide-ink/8 border-y border-ink/8">
            {staff.map((person) => {
              const on = selected.includes(person.id);
              return (
                <li key={person.id}>
                  <label className="flex items-center gap-3 py-3 cursor-pointer group">
                    <span
                      className={`w-5 h-5 rounded border grid place-items-center shrink-0 transition-colors ${
                        on
                          ? 'bg-gold border-gold text-ink'
                          : 'border-ink/20 group-hover:border-ink/40'
                      }`}
                    >
                      {on && <Check size={13} />}
                    </span>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={on}
                      onChange={() => toggle(person.id)}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15.5px] text-ink truncate">
                        {person.full_name}
                      </span>
                      <span className="block text-[13.5px] text-ink/50 truncate">
                        {person.email}
                      </span>
                    </span>
                    <span className="text-[11.5px] uppercase tracking-[0.08em] text-ink/40 shrink-0">
                      {ROLE_LABEL[person.role] ?? person.role}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex items-center justify-end gap-3 mt-5">
          {savedAt !== null && !dirty && <span className="text-[13.5px] text-ink/45">Saved</span>}
          <button
            type="button"
            disabled={!dirty || saving}
            onClick={() => void save().then((ok) => ok && onSaved())}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold text-ink text-[13px] font-semibold uppercase tracking-[0.08em] hover:bg-gold-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <UserPlus size={14} />
            {saving ? 'Saving…' : 'Save team'}
          </button>
        </div>
      </div>
    </div>
  );
}
