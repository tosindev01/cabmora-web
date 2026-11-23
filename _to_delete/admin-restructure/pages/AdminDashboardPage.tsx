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
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import AdminLayout from '@/components/AdminLayout';

export default function AdminDashboardPage() {
  const { users, projects, enquiries, reviews, transactions } = useAdmin();

  // Calculate live statistics
  const totalUsers = users.length;
  const creatorsCount = users.filter((u) => u.role === 'Creator').length;
  const customersCount = users.filter((u) => u.role === 'Customer').length;
  const activeProjectsCount = projects.filter((p) => p.stage !== 'Completed').length;

  const totalRevenue = transactions
    .filter((t) => t.status === 'Paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingEnquiries = enquiries.filter((e) => e.status === 'New').length;
  const pendingReviews = reviews.filter((r) => r.status === 'Pending').length;

  return (
    <AdminLayout>
      <div className="max-w-[1320px] mx-auto space-y-10">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-ink/10 pb-6">
          <div>
            <h1 className="text-[30px] font-sans font-medium text-ink">Platform Admin Overview</h1>
            <p className="text-ink/60 text-[14px]">
              Real-time KPIs across users, active projects, creators, financial volume, storage, and
              customer reviews.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/users"
              className="bg-ink text-white px-5 py-2.5 rounded-full text-[12px] font-semibold tracking-[0.05em] uppercase hover:bg-gold hover:text-ink transition-colors flex items-center gap-2"
            >
              <UserPlus size={16} />
              Manage Users
            </Link>
          </div>
        </div>

        {/* Core KPI Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* KPI 1: Users */}
          <div className="bg-white p-6 border border-ink/10 shadow-xs rounded-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] tracking-[0.15em] uppercase text-ink/50 font-bold">
                Total Accounts
              </span>
              <div className="p-2.5 rounded-lg bg-gold/10 text-gold">
                <Users size={20} />
              </div>
            </div>
            <div className="font-sans text-[34px] font-medium text-ink">{totalUsers}</div>
            <div className="text-[12px] text-ink/60 flex items-center justify-between mt-2 pt-2 border-t border-ink/5">
              <span>{creatorsCount} Creators</span>
              <span>•</span>
              <span>{customersCount} Customers</span>
            </div>
          </div>

          {/* KPI 2: Active Projects */}
          <div className="bg-white p-6 border border-ink/10 shadow-xs rounded-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] tracking-[0.15em] uppercase text-ink/50 font-bold">
                Active Projects
              </span>
              <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
                <FolderKanban size={20} />
              </div>
            </div>
            <div className="font-sans text-[34px] font-medium text-ink">{activeProjectsCount}</div>
            <div className="text-[12px] text-emerald-600 flex items-center gap-1 mt-2 pt-2 border-t border-ink/5">
              <TrendingUp size={14} /> +12% project velocity
            </div>
          </div>

          {/* KPI 3: Revenue */}
          <div className="bg-white p-6 border border-ink/10 shadow-xs rounded-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] tracking-[0.15em] uppercase text-ink/50 font-bold">
                Processed Revenue
              </span>
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
                <DollarSign size={20} />
              </div>
            </div>
            <div className="font-sans text-[34px] font-medium text-ink">
              ${totalRevenue.toLocaleString()}
            </div>
            <div className="text-[12px] text-emerald-600 flex items-center gap-1 mt-2 pt-2 border-t border-ink/5">
              <TrendingUp size={14} /> 100% Cleared via Gateways
            </div>
          </div>

          {/* KPI 4: Pending Moderation & Enquiries */}
          <div className="bg-white p-6 border border-ink/10 shadow-xs rounded-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] tracking-[0.15em] uppercase text-ink/50 font-bold">
                Action Queue
              </span>
              <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
                <ShieldAlert size={20} />
              </div>
            </div>
            <div className="font-sans text-[34px] font-medium text-amber-700">
              {pendingEnquiries + pendingReviews}
            </div>
            <div className="text-[12px] text-ink/60 flex items-center justify-between mt-2 pt-2 border-t border-ink/5">
              <span className="text-amber-700 font-semibold">{pendingEnquiries} Enquiries</span>
              <span>•</span>
              <span className="text-amber-700 font-semibold">{pendingReviews} Reviews</span>
            </div>
          </div>
        </div>

        {/* User & Creator Statistics + Storage Vault */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Creator & User Distribution */}
          <div className="lg:col-span-2 bg-white border border-ink/10 p-6 lg:p-8 rounded-xl shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-ink/5 pb-4">
              <div>
                <h3 className="font-sans text-[20px] text-ink">Registered Creators & Users</h3>
                <p className="text-[12px] text-ink/50">
                  Overview of creator profiles and client accounts on the platform.
                </p>
              </div>
              <Link
                to="/admin/users"
                className="text-[12px] text-gold font-semibold hover:underline flex items-center gap-1"
              >
                View All Users <ArrowUpRight size={15} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {users
                .filter((u) => u.role === 'Creator')
                .slice(0, 3)
                .map((creator) => (
                  <div
                    key={creator.id}
                    className="p-4 rounded-xl bg-canvas border border-ink/5 flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={creator.avatar}
                        alt={creator.name}
                        className="w-10 h-10 rounded-full object-cover border border-gold"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-[13px] text-ink truncate">
                          {creator.name}
                        </div>
                        <div className="text-[10px] text-gold font-bold uppercase tracking-[0.05em] truncate">
                          {creator.specialization || 'Creator'}
                        </div>
                      </div>
                    </div>
                    <div className="text-[11px] text-ink/60 space-y-1 pt-2 border-t border-ink/5">
                      <div className="flex justify-between">
                        <span>Projects:</span>
                        <span className="font-semibold">{creator.projectsCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Earned:</span>
                        <span className="font-semibold text-emerald-700">
                          {creator.totalBilledOrEarned}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Storage Usage Summary */}
          <div className="bg-white border border-ink/10 p-6 rounded-xl shadow-xs space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-sans text-[20px] text-ink">Platform Storage Vault</h3>
                <HardDrive size={20} className="text-gold" />
              </div>
              <p className="text-[12px] text-ink/50 mb-4">
                Cloud storage quota across high-res RAW photography & 4K video assets.
              </p>

              <div className="space-y-3">
                <div className="flex justify-between text-[12px] font-semibold">
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
                <div className="flex items-center justify-between text-[11px] p-2 rounded bg-canvas">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-gold" /> RAW Photography
                  </span>
                  <span className="font-semibold">600 GB</span>
                </div>
                <div className="flex items-center justify-between text-[11px] p-2 rounded bg-canvas">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> 4K ProRes Video
                  </span>
                  <span className="font-semibold">250 GB</span>
                </div>
                <div className="flex items-center justify-between text-[11px] p-2 rounded bg-canvas">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Delivery Zip Archives
                  </span>
                  <span className="font-semibold">115 GB</span>
                </div>
              </div>
            </div>

            <Link
              to="/admin/settings"
              className="block text-center py-2.5 border border-ink/10 text-[11px] uppercase tracking-[0.1em] font-bold rounded hover:bg-canvas hover:border-gold transition-colors"
            >
              Configure Storage Quotas
            </Link>
          </div>
        </div>

        {/* Active Projects & Workflow Progress Table */}
        <div className="bg-white border border-ink/10 p-6 lg:p-8 rounded-xl shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-ink/5 pb-4">
            <div>
              <h3 className="font-sans text-[20px] text-ink">
                Active Projects & Creator Assignments
              </h3>
              <p className="text-[12px] text-ink/50">
                Track project workflow stages, deadlines, and assigned creators.
              </p>
            </div>
            <Link
              to="/admin/projects"
              className="text-[12px] text-gold font-semibold hover:underline flex items-center gap-1"
            >
              Manage All Projects ({projects.length}) <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-ink/10 text-ink/50 uppercase tracking-[0.08em] text-[10px] font-bold">
                  <th className="py-3 px-3">Project Title</th>
                  <th className="py-3 px-3">Client</th>
                  <th className="py-3 px-3">Assigned Creator</th>
                  <th className="py-3 px-3">Stage</th>
                  <th className="py-3 px-3">Progress</th>
                  <th className="py-3 px-3 text-right">Budget</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {projects.slice(0, 4).map((proj) => (
                  <tr key={proj.id} className="hover:bg-canvas transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-ink">
                      <div className="flex items-center gap-3">
                        <img
                          src={proj.thumbnail}
                          alt={proj.title}
                          className="w-9 h-9 rounded object-cover"
                        />
                        <div>
                          <div>{proj.title}</div>
                          <div className="text-[10px] text-ink/40 font-normal">
                            {proj.deliverablesCount} Deliverables
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-ink/70">{proj.clientName}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-1 rounded bg-canvas border border-ink/10 font-medium text-ink text-[12px]">
                        {proj.assignedCreatorName}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-[0.05em] ${
                          proj.stage === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : proj.stage === 'Editing'
                              ? 'bg-purple-100 text-purple-800'
                              : proj.stage === 'Client Review'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {proj.stage}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="w-32 space-y-1">
                        <div className="flex justify-between text-[10px] text-ink/60">
                          <span>{proj.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-canvas rounded-full overflow-hidden border border-ink/5">
                          <div className="h-full bg-gold" style={{ width: `${proj.progress}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-ink">{proj.budget}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
