import { useState, useEffect, FormEvent } from "react";
import { Link } from "react-router-dom";
import { 
  Bell, 
  Search, 
  Settings, 
  LogOut, 
  LayoutDashboard, 
  Folder, 
  Image as ImageIcon, 
  MessageSquare, 
  CreditCard, 
  HardDrive,
  Database,
  TrendingUp,
  Zap,
  ShieldCheck,
  Download,
  UploadCloud,
  Plus,
  Check,
  AlertTriangle,
  Sparkles,
  Sliders,
  ArrowRight,
  RefreshCw,
  Archive,
  CheckCircle2,
  X,
  ChevronRight,
  Server,
  Layers,
  Clock,
  ArrowUpRight
} from "lucide-react";
import LogoWhite from "../assets/cabmora_white_logo.svg";

interface StoragePlan {
  id: string;
  name: string;
  capacity: string;
  capacityGB: number;
  monthlyPrice: number;
  annualPriceMonthly: number;
  description: string;
  features: string[];
  isCurrent?: boolean;
  isPopular?: boolean;
}

interface AddOnPack {
  id: string;
  name: string;
  boost: string;
  boostGB: number;
  price: number;
  type: "one-time" | "annual";
  description: string;
}

interface ProjectStorageItem {
  id: string;
  name: string;
  client: string;
  type: "RAW Photography" | "4K Video" | "Mixed Media" | "Archive";
  sizeGB: number;
  filesCount: number;
  lastUpdated: string;
  status: "Active" | "Delivered" | "Archived";
  tier: "Hot SSD" | "Cold Vault";
}

const STORAGE_PLANS: StoragePlan[] = [
  {
    id: "plan-starter",
    name: "Starter Creator",
    capacity: "500 GB",
    capacityGB: 500,
    monthlyPrice: 15,
    annualPriceMonthly: 12,
    description: "Ideal for emerging solo photographers managing seasonal client galleries.",
    features: [
      "300 GB Hot SSD + 200 GB Cold Archive",
      "Standard Global CDN Delivery",
      "Full RAW & JPEG Web Proofing",
      "1080p Video Streaming Player",
      "Up to 10 Active Client Galleries",
      "Email & Chat Support"
    ]
  },
  {
    id: "plan-pro",
    name: "Pro Studio",
    capacity: "2 TB (2,000 GB)",
    capacityGB: 2000,
    monthlyPrice: 39,
    annualPriceMonthly: 31,
    description: "Built for high-volume wedding, editorial, and commercial creators.",
    features: [
      "1,500 GB Hot SSD + 500 GB Cold Archive",
      "Ultra-Fast Global Edge CDN",
      "RAW, TIFF & ProRes 4K Streaming",
      "Unlimited Client Galleries & Proofing",
      "Custom Gallery Branding & Watermarking",
      "Automated Cold Storage Archiving Rules",
      "Priority Support & 99.9% Uptime"
    ],
    isCurrent: true
  },
  {
    id: "plan-vault",
    name: "Studio Vault 8K",
    capacity: "8 TB (8,000 GB)",
    capacityGB: 8000,
    monthlyPrice: 99,
    annualPriceMonthly: 79,
    description: "Designed for 4K/8K cinema teams, drone operators & multi-creator studios.",
    features: [
      "6,000 GB Hot NVMe SSD + 2,000 GB Cold Vault",
      "Dedicated 10Gbps High-Speed Transfer Pipes",
      "ProRes RAW & RED Digital Cinema Playback",
      "Multi-User Team Role Access Governance",
      "Lifetime Cold Vault Client Retention",
      "Automated Local NAS Sync Integration",
      "24/7 VIP Studio Support Line"
    ],
    isPopular: true
  },
  {
    id: "plan-enterprise",
    name: "Unlimited Enterprise",
    capacity: "25 TB+",
    capacityGB: 25000,
    monthlyPrice: 249,
    annualPriceMonthly: 199,
    description: "Custom enterprise cloud infrastructure for large production agencies.",
    features: [
      "Dedicated Private Cloud Vault Instance",
      "Custom Storage SLA & Zero Retention Limits",
      "API Access for Custom Studio Workflows",
      "Custom SSL & Whitelabel Domain",
      "Dedicated Account Manager",
      "Custom Backup Policy Matrix"
    ]
  }
];

