import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Plus,
  Filter,
  MoreVertical,
  Calendar,
  MapPin,
  UploadCloud,
  CheckSquare,
  Clock,
  User,
  CheckCircle2,
  List,
  Kanban,
  ChevronRight,
  ChevronDown,
  X,
  Camera,
  Video,
  ExternalLink,
  Trash2,
  Edit3,
  Layers,
  Eye,
  ArrowRight,
  Shield,
  Lock,
  Share2,
  Download,
  Sliders,
  Check,
  KeyRound,
  AlertCircle
} from "lucide-react";
import LogoWhite from "../assets/cabmora_white_logo.svg";

export interface ProjectPermissions {
  download: {
    enabled: boolean;
    quality: "Original High-Res" | "Web-Optimized (2K)" | "Both";
    requireWatermark: boolean;
    pinProtected: boolean;
    pinCode?: string;
  };
  viewing: {
    accessLevel: "Public" | "Password Protected" | "Client & Team Only" | "Private";
    password?: string;
    expirationDate?: string;
  };
  commenting: {
    enabled: boolean;
    allowProofingNotes: boolean;
    requireClientAuth: boolean;
  };
  sharing: {
    enabled: boolean;
    allowGuestReshare: boolean;
    showSocialShare: boolean;
  };
}

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  assignedTo: string;
}

export interface Project {
  id: number;
  name: string;
  type: "Wedding" | "Editorial" | "Corporate" | "Portrait" | "Commercial" | "Event";
  partnerType: "Photographer" | "Videographer" | "Hybrid";
  clientName: string;
  clientEmail: string;
  date: string;
  deadline: string;
  location: string;
  status: "Planning" | "Shooting" | "Culling" | "Editing" | "Review" | "Completed";
  progress: number;
  deliverables: string;
  image: string;
  tasks: TaskItem[];
  permissions?: ProjectPermissions;
}

export const DEFAULT_PROJECT_PERMISSIONS: ProjectPermissions = {
  download: {
    enabled: true,
    quality: "Original High-Res",
    requireWatermark: false,
    pinProtected: true,
    pinCode: "4821"
  },
  viewing: {
    accessLevel: "Client & Team Only",
    password: "",
    expirationDate: ""
  },
  commenting: {
    enabled: true,
    allowProofingNotes: true,
    requireClientAuth: true
  },
  sharing: {
    enabled: true,
    allowGuestReshare: true,
    showSocialShare: false
  }
};

