import { useState, useEffect, type FormEvent } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
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
  ChevronLeft,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  Circle,
  FileText,
  Download,
  Send,
  MoreVertical,
  UploadCloud,
  Shield,
  Lock,
  Share2,
  Sliders,
  Check,
  Eye,
  X
} from "lucide-react";
import LogoWhite from "../assets/cabmora_white_logo.svg";

const PROJECT_DATA = {
  id: "1",
  name: "Smith & Wesson Wedding",
  type: "Wedding",
  date: "Oct 12, 2025",
  location: "Tuscany, Italy",
  status: "In Progress",
  progress: 65,
  image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=400&fit=crop",
  description: "Full-day wedding coverage including preparation, ceremony, reception, and a post-wedding editorial shoot in the Tuscan countryside.",
  permissions: {
    download: { enabled: true, quality: "Original High-Res", requireWatermark: false, pinProtected: true, pinCode: "4821" },
    viewing: { accessLevel: "Client & Team Only", password: "", expirationDate: "2026-12-31" },
    commenting: { enabled: true, allowProofingNotes: true, requireClientAuth: true },
    sharing: { enabled: true, allowGuestReshare: true, showSocialShare: false }
  },
  client: {
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+44 7700 900077"
  },
  payment: {
    total: 8500,
    paid: 4250,
    status: "Partially Paid",
    nextDue: "Oct 01, 2025"
  },
  creators: [
    { id: 1, name: "Sarah Cabmora", role: "Lead Photographer", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" },
    { id: 2, name: "Michael Chang", role: "Videographer", image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop" },
    { id: 3, name: "Emma Wilson", role: "Second Shooter", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop" }
  ],
  timeline: [
    { id: 1, title: "Initial Consultation", date: "Jan 15, 2025", status: "completed", description: "Discussed vision, style preferences, and coverage needs." },
    { id: 2, title: "Contract Signed & Deposit", date: "Jan 20, 2025", status: "completed", description: "50% deposit received, dates secured." },
    { id: 3, title: "Venue Walkthrough", date: "Aug 10, 2025", status: "in-progress", description: "Scouting locations for portraits and lighting checks." },
    { id: 4, title: "Wedding Day", date: "Oct 12, 2025", status: "pending", description: "Full day coverage starting at 9:00 AM." },
    { id: 5, title: "Gallery Delivery", date: "Nov 15, 2025", status: "pending", description: "Final edited images and highlight film." }
  ],
  deliverables: [
    { id: 1, name: "Engagement Session Gallery", type: "gallery", items: 120, status: "completed" },
    { id: 2, name: "Wedding Preview", type: "gallery", items: 50, status: "pending" },
    { id: 3, name: "Full Wedding Gallery", type: "gallery", items: 800, status: "pending" },
    { id: 4, name: "Highlight Film (5-7 mins)", type: "video", items: 1, status: "pending" }
  ],
  comments: [
    { id: 1, user: "Jane Smith", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop", text: "We love the engagement photos! Can we make sure to get similar lighting for the wedding day portraits?", time: "2 days ago" },
    { id: 2, user: "Sarah Cabmora", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop", text: "Absolutely. I've noted the golden hour time for Tuscany on your date, we'll plan a 30-min window for those specific shots.", time: "1 day ago" }
  ]
};

export default function ProjectDetailsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  // Permissions State
  const [permissions, setPermissions] = useState(PROJECT_DATA.permissions);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [editPermissions, setEditPermissions] = useState(PROJECT_DATA.permissions);
  const [permissionsToast, setPermissionsToast] = useState<string | null>(null);

  // In a real app, you would fetch the project based on the id
  const project = { ...PROJECT_DATA, permissions };

  const handleSavePermissions = (e: FormEvent) => {
    e.preventDefault();
    setPermissions(editPermissions);
    setIsPermissionsModalOpen(false);
    setPermissionsToast("Project permissions and governance rights updated successfully.");
    setTimeout(() => setPermissionsToast(null), 3500);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Completed": return "bg-green-100 text-green-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Review": return "bg-yellow-100 text-yellow-800";
      case "Planning": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

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
          <Link to="/projects" className="flex items-center gap-4 px-4 py-3 rounded-lg bg-[#FAF9F6]/10 text-[#FAF9F6] transition-colors">
            <Folder size={20} className="text-[#C9A86A]" />
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
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="text-[#111]/60 hover:text-[#111] transition-colors">
                <ChevronLeft size={20} />
              </button>
              <h1 className="font-serif text-[18px] lg:text-[22px] hidden sm:block truncate max-w-[200px] lg:max-w-[400px]">{project.name}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative text-[#111]/60 hover:text-[#111] transition-colors">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C9A86A] rounded-full border-2 border-white flex items-center justify-center text-[9px] text-white font-bold">
                2
              </span>
            </button>
            
            <div className="w-9 h-9 rounded-full overflow-hidden border border-[#111]/10 cursor-pointer">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          
          <div className="max-w-[1200px] mx-auto space-y-8">
            
            {/* Project Hero / Header */}
            <div className="bg-white border border-[#111]/5 rounded-xl overflow-hidden">
              <div className="h-48 lg:h-64 overflow-hidden relative">
                <img src={project.image} alt={project.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute bottom-6 left-6 lg:left-10 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="text-white">
                    <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] uppercase tracking-[0.1em] font-medium mb-3">
                      {project.type}
                    </div>
                    <h2 className="font-serif text-[28px] lg:text-[36px] leading-tight mb-2">{project.name}</h2>
                    <div className="flex flex-wrap items-center gap-4 text-[13px] text-white/80">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>{project.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        <span>{project.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-5 py-2.5 bg-white text-[#111] rounded-full text-[11px] uppercase tracking-[0.1em] font-medium hover:bg-gray-100 transition-colors">
                      Edit Project
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6 lg:p-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2">
                    <h3 className="text-[12px] uppercase tracking-[0.15em] text-[#111]/50 font-semibold mb-3">About this Project</h3>
                    <p className="text-[#111]/80 leading-relaxed text-[15px]">
                      {project.description}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-[12px] uppercase tracking-[0.15em] text-[#111]/50 font-semibold mb-3">Client Details</h3>
                    <div className="space-y-2">
                      <div className="font-medium text-[15px]">{project.client.name}</div>
                      <a href={`mailto:${project.client.email}`} className="block text-[14px] text-[#111]/60 hover:text-[#C9A86A] transition-colors">{project.client.email}</a>
                      <a href={`tel:${project.client.phone}`} className="block text-[14px] text-[#111]/60 hover:text-[#C9A86A] transition-colors">{project.client.phone}</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* Left Column */}
              <div className="xl:col-span-2 space-y-8">
                
                {/* Progress & Payment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Progress Tracker */}
                  <div className="bg-white border border-[#111]/5 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-serif text-[20px]">Project Progress</h3>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    
                    <div className="flex items-end justify-between mb-2">
                      <span className="text-[32px] font-serif leading-none">{project.progress}%</span>
                      <span className="text-[13px] text-[#111]/50 mb-1">Completed</span>
                    </div>
                    
                    <div className="w-full h-2 bg-[#FAF9F6] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#C9A86A] transition-all duration-1000 ease-out"
                        style={{ width: `${project.progress}%` }} 
                      />
                    </div>
                  </div>

                  {/* Payment Status */}
                  <div className="bg-white border border-[#111]/5 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-serif text-[20px]">Payment Status</h3>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-yellow-100 text-yellow-800">
                        {project.payment.status}
                      </span>
                    </div>
                    
                    <div className="flex items-end gap-2 mb-4">
                      <span className="text-[32px] font-serif leading-none">${project.payment.paid.toLocaleString()}</span>
                      <span className="text-[13px] text-[#111]/50 mb-1">/ ${project.payment.total.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-[#111]/5 text-[13px]">
                      <span className="text-[#111]/60">Next payment due:</span>
                      <span className="font-medium">{project.payment.nextDue}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-white border border-[#111]/5 p-6 lg:p-8 rounded-xl">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-serif text-[22px]">Timeline</h3>
                    <button className="text-[12px] font-medium tracking-[0.05em] text-[#C9A86A] hover:text-[#111] transition-colors">
                      Edit Timeline
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {project.timeline.map((item, idx) => (
                      <div key={item.id} className="relative pl-8">
                        {/* Vertical line connecting items */}
                        {idx !== project.timeline.length - 1 && (
                          <div className="absolute top-6 bottom-[-24px] left-[11px] w-px bg-[#111]/10" />
                        )}
                        
                        {/* Status Icon */}
                        <div className="absolute left-0 top-1 text-white bg-white">
                          {item.status === 'completed' ? (
                            <CheckCircle2 size={24} className="text-[#C9A86A]" />
                          ) : item.status === 'in-progress' ? (
                            <div className="w-6 h-6 rounded-full border-2 border-[#C9A86A] flex items-center justify-center bg-white">
                              <div className="w-2 h-2 rounded-full bg-[#C9A86A]" />
                            </div>
                          ) : (
                            <Circle size={24} className="text-[#111]/20" />
                          )}
                        </div>
                        
                        <div className={`transition-opacity ${item.status === 'pending' ? 'opacity-60' : 'opacity-100'}`}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                            <h4 className="font-medium text-[15px]">{item.title}</h4>
                            <span className="text-[12px] text-[#111]/50">{item.date}</span>
                          </div>
                          <p className="text-[14px] text-[#111]/70">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deliverables */}
                <div className="bg-white border border-[#111]/5 p-6 lg:p-8 rounded-xl">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-serif text-[22px]">Deliverables</h3>
                    <button className="flex items-center gap-2 text-[12px] font-medium tracking-[0.05em] text-[#111] hover:text-[#C9A86A] transition-colors">
                      <Download size={14} />
                      Download All
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.deliverables.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4 border border-[#111]/10 rounded-lg hover:border-[#C9A86A] transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.status === 'completed' ? 'bg-[#C9A86A]/10 text-[#C9A86A]' : 'bg-[#FAF9F6] text-[#111]/40'}`}>
                            {item.type === 'gallery' ? <ImageIcon size={18} /> : <FileText size={18} />}
                          </div>
                          <div>
                            <div className="font-medium text-[14px] mb-0.5">{item.name}</div>
                            <div className="text-[12px] text-[#111]/50">{item.items} items • {item.status}</div>
                          </div>
                        </div>
                        {item.status === 'completed' ? (
                          <button className="w-8 h-8 rounded-full bg-[#FAF9F6] flex items-center justify-center text-[#111]/60 hover:text-[#111] hover:bg-[#111]/5 transition-colors">
                            <Download size={14} />
                          </button>
                        ) : (
                          <button className="w-8 h-8 rounded-full flex items-center justify-center text-[#111]/30">
                            <MoreVertical size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
              
              {/* Right Column */}
              <div className="space-y-8">
                
                {/* Project Access & Governance Rights Card */}
                <div className="bg-white border border-[#111]/5 p-6 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-[#111]/5 pb-4">
                    <div className="flex items-center gap-2">
                      <Shield size={18} className="text-[#C9A86A]" />
                      <h3 className="font-serif text-[20px]">Project Governance & Rights</h3>
                    </div>
                    <button 
                      onClick={() => setIsPermissionsModalOpen(true)}
                      className="px-3 py-1.5 bg-[#111] text-white rounded-lg text-[11px] font-medium hover:bg-[#C9A86A] transition-colors flex items-center gap-1.5"
                    >
                      <Sliders size={12} /> Configure
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[12px]">
                    <div className="p-3 bg-[#FAF9F6] border border-[#111]/5 rounded-lg space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#111]/50 tracking-[0.05em]">
                        <Eye size={12} className="text-[#C9A86A]" /> Viewing
                      </div>
                      <div className="font-medium text-[#111] text-[12px] truncate">
                        {project.permissions.viewing.accessLevel}
                      </div>
                    </div>

                    <div className="p-3 bg-[#FAF9F6] border border-[#111]/5 rounded-lg space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#111]/50 tracking-[0.05em]">
                        <Download size={12} className="text-[#C9A86A]" /> Downloads
                      </div>
                      <div className="font-medium text-[#111] text-[12px] truncate">
                        {project.permissions.download.enabled 
                          ? (project.permissions.download.pinProtected ? "PIN Protected" : "Allowed") 
                          : "Disabled"}
                      </div>
                    </div>

                    <div className="p-3 bg-[#FAF9F6] border border-[#111]/5 rounded-lg space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#111]/50 tracking-[0.05em]">
                        <MessageSquare size={12} className="text-[#C9A86A]" /> Commenting
                      </div>
                      <div className="font-medium text-[#111] text-[12px] truncate">
                        {project.permissions.commenting.enabled ? "Active / Proofing" : "Disabled"}
                      </div>
                    </div>

                    <div className="p-3 bg-[#FAF9F6] border border-[#111]/5 rounded-lg space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#111]/50 tracking-[0.05em]">
                        <Share2 size={12} className="text-[#C9A86A]" /> Sharing
                      </div>
                      <div className="font-medium text-[#111] text-[12px] truncate">
                        {project.permissions.sharing.enabled ? "Links Active" : "Restricted"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assigned Creators */}
                <div className="bg-white border border-[#111]/5 p-6 rounded-xl">
                  <h3 className="font-serif text-[20px] mb-6">Assigned Team</h3>
                  <div className="space-y-4">
                    {project.creators.map(creator => (
                      <div key={creator.id} className="flex items-center gap-4">
                        <img src={creator.image} alt={creator.name} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <div className="font-medium text-[14px]">{creator.name}</div>
                          <div className="text-[12px] text-[#111]/50">{creator.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-6 py-2.5 border border-[#111]/10 rounded-lg text-[11px] uppercase tracking-[0.1em] font-medium hover:border-[#C9A86A] transition-colors">
                    Manage Team
                  </button>
                </div>

                {/* Comments Section */}
                <div className="bg-white border border-[#111]/5 p-6 rounded-xl flex flex-col h-[500px]">
                  <div className="flex items-center gap-2 mb-6">
                    <MessageSquare size={18} className="text-[#C9A86A]" />
                    <h3 className="font-serif text-[20px]">Comments</h3>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-6">
                    {project.comments.map(comment => (
                      <div key={comment.id} className="flex gap-3">
                        <img src={comment.image} alt={comment.user} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        <div>
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="font-medium text-[13px]">{comment.user}</span>
                            <span className="text-[10px] text-[#111]/40">{comment.time}</span>
                          </div>
                          <div className="bg-[#FAF9F6] p-3 rounded-tr-lg rounded-b-lg text-[13px] text-[#111]/80 leading-relaxed">
                            {comment.text}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-auto relative">
                    <input 
                      type="text" 
                      placeholder="Write a comment..." 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-[#111]/10 rounded-full pl-4 pr-12 py-3 text-[13px] outline-none focus:border-[#C9A86A] transition-colors"
                    />
                    <button 
                      className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        newComment.trim() ? 'bg-[#C9A86A] text-white hover:bg-[#B8965C]' : 'bg-[#111]/5 text-[#111]/30'
                      }`}
                    >
                      <Send size={14} className={newComment.trim() ? 'ml-0.5' : ''} />
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </main>
      </div>
      
      {/* Toast Notification */}
      {permissionsToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-[#C9A86A]/40 text-[13px] animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Check size={16} className="text-[#C9A86A]" />
          <span>{permissionsToast}</span>
        </div>
      )}

      {/* CONFIGURE PROJECT PERMISSIONS MODAL */}
      {isPermissionsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-2xl p-6 lg:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#111]/10 pb-4">
              <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.1em] text-[#C9A86A] font-semibold">
                  <Shield size={14} /> Project Access & Rights Governance
                </div>
                <h2 className="font-serif text-[22px] text-[#111] mt-0.5">
                  Configure Permissions for {project.name}
                </h2>
              </div>
              <button 
                onClick={() => setIsPermissionsModalOpen(false)} 
                className="text-[#111]/40 hover:text-[#111] p-1 rounded-lg hover:bg-[#FAF9F6] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePermissions} className="space-y-6 text-[13px]">
              
              {/* 1. Download Rights */}
              <div className="p-4 bg-[#FAF9F6] border border-[#111]/10 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#111]/5 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#C9A86A]/10 flex items-center justify-center text-[#C9A86A]">
                      <Download size={16} />
                    </div>
                    <div>
                      <h4 className="font-serif text-[15px]">Download Rights</h4>
                      <p className="text-[11px] text-[#111]/50">Configure client asset download options & quality levels</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={editPermissions.download.enabled} 
                      onChange={e => setEditPermissions(prev => ({
                        ...prev,
                        download: { ...prev.download, enabled: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A86A]"></div>
                  </label>
                </div>

                {editPermissions.download.enabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.05em] text-[#111]/60 font-semibold mb-1">Max Download Quality</label>
                      <select 
                        value={editPermissions.download.quality}
                        onChange={e => setEditPermissions(prev => ({
                          ...prev,
                          download: { ...prev.download, quality: e.target.value as any }
                        }))}
                        className="w-full bg-white border border-[#111]/10 p-2.5 rounded-lg text-[12px] outline-none focus:border-[#C9A86A]"
                      >
                        <option value="Original High-Res">Original High-Res (RAW/TIFF/Uncompressed)</option>
                        <option value="Web-Optimized (2K)">Web-Optimized (2K Display Grade)</option>
                        <option value="Both">Both High-Res & Web Versions</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-2 cursor-pointer pt-2">
                        <input 
                          type="checkbox"
                          checked={editPermissions.download.requireWatermark}
                          onChange={e => setEditPermissions(prev => ({
                            ...prev,
                            download: { ...prev.download, requireWatermark: e.target.checked }
                          }))}
                          className="rounded text-[#C9A86A] focus:ring-[#C9A86A]"
                        />
                        <span className="text-[12px] font-medium text-[#111]">Enforce Watermarking on Export</span>
                      </label>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={editPermissions.download.pinProtected}
                            onChange={e => setEditPermissions(prev => ({
                              ...prev,
                              download: { ...prev.download, pinProtected: e.target.checked }
                            }))}
                            className="rounded text-[#C9A86A] focus:ring-[#C9A86A]"
                          />
                          <span className="text-[12px] font-medium text-[#111]">Require 4-Digit Security PIN to Download</span>
                        </label>
                        {editPermissions.download.pinProtected && (
                          <input 
                            type="text"
                            maxLength={6}
                            placeholder="e.g. 4821"
                            value={editPermissions.download.pinCode || ""}
                            onChange={e => setEditPermissions(prev => ({
                              ...prev,
                              download: { ...prev.download, pinCode: e.target.value }
                            }))}
                            className="w-full bg-white border border-[#111]/10 p-2 rounded-lg text-[12px] font-mono tracking-widest outline-none focus:border-[#C9A86A]"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Viewing Rights */}
              <div className="p-4 bg-[#FAF9F6] border border-[#111]/10 rounded-xl space-y-4">
                <div className="flex items-center gap-2.5 border-b border-[#111]/5 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#C9A86A]/10 flex items-center justify-center text-[#C9A86A]">
                    <Eye size={16} />
                  </div>
                  <div>
                    <h4 className="font-serif text-[15px]">Viewing Rights & Security</h4>
                    <p className="text-[11px] text-[#111]/50">Define visibility boundaries and password restrictions</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.05em] text-[#111]/60 font-semibold mb-1">Access Tier</label>
                    <select 
                      value={editPermissions.viewing.accessLevel}
                      onChange={e => setEditPermissions(prev => ({
                        ...prev,
                        viewing: { ...prev.viewing, accessLevel: e.target.value as any }
                      }))}
                      className="w-full bg-white border border-[#111]/10 p-2.5 rounded-lg text-[12px] outline-none focus:border-[#C9A86A]"
                    >
                      <option value="Client & Team Only">Client & Team Only (Email Restricted)</option>
                      <option value="Password Protected">Password Protected</option>
                      <option value="Public">Public (Anyone with link)</option>
                      <option value="Private">Private Vault (Creator Only)</option>
                    </select>
                  </div>

                  {editPermissions.viewing.accessLevel === "Password Protected" && (
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.05em] text-[#111]/60 font-semibold mb-1">Access Password</label>
                      <input 
                        type="text"
                        placeholder="Set gallery password"
                        value={editPermissions.viewing.password || ""}
                        onChange={e => setEditPermissions(prev => ({
                          ...prev,
                          viewing: { ...prev.viewing, password: e.target.value }
                        }))}
                        className="w-full bg-white border border-[#111]/10 p-2.5 rounded-lg text-[12px] outline-none focus:border-[#C9A86A]"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.05em] text-[#111]/60 font-semibold mb-1">Viewing Expiration Date (Optional)</label>
                    <input 
                      type="date"
                      value={editPermissions.viewing.expirationDate || ""}
                      onChange={e => setEditPermissions(prev => ({
                        ...prev,
                        viewing: { ...prev.viewing, expirationDate: e.target.value }
                      }))}
                      className="w-full bg-white border border-[#111]/10 p-2.5 rounded-lg text-[12px] outline-none focus:border-[#C9A86A]"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Commenting & Proofing Rights */}
              <div className="p-4 bg-[#FAF9F6] border border-[#111]/10 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#111]/5 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#C9A86A]/10 flex items-center justify-center text-[#C9A86A]">
                      <MessageSquare size={16} />
                    </div>
                    <div>
                      <h4 className="font-serif text-[15px]">Commenting & Proofing Rights</h4>
                      <p className="text-[11px] text-[#111]/50">Enable client feedback, revision notes and proofing</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={editPermissions.commenting.enabled} 
                      onChange={e => setEditPermissions(prev => ({
                        ...prev,
                        commenting: { ...prev.commenting, enabled: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A86A]"></div>
                  </label>
                </div>

                {editPermissions.commenting.enabled && (
                  <div className="space-y-3 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={editPermissions.commenting.allowProofingNotes}
                        onChange={e => setEditPermissions(prev => ({
                          ...prev,
                          commenting: { ...prev.commenting, allowProofingNotes: e.target.checked }
                        }))}
                        className="rounded text-[#C9A86A] focus:ring-[#C9A86A]"
                      />
                      <span className="text-[12px] text-[#111]">Allow frame-accurate timestamped / coordinate proofing notes</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={editPermissions.commenting.requireClientAuth}
                        onChange={e => setEditPermissions(prev => ({
                          ...prev,
                          commenting: { ...prev.commenting, requireClientAuth: e.target.checked }
                        }))}
                        className="rounded text-[#C9A86A] focus:ring-[#C9A86A]"
                      />
                      <span className="text-[12px] text-[#111]">Require client email sign-in before posting comments</span>
                    </label>
                  </div>
                )}
              </div>

              {/* 4. Sharing Rights */}
              <div className="p-4 bg-[#FAF9F6] border border-[#111]/10 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#111]/5 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#C9A86A]/10 flex items-center justify-center text-[#C9A86A]">
                      <Share2 size={16} />
                    </div>
                    <div>
                      <h4 className="font-serif text-[15px]">Sharing Rights</h4>
                      <p className="text-[11px] text-[#111]/50">Allow clients and team members to generate share links</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={editPermissions.sharing.enabled} 
                      onChange={e => setEditPermissions(prev => ({
                        ...prev,
                        sharing: { ...prev.sharing, enabled: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A86A]"></div>
                  </label>
                </div>

                {editPermissions.sharing.enabled && (
                  <div className="space-y-3 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={editPermissions.sharing.allowGuestReshare}
                        onChange={e => setEditPermissions(prev => ({
                          ...prev,
                          sharing: { ...prev.sharing, allowGuestReshare: e.target.checked }
                        }))}
                        className="rounded text-[#C9A86A] focus:ring-[#C9A86A]"
                      />
                      <span className="text-[12px] text-[#111]">Allow client to generate guest invitation links</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={editPermissions.sharing.showSocialShare}
                        onChange={e => setEditPermissions(prev => ({
                          ...prev,
                          sharing: { ...prev.sharing, showSocialShare: e.target.checked }
                        }))}
                        className="rounded text-[#C9A86A] focus:ring-[#C9A86A]"
                      />
                      <span className="text-[12px] text-[#111]">Display direct social media share buttons on client portal</span>
                    </label>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-[#111]/10">
                <button 
                  type="button"
                  onClick={() => setIsPermissionsModalOpen(false)}
                  className="px-5 py-2.5 text-[12px] font-medium text-[#111]/60 hover:text-[#111]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-[#111] text-white px-6 py-2.5 rounded-full text-[12px] font-medium tracking-[0.05em] hover:bg-[#C9A86A] transition-colors flex items-center gap-2"
                >
                  <Shield size={14} /> Save Permission Governance
                </button>
              </div>
            </form>
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
