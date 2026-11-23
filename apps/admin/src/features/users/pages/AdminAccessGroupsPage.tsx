import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2, Users } from 'lucide-react';

import type { AccessGroup, Permission } from '@cabmora/api-client';

import { createGroup, deleteGroup, listGroups, updateGroup } from '@/features/users/groups';

/** The four an administrator may hand out, named as the console names them. */
const GRANTABLE: { permission: Permission; label: string }[] = [
  { permission: 'payments', label: 'Payment management' },
  { permission: 'reviews', label: 'Review moderation' },
  { permission: 'creator_applications', label: 'Creator applications' },
  { permission: 'reports', label: 'Reporting dashboard' },
];

/**
 * Named bundles of sections, assignable to coordinators.
 *
 * The leverage here is the point and the hazard at once: changing one group
 * changes what every member can reach, in a single click, with nothing
 * per-person to slow anybody down. So every row carries its member count, and
 * saving or deleting says how many people it is about to affect.
 *
 * Only the four grantable sections appear. Users, Team and Platform settings
 * are missing because a group containing one of them would be the ladder out
 * that the per-user rules were written to prevent — and the API refuses them
 * regardless of what this screen offers.
 */
export default function AdminAccessGroupsPage() {
  const [groups, setGroups] = useState<AccessGroup[] | null>(null);
  const [name, setName] = useState('');
  const [picked, setPicked] = useState<Permission[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setGroups(await listGroups());
    } catch {
      setGroups([]);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function run(work: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await work();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-[1320px] mx-auto space-y-8">
      <div className="border-b border-ink/10 pb-6">
        <h1 className="text-[30px] font-sans font-medium text-ink">Access groups</h1>
        <p className="text-ink/60 text-[15.5px] max-w-[640px]">
          A named set of sections you can give to several coordinators at once. Groups only ever add
          to what a role already allows — they never take anything away.
        </p>
      </div>

      {error && (
        <p role="alert" className="text-[14.5px] text-red-700">
          {error}
        </p>
      )}

      <div className="bg-white border border-ink/10 rounded-xl shadow-xs p-6">
        <h2 className="text-[12.5px] uppercase tracking-[0.12em] font-bold text-ink/50 mb-4">
          New group
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex-1 min-w-[220px]">
            <span className="block text-[12px] font-bold uppercase tracking-[0.08em] text-ink/50 mb-1.5">
              Name
            </span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={60}
              placeholder="Billing cover"
              className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-[14.5px] outline-none focus:border-gold"
            />
          </label>
          <div className="flex flex-wrap items-center gap-4">
            {GRANTABLE.map(({ permission, label }) => (
              <label key={permission} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={picked.includes(permission)}
                  onChange={(event) =>
                    setPicked((current) =>
                      event.target.checked
                        ? [...current, permission]
                        : current.filter((p) => p !== permission),
                    )
                  }
                  className="accent-gold w-4 h-4"
                />
                <span className="text-[14px]">{label}</span>
              </label>
            ))}
          </div>
          <button
            type="button"
            disabled={busy || !name.trim()}
            onClick={() =>
              void run(async () => {
                await createGroup({ name: name.trim(), permissions: picked });
                setName('');
                setPicked([]);
              })
            }
            className="flex items-center gap-2 bg-ink text-white px-5 py-2.5 rounded-lg text-[12.5px] font-bold uppercase tracking-[0.08em] hover:bg-gold hover:text-ink transition-colors cursor-pointer disabled:opacity-50"
          >
            <Plus size={14} />
            Create
          </button>
        </div>
      </div>

      {groups === null ? (
        <p className="text-ink/50 text-[14.5px]">Loading…</p>
      ) : groups.length === 0 ? (
        <div className="bg-white border border-ink/10 rounded-xl shadow-xs p-12 text-center">
          <Users size={26} className="mx-auto mb-3 text-gold" strokeWidth={1.5} />
          <p className="text-[15.5px] text-ink/70 font-medium mb-1">No groups yet</p>
          <p className="text-[14.5px] text-ink/50 max-w-[460px] mx-auto">
            Make one above, then put coordinators in it from their own page.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {groups.map((group) => (
            <GroupRow
              key={group.id}
              group={group}
              busy={busy}
              onSave={(next) => void run(() => updateGroup(group.id, next))}
              onDelete={() => {
                if (
                  confirm(
                    `Delete "${group.name}"? ${group.member_count} ${
                      group.member_count === 1 ? 'person loses' : 'people lose'
                    } whatever it gave them.`,
                  )
                ) {
                  void run(() => deleteGroup(group.id));
                }
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function GroupRow({
  group,
  busy,
  onSave,
  onDelete,
}: {
  group: AccessGroup;
  busy: boolean;
  onSave: (next: { name: string; permissions: Permission[] }) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(group.name);
  const [picked, setPicked] = useState<Permission[]>(group.permissions);

  const changed =
    name.trim() !== group.name ||
    picked.length !== group.permissions.length ||
    picked.some((p) => !group.permissions.includes(p));

  return (
    <li className="bg-white border border-ink/10 rounded-xl shadow-xs p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={60}
          className="text-[18px] font-medium rounded-lg border border-transparent hover:border-ink/15 focus:border-gold bg-transparent px-2 py-1 -ml-2 outline-none"
        />
        <span className="flex items-center gap-1.5 text-[13px] text-ink/50 whitespace-nowrap">
          <Users size={13} />
          {group.member_count} {group.member_count === 1 ? 'person' : 'people'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {GRANTABLE.map(({ permission, label }) => (
          <label key={permission} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={picked.includes(permission)}
              onChange={(event) =>
                setPicked((current) =>
                  event.target.checked
                    ? [...current, permission]
                    : current.filter((p) => p !== permission),
                )
              }
              className="accent-gold w-4 h-4"
            />
            <span className="text-[14px]">{label}</span>
          </label>
        ))}
      </div>

      <div className="flex items-center gap-3 mt-5 pt-4 border-t border-ink/8">
        <button
          type="button"
          disabled={busy || !changed || !name.trim()}
          onClick={() => onSave({ name: name.trim(), permissions: picked })}
          className="px-4 py-2 rounded-lg text-[12.5px] font-bold uppercase tracking-[0.08em] bg-ink text-white hover:bg-gold hover:text-ink transition-colors cursor-pointer disabled:opacity-40"
        >
          Save
        </button>
        {/* Said before the click, not after. This is the only control here
            that changes several people's access at once. */}
        {changed && group.member_count > 0 && (
          <span className="text-[13px] text-amber-800">
            Affects {group.member_count} {group.member_count === 1 ? 'person' : 'people'}.
          </span>
        )}
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          aria-label={`Delete ${group.name}`}
          className="ml-auto p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
        >
          <Trash2 size={17} />
        </button>
      </div>
    </li>
  );
}