const INITIAL_PROJECTS: Project[] = [
  { 
    id: 1, 
    name: "Smith & Wesson Wedding", 
    type: "Wedding", 
    partnerType: "Hybrid",
    clientName: "Jane Smith", 
    clientEmail: "jane.smith@example.com",
    date: "Oct 12, 2025", 
    deadline: "Nov 15, 2025",
    location: "Tuscany, Italy", 
    status: "Editing", 
    progress: 65, 
    deliverables: "800 Edited Photos + 7-min 4K Highlight Film",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop",
    tasks: [
      { id: "t1", title: "Location Scout & Lighting Plan", completed: true, assignedTo: "Sarah Cabmora" },
      { id: "t2", title: "RAW Audio & Drone Backup", completed: true, assignedTo: "Michael Chang" },
      { id: "t3", title: "Color Grading Highlight Film", completed: false, assignedTo: "Michael Chang" },
      { id: "t4", title: "Export High-Res Proof Gallery", completed: false, assignedTo: "Sarah Cabmora" },
    ],
    permissions: {
      download: { enabled: true, quality: "Original High-Res", requireWatermark: false, pinProtected: true, pinCode: "4821" },
      viewing: { accessLevel: "Client & Team Only", password: "", expirationDate: "2026-12-31" },
      commenting: { enabled: true, allowProofingNotes: true, requireClientAuth: true },
      sharing: { enabled: true, allowGuestReshare: true, showSocialShare: false }
    }
  },
  { 
    id: 2, 
    name: "Elena's Editorial Shoot", 
    type: "Editorial", 
    partnerType: "Photographer",
    clientName: "Elena Vance", 
    clientEmail: "elena@vancemodels.com",
    date: "Nov 04, 2025", 
    deadline: "Nov 20, 2025",
    location: "Paris, France", 
    status: "Review", 
    progress: 90, 
    deliverables: "45 Retouched Cover Shots + TIFF Prints",
    image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=600&fit=crop",
    tasks: [
      { id: "t1", title: "Moodboard Approval", completed: true, assignedTo: "Sarah Cabmora" },
      { id: "t2", title: "Studio Lighting Rigging", completed: true, assignedTo: "Sarah Cabmora" },
      { id: "t3", title: "High-End Skin Retouching", completed: true, assignedTo: "Sarah Cabmora" },
      { id: "t4", title: "Client Proof Selection", completed: false, assignedTo: "Elena Vance" },
    ],
    permissions: {
      download: { enabled: true, quality: "Original High-Res", requireWatermark: true, pinProtected: false, pinCode: "" },
      viewing: { accessLevel: "Password Protected", password: "Vance2025", expirationDate: "" },
      commenting: { enabled: true, allowProofingNotes: true, requireClientAuth: true },
      sharing: { enabled: true, allowGuestReshare: false, showSocialShare: false }
    }
  },
  { 
    id: 3, 
    name: "Corporate Event - TechCorp", 
    type: "Corporate", 
    partnerType: "Videographer",
    clientName: "David Miller", 
    clientEmail: "david.m@techcorp.io",
    date: "Dec 15, 2025", 
    deadline: "Dec 22, 2025",
    location: "London, UK", 
    status: "Planning", 
    progress: 20, 
    deliverables: "Keynote 4K Multicam + 3 Recap Reels",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop",
    tasks: [
      { id: "t1", title: "Av Logistics & Cable Run", completed: true, assignedTo: "Michael Chang" },
      { id: "t2", title: "Speaker Audio Wireless Check", completed: false, assignedTo: "Michael Chang" },
      { id: "t3", title: "Drone Permit Request", completed: false, assignedTo: "Michael Chang" },
    ],
    permissions: {
      download: { enabled: true, quality: "Web-Optimized (2K)", requireWatermark: false, pinProtected: true, pinCode: "9910" },
      viewing: { accessLevel: "Client & Team Only", password: "", expirationDate: "" },
      commenting: { enabled: true, allowProofingNotes: true, requireClientAuth: true },
      sharing: { enabled: false, allowGuestReshare: false, showSocialShare: false }
    }
  },
  { 
    id: 4, 
    name: "Johnson Family Portraits", 
    type: "Portrait", 
    partnerType: "Photographer",
    clientName: "Mark Johnson", 
    clientEmail: "johnson.family@gmail.com",
    date: "Jan 10, 2026", 
    deadline: "Jan 25, 2026",
    location: "Central Park, NY", 
    status: "Completed", 
    progress: 100, 
    deliverables: "85 Color Corrected Portraits + Canvas Album",
    image: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800&h=600&fit=crop",
    tasks: [
      { id: "t1", title: "Golden Hour Shooting", completed: true, assignedTo: "Sarah Cabmora" },
      { id: "t2", title: "Culling & Selection", completed: true, assignedTo: "Sarah Cabmora" },
      { id: "t3", title: "Print Delivery", completed: true, assignedTo: "Sarah Cabmora" },
    ],
    permissions: {
      download: { enabled: true, quality: "Original High-Res", requireWatermark: false, pinProtected: false, pinCode: "" },
      viewing: { accessLevel: "Client & Team Only", password: "", expirationDate: "" },
      commenting: { enabled: true, allowProofingNotes: true, requireClientAuth: false },
      sharing: { enabled: true, allowGuestReshare: true, showSocialShare: true }
    }
  },
  { 
    id: 5, 
    name: "Summer Collection Campaign", 
    type: "Commercial", 
    partnerType: "Hybrid",
    clientName: "Aura Apparel", 
    clientEmail: "press@aurafashion.com",
    date: "Feb 22, 2026", 
    deadline: "Mar 10, 2026",
    location: "Malibu, CA", 
    status: "Shooting", 
    progress: 40, 
    deliverables: "Lookbook Gallery + 60s Brand Spot",
    image: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=800&h=600&fit=crop",
    tasks: [
      { id: "t1", title: "Talent Casting & Fitting", completed: true, assignedTo: "Sarah Cabmora" },
      { id: "t2", title: "Beach Sunset Shoot", completed: true, assignedTo: "Michael Chang" },
      { id: "t3", title: "Sound Design & Music License", completed: false, assignedTo: "Michael Chang" },
    ],
    permissions: {
      download: { enabled: true, quality: "Both", requireWatermark: false, pinProtected: true, pinCode: "1234" },
      viewing: { accessLevel: "Password Protected", password: "Aura2026", expirationDate: "" },
      commenting: { enabled: true, allowProofingNotes: true, requireClientAuth: true },
      sharing: { enabled: true, allowGuestReshare: true, showSocialShare: true }
    }
  },
  { 
    id: 6, 
    name: "Williams Anniversary Gala", 
    type: "Event", 
    partnerType: "Photographer",
    clientName: "Robert Williams", 
    clientEmail: "robert@williams.co.uk",
    date: "Mar 05, 2026", 
    deadline: "Mar 20, 2026",
    location: "Lake Como, Italy", 
    status: "Culling", 
    progress: 50, 
    deliverables: "450 Event Highlights + Online Guest Gallery",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=600&fit=crop",
    tasks: [
      { id: "t1", title: "Venue Setup Check", completed: true, assignedTo: "Sarah Cabmora" },
      { id: "t2", title: "RAW Backup to SSD", completed: true, assignedTo: "Sarah Cabmora" },
      { id: "t3", title: "AI Cull & Duplicate Removal", completed: false, assignedTo: "Sarah Cabmora" },
    ],
    permissions: {
      download: { enabled: false, quality: "Web-Optimized (2K)", requireWatermark: true, pinProtected: false, pinCode: "" },
      viewing: { accessLevel: "Client & Team Only", password: "", expirationDate: "" },
      commenting: { enabled: false, allowProofingNotes: false, requireClientAuth: true },
      sharing: { enabled: true, allowGuestReshare: false, showSocialShare: false }
    }
  },
];

