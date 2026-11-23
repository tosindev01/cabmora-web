import { useState, useEffect, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  HardDrive,
  Zap,
  ShieldCheck,
  UploadCloud,
  Plus,
  Check,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Archive,
  CheckCircle2,
  ChevronRight,
  Server,
} from 'lucide-react';
import { PortalShell, PortalTopbar } from '@/shared/portal';
import { Modal } from '@cabmora/ui';
import {
  ADD_ON_PACKS,
  AddOnPack,
  INITIAL_PROJECT_STORAGE,
  ProjectStorageItem,
  STORAGE_PLANS,
  StoragePlan,
} from '@/features/media/data';

export default function StoragePage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  // Storage Metrics State
  const [totalCapacityGB, setTotalCapacityGB] = useState(2000);
  const usedRAW_GB = 280;
  const usedVideo_GB = 140;
  const [usedArchives_GB, setUsedArchives_GB] = useState(30);
  const [currentPlanId, setCurrentPlanId] = useState('plan-pro');

  // Project List State
  const [projects, setProjects] = useState<ProjectStorageItem[]>(INITIAL_PROJECT_STORAGE);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Purchase Modal State
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<StoragePlan | null>(null);
  const [selectedAddOnForModal, setSelectedAddOnForModal] = useState<AddOnPack | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Visa ending in 4242');
  const [isPurchaseSuccess, setIsPurchaseSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto Archiving & Optimization Modal
  const [isCleanupModalOpen, setIsCleanupModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const totalUsedGB = usedRAW_GB + usedVideo_GB + usedArchives_GB;
  const freeGB = Math.max(0, totalCapacityGB - totalUsedGB);
  const usedPercentage = Math.min(100, Math.round((totalUsedGB / totalCapacityGB) * 1000) / 10);

  const rawPercent = Math.round((usedRAW_GB / totalCapacityGB) * 1000) / 10;
  const videoPercent = Math.round((usedVideo_GB / totalCapacityGB) * 1000) / 10;
  const archivePercent = Math.round((usedArchives_GB / totalCapacityGB) * 1000) / 10;

  const handleOpenPlanUpgrade = (plan: StoragePlan) => {
    if (plan.id === currentPlanId) return;
    setSelectedPlanForModal(plan);
    setSelectedAddOnForModal(null);
    setIsPurchaseSuccess(false);
  };

  const handleOpenAddOnPurchase = (addon: AddOnPack) => {
    setSelectedAddOnForModal(addon);
    setSelectedPlanForModal(null);
    setIsPurchaseSuccess(false);
  };

  const handleConfirmTransaction = (e: FormEvent) => {
    e.preventDefault();
    if (selectedPlanForModal) {
      setTotalCapacityGB(selectedPlanForModal.capacityGB);
      setCurrentPlanId(selectedPlanForModal.id);
      setIsPurchaseSuccess(true);
      setToastMessage(
        `Plan updated to ${selectedPlanForModal.name}! Vault capacity expanded to ${selectedPlanForModal.capacity}.`,
      );
    } else if (selectedAddOnForModal) {
      setTotalCapacityGB((prev) => prev + selectedAddOnForModal.boostGB);
      setIsPurchaseSuccess(true);
      setToastMessage(
        `Purchased ${selectedAddOnForModal.name}! Added ${selectedAddOnForModal.boost} instant vault space.`,
      );
    }

    setTimeout(() => {
      setSelectedPlanForModal(null);
      setSelectedAddOnForModal(null);
      setIsPurchaseSuccess(false);
    }, 2000);

    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  const handleArchiveProject = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return { ...p, status: 'Archived', tier: 'Cold Vault' };
        }
        return p;
      }),
    );

    // Adjust usage weights (moving hot to cold archive)
    setUsedArchives_GB((prev) => prev + 15);
    setToastMessage('Project moved to Cold Storage Vault. Hot SSD capacity freed!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRunOptimization = () => {
    setIsCleanupModalOpen(false);
    setUsedArchives_GB((prev) => Math.max(10, prev - 15));
    setToastMessage('Storage optimization completed! Purged 15 GB of cached web proofs.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredProjects =
    statusFilter === 'all'
      ? projects
      : projects.filter((p) => p.status.toLowerCase() === statusFilter.toLowerCase());

  const closeCheckout = () => {
    setSelectedPlanForModal(null);
    setSelectedAddOnForModal(null);
  };

  return (
    <PortalShell>
      {({ toggleSidebar }) => (
        <>
          <PortalTopbar
            title="Storage Vault Management"
            icon={HardDrive}
            onToggleSidebar={toggleSidebar}
          >
            <button
              onClick={() => setIsCleanupModalOpen(true)}
              className="hidden sm:flex items-center gap-2 border border-ink/15 px-4 py-2 rounded-full text-[12px] font-medium hover:border-gold hover:bg-canvas transition-colors"
            >
              <RefreshCw size={14} className="text-gold" />
              Run Vault Cleanup
            </button>

            <Link
              to="/upload"
              className="bg-ink text-white px-4 py-2 rounded-full text-[12px] font-medium tracking-[0.05em] hover:bg-gold transition-colors flex items-center gap-2 shadow-sm"
            >
              <UploadCloud size={15} />
              Upload Media
            </Link>
          </PortalTopbar>

          {/* Page Body */}
          <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
            <div className="max-w-[1240px] mx-auto space-y-10">
              {/* Section 1: Storage Usage Overview Card */}
              <div className="bg-white border border-ink/10 rounded-2xl p-6 lg:p-8 shadow-sm space-y-6">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-ink/5 pb-6">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-gold font-bold mb-1">
                      <Server size={14} /> High-Speed SSD & Cold Archive Capacity
                    </div>
                    <h2 className="font-serif text-[26px] text-ink">Current Storage Consumption</h2>
                    <p className="text-[13px] text-ink/60">
                      Real-time monitoring of your high-res RAW photography, 4K ProRes video reels,
                      and client archives.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 bg-canvas p-3 rounded-xl border border-ink/5">
                    <div className="w-10 h-10 rounded-lg bg-gold/15 flex items-center justify-center text-gold">
                      <Zap size={20} />
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.08em] text-ink/50 font-semibold">
                        Growth Pace
                      </div>
                      <div className="text-[13px] font-semibold text-ink">~85 GB added / month</div>
                    </div>
                  </div>
                </div>

                {/* Multi-Segment Usage Bar */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[13px] gap-1">
                    <span className="font-medium text-ink">
                      <strong>{totalUsedGB.toLocaleString()} GB</strong> used of{' '}
                      <strong>{totalCapacityGB.toLocaleString()} GB</strong> (
                      {freeGB.toLocaleString()} GB Available)
                    </span>
                    <span className="text-gold font-bold text-[14px]">
                      {usedPercentage}% Vault Consumed
                    </span>
                  </div>

                  {/* Progress Visual */}
                  <div className="w-full h-4 bg-canvas rounded-full overflow-hidden flex border border-ink/10 p-0.5">
                    <div
                      className="h-full bg-gold rounded-l-full transition-all duration-500"
                      style={{ width: `${Math.max(1, rawPercent)}%` }}
                      title={`RAW Photography: ${usedRAW_GB} GB`}
                    />
                    <div
                      className="h-full bg-purple-600 transition-all duration-500"
                      style={{ width: `${Math.max(1, videoPercent)}%` }}
                      title={`4K ProRes Video: ${usedVideo_GB} GB`}
                    />
                    <div
                      className="h-full bg-blue-500 rounded-r-full transition-all duration-500"
                      style={{ width: `${Math.max(1, archivePercent)}%` }}
                      title={`Delivery Archives: ${usedArchives_GB} GB`}
                    />
                  </div>

                  {/* Legend & Stat Boxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-3">
                    <div className="p-4 bg-canvas rounded-xl border border-ink/5 space-y-1">
                      <div className="flex items-center gap-2 text-[12px] font-semibold text-ink">
                        <div className="w-3 h-3 rounded-full bg-gold" />
                        RAW Photography
                      </div>
                      <div className="text-[18px] font-serif font-medium text-ink">
                        {usedRAW_GB} GB
                      </div>
                      <div className="text-[11px] text-ink/50">{rawPercent}% of total vault</div>
                    </div>

                    <div className="p-4 bg-canvas rounded-xl border border-ink/5 space-y-1">
                      <div className="flex items-center gap-2 text-[12px] font-semibold text-ink">
                        <div className="w-3 h-3 rounded-full bg-purple-600" />
                        4K ProRes Video
                      </div>
                      <div className="text-[18px] font-serif font-medium text-ink">
                        {usedVideo_GB} GB
                      </div>
                      <div className="text-[11px] text-ink/50">{videoPercent}% of total vault</div>
                    </div>

                    <div className="p-4 bg-canvas rounded-xl border border-ink/5 space-y-1">
                      <div className="flex items-center gap-2 text-[12px] font-semibold text-ink">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        Delivery Archives
                      </div>
                      <div className="text-[18px] font-serif font-medium text-ink">
                        {usedArchives_GB} GB
                      </div>
                      <div className="text-[11px] text-ink/50">
                        {archivePercent}% of total vault
                      </div>
                    </div>

                    <div className="p-4 bg-canvas rounded-xl border border-ink/5 space-y-1">
                      <div className="flex items-center gap-2 text-[12px] font-semibold text-emerald-700">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        Available Free Vault
                      </div>
                      <div className="text-[18px] font-serif font-medium text-emerald-800">
                        {freeGB.toLocaleString()} GB
                      </div>
                      <div className="text-[11px] text-emerald-600 font-medium">
                        Ready for immediate upload
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: AI Upgrade Recommendations & Intelligent Storage Insights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-forest to-forest-light text-white p-6 rounded-2xl space-y-4 shadow-md border border-gold/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Sparkles size={120} className="text-gold" />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-gold font-bold">
                    <Sparkles size={14} /> AI Recommendation
                  </div>
                  <h3 className="font-serif text-[20px] leading-snug">
                    Upgrade to Studio Vault 8K
                  </h3>
                  <p className="text-[12.5px] text-canvas/80 leading-relaxed">
                    Based on your 140 GB 4K ProRes uploads this month, moving to the 8 TB vault will
                    lower your cost per GB by 42% and provide priority 10Gbps CDN transfer speed.
                  </p>
                  <button
                    onClick={() => handleOpenPlanUpgrade(STORAGE_PLANS[2])}
                    className="bg-gold text-ink px-5 py-2.5 rounded-full text-[12px] font-bold hover:bg-white transition-colors flex items-center gap-2"
                  >
                    View 8 TB Plan Upgrade <ArrowRight size={14} />
                  </button>
                </div>

                <div className="bg-white border border-ink/10 p-6 rounded-2xl space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-ink/50 font-bold">
                    <Archive size={14} className="text-gold" /> Cold Storage Automation
                  </div>
                  <h3 className="font-serif text-[18px] text-ink">
                    Auto-Archive Eligible Projects
                  </h3>
                  <p className="text-[12.5px] text-ink/60 leading-relaxed">
                    3 delivered galleries older than 60 days can be converted to Cold Archival mode,
                    releasing 110 GB of hot SSD space while remaining client-accessible.
                  </p>
                  <button
                    onClick={() => setIsCleanupModalOpen(true)}
                    className="text-[12px] font-semibold text-ink hover:text-gold transition-colors flex items-center gap-1 pt-1"
                  >
                    Configure Archiving Policy <ChevronRight size={14} />
                  </button>
                </div>

                <div className="bg-white border border-ink/10 p-6 rounded-2xl space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-ink/50 font-bold">
                    <ShieldCheck size={14} className="text-gold" /> Redundant Cloud Mirroring
                  </div>
                  <h3 className="font-serif text-[18px] text-ink">Geographic Vault Protection</h3>
                  <p className="text-[12.5px] text-ink/60 leading-relaxed">
                    Your RAW photography and ProRes video assets are mirrored across 3 redundant
                    data centers in Europe & US with 99.999999999% durability.
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    100% Mirroring Active
                  </div>
                </div>
              </div>

              {/* Section 3: Available Plans & Pricing Matrix */}
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-ink/10 pb-6">
                  <div>
                    <h2 className="font-serif text-[26px] text-ink">Cloud Storage Plans</h2>
                    <p className="text-[13px] text-ink/60">
                      Select the vault tier that matches your studio's media production volume.
                    </p>
                  </div>

                  {/* Billing Cycle Toggle */}
                  <div className="flex items-center bg-canvas border border-ink/10 p-1 rounded-full text-[12px] font-medium">
                    <button
                      onClick={() => setBillingCycle('monthly')}
                      className={`px-4 py-1.5 rounded-full transition-colors ${billingCycle === 'monthly' ? 'bg-ink text-white shadow-sm' : 'text-ink/60 hover:text-ink'}`}
                    >
                      Monthly Billing
                    </button>
                    <button
                      onClick={() => setBillingCycle('annual')}
                      className={`px-4 py-1.5 rounded-full transition-colors flex items-center gap-1 ${billingCycle === 'annual' ? 'bg-ink text-white shadow-sm' : 'text-ink/60 hover:text-ink'}`}
                    >
                      Annual Billing
                      <span className="bg-gold text-ink text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                        Save 20%
                      </span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {STORAGE_PLANS.map((plan) => {
                    const price =
                      billingCycle === 'annual' ? plan.annualPriceMonthly : plan.monthlyPrice;
                    const isCurrent = plan.id === currentPlanId;

                    return (
                      <div
                        key={plan.id}
                        className={`bg-white rounded-2xl p-6 border transition-all duration-200 flex flex-col justify-between relative ${
                          plan.isPopular
                            ? 'border-gold shadow-lg ring-1 ring-gold/40'
                            : isCurrent
                              ? 'border-ink bg-canvas/40'
                              : 'border-ink/10 hover:border-ink/30'
                        }`}
                      >
                        {plan.isPopular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gold text-ink text-[10px] uppercase font-extrabold tracking-[0.1em] px-3 py-1 rounded-full shadow-sm">
                            Most Popular Studio Tier
                          </div>
                        )}

                        {isCurrent && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-ink text-white text-[10px] uppercase font-bold tracking-[0.1em] px-3 py-1 rounded-full shadow-sm">
                            Current Active Plan
                          </div>
                        )}

                        <div className="space-y-4 pt-2">
                          <div>
                            <h3 className="font-serif text-[20px] text-ink">{plan.name}</h3>
                            <div className="font-serif text-[28px] text-gold font-bold mt-1">
                              {plan.capacity}
                            </div>
                            <p className="text-[12px] text-ink/60 min-h-[36px] mt-2">
                              {plan.description}
                            </p>
                          </div>

                          <div className="border-t border-b border-ink/5 py-4">
                            <div className="flex items-baseline gap-1">
                              <span className="font-serif text-[32px] font-bold text-ink">
                                ${price}
                              </span>
                              <span className="text-[12px] text-ink/50">/ month</span>
                            </div>
                            <div className="text-[11px] text-ink/40 mt-0.5">
                              {billingCycle === 'annual' ? 'Billed annually' : 'Billed monthly'}
                            </div>
                          </div>

                          <div className="space-y-2.5">
                            <div className="text-[11px] uppercase tracking-[0.08em] text-ink/50 font-bold">
                              Plan Features:
                            </div>
                            {plan.features.map((feat, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2 text-[12px] text-ink/80"
                              >
                                <Check size={15} className="text-gold shrink-0 mt-0.5" />
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-6 mt-6 border-t border-ink/5">
                          {isCurrent ? (
                            <button
                              disabled
                              className="w-full py-2.5 bg-gray-100 text-ink/40 font-semibold rounded-full text-[12px] cursor-default flex items-center justify-center gap-1"
                            >
                              <CheckCircle2 size={15} /> Current Plan
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenPlanUpgrade(plan)}
                              className={`w-full py-2.5 rounded-full text-[12px] font-semibold tracking-[0.05em] transition-colors ${
                                plan.isPopular
                                  ? 'bg-gold text-ink hover:bg-ink hover:text-white'
                                  : 'bg-ink text-white hover:bg-gold hover:text-ink'
                              }`}
                            >
                              Select & Upgrade
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 4: One-Time Storage Add-On Top-Up Options */}
              <div className="bg-white border border-ink/10 rounded-2xl p-6 lg:p-8 shadow-sm space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-gold font-bold mb-1">
                    <Plus size={14} /> Instant Storage Top-Up Boosts
                  </div>
                  <h2 className="font-serif text-[22px] text-ink">
                    Need Temporary Storage Without Plan Changes?
                  </h2>
                  <p className="text-[13px] text-ink/60">
                    Purchase a one-time storage pack to handle heavy shoot seasons, large commercial
                    projects, or extended archive needs.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {ADD_ON_PACKS.map((addon) => (
                    <div
                      key={addon.id}
                      className="p-5 border border-ink/10 rounded-xl bg-canvas flex flex-col justify-between space-y-4 hover:border-gold transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-md bg-gold/20 text-ink font-bold text-[11px] uppercase tracking-wider">
                            {addon.boost}
                          </span>
                          <span className="font-serif text-[22px] font-bold text-ink">
                            ${addon.price}
                          </span>
                        </div>
                        <h4 className="font-serif text-[17px] text-ink">{addon.name}</h4>
                        <p className="text-[12px] text-ink/60">{addon.description}</p>
                      </div>

                      <button
                        onClick={() => handleOpenAddOnPurchase(addon)}
                        className="w-full py-2 bg-ink text-white rounded-lg text-[12px] font-medium hover:bg-gold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Plus size={14} /> Purchase Add-On Pack
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 5: Project Storage Allocation Breakdown Table */}
              <div className="bg-white border border-ink/10 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-ink/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-[20px] text-ink">Project Vault Allocation</h3>
                    <p className="text-[12.5px] text-ink/60">
                      Review storage consumption per client gallery & archive state.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-ink/50 uppercase font-semibold">Filter:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-canvas border border-ink/10 px-3 py-1.5 rounded-lg text-[12px] outline-none focus:border-gold"
                    >
                      <option value="all">All Projects</option>
                      <option value="active">Active (Hot SSD)</option>
                      <option value="delivered">Delivered</option>
                      <option value="archived">Archived (Cold Vault)</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[13px]">
                    <thead>
                      <tr className="bg-canvas border-b border-ink/10 text-[11px] uppercase tracking-[0.1em] text-ink/50 font-semibold">
                        <th className="p-4">Project & Client</th>
                        <th className="p-4">Media Type</th>
                        <th className="p-4">Storage Size</th>
                        <th className="p-4">Files Count</th>
                        <th className="p-4">Vault Tier</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProjects.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-ink/5 hover:bg-canvas/60 transition-colors"
                        >
                          <td className="p-4">
                            <div className="font-medium text-ink">{item.name}</div>
                            <div className="text-[11px] text-ink/50">
                              {item.client} • Updated {item.lastUpdated}
                            </div>
                          </td>
                          <td className="p-4 font-medium text-ink/80">{item.type}</td>
                          <td className="p-4 font-serif font-semibold text-[14px]">
                            {item.sizeGB} GB
                          </td>
                          <td className="p-4 text-ink/70">
                            {item.filesCount.toLocaleString()} items
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                                item.tier === 'Cold Vault'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {item.tier === 'Cold Vault' ? (
                                <Archive size={12} />
                              ) : (
                                <HardDrive size={12} />
                              )}
                              {item.tier}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {item.status !== 'Archived' ? (
                              <button
                                onClick={() => handleArchiveProject(item.id)}
                                className="px-3 py-1 bg-ink/5 hover:bg-ink hover:text-white rounded-md text-[11px] font-medium transition-colors"
                              >
                                Move to Cold Vault
                              </button>
                            ) : (
                              <span className="text-[11px] text-ink/40 italic">
                                In Cold Storage
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 bg-ink text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-gold/40 text-[13px] animate-in fade-in slide-in-from-bottom-4 duration-200">
              <CheckCircle2 size={18} className="text-gold" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* PURCHASE & TRANSACTION MODAL */}
          <Modal
            open={Boolean(selectedPlanForModal || selectedAddOnForModal)}
            onOpenChange={(next) => {
              if (!next) closeCheckout();
            }}
            size="lg"
            title="Confirm Storage Checkout"
            description="Vault Storage Expansion"
          >
            {isPurchaseSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Check size={28} />
                </div>
                <h3 className="font-serif text-[22px] text-ink">Vault Storage Expanded!</h3>
                <p className="text-[13px] text-ink/60">
                  Your storage quota has been updated instantly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmTransaction} className="space-y-6 text-[13px]">
                {/* Item Summary */}
                <div className="p-4 bg-canvas border border-ink/10 rounded-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-serif text-[16px] text-ink">
                        {selectedPlanForModal?.name || selectedAddOnForModal?.name}
                      </h4>
                      <p className="text-[11px] text-ink/50">
                        {selectedPlanForModal?.description || selectedAddOnForModal?.description}
                      </p>
                    </div>
                    <div className="font-serif text-[20px] font-bold text-gold">
                      $
                      {selectedPlanForModal
                        ? billingCycle === 'annual'
                          ? selectedPlanForModal.annualPriceMonthly
                          : selectedPlanForModal.monthlyPrice
                        : selectedAddOnForModal?.price}
                      <span className="text-[11px] font-sans text-ink/50">
                        {selectedPlanForModal ? '/mo' : ' one-time'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-ink/5 flex justify-between text-[12px] font-medium text-ink">
                    <span>Capacity Allocated</span>
                    <span className="text-gold">
                      +{selectedPlanForModal?.capacity || selectedAddOnForModal?.boost}
                    </span>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="block text-[11px] uppercase tracking-[0.05em] text-ink/60 font-semibold">
                    Payment Method
                  </label>
                  <select
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="w-full bg-white border border-ink/10 p-2.5 rounded-lg text-[13px] outline-none focus:border-gold"
                  >
                    <option value="Visa ending in 4242">Visa ending in 4242 (Default)</option>
                    <option value="Mastercard ending in 8812">Mastercard ending in 8812</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-ink/10 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeCheckout}
                    className="px-5 py-2.5 text-[12px] font-medium text-ink/60 hover:text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-ink text-white px-6 py-2.5 rounded-full text-[12px] font-bold tracking-[0.05em] hover:bg-gold transition-colors flex items-center gap-2"
                  >
                    <ShieldCheck size={16} /> Confirm & Expand Capacity
                  </button>
                </div>
              </form>
            )}
          </Modal>

          {/* STORAGE OPTIMIZATION & CLEANUP MODAL */}
          <Modal
            open={isCleanupModalOpen}
            onOpenChange={setIsCleanupModalOpen}
            size="sm"
            title={
              <span className="flex items-center gap-2">
                <RefreshCw size={16} className="text-gold" /> Run Storage Optimization
              </span>
            }
            footer={
              <>
                <button
                  type="button"
                  onClick={() => setIsCleanupModalOpen(false)}
                  className="px-4 py-2 text-[12px] text-ink/60 hover:text-ink transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRunOptimization}
                  className="bg-ink text-white px-5 py-2 rounded-full text-[12px] font-bold hover:bg-gold transition-colors"
                >
                  Execute Optimization
                </button>
              </>
            }
          >
            <div className="space-y-3 text-[13px] text-ink/80">
              <p>Cabmora AI Storage Assistant will perform the following actions:</p>

              <ul className="space-y-2 text-[12px]">
                <li className="flex items-start gap-2 bg-canvas p-2.5 rounded-lg border border-ink/5">
                  <Check size={14} className="text-gold shrink-0 mt-0.5" />
                  <span>
                    Purge cached 2K proofing files for galleries delivered over 90 days ago.
                  </span>
                </li>
                <li className="flex items-start gap-2 bg-canvas p-2.5 rounded-lg border border-ink/5">
                  <Check size={14} className="text-gold shrink-0 mt-0.5" />
                  <span>Move unselected RAW duplicate takes to Cold Storage Vault.</span>
                </li>
              </ul>
            </div>
          </Modal>
        </>
      )}
    </PortalShell>
  );
}
