import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Search,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react';
import { Modal, PersonAvatar, Select } from '@cabmora/ui';
import { PortalAvatar, PortalBell, PortalShell, PortalTopbar } from '@/shared/portal';
import { useAuth } from '@/shared/auth';

type TeamRole = 'coordinator' | 'admin' | 'creator' | 'customer';
type TeamStatus = 'active' | 'pending' | 'suspended';

interface StudioTeamMember {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  role: TeamRole;
  status: TeamStatus;
  joined: string;
  avatar_url?: string | null;
}

const TEAM_STORAGE_KEY = 'cabmora_creator_team_members_v1';

const INITIAL_TEAM_MEMBERS: StudioTeamMember[] = [
  {
    id: 'tm-1',
    first_name: 'Blessing',
    last_name: 'Babade',
    full_name: 'Blessing Babade',
    email: 'babadeblessing49@gmail.com',
    role: 'coordinator',
    status: 'active',
    joined: '24 Oct 2026',
  },
  {
    id: 'tm-2',
    first_name: 'Precious',
    last_name: 'Oreva',
    full_name: 'Precious Oreva',
    email: 'preciousoreva34@gmail.com',
    role: 'coordinator',
    status: 'active',
    joined: '13 Oct 2026',
  },
  {
    id: 'tm-3',
    first_name: 'Ajayi',
    last_name: 'Adeoye',
    full_name: 'Ajayi Adeoye',
    email: 'clemzivibes@gmail.com',
    role: 'coordinator',
    status: 'active',
    joined: '3 Oct 2026',
  },
  {
    id: 'tm-4',
    first_name: 'Taiwo',
    last_name: 'Kehinde',
    full_name: 'Taiwo Kehinde',
    email: 'taiwo@cabmora.com',
    role: 'admin',
    status: 'active',
    joined: '2 Sept 2026',
  },
];

const ROLE_OPTIONS: {
  value: TeamRole;
  label: string;
  plural: string;
}[] = [
  { value: 'coordinator', label: 'Coordinator', plural: 'Coordinators' },
  { value: 'admin', label: 'Admin', plural: 'Admins' },
  { value: 'creator', label: 'Creator', plural: 'Creators' },
  { value: 'customer', label: 'Customer', plural: 'Customers' },
];

const ROLE_PILL: Record<TeamRole, string> = {
  coordinator: 'bg-teal-50 text-teal-900 border border-teal-200',
  admin: 'bg-purple-100 text-purple-900 border border-purple-200',
  creator: 'bg-gold/20 text-ink border border-gold/40',
  customer: 'bg-blue-50 text-blue-800 border border-blue-200',
};

const STATUS_PILL: Record<TeamStatus, string> = {
  active: 'bg-emerald-100 text-emerald-800',
  suspended: 'bg-red-100 text-red-800',
  pending: 'bg-amber-100 text-amber-800',
};

const STATUS_DOT: Record<TeamStatus, string> = {
  active: 'bg-emerald-600',
  suspended: 'bg-red-600',
  pending: 'bg-amber-600',
};

function getInitials(member: Pick<StudioTeamMember, 'first_name' | 'last_name'>): string {
  return (
    [member.first_name, member.last_name]
      .filter(Boolean)
      .map((part) => part[0]!.toUpperCase())
      .join('') || '?'
  );
}

function loadTeamMembers(): StudioTeamMember[] {
  if (typeof window === 'undefined') return INITIAL_TEAM_MEMBERS;
  try {
    const raw = window.localStorage.getItem(TEAM_STORAGE_KEY);
    if (!raw) return INITIAL_TEAM_MEMBERS;
    const parsed = JSON.parse(raw) as StudioTeamMember[];
    return parsed.length > 0 ? parsed : INITIAL_TEAM_MEMBERS;
  } catch {
    return INITIAL_TEAM_MEMBERS;
  }
}

