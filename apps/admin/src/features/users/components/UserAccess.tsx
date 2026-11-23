import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { User } from '@cabmora/api-client';

import { STAGE_LABEL, STAGE_PILL } from '@/shared/format';

import { useUserAccess } from '@/features/users/hooks/useUserAccess';

interface Props {
  user: User;
}

/** What "can open" means for each kind of account, in one place. */
const EXPLAINER: Record<User['role'], string> = {
  admin: 'Administrators reach every project in the system.',
  coordinator: 'A coordinator opens a project only when they are on its team.',
  creator: 'A partner creator opens the shoots assigned to them.',
  customer: 'A client opens their own work once it has been released to them.',
};

const EMPTY: Record<User['role'], string> = {
  admin: '',
  coordinator: 'Not on any shoots.',
  creator: 'No shoots assigned.',
  customer: 'No projects of their own.',
};

/**
 * The projects this account can open.
 *
 * The oversight question — "what can this person see?" — read from the same
 * endpoint that answers it for them, rather than recomputed here. A second
 * implementation of the access rule is a second thing to get wrong, and this
 * panel exists precisely to be trusted.
 *
 * It never renders a bare zero. An administrator gets a sentence saying they
 * reach everything, and everyone else gets a sentence naming what an empty
 * list means, because "0" on this screen is indistinguishable from "we did
 * not check".
 */
export function UserAccess({ user }: Props) {
  const { projects, total, unrestricted, error } = useUserAccess(user);

  return (
    <div className="bg-white border border-ink/10 rounded-xl shadow-xs p-6">
      <h2 className="text-[12.5px] uppercase tracking-[0.12em] font-bold text-ink/50 mb-1">
        Can open
      </h2>
      <p className="text-ink/55 text-[14.5px] mb-4">{EXPLAINER[user.role]}</p>

      {unrestricted ? (
        <p className="flex items-start gap-2.5 text-[14.5px] text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <ShieldAlert size={16} className="flex-shrink-0 mt-px" />
          <span>
            <strong className="font-semibold">Administrator</strong> — can open every project, every
            client and every gallery. Team membership does not restrict this account.
          </span>
        </p>
      ) : error ? (
        <p role="alert" className="text-[14.5px] text-red-800">
          {error}
        </p>
      ) : projects === null ? (
        <p className="text-[14.5px] text-ink/50 py-2">Checking…</p>
      ) : projects.length === 0 ? (
        <p className="text-[14.5px] text-ink/50 py-2">{EMPTY[user.role]}</p>
      ) : (
        <>
          <ul className="divide-y divide-ink/8 border-y border-ink/8">
            {projects.map((project) => (
              <li key={project.id}>
                <Link
                  to={`/admin/projects/${project.id}`}
                  className="flex items-center gap-3 py-3 group"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14.5px] font-medium text-ink truncate group-hover:text-gold transition-colors">
                      {project.title}
                    </span>
                    <span className="block text-[13.5px] text-ink/50 truncate">
                      {project.customer_name ?? 'No client yet'}
                    </span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11.5px] font-bold uppercase tracking-[0.05em] whitespace-nowrap flex-shrink-0 ${STAGE_PILL[project.stage]}`}
                  >
                    {STAGE_LABEL[project.stage]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {total > projects.length && (
            <p className="text-[13.5px] text-ink/50 pt-3">
              Showing {projects.length} of {total}.
            </p>
          )}
        </>
      )}
    </div>
  );
}