const ADD_ON_PACKS: AddOnPack[] = [
  {
    id: "addon-250",
    name: "+250 GB Instant Boost",
    boost: "+250 GB",
    boostGB: 250,
    price: 19,
    type: "one-time",
    description: "Instant hot storage boost for heavy wedding deliveries or peak shoot months."
  },
  {
    id: "addon-1000",
    name: "+1 TB High-Speed SSD Pack",
    boost: "+1,000 GB",
    boostGB: 1000,
    price: 49,
    type: "one-time",
    description: "High-speed NVMe SSD allocation added to your current studio plan."
  },
  {
    id: "addon-cold-5000",
    name: "+5 TB Cold Archive Pack",
    boost: "+5,000 GB",
    boostGB: 5000,
    price: 120,
    type: "one-time",
    description: "Deep archival vault storage for long-term project backups and RAW assets."
  }
];

const INITIAL_PROJECT_STORAGE: ProjectStorageItem[] = [
  {
    id: "p1",
    name: "Smith & Wesson Wedding",
    client: "Jane Smith",
    type: "Mixed Media",
    sizeGB: 185,
    filesCount: 1240,
    lastUpdated: "2 hours ago",
    status: "Active",
    tier: "Hot SSD"
  },
  {
    id: "p2",
    name: "Elena's Editorial Shoot",
    client: "Elena Vance",
    type: "RAW Photography",
    sizeGB: 95,
    filesCount: 680,
    lastUpdated: "1 day ago",
    status: "Active",
    tier: "Hot SSD"
  },
  {
    id: "p3",
    name: "Corporate Event - TechCorp",
    client: "David Miller",
    type: "4K Video",
    sizeGB: 82,
    filesCount: 42,
    lastUpdated: "3 days ago",
    status: "Active",
    tier: "Hot SSD"
  },
  {
    id: "p4",
    name: "Johnson Family Portraits",
    client: "Sarah & Mark Johnson",
    type: "RAW Photography",
    sizeGB: 48,
    filesCount: 310,
    lastUpdated: "1 week ago",
    status: "Delivered",
    tier: "Hot SSD"
  },
  {
    id: "p5",
    name: "Aura Beach Sunset Commercial",
    client: "Aura Apparel",
    type: "4K Video",
    sizeGB: 40,
    filesCount: 18,
    lastUpdated: "2 weeks ago",
    status: "Archived",
    tier: "Cold Vault"
  }
];