export default function CreatorTeamPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<StudioTeamMember[]>(() => loadTeamMembers());
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | TeamRole>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | TeamStatus>('All');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Add a colleague modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [newRole, setNewRole] = useState<TeamRole>('coordinator');
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const saveMembers = (next: StudioTeamMember[]) => {
    setMembers(next);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage error
      }
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 4000);
  };

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (roleFilter !== 'All' && m.role !== roleFilter) return false;
      if (statusFilter !== 'All' && m.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!m.full_name.toLowerCase().includes(q) && !m.email.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [members, roleFilter, statusFilter, search]);

  const total = filteredMembers.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const pagedMembers = filteredMembers.slice(page * pageSize, (page + 1) * pageSize);
  const firstShown = total === 0 ? 0 : page * pageSize + 1;
  const lastShown = page * pageSize + pagedMembers.length;

  const handleToggleStatus = (id: string, targetStatus?: TeamStatus) => {
    const next = members.map((m) => {
      if (m.id !== id) return m;
      const updatedStatus: TeamStatus =
        targetStatus ?? (m.status === 'suspended' ? 'active' : 'suspended');
      showToast(
        `${m.full_name} is now ${updatedStatus.toUpperCase()}.`,
      );
      return { ...m, status: updatedStatus };
    });
    saveMembers(next);
  };

  const handleChangeRole = (id: string, role: TeamRole) => {
    const next = members.map((m) => {
      if (m.id !== id) return m;
      showToast(`Updated ${m.full_name}'s role to ${role.toUpperCase()}.`);
      return { ...m, role };
    });
    saveMembers(next);
  };

  const resetAddModal = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setNewRole('coordinator');
    setInviteUrl(null);
    setCopied(false);
  };

  const handleAddColleague = (e: FormEvent) => {
    e.preventDefault();
    const fn = firstName.trim();
    const ln = lastName.trim();
    const em = email.trim().toLowerCase();
    if (!fn || !ln || !em) return;

    const today = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const newColleague: StudioTeamMember = {
      id: `tm-${Date.now()}`,
      first_name: fn,
      last_name: ln,
      full_name: `${fn} ${ln}`,
      email: em,
      role: newRole,
      status: 'active',
      joined: today,
    };

    saveMembers([newColleague, ...members]);
    const generatedInvite = `${window.location.origin}/accept-invite?token=cabmora-${Date.now().toString(36)}`;
    setInviteUrl(generatedInvite);
    showToast(`Added ${newColleague.full_name} (${newRole.toUpperCase()}) to your studio team.`);
  };

  const fieldClass =
    'bg-canvas border border-ink/15 px-3 py-2 text-[14.5px] outline-none focus:border-gold rounded-lg w-full';
  const labelClass =
    'text-[12.5px] uppercase tracking-[0.1em] font-bold text-ink/50 block mb-1.5';

  return (
    <PortalShell>
      {({ toggleSidebar }) => (
        <>
          {toast && (
            <div className="fixed top-6 right-6 z-50 bg-forest text-canvas border border-gold px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-[13px] font-semibold">
              <Sparkles size={16} className="text-gold shrink-0" />
              <span>{toast}</span>
            </div>
          )}

          <PortalTopbar
            title="Team Management"
            subtitle="Manage studio coordinators, second shooters, and administrators"
            icon={Users}
            onToggleSidebar={toggleSidebar}
          >
            <PortalBell />
            <PortalAvatar
              src={
                user?.avatar_url ||
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'
              }
            />
          </PortalTopbar>

          <main className="flex-1 p-5 sm:p-6 lg:p-10 overflow-y-auto">
            <div className="max-w-[1320px] mx-auto space-y-6">
              {/* Header (Matches the exact Team UI layout) */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-ink/10 pb-4">
                <div>
                  <h2 className="text-[30px] font-sans font-medium text-ink">Team</h2>
                  <p className="text-ink/60 text-[15.5px]">
                    Cabmora staff. Everyone here can open client work — coordinators the shoots they
                    are on, administrators all of it.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-5 py-2.5 rounded-full text-[13.5px] font-bold tracking-[0.05em] uppercase transition-colors flex items-center gap-2 cursor-pointer border border-ink bg-ink text-white hover:bg-gold hover:text-ink hover:border-gold whitespace-nowrap"
                  >
                    <UserPlus size={16} />
                    <span>Add a colleague</span>
                  </button>
                </div>
              </div>

              {/* Filter controls */}
              <div className="bg-white border border-ink/10 p-4 rounded-xl shadow-xs space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(0);
                    }}
                    placeholder="Search by name or email..."
                    aria-label="Search users"
                    className="w-full bg-canvas border border-ink/15 pl-10 pr-4 py-2.5 text-[14.5px] outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all rounded-lg"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="team-role-filter"
                      className="text-[12.5px] uppercase tracking-[0.1em] font-bold text-ink/50"
                    >
                      Role
                    </label>
                    <Select
                      id="team-role-filter"
                      value={roleFilter}
                      onChange={(e) => {
                        setRoleFilter(e.target.value as 'All' | TeamRole);
                        setPage(0);
                      }}
                      className="bg-canvas border border-ink/15 pl-3 pr-9 py-2 text-[13.5px] font-medium outline-none focus:border-gold rounded-lg min-w-[150px]"
                    >
                      <option value="All">All roles</option>
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.plural}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="team-status-filter"
                      className="text-[12.5px] uppercase tracking-[0.1em] font-bold text-ink/50"
                    >
                      Status
                    </label>
                    <Select
                      id="team-status-filter"
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value as 'All' | TeamStatus);
                        setPage(0);
                      }}
                      className="bg-canvas border border-ink/15 pl-3 pr-9 py-2 text-[13.5px] font-medium outline-none focus:border-gold rounded-lg min-w-[150px]"
                    >
                      <option value="All">All statuses</option>
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Users table */}
              <div className="bg-white border border-ink/10 rounded-xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[14.5px] table-fixed min-w-[960px]">
                    <colgroup>
                      <col />
                      <col className="w-[150px]" />
                      <col className="w-[128px]" />
                      <col className="w-[124px]" />
                      <col className="w-[292px]" />
                    </colgroup>
                    <thead>
                      <tr className="bg-canvas border-b border-ink/10 text-ink/60 uppercase tracking-[0.08em] text-[11.5px] font-bold">
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Joined</th>
                        <th className="py-3 px-4 text-right">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/5">
                      {pagedMembers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-12 text-ink/50 text-[15.5px]">
                            <Users size={24} className="mx-auto mb-3 opacity-40" />
                            No staff accounts match these filters.
                          </td>
                        </tr>
                      ) : (
                        pagedMembers.map((member) => (
                          <tr
                            key={member.id}
                            className="hover:bg-canvas/60 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <PersonAvatar
                                  src={member.avatar_url ?? null}
                                  initials={getInitials(member)}
                                  size={40}
                                />
                                <div className="min-w-0">
                                  <div className="font-semibold text-ink text-[15.5px] truncate">
                                    {member.full_name}
                                  </div>
                                  <div className="text-[12.5px] text-ink/50 truncate">
                                    {member.email}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <span
                                className={`inline-block px-2.5 py-1 rounded text-[12.5px] font-bold uppercase tracking-[0.05em] whitespace-nowrap ${ROLE_PILL[member.role]}`}
                              >
                                {member.role}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[11.5px] font-bold uppercase tracking-[0.05em] inline-flex items-center gap-1.5 w-fit whitespace-nowrap ${STATUS_PILL[member.status]}`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[member.status]}`}
                                />
                                {member.status}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-ink/70 whitespace-nowrap">
                              {member.joined}
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                                {member.status === 'pending' && (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleStatus(member.id, 'active')}
                                    className="px-2.5 py-1 text-[12.5px] font-bold rounded uppercase tracking-[0.05em] bg-emerald-100 text-emerald-900 hover:bg-emerald-200 transition-colors cursor-pointer"
                                  >
                                    Accept
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(member.id)}
                                  className={`px-2.5 py-1 text-[12.5px] font-bold rounded uppercase tracking-[0.05em] transition-colors cursor-pointer ${
                                    member.status === 'suspended'
                                      ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                                      : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                                  }`}
                                >
                                  {member.status === 'suspended' ? 'Reinstate' : 'Suspend'}
                                </button>

                                <Select
                                  aria-label={`Role for ${member.full_name}`}
                                  value={member.role}
                                  onChange={(e) =>
                                    handleChangeRole(member.id, e.target.value as TeamRole)
                                  }
                                  className="bg-canvas border border-ink/15 pl-2 pr-7 py-1 text-[12.5px] font-medium outline-none focus:border-gold rounded cursor-pointer"
                                  chevronInset="sm"
                                >
                                  {ROLE_OPTIONS.map((r) => (
                                    <option key={r.value} value={r.value}>
                                      {r.label}
                                    </option>
                                  ))}
                                </Select>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pager */}
                <div className="flex items-center justify-between gap-4 border-t border-ink/10 px-4 py-3">
                  <p className="text-[13.5px] text-ink/60 tabular-nums">
                    {total === 0 ? 'No accounts' : `Showing ${firstShown}–${lastShown} of ${total}`}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      aria-label="Previous page"
                      className="p-1.5 rounded border border-ink/15 text-ink/70 hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-[13.5px] text-ink/70 tabular-nums">
                      Page {page + 1} of {pageCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPage(Math.min(pageCount - 1, page + 1))}
                      disabled={page + 1 >= pageCount}
                      aria-label="Next page"
                      className="p-1.5 rounded border border-ink/15 text-ink/70 hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Add a Colleague Modal */}
          <Modal
            open={isAddModalOpen}
            onOpenChange={(next) => {
              setIsAddModalOpen(next);
              if (!next) resetAddModal();
            }}
            title="Add a colleague"
            description="Create an account for someone at Cabmora."
            size="md"
          >
            {inviteUrl ? (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-[14.5px] text-amber-900 font-medium mb-1">
                    Send them this link
                  </p>
                  <p className="text-[13.5px] text-amber-900/80">
                    Copy this invite link so your colleague can choose their own password and join
                    your studio team.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={inviteUrl}
                    aria-label="Invite link"
                    className={`${fieldClass} font-mono text-[12.5px]`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(inviteUrl);
                      setCopied(true);
                    }}
                    className="px-3 py-2 rounded-lg border border-ink/15 text-ink/70 hover:bg-canvas cursor-pointer shrink-0"
                    aria-label="Copy invite link"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetAddModal();
                  }}
                  className="w-full bg-ink text-white px-5 py-2.5 rounded-full text-[13.5px] font-bold tracking-[0.05em] uppercase hover:bg-gold hover:text-ink transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddColleague} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="colleague-first-name" className={labelClass}>
                      First name
                    </label>
                    <input
                      id="colleague-first-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="colleague-last-name" className={labelClass}>
                      Last name
                    </label>
                    <input
                      id="colleague-last-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className={fieldClass}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="colleague-email" className={labelClass}>
                    Email
                  </label>
                  <input
                    id="colleague-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label htmlFor="colleague-role" className={labelClass}>
                    Role
                  </label>
                  <Select
                    id="colleague-role"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as TeamRole)}
                    className={`${fieldClass} pr-9`}
                  >
                    <option value="coordinator">Coordinator</option>
                    <option value="admin">Admin</option>
                    <option value="creator">Creator</option>
                  </Select>
                  {newRole === 'admin' && (
                    <p className="text-[13.5px] text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
                      An administrator can open every project and every client&rsquo;s photographs,
                      and can change anyone&rsquo;s role — including yours.
                    </p>
                  )}
                </div>

                <p className="text-[13.5px] text-ink/55 border-t border-ink/10 pt-4">
                  They get an email with a link to choose a password, and it brings them directly to
                  the studio workspace.
                </p>

                <button
                  type="submit"
                  className="w-full bg-ink text-white px-5 py-2.5 rounded-full text-[13.5px] font-bold tracking-[0.05em] uppercase hover:bg-gold hover:text-ink transition-colors cursor-pointer"
                >
                  Create account and send invite
                </button>
              </form>
            )}
          </Modal>
        </>
      )}
    </PortalShell>
  );
}
