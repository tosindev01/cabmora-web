import { useState } from 'react';
import { BarChart3, Download, Calendar } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import AdminLayout from '@/components/AdminLayout';

export default function AdminReportingDashboardPage() {
  const { users, projects, enquiries, transactions } = useAdmin();
  const [timeRange, setTimeRange] = useState<string>('30 Days');

  const totalRevenue = transactions
    .filter((t) => t.status === 'Paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const creatorsCount = users.filter((u) => u.role === 'Creator').length;
  const customersCount = users.filter((u) => u.role === 'Customer').length;

  const handleExportCSV = () => {
    const headers = 'Category,Metric,Value\n';
    const rows = [
      `Revenue,Total Revenue,$${totalRevenue}`,
      `Users,Total Users,${users.length}`,
      `Users,Creators,${creatorsCount}`,
      `Users,Customers,${customersCount}`,
      `Projects,Active Projects,${projects.length}`,
      `Enquiries,Total Enquiries,${enquiries.length}`,
    ].join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cabmora_Admin_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <AdminLayout>
      <div className="max-w-[1320px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-ink/10 pb-6">
          <div>
            <h1 className="text-[30px] font-sans font-medium text-ink">
              Platform Analytics & Reporting
            </h1>
            <p className="text-ink/60 text-[14px]">
              Deep analytical insights and visual trends across user acquisition, project velocity,
              financial revenue, storage, enquiries, and platform performance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="border border-ink/20 text-ink px-4 py-2.5 rounded-full text-[12px] font-bold tracking-[0.05em] uppercase hover:bg-canvas transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Download size={15} /> Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="bg-ink text-white px-5 py-2.5 rounded-full text-[12px] font-bold tracking-[0.05em] uppercase hover:bg-gold hover:text-ink transition-colors flex items-center gap-2 cursor-pointer"
            >
              <BarChart3 size={15} /> Print / Save PDF
            </button>
          </div>
        </div>

        {/* Time Period Filter Bar */}
        <div className="bg-white border border-ink/10 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gold" />
            <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-ink">
              Report Time Frame:
            </span>
          </div>

          <div className="flex items-center gap-2 bg-canvas p-1 rounded-lg border border-ink/10 w-full sm:w-auto overflow-x-auto">
            {['7 Days', '30 Days', '90 Days', 'Year to Date', 'All Time'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3.5 py-1.5 rounded text-[11px] font-bold uppercase tracking-[0.05em] transition-colors whitespace-nowrap cursor-pointer ${
                  timeRange === range ? 'bg-ink text-gold shadow-xs' : 'text-ink/60 hover:text-ink'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* CHART 1: User Growth & Creator Acquisition */}
          <div className="bg-white border border-ink/10 p-6 lg:p-8 rounded-xl shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-ink/5 pb-4">
              <div>
                <h3 className="font-sans text-[20px] font-medium text-ink">
                  User & Creator Onboarding
                </h3>
                <p className="text-[12px] text-ink/50">
                  Monthly new registrations: Creators vs Customers.
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-gold" /> Creators
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-ink" /> Customers
                </span>
              </div>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2 border-b border-ink/10">
              {[
                { month: 'Jan', creators: 3, customers: 8 },
                { month: 'Feb', creators: 5, customers: 12 },
                { month: 'Mar', creators: 7, customers: 15 },
                { month: 'Apr', creators: 6, customers: 18 },
                { month: 'May', creators: 9, customers: 22 },
                { month: 'Jun', creators: 12, customers: 28 },
              ].map((data, idx) => (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-1 h-full justify-end group"
                >
                  <div className="flex items-end gap-1 w-full justify-center h-full">
                    <div
                      className="w-1/3 bg-gold rounded-t transition-all group-hover:bg-gold-dark"
                      style={{ height: `${data.creators * 7}%` }}
                      title={`Creators: ${data.creators}`}
                    />
                    <div
                      className="w-1/3 bg-ink rounded-t transition-all group-hover:bg-ink/75"
                      style={{ height: `${data.customers * 3.2}%` }}
                      title={`Customers: ${data.customers}`}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-ink/50 mt-2">{data.month}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-canvas rounded-lg">
                <div className="text-[10px] uppercase font-bold text-ink/50">
                  Total Active Creators
                </div>
                <div className="font-sans text-[24px] font-medium text-ink">{creatorsCount}</div>
              </div>
              <div className="p-3 bg-canvas rounded-lg">
                <div className="text-[10px] uppercase font-bold text-ink/50">
                  Total Active Customers
                </div>
                <div className="font-sans text-[24px] font-medium text-ink">{customersCount}</div>
              </div>
            </div>
          </div>

          {/* CHART 2: Revenue Trajectory & Service Breakdown */}
          <div className="bg-white border border-ink/10 p-6 lg:p-8 rounded-xl shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-ink/5 pb-4">
              <div>
                <h3 className="font-sans text-[20px] font-medium text-ink">Financial Trajectory</h3>
                <p className="text-[12px] text-ink/50">
                  Monthly gross platform billing volume (${totalRevenue.toLocaleString()}).
                </p>
              </div>
              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded">
                +24.5% MoM Growth
              </span>
            </div>

            {/* Custom SVG Line / Bar Trend Chart */}
            <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2 border-b border-ink/10">
              {[
                { month: 'Jan', rev: '$12.4k', pct: 35 },
                { month: 'Feb', rev: '$18.2k', pct: 50 },
                { month: 'Mar', rev: '$22.5k', pct: 62 },
                { month: 'Apr', rev: '$28.0k', pct: 75 },
                { month: 'May', rev: '$31.4k', pct: 82 },
                { month: 'Jun', rev: '$38.5k', pct: 95 },
              ].map((data, idx) => (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-1 h-full justify-end group"
                >
                  <span className="text-[9px] font-mono font-bold text-ink/60 opacity-0 group-hover:opacity-100 transition-opacity">
                    {data.rev}
                  </span>
                  <div
                    className="w-full max-w-[32px] bg-emerald-600 rounded-t group-hover:bg-emerald-500 transition-colors"
                    style={{ height: `${data.pct}%` }}
                  />
                  <span className="text-[11px] font-bold text-ink/50 mt-2">{data.month}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-[11px] font-medium">
                <span>Photography Services (55%)</span>
                <span className="font-bold text-ink">$21,175</span>
              </div>
              <div className="flex justify-between text-[11px] font-medium">
                <span>4K Videography & FPV Drone (35%)</span>
                <span className="font-bold text-ink">$13,475</span>
              </div>
              <div className="flex justify-between text-[11px] font-medium">
                <span>Fine-Art Albums & Downloads (10%)</span>
                <span className="font-bold text-ink">$3,850</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Enquiry Conversion Funnel & Infrastructure Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enquiry Conversion Funnel */}
          <div className="lg:col-span-2 bg-white border border-ink/10 p-6 lg:p-8 rounded-xl shadow-xs space-y-6">
            <div>
              <h3 className="font-sans text-[20px] font-medium text-ink">
                Enquiry Conversion Funnel
              </h3>
              <p className="text-[12px] text-ink/50">
                Customer lead pipeline from initial inquiry to booked project.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[12px] font-semibold">
                  <span>1. Inquiries Received (100%)</span>
                  <span>48 Leads</span>
                </div>
                <div className="w-full h-3 bg-canvas rounded-full overflow-hidden border border-ink/10">
                  <div className="h-full bg-blue-600" style={{ width: '100%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[12px] font-semibold">
                  <span>2. Contacted & Proposal Sent (75%)</span>
                  <span>36 Leads</span>
                </div>
                <div className="w-full h-3 bg-canvas rounded-full overflow-hidden border border-ink/10">
                  <div className="h-full bg-purple-600" style={{ width: '75%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[12px] font-semibold">
                  <span>3. In Active Negotiation (52%)</span>
                  <span>25 Leads</span>
                </div>
                <div className="w-full h-3 bg-canvas rounded-full overflow-hidden border border-ink/10">
                  <div className="h-full bg-amber-500" style={{ width: '52%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[12px] font-semibold">
                  <span className="text-emerald-700 font-bold">
                    4. Converted to Paid Project (38%)
                  </span>
                  <span className="font-bold text-emerald-700">18 Projects</span>
                </div>
                <div className="w-full h-3 bg-canvas rounded-full overflow-hidden border border-ink/10">
                  <div className="h-full bg-emerald-600" style={{ width: '38%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Infrastructure Health */}
          <div className="bg-white border border-ink/10 p-6 rounded-xl shadow-xs space-y-5">
            <div>
              <h3 className="font-sans text-[20px] font-medium text-ink">Platform Health</h3>
              <p className="text-[12px] text-ink/50">
                Cloud Run server metrics & storage vault syncing.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="p-3 bg-canvas rounded-lg space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="font-semibold text-ink">API Server Uptime</span>
                  <span className="font-bold text-emerald-700">99.98%</span>
                </div>
                <div className="text-[10px] text-ink/50">Cloud Run High Availability Cluster</div>
              </div>

              <div className="p-3 bg-canvas rounded-lg space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="font-semibold text-ink">Mean Latency</span>
                  <span className="font-bold text-emerald-700">42 ms</span>
                </div>
                <div className="text-[10px] text-ink/50">Global CDN & Edge Caching</div>
              </div>

              <div className="p-3 bg-canvas rounded-lg space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="font-semibold text-ink">Vault Transfer Speed</span>
                  <span className="font-bold text-emerald-700">1.2 GB/s</span>
                </div>
                <div className="text-[10px] text-ink/50">RAW & 4K ProRes Parallel Sync</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
