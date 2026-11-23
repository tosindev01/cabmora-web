import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FolderKanban,
  DollarSign,
  HardDrive,
  TrendingUp,
  UserPlus,
  ArrowUpRight,
  ShieldAlert,
  Building2,
} from 'lucide-react';
import { useAnalytics, useCreatorReport, useRecentProjects } from '@/shared/analytics';
import { formatMinor, STAGE_LABEL, STAGE_PILL } from '@/shared/format';
import { Avatar } from '@cabmora/ui';
import { EnquiryTriageTable } from '@/features/enquiries/components';
import { canOpen, useAdminAuth } from '@/shared/auth';

/**
 * A KPI card that leads somewhere.
 *
 * The four headline numbers used to be inert `div`s — "Total Accounts" sat
 * above the only page that explains it and there was no way to get there from
 * the number, which is where everybody tries first.
 *
 * Permission-gated rather than linked unconditionally: a coordinator cannot
 * open User Management, and a link that 403s is worse than a number that does
 * not move. Where they may not follow it the card renders exactly as before,
 * so nothing is advertised that cannot be used. The same `canOpen` the sidebar
 * uses, so the two cannot disagree about who may go where.
 */
function KpiCard({
  to,
  children,
}: {
  /** Null means nobody should be offered this one. */
  to: string | null;
  children: ReactNode;
}) {
  const base =
    'bg-white p-6 border border-ink/10 shadow-xs rounded-xl relative overflow-hidden block';
  if (!to) return <div className={base}>{children}</div>;
  return (
    <Link
      to={to}
      className={`${base} transition-colors hover:border-gold/50 hover:bg-canvas/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold group/kpi`}
    >
      {children}
      {/* Shown on hover so the card does not carry a permanent arrow, but it is
          the affordance that says the number is a door. */}
      <ArrowUpRight
        size={15}
        className="absolute bottom-4 right-4 text-ink/25 opacity-0 group-hover/kpi:opacity-100 transition-opacity"
        aria-hidden
      />
    </Link>
  );
}