const STAGES: Project["status"][] = ["Planning", "Shooting", "Culling", "Editing", "Review", "Completed"];

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Active Project Menu State
  const [activeMenuProjectId, setActiveMenuProjectId] = useState<number | null>(null);

  // Permissions Modal State
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [permissionsTargetProject, setPermissionsTargetProject] = useState<Project | null>(null);
  const [editPermissions, setEditPermissions] = useState<ProjectPermissions>(DEFAULT_PROJECT_PERMISSIONS);
  const [permissionsToast, setPermissionsToast] = useState<string | null>(null);

  const openPermissionsModal = (proj: Project) => {
    setPermissionsTargetProject(proj);
    setEditPermissions(
      proj.permissions
        ? JSON.parse(JSON.stringify(proj.permissions))
        : JSON.parse(JSON.stringify(DEFAULT_PROJECT_PERMISSIONS))
    );
    setIsPermissionsModalOpen(true);
    setActiveMenuProjectId(null);
  };

  const handleSavePermissions = (e: FormEvent) => {
    e.preventDefault();
    if (!permissionsTargetProject) return;

    setProjects(prev => prev.map(p => {
      if (p.id === permissionsTargetProject.id) {
        const updated = { ...p, permissions: editPermissions };
        if (selectedProject?.id === p.id) setSelectedProject(updated);
        return updated;
      }
      return p;
    }));

    setIsPermissionsModalOpen(false);
    setPermissionsToast(`Rights & permissions updated for "${permissionsTargetProject.name}"`);
    setTimeout(() => setPermissionsToast(null), 3500);
  };

  // New Project Form Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newProjectType, setNewProjectType] = useState<Project["type"]>("Wedding");
  const [newPartnerType, setNewPartnerType] = useState<Project["partnerType"]>("Hybrid");
  const [newLocation, setNewLocation] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Close popup menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.project-menu-container') && !target.closest('.project-menu-button')) {
        setActiveMenuProjectId(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const changeProjectStage = (id: number, newStage: Project["status"]) => {
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        let defaultProgress = p.progress;
        if (newStage === "Planning") defaultProgress = 10;
        else if (newStage === "Shooting") defaultProgress = 30;
        else if (newStage === "Culling") defaultProgress = 50;
        else if (newStage === "Editing") defaultProgress = 70;
        else if (newStage === "Review") defaultProgress = 90;
        else if (newStage === "Completed") defaultProgress = 100;

        const updated = { ...p, status: newStage, progress: defaultProgress };
        if (selectedProject?.id === id) setSelectedProject(updated);
        return updated;
      }
      return p;
    }));
    setActiveMenuProjectId(null);
  };

  const deleteProject = (id: number) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (selectedProject?.id === id) setSelectedProject(null);
    setActiveMenuProjectId(null);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          project.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "All" || project.status === activeFilter || project.partnerType === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const updateProjectProgress = (id: number, delta: number) => {
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        const nextProgress = Math.min(Math.max(p.progress + delta, 0), 100);
        let nextStatus = p.status;
        if (nextProgress === 100) nextStatus = "Completed";
        else if (nextProgress >= 80) nextStatus = "Review";
        else if (nextProgress >= 60) nextStatus = "Editing";
        else if (nextProgress >= 40) nextStatus = "Culling";
        else if (nextProgress >= 20) nextStatus = "Shooting";
        else nextStatus = "Planning";

        const updated = { ...p, progress: nextProgress, status: nextStatus };
        if (selectedProject?.id === id) setSelectedProject(updated);
        return updated;
      }
      return p;
    }));
  };

  const toggleTask = (projectId: number, taskId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const updatedTasks = p.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
        const completedCount = updatedTasks.filter(t => t.completed).length;
        const calcProgress = Math.round((completedCount / updatedTasks.length) * 100);
        
        const updated = { ...p, tasks: updatedTasks, progress: calcProgress };
        if (selectedProject?.id === projectId) setSelectedProject(updated);
        return updated;
      }
      return p;
    }));
  };

  const handleCreateProject = (e: FormEvent) => {
    e.preventDefault();
    if (!newProjectName) return;

    const newProj: Project = {
      id: Date.now(),
      name: newProjectName,
      type: newProjectType,
      partnerType: newPartnerType,
      clientName: newClientName || "Client Name",
      clientEmail: newClientEmail || "client@example.com",
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      deadline: "In 30 Days",
      location: newLocation || "Studio / On Location",
      status: "Planning",
      progress: 10,
      deliverables: "High-Res Gallery + Video Edit",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop",
      tasks: [
        { id: "t1", title: "Send Deposit Invoice", completed: true, assignedTo: "Sarah Cabmora" },
        { id: "t2", title: "Confirm Shotlist & Timeline", completed: false, assignedTo: "Sarah Cabmora" },
        { id: "t3", title: "Equipment Check", completed: false, assignedTo: "Michael Chang" },
      ]
    };

    setProjects(prev => [newProj, ...prev]);
    setIsCreateModalOpen(false);
    setNewProjectName("");
    setNewClientName("");
    setNewClientEmail("");
    setNewLocation("");
  };

  const getStatusColor = (status: Project["status"]) => {
    switch(status) {
      case "Completed": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Review": return "bg-amber-100 text-amber-800 border-amber-200";
      case "Editing": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Culling": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Shooting": return "bg-rose-100 text-rose-800 border-rose-200";
      case "Planning": return "bg-gray-100 text-gray-800 border-gray-200";
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
          <Link to="/storage" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <HardDrive size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Storage Vault</span>
          </Link>
          <Link to="/profile" className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/5 hover:text-[#FAF9F6] transition-colors">
            <User size={20} />
            <span className="text-[13px] font-medium tracking-[0.05em]">Creator Profile</span>
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
            <h1 className="font-serif text-[22px] lg:text-[26px]">Project Management Workspace</h1>
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

        {/* Workspace Content */}
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          
          <div className="max-w-[1200px] mx-auto space-y-8">
            
            {/* Controls & Filter Header */}
            <div className="flex flex-col xl:flex-row gap-5 justify-between items-start xl:items-center">
              <div className="flex items-center gap-4 w-full xl:w-auto">
                <div className="relative w-full xl:w-80">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#111]/40" />
                  <input 
                    type="text" 
                    placeholder="Search by project name, client, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-[#111]/15 pl-11 pr-4 py-2.5 text-[13px] outline-none focus:border-[#C9A86A] focus:ring-2 focus:ring-[#C9A86A]/20 transition-all rounded-full shadow-xs"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                {/* View Switcher */}
                <div className="flex items-center bg-white border border-[#111]/10 p-1 rounded-full shadow-xs">
                  <button 
                    onClick={() => setViewMode("kanban")}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                      viewMode === "kanban" ? "bg-[#111] text-white shadow-xs" : "text-[#111]/60 hover:text-[#111]"
                    }`}
                  >
                    <Kanban size={14} />
                    Kanban Board
                  </button>
                  <button 
                    onClick={() => setViewMode("list")}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                      viewMode === "list" ? "bg-[#111] text-white shadow-xs" : "text-[#111]/60 hover:text-[#111]"
                    }`}
                  >
                    <List size={14} />
                    List View
                  </button>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 bg-white border border-[#111]/10 p-1 rounded-full shadow-xs overflow-x-auto max-w-full">
                  {["All", "Photographer", "Videographer", "Hybrid", "Editing", "Review", "Completed"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-medium tracking-[0.03em] whitespace-nowrap transition-all ${
                        activeFilter === filter
                          ? "bg-[#C9A86A] text-[#111] font-semibold shadow-xs"
                          : "text-[#111]/60 hover:text-[#111] hover:bg-[#111]/5"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 bg-[#111] text-white px-5 py-2.5 rounded-full text-[12px] font-medium tracking-[0.05em] hover:bg-[#C9A86A] transition-colors shadow-xs ml-auto xl:ml-0"
                >
                  <Plus size={16} />
                  New Project
                </button>
              </div>
            </div>

            {/* KANBAN BOARD VIEW */}
            {viewMode === "kanban" && (
              <div className="flex gap-4 overflow-x-auto pb-6 pt-1 px-1 no-scrollbar min-w-full">
                {STAGES.map((stage) => {
                  const stageProjects = filteredProjects.filter(p => p.status === stage);
                  return (
                    <div key={stage} className="bg-[#FAF9F6] border border-[#111]/10 rounded-2xl p-3 flex flex-col w-[265px] flex-shrink-0">
                      <div className="flex items-center justify-between pb-3 border-b border-[#111]/10 mb-3 px-1">
                        <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-[#111]/70">{stage}</span>
                        <span className="w-5 h-5 rounded-full bg-[#111]/10 text-[#111] text-[10px] font-bold flex items-center justify-center">
                          {stageProjects.length}
                        </span>
                      </div>

                      <div className="space-y-3 flex-1 overflow-y-auto max-h-[620px] pr-1">
                        {stageProjects.map((proj) => {
                          const isMenuOpen = activeMenuProjectId === proj.id;
                          return (
                            <div 
                              key={proj.id} 
                              className={`bg-white border border-[#111]/10 p-4 rounded-xl shadow-xs hover:border-[#C9A86A] transition-all group space-y-3 relative ${
                                isMenuOpen ? "z-30 ring-1 ring-[#C9A86A]" : "relative"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[9px] uppercase tracking-[0.1em] font-bold px-2 py-0.5 rounded bg-[#FAF9F6] border border-[#111]/10 text-[#111]/70">
                                  {proj.partnerType}
                                </span>
                                
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-[#111]/40">{proj.date}</span>
                                  
                                  {/* Project Dropdown Menu Button */}
                                  <div className="relative">
                                    <button 
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuProjectId(isMenuOpen ? null : proj.id);
                                      }}
                                      className="project-menu-button p-1 text-[#111]/40 hover:text-[#111] hover:bg-[#111]/5 rounded-md transition-colors"
                                      title="Project Options"
                                    >
                                      <MoreVertical size={14} />
                                    </button>

                                    {/* DROPDOWN MENU POPOVER */}
                                    {isMenuOpen && (
                                      <div 
                                        className="project-menu-container absolute right-0 top-6 z-50 w-[190px] bg-white border border-[#111]/15 shadow-xl rounded-xl p-1.5 text-left space-y-1 text-[11px] animate-in fade-in zoom-in-95 duration-150"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <div className="px-2 py-1 border-b border-[#111]/5 text-[10.5px] font-semibold text-[#111]/50 truncate">
                                          {proj.name}
                                        </div>

                                        <button 
                                          onClick={() => {
                                            setSelectedProject(proj);
                                            setActiveMenuProjectId(null);
                                          }}
                                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[#111]/80 hover:bg-[#FAF9F6] hover:text-[#111] transition-colors"
                                        >
                                          <Eye size={13} className="text-[#C9A86A]" />
                                          View Tasks & Drawer
                                        </button>

                                        <button 
                                          onClick={() => openPermissionsModal(proj)}
                                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[#111]/80 hover:bg-[#FAF9F6] hover:text-[#111] transition-colors font-medium text-[#111]"
                                        >
                                          <Shield size={13} className="text-[#C9A86A]" />
                                          Configure Permissions
                                        </button>

                                        <button 
                                          onClick={() => {
                                            navigate(`/projects/${proj.id}`);
                                            setActiveMenuProjectId(null);
                                          }}
                                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[#111]/80 hover:bg-[#FAF9F6] hover:text-[#111] transition-colors"
                                        >
                                          <ExternalLink size={13} />
                                          Open Project Page
                                        </button>

                                        <button 
                                          onClick={() => {
                                            navigate('/upload');
                                            setActiveMenuProjectId(null);
                                          }}
                                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[#111]/80 hover:bg-[#FAF9F6] hover:text-[#111] transition-colors"
                                        >
                                          <UploadCloud size={13} />
                                          Upload Media
                                        </button>

                                        {/* Stage Quick Switch Sub-section */}
                                        <div className="pt-1 border-t border-[#111]/5">
                                          <div className="px-1.5 py-0.5 text-[9.5px] uppercase tracking-[0.08em] text-[#111]/40 font-bold flex items-center gap-1">
                                            <Layers size={11} /> Move Stage
                                          </div>
                                          <div className="grid grid-cols-2 gap-1 p-1 bg-[#FAF9F6] rounded-md">
                                            {STAGES.map(s => (
                                              <button 
                                                key={s}
                                                onClick={() => changeProjectStage(proj.id, s)}
                                                className={`px-1 py-0.5 text-[9.5px] rounded font-medium transition-colors text-center truncate ${
                                                  proj.status === s ? "bg-[#111] text-white font-semibold" : "text-[#111]/70 hover:bg-white hover:text-[#111]"
                                                }`}
                                              >
                                                {s}
                                              </button>
                                            ))}
                                          </div>
                                        </div>

                                        <div className="pt-1 border-t border-[#111]/5">
                                          <button 
                                            onClick={() => deleteProject(proj.id)}
                                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-red-600 hover:bg-red-50 transition-colors font-medium"
                                          >
                                            <Trash2 size={13} />
                                            Delete Project
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div 
                                onClick={() => setSelectedProject(proj)}
                                className="cursor-pointer"
                              >
                                <h4 className="font-serif text-[15px] group-hover:text-[#C9A86A] transition-colors line-clamp-1">{proj.name}</h4>
                                <p className="text-[11px] text-[#111]/50 truncate">Client: {proj.clientName}</p>
                              </div>

                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-[#111]/50">
                                  <span>Progress</span>
                                  <span>{proj.progress}%</span>
                                </div>
                                <div className="w-full h-1 bg-[#FAF9F6] rounded-full overflow-hidden">
                                  <div className="h-full bg-[#C9A86A]" style={{ width: `${proj.progress}%` }} />
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-[#111]/5 text-[10px] text-[#111]/50">
                                <span className="flex items-center gap-1">
                                  <CheckSquare size={12} />
                                  {proj.tasks.filter(t => t.completed).length}/{proj.tasks.length} tasks
                                </span>
                                <button 
                                  onClick={() => setSelectedProject(proj)}
                                  className="text-[#C9A86A] font-semibold hover:underline"
                                >
                                  Details →
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {stageProjects.length === 0 && (
                          <div className="h-24 border border-dashed border-[#111]/10 rounded-lg flex items-center justify-center text-[11px] text-[#111]/30">
                            No projects
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* DETAILED LIST VIEW */}
            {viewMode === "list" && (
              <div className="bg-white border border-[#111]/10 rounded-2xl shadow-xs overflow-hidden divide-y divide-[#111]/5">
                {filteredProjects.map((project) => {
                  const isMenuOpen = activeMenuProjectId === project.id;
                  return (
                    <div key={project.id} className="p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:bg-[#FAF9F6]/60 transition-colors relative">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <img src={project.image} alt={project.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-[#111]/10" />
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(project.status)}`}>
                              {project.status}
                            </span>
                            <span className="text-[11px] uppercase font-semibold text-[#C9A86A] tracking-[0.08em]">
                              {project.partnerType}
                            </span>
                          </div>
                          <h3 className="font-serif text-[18px] text-[#111] truncate">{project.name}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-[12px] text-[#111]/50">
                            <span>Client: <strong className="text-[#111]">{project.clientName}</strong></span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Calendar size={12} /> {project.date}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><MapPin size={12} /> {project.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full lg:w-auto">
                        <div className="w-full sm:w-48 space-y-1">
                          <div className="flex justify-between text-[11px] text-[#111]/60">
                            <span>Deliverable Progress</span>
                            <span className="font-semibold">{project.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#FAF9F6] rounded-full overflow-hidden border border-[#111]/5">
                            <div className="h-full bg-[#C9A86A]" style={{ width: `${project.progress}%` }} />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <button 
                            onClick={() => updateProjectProgress(project.id, 10)}
                            className="px-3 py-1.5 border border-[#111]/10 rounded-lg text-[11px] font-medium hover:bg-[#111] hover:text-white transition-colors"
                          >
                            +10% Progress
                          </button>
                          <button 
                            onClick={() => setSelectedProject(project)}
                            className="px-4 py-1.5 bg-[#111] text-white rounded-lg text-[11px] font-medium hover:bg-[#C9A86A] transition-colors"
                          >
                            Manage Tasks
                          </button>

                          {/* List View Project Menu Dropdown */}
                          <div className="relative">
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuProjectId(isMenuOpen ? null : project.id);
                              }}
                              className="project-menu-button p-2 text-[#111]/50 hover:text-[#111] border border-[#111]/10 hover:bg-[#111]/5 rounded-lg transition-colors"
                              title="Project Options"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {isMenuOpen && (
                              <div 
                                className="project-menu-container absolute right-0 top-10 z-40 w-56 bg-white border border-[#111]/15 shadow-2xl rounded-xl p-2 text-left space-y-1 text-[12px] animate-in fade-in zoom-in-95 duration-150"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="px-2 py-1.5 border-b border-[#111]/5 text-[11px] font-semibold text-[#111]/50 truncate">
                                  {project.name}
                                </div>

                                <button 
                                  onClick={() => {
                                    setSelectedProject(project);
                                    setActiveMenuProjectId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#111]/80 hover:bg-[#FAF9F6] hover:text-[#111] transition-colors"
                                >
                                  <Eye size={14} className="text-[#C9A86A]" />
                                  View Tasks & Drawer
                                </button>

                                <button 
                                  onClick={() => openPermissionsModal(project)}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#111]/80 hover:bg-[#FAF9F6] hover:text-[#111] transition-colors font-medium text-[#111]"
                                >
                                  <Shield size={14} className="text-[#C9A86A]" />
                                  Configure Permissions
                                </button>

                                <button 
                                  onClick={() => {
                                    navigate(`/projects/${project.id}`);
                                    setActiveMenuProjectId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#111]/80 hover:bg-[#FAF9F6] hover:text-[#111] transition-colors"
                                >
                                  <ExternalLink size={14} />
                                  Open Project Page
                                </button>

                                <button 
                                  onClick={() => {
                                    navigate('/upload');
                                    setActiveMenuProjectId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#111]/80 hover:bg-[#FAF9F6] hover:text-[#111] transition-colors"
                                >
                                  <UploadCloud size={14} />
                                  Upload Media
                                </button>

                                <div className="pt-1 border-t border-[#111]/5">
                                  <div className="px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-[#111]/40 font-semibold flex items-center gap-1">
                                    <Layers size={12} /> Move Stage
                                  </div>
                                  <div className="grid grid-cols-2 gap-1 p-1 bg-[#FAF9F6] rounded-lg">
                                    {STAGES.map(s => (
                                      <button 
                                        key={s}
                                        onClick={() => changeProjectStage(project.id, s)}
                                        className={`px-1.5 py-1 text-[10px] rounded font-medium transition-colors text-center truncate ${
                                          project.status === s ? "bg-[#111] text-white" : "text-[#111]/70 hover:bg-white hover:text-[#111]"
                                        }`}
                                      >
                                        {s}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div className="pt-1 border-t border-[#111]/5">
                                  <button 
                                    onClick={() => deleteProject(project.id)}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium"
                                  >
                                    <Trash2 size={14} />
                                    Delete Project
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </main>
      </div>

      {/* PROJECT DETAILS & TASK DRAWER MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col overflow-y-auto p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#111]/10 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.1em] text-[#C9A86A]">
                  {selectedProject.partnerType} • {selectedProject.type}
                </span>
                <h2 className="font-serif text-[24px] text-[#111]">{selectedProject.name}</h2>
              </div>
              <button onClick={() => setSelectedProject(null)} className="p-2 text-[#111]/50 hover:text-[#111] rounded-full hover:bg-[#111]/5">
                <X size={20} />
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#111]/5 space-y-3">
              <div className="flex justify-between text-[12px]">
                <span className="text-[#111]/60">Current Workflow Stage</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusColor(selectedProject.status)}`}>
                  {selectedProject.status}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-[#111]/60">
                  <span>Progress Completion</span>
                  <span>{selectedProject.progress}%</span>
                </div>
                <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-[#111]/10">
                  <div className="h-full bg-[#C9A86A]" style={{ width: `${selectedProject.progress}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                <button 
                  onClick={() => updateProjectProgress(selectedProject.id, -10)} 
                  className="px-3 py-1 bg-white border border-[#111]/10 rounded text-[11px] font-medium hover:bg-gray-50"
                >
                  -10% Progress
                </button>
                <button 
                  onClick={() => updateProjectProgress(selectedProject.id, 10)} 
                  className="px-3 py-1 bg-[#111] text-white rounded text-[11px] font-medium hover:bg-[#C9A86A]"
                >
                  +10% Progress
                </button>
              </div>
            </div>

            {/* Deliverables & Client Specs */}
            <div className="space-y-3 text-[13px]">
              <h3 className="font-serif text-[18px]">Client Deliverables</h3>
              <div className="p-4 bg-[#FAF9F6] border border-[#111]/5 rounded-xl space-y-2">
                <div><strong>Client:</strong> {selectedProject.clientName} ({selectedProject.clientEmail})</div>
                <div><strong>Target Deadline:</strong> {selectedProject.deadline}</div>
                <div><strong>Location:</strong> {selectedProject.location}</div>
                <div><strong>Deliverable Specs:</strong> {selectedProject.deliverables}</div>
              </div>
            </div>

            {/* Project Access & Rights Summary Card */}
            <div className="space-y-3 text-[13px]">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-[18px] flex items-center gap-2">
                  <Shield size={16} className="text-[#C9A86A]" />
                  Access & Governance Rights
                </h3>
                <button 
                  onClick={() => openPermissionsModal(selectedProject)}
                  className="px-2.5 py-1 bg-[#111] text-white rounded-md text-[11px] font-medium hover:bg-[#C9A86A] transition-colors flex items-center gap-1"
                >
                  <Sliders size={12} /> Configure
                </button>
              </div>
              <div className="p-4 bg-[#FAF9F6] border border-[#111]/5 rounded-xl space-y-3">
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <div className="p-2.5 bg-white rounded-lg border border-[#111]/5 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#111]/50 tracking-[0.05em]">
                      <Eye size={12} className="text-[#C9A86A]" /> Viewing
                    </div>
                    <div className="font-medium text-[#111] text-[12px] truncate">
                      {selectedProject.permissions?.viewing.accessLevel || "Client & Team"}
                    </div>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-[#111]/5 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#111]/50 tracking-[0.05em]">
                      <Download size={12} className="text-[#C9A86A]" /> Downloads
                    </div>
                    <div className="font-medium text-[#111] text-[12px] truncate">
                      {selectedProject.permissions?.download.enabled 
                        ? (selectedProject.permissions.download.pinProtected ? "PIN Protected" : "Allowed") 
                        : "Blocked"}
                    </div>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-[#111]/5 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#111]/50 tracking-[0.05em]">
                      <MessageSquare size={12} className="text-[#C9A86A]" /> Commenting
                    </div>
                    <div className="font-medium text-[#111] text-[12px] truncate">
                      {selectedProject.permissions?.commenting.enabled ? "Active / Proofing" : "Disabled"}
                    </div>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-[#111]/5 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#111]/50 tracking-[0.05em]">
                      <Share2 size={12} className="text-[#C9A86A]" /> Sharing
                    </div>
                    <div className="font-medium text-[#111] text-[12px] truncate">
                      {selectedProject.permissions?.sharing.enabled ? "Sharing Enabled" : "Restricted"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tasks & Milestones Checklist */}
            <div className="space-y-3 flex-1">
              <h3 className="font-serif text-[18px]">Assigned Tasks & Checklist</h3>
              <div className="space-y-2">
                {selectedProject.tasks.map(t => (
                  <div 
                    key={t.id} 
                    onClick={() => toggleTask(selectedProject.id, t.id)}
                    className="flex items-center justify-between p-3 border border-[#111]/10 rounded-lg cursor-pointer hover:border-[#C9A86A] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${t.completed ? "bg-[#C9A86A] border-[#C9A86A] text-white" : "border-[#111]/30"}`}>
                        {t.completed && <CheckCircle2 size={14} />}
                      </div>
                      <span className={`text-[13px] ${t.completed ? "line-through text-[#111]/40" : "text-[#111]"}`}>
                        {t.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#111]/50 bg-[#FAF9F6] px-2 py-0.5 rounded">
                      {t.assignedTo}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#111]/10 flex items-center justify-between gap-4">
              <Link 
                to="/upload" 
                className="flex-1 text-center bg-[#111] text-white py-3 rounded-full text-[12px] font-medium tracking-[0.05em] hover:bg-[#C9A86A] transition-colors"
              >
                Upload Assets for this Project
              </Link>
              <Link 
                to={`/projects/${selectedProject.id}`} 
                className="px-4 py-3 border border-[#111]/15 text-[#111] rounded-full text-[12px] font-medium hover:border-[#C9A86A]"
              >
                Full Page →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* NEW PROJECT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 lg:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#111]/10 pb-4">
              <h2 className="font-serif text-[22px]">Create Assigned Client Project</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-[#111]/40 hover:text-[#111]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-[13px]">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.1em] text-[#111]/60 font-semibold mb-1">Project Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Smith Wedding or Vogue Editorial" 
                  value={newProjectName} 
                  onChange={e => setNewProjectName(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#111]/10 p-3 rounded-lg outline-none focus:border-[#C9A86A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.1em] text-[#111]/60 font-semibold mb-1">Client Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Jane Smith" 
                    value={newClientName} 
                    onChange={e => setNewClientName(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#111]/10 p-3 rounded-lg outline-none focus:border-[#C9A86A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.1em] text-[#111]/60 font-semibold mb-1">Client Email</label>
                  <input 
                    type="email" 
                    required
                    placeholder="client@email.com" 
                    value={newClientEmail} 
                    onChange={e => setNewClientEmail(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#111]/10 p-3 rounded-lg outline-none focus:border-[#C9A86A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.1em] text-[#111]/60 font-semibold mb-1">Category</label>
                  <select 
                    value={newProjectType} 
                    onChange={e => setNewProjectType(e.target.value as any)}
                    className="w-full bg-[#FAF9F6] border border-[#111]/10 p-3 rounded-lg outline-none focus:border-[#C9A86A]"
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Editorial">Editorial</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Portrait">Portrait</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Event">Event</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.1em] text-[#111]/60 font-semibold mb-1">Lead Partner Role</label>
                  <select 
                    value={newPartnerType} 
                    onChange={e => setNewPartnerType(e.target.value as any)}
                    className="w-full bg-[#FAF9F6] border border-[#111]/10 p-3 rounded-lg outline-none focus:border-[#C9A86A]"
                  >
                    <option value="Photographer">Photographer</option>
                    <option value="Videographer">Videographer</option>
                    <option value="Hybrid">Hybrid (Photo & Video)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.1em] text-[#111]/60 font-semibold mb-1">Location</label>
                <input 
                  type="text" 
                  placeholder="e.g., Tuscany, Italy or London Studio" 
                  value={newLocation} 
                  onChange={e => setNewLocation(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#111]/10 p-3 rounded-lg outline-none focus:border-[#C9A86A]"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 text-[12px] font-medium text-[#111]/60 hover:text-[#111]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-[#111] text-white px-6 py-2.5 rounded-full text-[12px] font-medium tracking-[0.05em] hover:bg-[#C9A86A] transition-colors"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification for Permissions Saved */}
      {permissionsToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-[#C9A86A]/40 text-[13px] animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Check size={16} className="text-[#C9A86A]" />
          <span>{permissionsToast}</span>
        </div>
      )}

      {/* CONFIGURE PROJECT PERMISSIONS MODAL */}
      {isPermissionsModalOpen && permissionsTargetProject && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-2xl p-6 lg:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#111]/10 pb-4">
              <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.1em] text-[#C9A86A] font-semibold">
                  <Shield size={14} /> Project Access & Rights Governance
                </div>
                <h2 className="font-serif text-[22px] text-[#111] mt-0.5">
                  Permissions for {permissionsTargetProject.name}
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
