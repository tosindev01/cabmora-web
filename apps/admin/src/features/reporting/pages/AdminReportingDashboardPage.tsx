import { useState } from 'react';
import { BarChart3, Download, Calendar } from 'lucide-react';
import { useAnalytics } from '@/shared/analytics';
import { formatMinor } from '@/shared/format';

export default function AdminReportingDashboardPage() {
  // Six, not twelve: these charts sit two-up, so twelve columns overflow their
  // panel and clip the newest months — which are the only ones with data. The
  // API caps at 24 if a wider window is ever wanted in a full-width layout.
  const { stats, billing, report, loading } = useAnalytics(6);
  const months = report?.months ?? [];
  const currency = report?.currency ?? 'GBP';
  const peakRegistrations = Math.max(1, ...months.map((m) => m.customers + m.creators));
  const peakRevenue = Math.max(1, ...months.map((m) => m.revenue_minor));

  /** "2026-09" -> "Sep", with the year shown at each January and on the first
   *  column, so a twelve-month span stays readable without repeating "2026". */
  const monthLabel = (value: string, index: number) => {
    const [year, month] = value.split('-');
    const name = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('en-GB', {
      month: 'short',
    });
    return index === 0 || month === '01' ? `${name} ${year!.slice(2)}` : name;
  };

  /** A month with no activity still needs a baseline, or the chart reads as
   *  broken rather than quiet. Two pixels is a tick, not a value. */
  const barHeight = (value: number, peak: number) =>
    value === 0 ? '2px' : `${Math.max(4, (value / peak) * 100)}%`;
  const [timeRange, setTimeRange] = useState<string>('30 Days');

  const creatorsCount = stats?.users.creators ?? 0;
  const customersCount = stats?.users.customers ?? 0;

  const handleExportCSV = () => {
    const headers = 'Category,Metric,Value\n';
    // Minor units divided at the edge, and labelled with the real currency —
    // the fixture exported "$" for a business that invoices in GBP.
    const rows = [
      `Revenue,Cleared Revenue (${currency}),${((billing?.paid_minor ?? 0) / 100).toFixed(2)}`,
      `Revenue,Outstanding (${currency}),${((billing?.outstanding_minor ?? 0) / 100).toFixed(2)}`,
      `Revenue,Refunded (${currency}),${((billing?.refunded_minor ?? 0) / 100).toFixed(2)}`,
      `Users,Total Users,${stats?.users.total ?? 0}`,
      `Users,Creators,${creatorsCount}`,
      `Users,Customers,${customersCount}`,
      `Projects,Total Projects,${stats?.projects.total ?? 0}`,
      `Projects,Active Projects,${stats?.projects.active ?? 0}`,
      `Enquiries,Total Enquiries,${stats?.enquiries.total ?? 0}`,
      `Enquiries,Unclaimed,${stats?.enquiries.new ?? 0}`,
      ...months.map(
        (m) => `Monthly,${m.month} revenue (${currency}),${(m.revenue_minor / 100).toFixed(2)}`,
      ),
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
    <>
      <div className="max-w-[1320px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-ink/10 pb-6">
          <div>
            <h1 className="text-[30px] font-sans font-medium text-ink">
              Platform Analytics & Reporting
            </h1>
            <p className="text-ink/60 text-[15.5px]">
              Deep analytical insights and visual trends across user acquisition, project velocity,
              financial revenue, storage, enquiries, and platform performance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="border border-ink/20 text-ink px-4 py-2.5 rounded-full text-[13.5px] font-bold tracking-[0.05em] uppercase hover:bg-canvas transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Download size={15} /> Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="bg-ink text-white px-5 py-2.5 rounded-full text-[13.5px] font-bold tracking-[0.05em] uppercase hover:bg-gold hover:text-ink transition-colors flex items-center gap-2 cursor-pointer"
            >
              <BarChart3 size={15} /> Print / Save PDF
            </button>
          </div>
        </div>

        {/* Time Period Filter Bar */}
        <div className="bg-white border border-ink/10 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gold" />
            <span className="text-[13.5px] font-bold uppercase tracking-[0.08em] text-ink">
              Report Time Frame:
            </span>
          </div>

          <div className="flex items-center gap-2 bg-canvas p-1 rounded-lg border border-ink/10 w-full sm:w-auto overflow-x-auto">
            {['7 Days', '30 Days', '90 Days', 'Year to Date', 'All Time'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3.5 py-1.5 rounded text-[12.5px] font-bold uppercase tracking-[0.05em] transition-colors whitespace-nowrap cursor-pointer ${
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
                <h3 className="font-sans text-[21.5px] font-medium text-ink">
                  User & Creator Onboarding
                </h3>
                <p className="text-[13.5px] text-ink/50">
                  Monthly new registrations: Creators vs Customers.
                </p>
              </div>
              <div className="flex items-center gap-3 text-[12.5px] font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-gold" /> Creators
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-ink" /> Customers
                </span>
              </div>
            </div>

            {/* Custom SVG Bar Chart */}
            {loading && (
              <p className="text-[13.5px] text-ink/45">Loading the last twelve months…</p>
            )}
            <div className="h-56 flex items-end justify-between gap-1.5 pt-6 px-1 border-b border-ink/10 min-w-0">
              {months.map((data, idx) => (
                <div
                  key={idx}
                  className="flex-1 min-w-0 flex flex-col items-center gap-1 h-full justify-end group"
                >
                  <div className="flex items-end gap-1 w-full justify-center h-full">
                    <div
                      className="w-1/3 bg-gold rounded-t transition-all group-hover:bg-gold-dark"
                      style={{ height: barHeight(data.creators, peakRegistrations) }}
                      title={`Creators: ${data.creators}`}
                    />
                    <div
                      className="w-1/3 bg-ink rounded-t transition-all group-hover:bg-ink/75"
                      style={{ height: barHeight(data.customers, peakRegistrations) }}
                      title={`Customers: ${data.customers}`}
                    />
                  </div>
                  <span className="text-[11.5px] font-bold text-ink/50 mt-2 whitespace-nowrap">
                    {monthLabel(data.month, idx)}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-canvas rounded-lg">
                <div className="text-[11.5px] uppercase font-bold text-ink/50">
                  Total Active Creators
                </div>
                <div className="font-sans text-[24px] font-medium text-ink">{creatorsCount}</div>
              </div>
              <div className="p-3 bg-canvas rounded-lg">
                <div className="text-[11.5px] uppercase font-bold text-ink/50">
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
                <h3 className="font-sans text-[21.5px] font-medium text-ink">
                  Financial Trajectory
                </h3>
                <p className="text-[13.5px] text-ink/50">
                  Monthly revenue, net of refunds
                  {billing && ` — ${formatMinor(billing.paid_minor, billing.currency)} cleared`}.
                </p>
              </div>
              {/* Was "+24.5% MoM Growth", which nothing computed. This is the
                  same two months the chart already shows, so it cannot drift
                  from it. */}
              {months.length >= 2 && (
                <span className="text-[12.5px] text-ink/60 font-bold bg-canvas px-2.5 py-1 rounded">
                  {formatMinor(months[months.length - 1]!.revenue_minor, currency)} this month
                </span>
              )}
            </div>

            {/* Custom SVG Line / Bar Trend Chart */}
            <div className="h-56 flex items-end justify-between gap-1.5 pt-6 px-1 border-b border-ink/10 min-w-0">
              {months.map((data, idx) => (
                <div
                  key={idx}
                  className="flex-1 min-w-0 flex flex-col items-center gap-1 h-full justify-end group"
                >
                  <span className="text-[10.5px] font-mono font-bold text-ink/60 opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatMinor(data.revenue_minor, currency)}
                  </span>
                  <div
                    className="w-full max-w-[32px] bg-emerald-600 rounded-t group-hover:bg-emerald-500 transition-colors"
                    style={{ height: barHeight(data.revenue_minor, peakRevenue) }}
                  />
                  <span className="text-[11.5px] font-bold text-ink/50 mt-2 whitespace-nowrap">
                    {monthLabel(data.month, idx)}
                  </span>
                </div>
              ))}
            </div>

            {/* The service breakdown was a fixed 55/35/10 split with invented
                totals. Projects carry an `event_type`, but nothing aggregates
                revenue by it yet, so the panel is gone rather than fabricated. */}
          </div>
        </div>

        {/* Bottom Section: Enquiry Conversion Funnel & Infrastructure Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enquiry Conversion Funnel */}
          <div className="lg:col-span-2 bg-white border border-ink/10 p-6 lg:p-8 rounded-xl shadow-xs space-y-6">
            <div>
              <h3 className="font-sans text-[21.5px] font-medium text-ink">
                Enquiry Conversion Funnel
              </h3>
              <p className="text-[13.5px] text-ink/50">
                Customer lead pipeline from initial inquiry to booked project.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[13.5px] font-semibold">
                  <span>1. Inquiries Received (100%)</span>
                  <span>48 Leads</span>
                </div>
                <div className="w-full h-3 bg-canvas rounded-full overflow-hidden border border-ink/10">
                  <div className="h-full bg-blue-600" style={{ width: '100%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[13.5px] font-semibold">
                  <span>2. Contacted & Proposal Sent (75%)</span>
                  <span>36 Leads</span>
                </div>
                <div className="w-full h-3 bg-canvas rounded-full overflow-hidden border border-ink/10">
                  <div className="h-full bg-purple-600" style={{ width: '75%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[13.5px] font-semibold">
                  <span>3. In Active Negotiation (52%)</span>
                  <span>25 Leads</span>
                </div>
                <div className="w-full h-3 bg-canvas rounded-full overflow-hidden border border-ink/10">
                  <div className="h-full bg-amber-500" style={{ width: '52%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[13.5px] font-semibold">
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
              <h3 className="font-sans text-[21.5px] font-medium text-ink">Platform Health</h3>
              <p className="text-[13.5px] text-ink/50">
                Cloud Run server metrics & storage vault syncing.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="p-3 bg-canvas rounded-lg space-y-1">
                <div className="flex justify-between text-[12.5px]">
                  <span className="font-semibold text-ink">API Server Uptime</span>
                  <span className="font-bold text-emerald-700">99.98%</span>
                </div>
                <div className="text-[11.5px] text-ink/50">Cloud Run High Availability Cluster</div>
              </div>

              <div className="p-3 bg-canvas rounded-lg space-y-1">
                <div className="flex justify-between text-[12.5px]">
                  <span className="font-semibold text-ink">Mean Latency</span>
                  <span className="font-bold text-emerald-700">42 ms</span>
                </div>
                <div className="text-[11.5px] text-ink/50">Global CDN & Edge Caching</div>
              </div>

              <div className="p-3 bg-canvas rounded-lg space-y-1">
                <div className="flex justify-between text-[12.5px]">
                  <span className="font-semibold text-ink">Vault Transfer Speed</span>
                  <span className="font-bold text-emerald-700">1.2 GB/s</span>
                </div>
                <div className="text-[11.5px] text-ink/50">RAW & 4K ProRes Parallel Sync</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