export default function AdminDashboardPage() {
  const { staff } = useAdminAuth();
  /* Where each headline number leads, or null where this reader may not follow
     it. Resolved through the same `canOpen` the sidebar uses, so a coordinator
     is never shown a door into User Management that the API will shut. */
  const reach = {
    users: staff && canOpen(staff, '/admin/users') ? '/admin/users' : null,
    projects: staff && canOpen(staff, '/admin/projects') ? '/admin/projects' : null,
    payments: staff && canOpen(staff, '/admin/payments') ? '/admin/payments' : null,
    enquiries: staff && canOpen(staff, '/admin/enquiries') ? '/admin/enquiries' : null,
  };

  // Every figure on this page now comes from the API. The Storage Vault panel
  // below is the one exception and is still the designer's fixture: there is no
  // storage entity, so there is nothing true to put in it yet.
  const { projects: recentProjects } = useRecentProjects(4);
  const { stats, billing, loading } = useAnalytics();
  const { report: creatorReport } = useCreatorReport();

  // Calculate live statistics

  return (
    <>
      <div className="max-w-[1320px] mx-auto space-y-10">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-ink/10 pb-6">
          <div>
            <h1 className="text-[30px] font-sans font-medium text-ink">Platform Admin Overview</h1>
            <p className="text-ink/60 text-[15.5px]">
              Real-time KPIs across users, active projects, creators, financial volume, storage, and
              customer reviews.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/users"
              className="bg-ink text-white px-5 py-2.5 rounded-full text-[13.5px] font-semibold tracking-[0.05em] uppercase hover:bg-gold hover:text-ink transition-colors flex items-center gap-2"
            >
              <UserPlus size={16} />
              Manage Users
            </Link>
          </div>
        </div>

        {/* Core KPI Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* KPI 1: Users */}
          <KpiCard to={reach.users}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12.5px] tracking-[0.15em] uppercase text-ink/50 font-bold">
                Total Accounts
              </span>
              <div className="p-2.5 rounded-lg bg-gold/10 text-gold">
                <Users size={20} />
              </div>
            </div>
            <div className="font-sans text-[34px] font-medium text-ink tabular-nums">
              {loading ? '—' : (stats?.users.total ?? 0)}
            </div>
            <div className="text-[13.5px] text-ink/60 flex items-center justify-between mt-2 pt-2 border-t border-ink/5">
              <span>{stats?.users.creators ?? 0} Creators</span>
              <span>•</span>
              <span>{stats?.users.customers ?? 0} Customers</span>
            </div>
          </KpiCard>

          {/* KPI 2: Active Projects */}
          <KpiCard to={reach.projects}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12.5px] tracking-[0.15em] uppercase text-ink/50 font-bold">
                Active Projects
              </span>
              <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
                <FolderKanban size={20} />
              </div>
            </div>
            <div className="font-sans text-[34px] font-medium text-ink tabular-nums">
              {loading ? '—' : (stats?.projects.active ?? 0)}
            </div>
            {/* Was "+12% project velocity", which nothing measured. Replaced
                with two counts the API actually reports. */}
            <div className="text-[13.5px] text-ink/60 flex items-center justify-between mt-2 pt-2 border-t border-ink/5">
              <span>{stats?.projects.in_review ?? 0} In review</span>
              <span>•</span>
              <span>{stats?.projects.delivered ?? 0} Delivered</span>
            </div>
          </KpiCard>

          {/* KPI 3: Revenue */}
          <KpiCard to={reach.payments}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12.5px] tracking-[0.15em] uppercase text-ink/50 font-bold">
                Processed Revenue
              </span>
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
                <DollarSign size={20} />
              </div>
            </div>
            {/* clamp, not a fixed 34px: "7" and "£2,450.00" are very different
                widths, and the fixed size clipped the money. */}
            <div className="font-sans text-[clamp(20px,2.1vw,34px)] font-medium text-ink tabular-nums whitespace-nowrap">
              {loading || !billing ? '—' : formatMinor(billing.paid_minor, billing.currency)}
            </div>
            {/* Was "100% Cleared via Gateways", which was untrue the moment a
                bank transfer was recorded. Outstanding is a real figure and the
                one an administrator acts on. */}
            <div className="text-[13.5px] text-amber-700 flex items-center gap-1 mt-2 pt-2 border-t border-ink/5">
              <TrendingUp size={14} />
              {billing ? formatMinor(billing.outstanding_minor, billing.currency) : '—'} outstanding
            </div>
          </KpiCard>

          {/* KPI 4: Pending Moderation & Enquiries */}
          <KpiCard to={reach.enquiries}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12.5px] tracking-[0.15em] uppercase text-ink/50 font-bold">
                Action Queue
              </span>
              <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
                <ShieldAlert size={20} />
              </div>
            </div>
            <div className="font-sans text-[34px] font-medium text-amber-700 tabular-nums">
              {loading ? '—' : (stats?.enquiries.new ?? 0)}
            </div>
            {/* Reviews are absent, not zero: there is no review entity in the
                API. Showing "0 Reviews" beside a real enquiry count would read
                as "nothing to moderate" rather than "not built yet". */}
            <div className="text-[13.5px] text-ink/60 flex items-center justify-between mt-2 pt-2 border-t border-ink/5">
              <span className="text-amber-700 font-semibold">
                {stats?.enquiries.new ?? 0} Unclaimed enquiries
              </span>
              <span>{stats?.enquiries.consultation_booked ?? 0} booked</span>
            </div>
          </KpiCard>
        </div>

        {/* User & Creator Statistics + Storage Vault */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Creator & User Distribution */}
          <div className="lg:col-span-2 bg-white border border-ink/10 p-6 lg:p-8 rounded-xl shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-ink/5 pb-4">
              <div>
                <h3 className="font-sans text-[21.5px] text-ink">Registered Creators & Users</h3>
                <p className="text-[13.5px] text-ink/50">
                  Overview of creator profiles and client accounts on the platform.
                </p>
              </div>
              <Link
                to="/admin/users"
                className="text-[13.5px] text-gold font-semibold hover:underline flex items-center gap-1"
              >
                View All Users <ArrowUpRight size={15} />
              </Link>
            </div>

            {/* Two up until there is genuinely room for three. At this panel
                width three columns left 48px for the name and truncated every
                one of them. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4">
              {creatorReport === null ? (
                <p className="text-[13.5px] text-ink/45 sm:col-span-2">Loading creators…</p>
              ) : (
                creatorReport.creators.slice(0, 3).map((creator) => (
                  <div
                    key={creator.creator_id ?? 'in-house'}
                    className={`p-4 rounded-xl bg-canvas flex flex-col justify-between border ${
                      creator.is_in_house ? 'border-gold/40' : 'border-ink/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {/* No account has a photograph — `User` has no avatar
                          field — so a monogram is the design, not a fallback.
                          The in-house row gets the wordmark initial instead. */}
                      <Avatar name={creator.name}>
                        {creator.is_in_house ? <Building2 size={17} /> : undefined}
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-semibold text-[14.5px] text-ink truncate">
                          {creator.name}
                        </div>
                        <div className="text-[11.5px] text-gold font-bold uppercase tracking-[0.05em] whitespace-nowrap">
                          {creator.is_in_house ? 'In-house' : 'Partner'}
                        </div>
                      </div>
                    </div>
                    <div className="text-[12.5px] text-ink/60 space-y-1 pt-2 border-t border-ink/5">
                      <div className="flex justify-between">
                        <span>Projects:</span>
                        <span className="font-semibold tabular-nums">
                          {creator.projects_active} active / {creator.projects_total}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        {/* "Billed", not "Earned": a partner's share would need
                            a commission model, and nothing computes one. */}
                        <span>Billed:</span>
                        <span className="font-semibold text-emerald-700 tabular-nums">
                          {formatMinor(creator.revenue_minor, creatorReport.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Storage Usage Summary */}
          <div className="bg-white border border-ink/10 p-6 rounded-xl shadow-xs space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-sans text-[21.5px] text-ink">Platform Storage Vault</h3>
                <HardDrive size={20} className="text-gold" />
              </div>
              <p className="text-[13.5px] text-ink/50 mb-4">
                Cloud storage quota across high-res RAW photography & 4K video assets.
              </p>

              <div className="space-y-3">
                <div className="flex justify-between text-[13.5px] font-semibold">
                  <span>965 GB used of 5,000 GB</span>
                  <span className="text-gold">19.3%</span>
                </div>
                <div className="w-full h-3 bg-canvas rounded-full overflow-hidden flex border border-ink/10">
                  <div
                    className="h-full bg-gold"
                    style={{ width: '12%' }}
                    title="RAW Photography: 600 GB"
                  />
                  <div
                    className="h-full bg-purple-600"
                    style={{ width: '5%' }}
                    title="4K Video: 250 GB"
                  />
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: '2.3%' }}
                    title="Archives: 115 GB"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <div className="flex items-center justify-between text-[12.5px] p-2 rounded bg-canvas">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-gold" /> RAW Photography
                  </span>
                  <span className="font-semibold">600 GB</span>
                </div>
                <div className="flex items-center justify-between text-[12.5px] p-2 rounded bg-canvas">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> 4K ProRes Video
                  </span>
                  <span className="font-semibold">250 GB</span>
                </div>
                <div className="flex items-center justify-between text-[12.5px] p-2 rounded bg-canvas">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Delivery Zip Archives
                  </span>
                  <span className="font-semibold">115 GB</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Leads, by how soon the client's event is.
            Above the project table on purpose: a project already in flight
            has a deadline and an owner, while an unanswered lead has
            neither and is the only thing on this page that can still be
            lost by being left. */}
        <EnquiryTriageTable />

        {/* Active Projects & Workflow Progress Table */}
        <div className="bg-white border border-ink/10 p-6 lg:p-8 rounded-xl shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-ink/5 pb-4">
            <div>
              <h3 className="font-sans text-[21.5px] text-ink">
                Active Projects & Creator Assignments
              </h3>
              <p className="text-[13.5px] text-ink/50">
                Track project workflow stages, deadlines, and assigned creators.
              </p>
            </div>
            <Link
              to="/admin/projects"
              className="text-[13.5px] text-gold font-semibold hover:underline flex items-center gap-1"
            >
              Manage All Projects ({stats?.projects.total ?? 0}) <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14.5px]">
              <thead>
                <tr className="border-b border-ink/10 text-ink/50 uppercase tracking-[0.08em] text-[11.5px] font-bold">
                  <th className="py-3 px-3">Project Title</th>
                  <th className="py-3 px-3">Client</th>
                  <th className="py-3 px-3">Assigned Creator</th>
                  <th className="py-3 px-3">Stage</th>
                  <th className="py-3 px-3">Progress</th>
                  {/* Was "Budget". Projects carry no budget — money lives on
                      invoices, against a project — so this shows the deadline,
                      which is a real field and the thing an overview is for. */}
                  <th className="py-3 px-3 text-right">Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {recentProjects === null ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-ink/45 text-[14.5px]">
                      Loading projects…
                    </td>
                  </tr>
                ) : recentProjects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-ink/45 text-[14.5px]">
                      No projects yet.
                    </td>
                  </tr>
                ) : (
                  recentProjects.map((proj) => (
                    <tr key={proj.id} className="hover:bg-canvas transition-colors">
                      <td className="py-3.5 px-3 font-semibold text-ink">
                        <div className="flex items-center gap-3">
                          {/* No cover image exists — there is no media entity —
                            so a monogram of the project title stands in rather
                            than a stock photograph of somebody else's wedding. */}
                          <Avatar name={proj.title} size="sm" className="rounded" />
                          <div className="min-w-0">
                            <Link
                              to={`/admin/projects/${proj.id}`}
                              className="hover:text-gold transition-colors"
                            >
                              {proj.title}
                            </Link>
                            <div className="text-[11.5px] text-ink/40 font-normal truncate">
                              {proj.event_type}
                              {proj.location && ` · ${proj.location}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-ink/70">
                        {proj.customer_name ?? (
                          <span className="text-ink/35 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        {/* Null creator means Cabmora's own work — the same rule
                          the creator panel and the payments table apply. */}
                        <span
                          className={`px-2.5 py-1 rounded border font-medium text-[13.5px] ${
                            proj.creator_name
                              ? 'bg-canvas border-ink/10 text-ink'
                              : 'bg-gold/10 border-gold/40 text-ink'
                          }`}
                        >
                          {proj.creator_name ?? 'Cabmora'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11.5px] uppercase font-bold tracking-[0.05em] whitespace-nowrap ${STAGE_PILL[proj.stage]}`}
                        >
                          {STAGE_LABEL[proj.stage]}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="w-32 space-y-1">
                          <div className="flex justify-between text-[11.5px] text-ink/60">
                            <span>{proj.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-canvas rounded-full overflow-hidden border border-ink/5">
                            <div
                              className="h-full bg-gold"
                              style={{ width: `${proj.progress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right text-ink/70 whitespace-nowrap">
                        {proj.deadline
                          ? new Date(proj.deadline).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