export default function StoragePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  
  // Storage Metrics State
  const [totalCapacityGB, setTotalCapacityGB] = useState(2000);
  const [usedRAW_GB, setUsedRAW_GB] = useState(280);
  const [usedVideo_GB, setUsedVideo_GB] = useState(140);
  const [usedArchives_GB, setUsedArchives_GB] = useState(30);
  const [currentPlanId, setCurrentPlanId] = useState("plan-pro");

  // Project List State
  const [projects, setProjects] = useState<ProjectStorageItem[]>(INITIAL_PROJECT_STORAGE);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Purchase Modal State
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<StoragePlan | null>(null);
  const [selectedAddOnForModal, setSelectedAddOnForModal] = useState<AddOnPack | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Visa ending in 4242");
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
      setToastMessage(`Plan updated to ${selectedPlanForModal.name}! Vault capacity expanded to ${selectedPlanForModal.capacity}.`);
    } else if (selectedAddOnForModal) {
      setTotalCapacityGB(prev => prev + selectedAddOnForModal.boostGB);
      setIsPurchaseSuccess(true);
      setToastMessage(`Purchased ${selectedAddOnForModal.name}! Added ${selectedAddOnForModal.boost} instant vault space.`);
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
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, status: "Archived", tier: "Cold Vault" };
      }
      return p;
    }));

    // Adjust usage weights (moving hot to cold archive)
    setUsedArchives_GB(prev => prev + 15);
    setToastMessage("Project moved to Cold Storage Vault. Hot SSD capacity freed!");
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRunOptimization = () => {
    setIsCleanupModalOpen(false);
    setUsedArchives_GB(prev => Math.max(10, prev - 15));
    setToastMessage("Storage optimization completed! Purged 15 GB of cached web proofs.");
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredProjects = statusFilter === "all" 
    ? projects 
    : projects.filter(p => p.status.toLowerCase() === statusFilter.toLowerCase());

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111] flex overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-[260px] bg-[#001F1F] text-[#FAF9F6] transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} flex flex-col`}>
        <div className="h-20 flex items-center px-8 border-b border-[#FAF9F6]/10">
          <Link to="/">
            <img src={LogoWhite} alt="Cabmora Logo" className="h-8 w-auto object-contain" />
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar py-6 px-4 flex flex-col gap-1.5">
          <Link to="/dashboard" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <LayoutDashboard size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Overview</span>
          </Link>
          <Link to="/projects" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <Folder size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Projects</span>
          </Link>
          <Link to="/galleries" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <ImageIcon size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Media Library</span>
          </Link>
          <Link to="/messages" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <MessageSquare size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Messages</span>
          </Link>
          <Link to="/billing" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <CreditCard size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Billing</span>
          </Link>
          <Link to="/storage" className="flex items-center gap-4 px-4 py-3 rounded-lg bg-[#FAF9F6]/10 text-[#FAF9F6] transition-colors">
            <HardDrive size={20} className="text-[#C9A86A]" />
            <span className="text-[13px] font-medium tracking-[0.05em]">Storage Vault</span>
          </Link>
          <Link to="/client/dashboard" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors mt-auto">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            <span className="text-[13px] font-medium tracking-[0.05em]">View as Client</span>
          </Link>
        </div>

        <div className="p-4 border-t border-[#FAF9F6]/10">
          <Link to="/settings" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <Settings size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Settings</span>
          </Link>
          <Link to="/" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors mt-2">
            <LogOut size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Log out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-[260px] min-w-0 transition-all duration-300">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-[#111]/10 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-[#111]/70 hover:text-[#111]"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <HardDrive size={22} className="text-[#C9A86A]" />
              <h1 className="font-serif text-[22px] lg:text-[26px]">Storage Vault Management</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsCleanupModalOpen(true)}
              className="hidden sm:flex items-center gap-2 border border-[#111]/15 px-4 py-2 rounded-full text-[12px] font-medium hover:border-[#C9A86A] hover:bg-[#FAF9F6] transition-colors"
            >
              <RefreshCw size={14} className="text-[#C9A86A]" />
              Run Vault Cleanup
            </button>

            <Link 
              to="/upload" 
              className="bg-[#111] text-white px-4 py-2 rounded-full text-[12px] font-medium tracking-[0.05em] hover:bg-[#C9A86A] transition-colors flex items-center gap-2 shadow-sm"
            >
              <UploadCloud size={15} />
              Upload Media
            </Link>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          <div className="max-w-[1240px] mx-auto space-y-10">

            {/* Section 1: Storage Usage Overview Card */}
            <div className="bg-white border border-[#111]/10 rounded-2xl p-6 lg:p-8 shadow-sm space-y-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-[#111]/5 pb-6">
                <div>
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-[#C9A86A] font-bold mb-1">
                    <Server size={14} /> High-Speed SSD & Cold Archive Capacity
                  </div>
                  <h2 className="font-serif text-[26px] text-[#111]">Current Storage Consumption</h2>
                  <p className="text-[13px] text-[#111]/60">
                    Real-time monitoring of your high-res RAW photography, 4K ProRes video reels, and client archives.
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-[#FAF9F6] p-3 rounded-xl border border-[#111]/5">
                  <div className="w-10 h-10 rounded-lg bg-[#C9A86A]/15 flex items-center justify-center text-[#C9A86A]">
                    <Zap size={20} />
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.08em] text-[#111]/50 font-semibold">Growth Pace</div>
                    <div className="text-[13px] font-semibold text-[#111]">~85 GB added / month</div>
                  </div>
                </div>
              </div>

              {/* Multi-Segment Usage Bar */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[13px] gap-1">
                  <span className="font-medium text-[#111]">
                    <strong>{totalUsedGB.toLocaleString()} GB</strong> used of <strong>{totalCapacityGB.toLocaleString()} GB</strong> ({freeGB.toLocaleString()} GB Available)
                  </span>
                  <span className="text-[#C9A86A] font-bold text-[14px]">
                    {usedPercentage}% Vault Consumed
                  </span>
                </div>

                {/* Progress Visual */}
                <div className="w-full h-4 bg-[#FAF9F6] rounded-full overflow-hidden flex border border-[#111]/10 p-0.5">
                  <div 
                    className="h-full bg-[#C9A86A] rounded-l-full transition-all duration-500" 
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
                  <div className="p-4 bg-[#FAF9F6] rounded-xl border border-[#111]/5 space-y-1">
                    <div className="flex items-center gap-2 text-[12px] font-semibold text-[#111]">
                      <div className="w-3 h-3 rounded-full bg-[#C9A86A]" />
                      RAW Photography
                    </div>
                    <div className="text-[18px] font-serif font-medium text-[#111]">{usedRAW_GB} GB</div>
                    <div className="text-[11px] text-[#111]/50">{rawPercent}% of total vault</div>
                  </div>

                  <div className="p-4 bg-[#FAF9F6] rounded-xl border border-[#111]/5 space-y-1">
                    <div className="flex items-center gap-2 text-[12px] font-semibold text-[#111]">
                      <div className="w-3 h-3 rounded-full bg-purple-600" />
                      4K ProRes Video
                    </div>
                    <div className="text-[18px] font-serif font-medium text-[#111]">{usedVideo_GB} GB</div>
                    <div className="text-[11px] text-[#111]/50">{videoPercent}% of total vault</div>
                  </div>

                  <div className="p-4 bg-[#FAF9F6] rounded-xl border border-[#111]/5 space-y-1">
                    <div className="flex items-center gap-2 text-[12px] font-semibold text-[#111]">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      Delivery Archives
                    </div>
                    <div className="text-[18px] font-serif font-medium text-[#111]">{usedArchives_GB} GB</div>
                    <div className="text-[11px] text-[#111]/50">{archivePercent}% of total vault</div>
                  </div>

                  <div className="p-4 bg-[#FAF9F6] rounded-xl border border-[#111]/5 space-y-1">
                    <div className="flex items-center gap-2 text-[12px] font-semibold text-emerald-700">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      Available Free Vault
                    </div>
                    <div className="text-[18px] font-serif font-medium text-emerald-800">{freeGB.toLocaleString()} GB</div>
                    <div className="text-[11px] text-emerald-600 font-medium">Ready for immediate upload</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: AI Upgrade Recommendations & Intelligent Storage Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-gradient-to-br from-[#001F1F] to-[#003B3B] text-white p-6 rounded-2xl space-y-4 shadow-md border border-[#C9A86A]/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Sparkles size={120} className="text-[#C9A86A]" />
                </div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-[#C9A86A] font-bold">
                  <Sparkles size={14} /> AI Recommendation
                </div>
                <h3 className="font-serif text-[20px] leading-snug">
                  Upgrade to Studio Vault 8K
                </h3>
                <p className="text-[12.5px] text-[#FAF9F6]/80 leading-relaxed">
                  Based on your 140 GB 4K ProRes uploads this month, moving to the 8 TB vault will lower your cost per GB by 42% and provide priority 10Gbps CDN transfer speed.
                </p>
                <button 
                  onClick={() => handleOpenPlanUpgrade(STORAGE_PLANS[2])}
                  className="bg-[#C9A86A] text-[#111] px-5 py-2.5 rounded-full text-[12px] font-bold hover:bg-white transition-colors flex items-center gap-2"
                >
                  View 8 TB Plan Upgrade <ArrowRight size={14} />
                </button>
              </div>

              <div className="bg-white border border-[#111]/10 p-6 rounded-2xl space-y-3 shadow-sm">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-[#111]/50 font-bold">
                  <Archive size={14} className="text-[#C9A86A]" /> Cold Storage Automation
                </div>
                <h3 className="font-serif text-[18px] text-[#111]">
                  Auto-Archive Eligible Projects
                </h3>
                <p className="text-[12.5px] text-[#111]/60 leading-relaxed">
                  3 delivered galleries older than 60 days can be converted to Cold Archival mode, releasing 110 GB of hot SSD space while remaining client-accessible.
                </p>
                <button 
                  onClick={() => setIsCleanupModalOpen(true)}
                  className="text-[12px] font-semibold text-[#111] hover:text-[#C9A86A] transition-colors flex items-center gap-1 pt-1"
                >
                  Configure Archiving Policy <ChevronRight size={14} />
                </button>
              </div>

              <div className="bg-white border border-[#111]/10 p-6 rounded-2xl space-y-3 shadow-sm">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-[#111]/50 font-bold">
                  <ShieldCheck size={14} className="text-[#C9A86A]" /> Redundant Cloud Mirroring
                </div>
                <h3 className="font-serif text-[18px] text-[#111]">
                  Geographic Vault Protection
                </h3>
                <p className="text-[12.5px] text-[#111]/60 leading-relaxed">
                  Your RAW photography and ProRes video assets are mirrored across 3 redundant data centers in Europe & US with 99.999999999% durability.
                </p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  100% Mirroring Active
                </div>
              </div>

            </div>

            {/* Section 3: Available Plans & Pricing Matrix */}
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#111]/10 pb-6">
                <div>
                  <h2 className="font-serif text-[26px] text-[#111]">Cloud Storage Plans</h2>
                  <p className="text-[13px] text-[#111]/60">Select the vault tier that matches your studio's media production volume.</p>
                </div>

                {/* Billing Cycle Toggle */}
                <div className="flex items-center bg-[#FAF9F6] border border-[#111]/10 p-1 rounded-full text-[12px] font-medium">
                  <button 
                    onClick={() => setBillingCycle("monthly")}
                    className={`px-4 py-1.5 rounded-full transition-colors ${billingCycle === "monthly" ? "bg-[#111] text-white shadow-sm" : "text-[#111]/60 hover:text-[#111]"}`}
                  >
                    Monthly Billing
                  </button>
                  <button 
                    onClick={() => setBillingCycle("annual")}
                    className={`px-4 py-1.5 rounded-full transition-colors flex items-center gap-1 ${billingCycle === "annual" ? "bg-[#111] text-white shadow-sm" : "text-[#111]/60 hover:text-[#111]"}`}
                  >
                    Annual Billing
                    <span className="bg-[#C9A86A] text-[#111] text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase">Save 20%</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {STORAGE_PLANS.map((plan) => {
                  const price = billingCycle === "annual" ? plan.annualPriceMonthly : plan.monthlyPrice;
                  const isCurrent = plan.id === currentPlanId;

                  return (
                    <div 
                      key={plan.id}
                      className={`bg-white rounded-2xl p-6 border transition-all duration-200 flex flex-col justify-between relative ${
                        plan.isPopular 
                          ? "border-[#C9A86A] shadow-lg ring-1 ring-[#C9A86A]/40" 
                          : isCurrent 
                          ? "border-[#111] bg-[#FAF9F6]/40" 
                          : "border-[#111]/10 hover:border-[#111]/30"
                      }`}
                    >
                      {plan.isPopular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#C9A86A] text-[#111] text-[10px] uppercase font-extrabold tracking-[0.1em] px-3 py-1 rounded-full shadow-sm">
                          Most Popular Studio Tier
                        </div>
                      )}

                      {isCurrent && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#111] text-white text-[10px] uppercase font-bold tracking-[0.1em] px-3 py-1 rounded-full shadow-sm">
                          Current Active Plan
                        </div>
                      )}

                      <div className="space-y-4 pt-2">
                        <div>
                          <h3 className="font-serif text-[20px] text-[#111]">{plan.name}</h3>
                          <div className="font-serif text-[28px] text-[#C9A86A] font-bold mt-1">
                            {plan.capacity}
                          </div>
                          <p className="text-[12px] text-[#111]/60 min-h-[36px] mt-2">
                            {plan.description}
                          </p>
                        </div>

                        <div className="border-t border-b border-[#111]/5 py-4">
                          <div className="flex items-baseline gap-1">
                            <span className="font-serif text-[32px] font-bold text-[#111]">${price}</span>
                            <span className="text-[12px] text-[#111]/50">/ month</span>
                          </div>
                          <div className="text-[11px] text-[#111]/40 mt-0.5">
                            {billingCycle === "annual" ? "Billed annually" : "Billed monthly"}
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          <div className="text-[11px] uppercase tracking-[0.08em] text-[#111]/50 font-bold">Plan Features:</div>
                          {plan.features.map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-[12px] text-[#111]/80">
                              <Check size={15} className="text-[#C9A86A] shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 mt-6 border-t border-[#111]/5">
                        {isCurrent ? (
                          <button 
                            disabled 
                            className="w-full py-2.5 bg-gray-100 text-[#111]/40 font-semibold rounded-full text-[12px] cursor-default flex items-center justify-center gap-1"
                          >
                            <CheckCircle2 size={15} /> Current Plan
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleOpenPlanUpgrade(plan)}
                            className={`w-full py-2.5 rounded-full text-[12px] font-semibold tracking-[0.05em] transition-colors ${
                              plan.isPopular 
                                ? "bg-[#C9A86A] text-[#111] hover:bg-[#111] hover:text-white" 
                                : "bg-[#111] text-white hover:bg-[#C9A86A] hover:text-[#111]"
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
            <div className="bg-white border border-[#111]/10 rounded-2xl p-6 lg:p-8 shadow-sm space-y-6">
              <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-[#C9A86A] font-bold mb-1">
                  <Plus size={14} /> Instant Storage Top-Up Boosts
                </div>
                <h2 className="font-serif text-[22px] text-[#111]">Need Temporary Storage Without Plan Changes?</h2>
                <p className="text-[13px] text-[#111]/60">
                  Purchase a one-time storage pack to handle heavy shoot seasons, large commercial projects, or extended archive needs.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {ADD_ON_PACKS.map((addon) => (
                  <div key={addon.id} className="p-5 border border-[#111]/10 rounded-xl bg-[#FAF9F6] flex flex-col justify-between space-y-4 hover:border-[#C9A86A] transition-colors">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#C9A86A]/20 text-[#111] font-bold text-[11px] uppercase tracking-wider">
                          {addon.boost}
                        </span>
                        <span className="font-serif text-[22px] font-bold text-[#111]">${addon.price}</span>
                      </div>
                      <h4 className="font-serif text-[17px] text-[#111]">{addon.name}</h4>
                      <p className="text-[12px] text-[#111]/60">{addon.description}</p>
                    </div>

                    <button 
                      onClick={() => handleOpenAddOnPurchase(addon)}
                      className="w-full py-2 bg-[#111] text-white rounded-lg text-[12px] font-medium hover:bg-[#C9A86A] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Plus size={14} /> Purchase Add-On Pack
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 5: Project Storage Allocation Breakdown Table */}
            <div className="bg-white border border-[#111]/10 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#111]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-[20px] text-[#111]">Project Vault Allocation</h3>
                  <p className="text-[12.5px] text-[#111]/60">Review storage consumption per client gallery & archive state.</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#111]/50 uppercase font-semibold">Filter:</span>
                  <select 
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="bg-[#FAF9F6] border border-[#111]/10 px-3 py-1.5 rounded-lg text-[12px] outline-none focus:border-[#C9A86A]"
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
                    <tr className="bg-[#FAF9F6] border-b border-[#111]/10 text-[11px] uppercase tracking-[0.1em] text-[#111]/50 font-semibold">
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
                      <tr key={item.id} className="border-b border-[#111]/5 hover:bg-[#FAF9F6]/60 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-[#111]">{item.name}</div>
                          <div className="text-[11px] text-[#111]/50">{item.client} • Updated {item.lastUpdated}</div>
                        </td>
                        <td className="p-4 font-medium text-[#111]/80">
                          {item.type}
                        </td>
                        <td className="p-4 font-serif font-semibold text-[14px]">
                          {item.sizeGB} GB
                        </td>
                        <td className="p-4 text-[#111]/70">
                          {item.filesCount.toLocaleString()} items
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                            item.tier === "Cold Vault" 
                              ? "bg-purple-100 text-purple-800" 
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {item.tier === "Cold Vault" ? <Archive size={12} /> : <HardDrive size={12} />}
                            {item.tier}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {item.status !== "Archived" ? (
                            <button 
                              onClick={() => handleArchiveProject(item.id)}
                              className="px-3 py-1 bg-[#111]/5 hover:bg-[#111] hover:text-white rounded-md text-[11px] font-medium transition-colors"
                            >
                              Move to Cold Vault
                            </button>
                          ) : (
                            <span className="text-[11px] text-[#111]/40 italic">In Cold Storage</span>
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
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-[#C9A86A]/40 text-[13px] animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 size={18} className="text-[#C9A86A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* PURCHASE & TRANSACTION MODAL */}
      {(selectedPlanForModal || selectedAddOnForModal) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 lg:p-8 space-y-6 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-[#111]/10 pb-4">
              <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.1em] text-[#C9A86A] font-bold">
                  <CreditCard size={14} /> Vault Storage Expansion
                </div>
                <h2 className="font-serif text-[22px] text-[#111] mt-0.5">
                  Confirm Storage Checkout
                </h2>
              </div>
              <button 
                onClick={() => {
                  setSelectedPlanForModal(null);
                  setSelectedAddOnForModal(null);
                }} 
                className="text-[#111]/40 hover:text-[#111] p-1 rounded-lg hover:bg-[#FAF9F6]"
              >
                <X size={20} />
              </button>
            </div>

            {isPurchaseSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Check size={28} />
                </div>
                <h3 className="font-serif text-[22px] text-[#111]">Vault Storage Expanded!</h3>
                <p className="text-[13px] text-[#111]/60">Your storage quota has been updated instantly.</p>
              </div>
            ) : (
              <form onSubmit={handleConfirmTransaction} className="space-y-6 text-[13px]">
                
                {/* Item Summary */}
                <div className="p-4 bg-[#FAF9F6] border border-[#111]/10 rounded-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-serif text-[16px] text-[#111]">
                        {selectedPlanForModal?.name || selectedAddOnForModal?.name}
                      </h4>
                      <p className="text-[11px] text-[#111]/50">
                        {selectedPlanForModal?.description || selectedAddOnForModal?.description}
                      </p>
                    </div>
                    <div className="font-serif text-[20px] font-bold text-[#C9A86A]">
                      ${selectedPlanForModal 
                        ? (billingCycle === "annual" ? selectedPlanForModal.annualPriceMonthly : selectedPlanForModal.monthlyPrice)
                        : selectedAddOnForModal?.price
                      }
                      <span className="text-[11px] font-sans text-[#111]/50">
                        {selectedPlanForModal ? "/mo" : " one-time"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#111]/5 flex justify-between text-[12px] font-medium text-[#111]">
                    <span>Capacity Allocated</span>
                    <span className="text-[#C9A86A]">
                      +{selectedPlanForModal?.capacity || selectedAddOnForModal?.boost}
                    </span>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="block text-[11px] uppercase tracking-[0.05em] text-[#111]/60 font-semibold">Payment Method</label>
                  <select 
                    value={selectedPaymentMethod}
                    onChange={e => setSelectedPaymentMethod(e.target.value)}
                    className="w-full bg-white border border-[#111]/10 p-2.5 rounded-lg text-[13px] outline-none focus:border-[#C9A86A]"
                  >
                    <option value="Visa ending in 4242">Visa ending in 4242 (Default)</option>
                    <option value="Mastercard ending in 8812">Mastercard ending in 8812</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-[#111]/10 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => {
                      setSelectedPlanForModal(null);
                      setSelectedAddOnForModal(null);
                    }}
                    className="px-5 py-2.5 text-[12px] font-medium text-[#111]/60 hover:text-[#111]"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-[#111] text-white px-6 py-2.5 rounded-full text-[12px] font-bold tracking-[0.05em] hover:bg-[#C9A86A] transition-colors flex items-center gap-2"
                  >
                    <ShieldCheck size={16} /> Confirm & Expand Capacity
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

      {/* STORAGE OPTIMIZATION & CLEANUP MODAL */}
      {isCleanupModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#111]/10 pb-3">
              <div className="flex items-center gap-2 text-[15px] font-serif font-bold text-[#111]">
                <RefreshCw size={16} className="text-[#C9A86A]" /> Run Storage Optimization
              </div>
              <button onClick={() => setIsCleanupModalOpen(false)} className="text-[#111]/40 hover:text-[#111]">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-[13px] text-[#111]/80">
              <p>Cabmora AI Storage Assistant will perform the following actions:</p>
              
              <ul className="space-y-2 text-[12px]">
                <li className="flex items-start gap-2 bg-[#FAF9F6] p-2.5 rounded-lg border border-[#111]/5">
                  <Check size={14} className="text-[#C9A86A] shrink-0 mt-0.5" />
                  <span>Purge cached 2K proofing files for galleries delivered over 90 days ago.</span>
                </li>
                <li className="flex items-start gap-2 bg-[#FAF9F6] p-2.5 rounded-lg border border-[#111]/5">
                  <Check size={14} className="text-[#C9A86A] shrink-0 mt-0.5" />
                  <span>Move unselected RAW duplicate takes to Cold Storage Vault.</span>
                </li>
              </ul>
            </div>

            <div className="pt-2 flex justify-end gap-3 border-t border-[#111]/10">
              <button 
                onClick={() => setIsCleanupModalOpen(false)}
                className="px-4 py-2 text-[12px] text-[#111]/60"
              >
                Cancel
              </button>
              <button 
                onClick={handleRunOptimization}
                className="bg-[#111] text-white px-5 py-2 rounded-full text-[12px] font-bold hover:bg-[#C9A86A] transition-colors"
              >
                Execute Optimization
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
