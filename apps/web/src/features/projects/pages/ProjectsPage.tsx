import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MessageSquare,
  Plus,
  MoreVertical,
  Calendar,
  MapPin,
  UploadCloud,
  CheckSquare,
  CheckCircle2,
  List,
  Kanban,
  ExternalLink,
  Trash2,
  Layers,
  Eye,
  Shield,
  Share2,
  Download,
  Sliders,
  Check,
  Clock,
  AlertTriangle,
  Navigation,
  Sparkles,
  CloudSun,
} from 'lucide-react';
import { PortalAvatar, PortalBell, PortalShell, PortalTopbar } from '@/shared/portal';
import { Modal } from '@cabmora/ui';
import {
  DEFAULT_PROJECT_PERMISSIONS,
  INITIAL_PROJECTS,
  Project,
  ProjectPermissions,
  STAGES,
} from '@/features/projects/data';
import {
  PROJECT_WEATHER_FORECASTS,
  formatLiveCountdown,
  getProjectLogisticsMeta,
  shareCompletedProjectToCommunity,
} from '@/shared/collaboration/studioWorkspaceStore';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem('cabmora_studio_projects_v1');
        if (raw) {
          const parsed = JSON.parse(raw) as Project[];
          if (parsed.length > 0) return parsed;
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_PROJECTS;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('cabmora_studio_projects_v1', JSON.stringify(projects));
      } catch {
        // ignore
      }
    }
  }, [projects]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Active Project Menu State
  const [activeMenuProjectId, setActiveMenuProjectId] = useState<number | null>(null);

  // Permissions Modal State
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [permissionsTargetProject, setPermissionsTargetProject] = useState<Project | null>(null);
  const [editPermissions, setEditPermissions] = useState<ProjectPermissions>(
    DEFAULT_PROJECT_PERMISSIONS,
  );
  const [permissionsToast, setPermissionsToast] = useState<string | null>(null);

  const openPermissionsModal = (proj: Project) => {
    setPermissionsTargetProject(proj);
    setEditPermissions(
      proj.permissions
        ? JSON.parse(JSON.stringify(proj.permissions))
        : JSON.parse(JSON.stringify(DEFAULT_PROJECT_PERMISSIONS)),
    );
    setIsPermissionsModalOpen(true);
    setActiveMenuProjectId(null);
  };

  const handleSavePermissions = (e: FormEvent) => {
    e.preventDefault();
    if (!permissionsTargetProject) return;

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === permissionsTargetProject.id) {
          const updated = { ...p, permissions: editPermissions };
          if (selectedProject?.id === p.id) setSelectedProject(updated);
          return updated;
        }
        return p;
      }),
    );

    setIsPermissionsModalOpen(false);
    setPermissionsToast(`Rights & permissions updated for "${permissionsTargetProject.name}"`);
    setTimeout(() => setPermissionsToast(null), 3500);
  };

  // New Project Form Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newProjectType, setNewProjectType] = useState<Project['type']>('Wedding');
  const [newPartnerType, setNewPartnerType] = useState<Project['partnerType']>('Hybrid');
  const [newLocation, setNewLocation] = useState('');
  const [tick, setTick] = useState(0);
  const [activeTopProjectIdx, setActiveTopProjectIdx] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleShareCompletedToCommunity = (proj: Project) => {
    if (proj.status !== 'Completed') {
      setPermissionsToast(
        'Only Completed projects can be shared to the Creator Community. Mark project as Completed first!',
      );
      setTimeout(() => setPermissionsToast(null), 3500);
      return;
    }
    shareCompletedProjectToCommunity({
      projectId: String(proj.id),
      projectTitle: proj.name,
      projectType: proj.type,
      clientName: proj.clientName,
      location: proj.location,
      deliverablesSummary: proj.deliverables,
      caption: `Completed and delivered "${proj.name}" in ${proj.location} (${proj.deliverables}). Open to new creator & client collaborations!`,
      mediaUrls: [proj.image],
    });
    setPermissionsToast(`Shared completed job "${proj.name}" to the Creator Community!`);
    setTimeout(() => setPermissionsToast(null), 4000);
  };

  const featuredTopProject = projects[activeTopProjectIdx] ?? projects[0]!;
  const featuredLogistics = getProjectLogisticsMeta(
    featuredTopProject.id,
    featuredTopProject.status,
  );
  const featuredCountdown = formatLiveCountdown(featuredLogistics.targetOffsetHours, tick);
  const featuredWeather =
    PROJECT_WEATHER_FORECASTS.find((w) => w.projectId === String(featuredTopProject.id)) ??
    PROJECT_WEATHER_FORECASTS[0]!;

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

  const changeProjectStage = (id: number, newStage: Project['status']) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          let defaultProgress = p.progress;
          if (newStage === 'Planning') defaultProgress = 10;
          else if (newStage === 'Shooting') defaultProgress = 30;
          else if (newStage === 'Culling') defaultProgress = 50;
          else if (newStage === 'Editing') defaultProgress = 70;
          else if (newStage === 'Review') defaultProgress = 90;
          else if (newStage === 'Completed') defaultProgress = 100;

          const updated = { ...p, status: newStage, progress: defaultProgress };
          if (selectedProject?.id === id) setSelectedProject(updated);
          return updated;
        }
        return p;
      }),
    );
    setActiveMenuProjectId(null);
  };

  const deleteProject = (id: number) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (selectedProject?.id === id) setSelectedProject(null);
    setActiveMenuProjectId(null);
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === 'All' ||
      project.status === activeFilter ||
      project.partnerType === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const updateProjectProgress = (id: number, delta: number) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextProgress = Math.min(Math.max(p.progress + delta, 0), 100);
          let nextStatus = p.status;
          if (nextProgress === 100) nextStatus = 'Completed';
          else if (nextProgress >= 80) nextStatus = 'Review';
          else if (nextProgress >= 60) nextStatus = 'Editing';
          else if (nextProgress >= 40) nextStatus = 'Culling';
          else if (nextProgress >= 20) nextStatus = 'Shooting';
          else nextStatus = 'Planning';

          const updated = { ...p, progress: nextProgress, status: nextStatus };
          if (selectedProject?.id === id) setSelectedProject(updated);
          return updated;
        }
        return p;
      }),
    );
  };

  const toggleTask = (projectId: number, taskId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const updatedTasks = p.tasks.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t,
          );
          const completedCount = updatedTasks.filter((t) => t.completed).length;
          const calcProgress = Math.round((completedCount / updatedTasks.length) * 100);

          const updated = { ...p, tasks: updatedTasks, progress: calcProgress };
          if (selectedProject?.id === projectId) setSelectedProject(updated);
          return updated;
        }
        return p;
      }),
    );
  };

  const handleCreateProject = (e: FormEvent) => {
    e.preventDefault();
    if (!newProjectName) return;

    const newProj: Project = {
      id: Date.now(),
      name: newProjectName,
      type: newProjectType,
      partnerType: newPartnerType,
      clientName: newClientName || 'Client Name',
      clientEmail: newClientEmail || 'client@example.com',
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      deadline: 'In 30 Days',
      location: newLocation || 'Studio / On Location',
      status: 'Planning',
      progress: 10,
      deliverables: 'High-Res Gallery + Video Edit',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop',
      tasks: [
        { id: 't1', title: 'Send Deposit Invoice', completed: true, assignedTo: 'Sarah Cabmora' },
        {
          id: 't2',
          title: 'Confirm Shotlist & Timeline',
          completed: false,
          assignedTo: 'Sarah Cabmora',
        },
        { id: 't3', title: 'Equipment Check', completed: false, assignedTo: 'Michael Chang' },
      ],
    };

    setProjects((prev) => [newProj, ...prev]);
    setIsCreateModalOpen(false);
    setNewProjectName('');
    setNewClientName('');
    setNewClientEmail('');
    setNewLocation('');
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Review':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Editing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Culling':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Shooting':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Planning':
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <PortalShell>
      {({ toggleSidebar }) => (
        <>
          <PortalTopbar title="Project Management Workspace" onToggleSidebar={toggleSidebar}>
            <div className="hidden xl:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-canvas border border-ink/10 text-[11.5px] text-ink/75 whitespace-nowrap">
              <span className="flex items-center gap-1 font-medium text-ink">
                <Clock size={13} className="text-gold" />
                <span className="font-mono font-semibold">
                  {featuredCountdown.days}d {featuredCountdown.hours}h {featuredCountdown.mins}m
                </span>
              </span>
              <span className="text-ink/20">•</span>
              <span className="flex items-center gap-1 font-medium text-ink">
                <CloudSun size={13} className="text-gold" />
                <span>
                  {featuredWeather.tempC}°C {featuredWeather.condition.split(' ')[0]}
                </span>
              </span>
              <span className="text-ink/20">•</span>
              <span className="flex items-center gap-1">
                <Navigation size={12} className="text-gold" />
                {featuredLogistics.venueDistanceKm} km to venue
              </span>
              <span className="text-ink/20">•</span>
              <span className="flex items-center gap-1 text-amber-800 font-medium">
                <AlertTriangle size={12} className="text-gold" />
                Due {featuredTopProject.deadline}
              </span>
            </div>

            <PortalBell />

            <PortalAvatar src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" />
          </PortalTopbar>

          {/* Workspace Content */}
          <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
            <div className="max-w-[1200px] mx-auto space-y-8">
              {/* Controls & Filter Header */}
              <div className="flex flex-col xl:flex-row gap-5 justify-between items-start xl:items-center">
                <div className="flex items-center gap-4 w-full xl:w-auto">
                  <div className="relative w-full xl:w-80">
                    <Search
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40"
                    />
                    <input
                      type="text"
                      placeholder="Search by project name, client, or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-ink/15 pl-11 pr-4 py-2.5 text-[13px] outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all rounded-full shadow-xs"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                  {/* View Switcher */}
                  <div className="flex items-center bg-white border border-ink/10 p-1 rounded-full shadow-xs">
                    <button
                      onClick={() => setViewMode('kanban')}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all ${viewMode === 'kanban'
                          ? 'bg-ink text-white shadow-xs'
                          : 'text-ink/60 hover:text-ink'
                        }`}
                    >
                      <Kanban size={14} />
                      Grid View
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all ${viewMode === 'list'
                          ? 'bg-ink text-white shadow-xs'
                          : 'text-ink/60 hover:text-ink'
                        }`}
                    >
                      <List size={14} />
                      List View
                    </button>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 bg-white border border-ink/10 p-1 rounded-full shadow-xs overflow-x-auto max-w-full">
                    {[
                      'All',
                      'Photographer',
                      'Videographer',
                      'Hybrid',
                      'Editing',
                      'Review',
                      'Completed',
                    ].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-medium tracking-[0.03em] whitespace-nowrap transition-all ${activeFilter === filter
                            ? 'bg-gold text-ink font-semibold shadow-xs'
                            : 'text-ink/60 hover:text-ink hover:bg-ink/5'
                          }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-ink text-white px-5 py-2.5 rounded-full text-[12px] font-medium tracking-[0.05em] hover:bg-gold transition-colors shadow-xs ml-auto xl:ml-0"
                  >
                    <Plus size={16} />
                    New Project
                  </button>
                </div>
              </div>

              {/* KANBAN BOARD VIEW */}
              {viewMode === 'kanban' && (
                <div className="flex gap-4 overflow-x-auto pb-6 pt-1 px-1 no-scrollbar min-w-full">
                  {STAGES.map((stage) => {
                    const stageProjects = filteredProjects.filter((p) => p.status === stage);
                    return (
                      <div
                        key={stage}
                        className="bg-canvas border border-ink/10 rounded-2xl p-3 flex flex-col w-[265px] flex-shrink-0"
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-ink/10 mb-3 px-1">
                          <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink/70">
                            {stage}
                          </span>
                          <span className="w-5 h-5 rounded-full bg-ink/10 text-ink text-[10px] font-bold flex items-center justify-center">
                            {stageProjects.length}
                          </span>
                        </div>

                        <div className="space-y-3 flex-1 overflow-y-auto max-h-[620px] pr-1">
                          {stageProjects.map((proj) => {
                            const isMenuOpen = activeMenuProjectId === proj.id;
                            return (
                              <div
                                key={proj.id}
                                className={`bg-white border border-ink/10 p-4 rounded-xl shadow-xs hover:border-gold transition-all group space-y-3 relative ${isMenuOpen ? 'z-30 ring-1 ring-gold' : 'relative'
                                  }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[9px] uppercase tracking-[0.1em] font-bold px-2 py-0.5 rounded bg-canvas border border-ink/10 text-ink/70">
                                    {proj.partnerType}
                                  </span>

                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-ink/40">{proj.date}</span>

                                    {/* Project Dropdown Menu Button */}
                                    <div className="relative">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveMenuProjectId(isMenuOpen ? null : proj.id);
                                        }}
                                        className="project-menu-button p-1 text-ink/40 hover:text-ink hover:bg-ink/5 rounded-md transition-colors"
                                        title="Project Options"
                                      >
                                        <MoreVertical size={14} />
                                      </button>

                                      {/* DROPDOWN MENU POPOVER */}
                                      {isMenuOpen && (
                                        <div
                                          className="project-menu-container absolute right-0 top-6 z-50 w-[190px] bg-white border border-ink/15 shadow-xl rounded-xl p-1.5 text-left space-y-1 text-[11px] animate-in fade-in zoom-in-95 duration-150"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <div className="px-2 py-1 border-b border-ink/5 text-[10.5px] font-semibold text-ink/50 truncate">
                                            {proj.name}
                                          </div>

                                          <button
                                            onClick={() => {
                                              setSelectedProject(proj);
                                              setActiveMenuProjectId(null);
                                            }}
                                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-ink/80 hover:bg-canvas hover:text-ink transition-colors"
                                          >
                                            <Eye size={13} className="text-gold" />
                                            View Tasks & Drawer
                                          </button>

                                          <button
                                            onClick={() => openPermissionsModal(proj)}
                                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-ink/80 hover:bg-canvas hover:text-ink transition-colors font-medium text-ink"
                                          >
                                            <Shield size={13} className="text-gold" />
                                            Configure Permissions
                                          </button>

                                          <button
                                            onClick={() => {
                                              navigate(`/projects/${proj.id}`);
                                              setActiveMenuProjectId(null);
                                            }}
                                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-ink/80 hover:bg-canvas hover:text-ink transition-colors"
                                          >
                                            <ExternalLink size={13} />
                                            Open Project Page
                                          </button>

                                          <button
                                            onClick={() => {
                                              navigate('/upload');
                                              setActiveMenuProjectId(null);
                                            }}
                                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-ink/80 hover:bg-canvas hover:text-ink transition-colors"
                                          >
                                            <UploadCloud size={13} />
                                            Upload Media
                                          </button>

                                          {/* Stage Quick Switch Sub-section */}
                                          <div className="pt-1 border-t border-ink/5">
                                            <div className="px-1.5 py-0.5 text-[9.5px] uppercase tracking-[0.08em] text-ink/40 font-bold flex items-center gap-1">
                                              <Layers size={11} /> Move Stage
                                            </div>
                                            <div className="grid grid-cols-2 gap-1 p-1 bg-canvas rounded-md">
                                              {STAGES.map((s) => (
                                                <button
                                                  key={s}
                                                  onClick={() => changeProjectStage(proj.id, s)}
                                                  className={`px-1 py-0.5 text-[9.5px] rounded font-medium transition-colors text-center truncate ${proj.status === s
                                                      ? 'bg-ink text-white font-semibold'
                                                      : 'text-ink/70 hover:bg-white hover:text-ink'
                                                    }`}
                                                >
                                                  {s}
                                                </button>
                                              ))}
                                            </div>
                                          </div>

                                          <div className="pt-1 border-t border-ink/5">
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
                                  onClick={() => {
                                    setActiveTopProjectIdx(
                                      projects.findIndex((x) => x.id === proj.id),
                                    );
                                    navigate(`/projects/${proj.id}`);
                                  }}
                                  className="cursor-pointer space-y-1"
                                >
                                  <h4 className="font-serif text-[15px] group-hover:text-gold transition-colors line-clamp-1">
                                    {proj.name}
                                  </h4>
                                  <p className="text-[11px] text-ink/50 truncate">
                                    Client: {proj.clientName}
                                  </p>
                                  <div className="text-[10px] text-ink/50 flex items-center justify-between pt-0.5">
                                    <span>{getProjectLogisticsMeta(proj.id, proj.status).venueDistanceKm} km to venue</span>
                                    <span>Due {proj.deadline}</span>
                                  </div>
                                </div>

                                {proj.status === 'Completed' && (
                                  <button
                                    type="button"
                                    onClick={() => handleShareCompletedToCommunity(proj)}
                                    className="w-full py-1.5 px-2.5 rounded-lg bg-canvas hover:bg-gold text-ink text-[10.5px] font-medium border border-ink/10 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Sparkles size={11} className="text-gold" />
                                    <span>Share to Community</span>
                                  </button>
                                )}

                                <div className="space-y-1">
                                  <div className="flex justify-between text-[10px] text-ink/50">
                                    <span>Progress</span>
                                    <span>{proj.progress}%</span>
                                  </div>
                                  <div className="w-full h-1 bg-canvas rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gold"
                                      style={{ width: `${proj.progress}%` }}
                                    />
                                  </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-ink/5 text-[10px] text-ink/50">
                                  <span className="flex items-center gap-1">
                                    <CheckSquare size={12} />
                                    {proj.tasks.filter((t) => t.completed).length}/
                                    {proj.tasks.length} tasks
                                  </span>
                                  <button
                                    onClick={() => navigate(`/projects/${proj.id}`)}
                                    className="text-gold font-semibold hover:underline"
                                  >
                                    Details →
                                  </button>
                                </div>
                              </div>
                            );
                          })}

                          {stageProjects.length === 0 && (
                            <div className="h-24 border border-dashed border-ink/10 rounded-lg flex items-center justify-center text-[11px] text-ink/30">
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
              {viewMode === 'list' && (
                <div className="bg-white border border-ink/10 rounded-2xl shadow-xs overflow-hidden divide-y divide-ink/5">
                  {filteredProjects.map((project) => {
                    const isMenuOpen = activeMenuProjectId === project.id;
                    return (
                      <div
                        key={project.id}
                        className="p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:bg-canvas/60 transition-colors relative"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <img
                            src={project.image}
                            alt={project.name}
                            className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-ink/10"
                          />
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(project.status)}`}
                              >
                                {project.status}
                              </span>
                              <span className="text-[11px] uppercase font-semibold text-gold tracking-[0.08em]">
                                {project.partnerType}
                              </span>
                            </div>
                            <h3 className="font-serif text-[18px] text-ink truncate">
                              {project.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-4 text-[12px] text-ink/50">
                              <span>
                                Client: <strong className="text-ink">{project.clientName}</strong>
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Calendar size={12} /> {project.date}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MapPin size={12} /> {project.location}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full lg:w-auto">
                          <div className="w-full sm:w-48 space-y-1">
                            <div className="flex justify-between text-[11px] text-ink/60">
                              <span>Deliverable Progress</span>
                              <span className="font-semibold">{project.progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-canvas rounded-full overflow-hidden border border-ink/5">
                              <div
                                className="h-full bg-gold"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <button
                              onClick={() => updateProjectProgress(project.id, 10)}
                              className="px-3 py-1.5 border border-ink/10 rounded-lg text-[11px] font-medium hover:bg-ink hover:text-white transition-colors"
                            >
                              +10% Progress
                            </button>
                            <button
                              onClick={() => navigate(`/projects/${project.id}`)}
                              className="px-4 py-1.5 bg-ink text-white rounded-lg text-[11px] font-medium hover:bg-gold transition-colors"
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
                                className="project-menu-button p-2 text-ink/50 hover:text-ink border border-ink/10 hover:bg-ink/5 rounded-lg transition-colors"
                                title="Project Options"
                              >
                                <MoreVertical size={16} />
                              </button>

                              {isMenuOpen && (
                                <div
                                  className="project-menu-container absolute right-0 top-10 z-40 w-56 bg-white border border-ink/15 shadow-2xl rounded-xl p-2 text-left space-y-1 text-[12px] animate-in fade-in zoom-in-95 duration-150"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="px-2 py-1.5 border-b border-ink/5 text-[11px] font-semibold text-ink/50 truncate">
                                    {project.name}
                                  </div>

                                  <button
                                    onClick={() => {
                                      setSelectedProject(project);
                                      setActiveMenuProjectId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-ink/80 hover:bg-canvas hover:text-ink transition-colors"
                                  >
                                    <Eye size={14} className="text-gold" />
                                    View Tasks & Drawer
                                  </button>

                                  <button
                                    onClick={() => openPermissionsModal(project)}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-ink/80 hover:bg-canvas hover:text-ink transition-colors font-medium text-ink"
                                  >
                                    <Shield size={14} className="text-gold" />
                                    Configure Permissions
                                  </button>

                                  <button
                                    onClick={() => {
                                      navigate(`/projects/${project.id}`);
                                      setActiveMenuProjectId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-ink/80 hover:bg-canvas hover:text-ink transition-colors"
                                  >
                                    <ExternalLink size={14} />
                                    Open Project Page
                                  </button>

                                  <button
                                    onClick={() => {
                                      navigate('/upload');
                                      setActiveMenuProjectId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-ink/80 hover:bg-canvas hover:text-ink transition-colors"
                                  >
                                    <UploadCloud size={14} />
                                    Upload Media
                                  </button>

                                  <div className="pt-1 border-t border-ink/5">
                                    <div className="px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-ink/40 font-semibold flex items-center gap-1">
                                      <Layers size={12} /> Move Stage
                                    </div>
                                    <div className="grid grid-cols-2 gap-1 p-1 bg-canvas rounded-lg">
                                      {STAGES.map((s) => (
                                        <button
                                          key={s}
                                          onClick={() => changeProjectStage(project.id, s)}
                                          className={`px-1.5 py-1 text-[10px] rounded font-medium transition-colors text-center truncate ${project.status === s
                                              ? 'bg-ink text-white'
                                              : 'text-ink/70 hover:bg-white hover:text-ink'
                                            }`}
                                        >
                                          {s}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="pt-1 border-t border-ink/5">
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

          {/* PROJECT DETAILS & TASK DRAWER MODAL */}
          {selectedProject && (
            <Modal
              open
              onOpenChange={(next) => {
                if (!next) setSelectedProject(null);
              }}
              layout="fullscreen"
              size="xl"
              title={selectedProject.name}
              description={`${selectedProject.partnerType} • ${selectedProject.type}`}
            >
              {/* Quick Status Bar */}
              <div className="bg-canvas p-4 rounded-xl border border-ink/5 space-y-3">
                <div className="flex justify-between text-[12px]">
                  <span className="text-ink/60">Current Workflow Stage</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusColor(selectedProject.status)}`}
                  >
                    {selectedProject.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-ink/60">
                    <span>Progress Completion</span>
                    <span>{selectedProject.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-ink/10">
                    <div
                      className="h-full bg-gold"
                      style={{ width: `${selectedProject.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2">
                  <button
                    onClick={() => updateProjectProgress(selectedProject.id, -10)}
                    className="px-3 py-1 bg-white border border-ink/10 rounded text-[11px] font-medium hover:bg-gray-50"
                  >
                    -10% Progress
                  </button>
                  <button
                    onClick={() => updateProjectProgress(selectedProject.id, 10)}
                    className="px-3 py-1 bg-ink text-white rounded text-[11px] font-medium hover:bg-gold"
                  >
                    +10% Progress
                  </button>
                </div>
              </div>

              {/* Deliverables & Client Specs */}
              <div className="space-y-3 text-[13px]">
                <h3 className="font-serif text-[18px]">Client Deliverables</h3>
                <div className="p-4 bg-canvas border border-ink/5 rounded-xl space-y-2">
                  <div>
                    <strong>Client:</strong> {selectedProject.clientName} (
                    {selectedProject.clientEmail})
                  </div>
                  <div>
                    <strong>Target Deadline:</strong> {selectedProject.deadline}
                  </div>
                  <div>
                    <strong>Location:</strong> {selectedProject.location}
                  </div>
                  <div>
                    <strong>Deliverable Specs:</strong> {selectedProject.deliverables}
                  </div>
                </div>
              </div>

              {/* Project Access & Rights Summary Card */}
              <div className="space-y-3 text-[13px]">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-[18px] flex items-center gap-2">
                    <Shield size={16} className="text-gold" />
                    Access & Governance Rights
                  </h3>
                  <button
                    onClick={() => openPermissionsModal(selectedProject)}
                    className="px-2.5 py-1 bg-ink text-white rounded-md text-[11px] font-medium hover:bg-gold transition-colors flex items-center gap-1"
                  >
                    <Sliders size={12} /> Configure
                  </button>
                </div>
                <div className="p-4 bg-canvas border border-ink/5 rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-[12px]">
                    <div className="p-2.5 bg-white rounded-lg border border-ink/5 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-ink/50 tracking-[0.05em]">
                        <Eye size={12} className="text-gold" /> Viewing
                      </div>
                      <div className="font-medium text-ink text-[12px] truncate">
                        {selectedProject.permissions?.viewing.accessLevel || 'Client & Team'}
                      </div>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-ink/5 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-ink/50 tracking-[0.05em]">
                        <Download size={12} className="text-gold" /> Downloads
                      </div>
                      <div className="font-medium text-ink text-[12px] truncate">
                        {selectedProject.permissions?.download.enabled
                          ? selectedProject.permissions.download.pinProtected
                            ? 'PIN Protected'
                            : 'Allowed'
                          : 'Blocked'}
                      </div>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-ink/5 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-ink/50 tracking-[0.05em]">
                        <MessageSquare size={12} className="text-gold" /> Commenting
                      </div>
                      <div className="font-medium text-ink text-[12px] truncate">
                        {selectedProject.permissions?.commenting.enabled
                          ? 'Active / Proofing'
                          : 'Disabled'}
                      </div>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-ink/5 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-ink/50 tracking-[0.05em]">
                        <Share2 size={12} className="text-gold" /> Sharing
                      </div>
                      <div className="font-medium text-ink text-[12px] truncate">
                        {selectedProject.permissions?.sharing.enabled
                          ? 'Sharing Enabled'
                          : 'Restricted'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tasks & Milestones Checklist */}
              <div className="space-y-3 flex-1">
                <h3 className="font-serif text-[18px]">Assigned Tasks & Checklist</h3>
                <div className="space-y-2">
                  {selectedProject.tasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => toggleTask(selectedProject.id, t.id)}
                      className="flex items-center justify-between p-3 border border-ink/10 rounded-lg cursor-pointer hover:border-gold transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center ${t.completed ? 'bg-gold border-gold text-white' : 'border-ink/30'}`}
                        >
                          {t.completed && <CheckCircle2 size={14} />}
                        </div>
                        <span
                          className={`text-[13px] ${t.completed ? 'line-through text-ink/40' : 'text-ink'}`}
                        >
                          {t.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-ink/50 bg-canvas px-2 py-0.5 rounded">
                        {t.assignedTo}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-ink/10 flex items-center justify-between gap-4">
                <Link
                  to="/upload"
                  className="flex-1 text-center bg-ink text-white py-3 rounded-full text-[12px] font-medium tracking-[0.05em] hover:bg-gold transition-colors"
                >
                  Upload Assets for this Project
                </Link>
                <Link
                  to={`/projects/${selectedProject.id}`}
                  className="px-4 py-3 border border-ink/15 text-ink rounded-full text-[12px] font-medium hover:border-gold"
                >
                  Full Page →
                </Link>
              </div>
            </Modal>
          )}

          {/* NEW PROJECT MODAL */}
          <Modal
            open={isCreateModalOpen}
            onOpenChange={setIsCreateModalOpen}
            size="md"
            title="Create Assigned Client Project"
          >
            <form onSubmit={handleCreateProject} className="space-y-4 text-[13px]">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.1em] text-ink/60 font-semibold mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Smith Wedding or Vogue Editorial"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-canvas border border-ink/10 p-3 rounded-lg outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.1em] text-ink/60 font-semibold mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jane Smith"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full bg-canvas border border-ink/10 p-3 rounded-lg outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.1em] text-ink/60 font-semibold mb-1">
                    Client Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="client@email.com"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="w-full bg-canvas border border-ink/10 p-3 rounded-lg outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.1em] text-ink/60 font-semibold mb-1">
                    Category
                  </label>
                  <select
                    value={newProjectType}
                    onChange={(e) => setNewProjectType(e.target.value as any)}
                    className="w-full bg-canvas border border-ink/10 p-3 rounded-lg outline-none focus:border-gold"
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
                  <label className="block text-[11px] uppercase tracking-[0.1em] text-ink/60 font-semibold mb-1">
                    Lead Partner Role
                  </label>
                  <select
                    value={newPartnerType}
                    onChange={(e) => setNewPartnerType(e.target.value as any)}
                    className="w-full bg-canvas border border-ink/10 p-3 rounded-lg outline-none focus:border-gold"
                  >
                    <option value="Photographer">Photographer</option>
                    <option value="Videographer">Videographer</option>
                    <option value="Hybrid">Hybrid (Photo & Video)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.1em] text-ink/60 font-semibold mb-1">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g., Tuscany, Italy or London Studio"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-canvas border border-ink/10 p-3 rounded-lg outline-none focus:border-gold"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 text-[12px] font-medium text-ink/60 hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-ink text-white px-6 py-2.5 rounded-full text-[12px] font-medium tracking-[0.05em] hover:bg-gold transition-colors"
                >
                  Create Project
                </button>
              </div>
            </form>
          </Modal>

          {/* Toast Notification for Permissions Saved */}
          {permissionsToast && (
            <div className="fixed bottom-6 right-6 z-50 bg-ink text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-gold/40 text-[13px] animate-in fade-in slide-in-from-bottom-4 duration-200">
              <Check size={16} className="text-gold" />
              <span>{permissionsToast}</span>
            </div>
          )}

          {/* CONFIGURE PROJECT PERMISSIONS MODAL */}
          {isPermissionsModalOpen && permissionsTargetProject && (
            <Modal
              open
              onOpenChange={(next) => {
                if (!next) setIsPermissionsModalOpen(false);
              }}
              size="lg"
              title={`Permissions for ${permissionsTargetProject.name}`}
              description="Project Access & Rights Governance"
            >
              <form onSubmit={handleSavePermissions} className="space-y-6 text-[13px]">
                {/* 1. Download Rights */}
                <div className="p-4 bg-canvas border border-ink/10 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-ink/5 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
                        <Download size={16} />
                      </div>
                      <div>
                        <h4 className="font-serif text-[15px]">Download Rights</h4>
                        <p className="text-[11px] text-ink/50">
                          Configure client asset download options & quality levels
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editPermissions.download.enabled}
                        onChange={(e) =>
                          setEditPermissions((prev) => ({
                            ...prev,
                            download: { ...prev.download, enabled: e.target.checked },
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                    </label>
                  </div>

                  {editPermissions.download.enabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="block text-[11px] uppercase tracking-[0.05em] text-ink/60 font-semibold mb-1">
                          Max Download Quality
                        </label>
                        <select
                          value={editPermissions.download.quality}
                          onChange={(e) =>
                            setEditPermissions((prev) => ({
                              ...prev,
                              download: { ...prev.download, quality: e.target.value as any },
                            }))
                          }
                          className="w-full bg-white border border-ink/10 p-2.5 rounded-lg text-[12px] outline-none focus:border-gold"
                        >
                          <option value="Original High-Res">
                            Original High-Res (RAW/TIFF/Uncompressed)
                          </option>
                          <option value="Web-Optimized (2K)">
                            Web-Optimized (2K Display Grade)
                          </option>
                          <option value="Both">Both High-Res & Web Versions</option>
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer pt-2">
                          <input
                            type="checkbox"
                            checked={editPermissions.download.requireWatermark}
                            onChange={(e) =>
                              setEditPermissions((prev) => ({
                                ...prev,
                                download: {
                                  ...prev.download,
                                  requireWatermark: e.target.checked,
                                },
                              }))
                            }
                            className="rounded text-gold focus:ring-gold"
                          />
                          <span className="text-[12px] font-medium text-ink">
                            Enforce Watermarking on Export
                          </span>
                        </label>

                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editPermissions.download.pinProtected}
                              onChange={(e) =>
                                setEditPermissions((prev) => ({
                                  ...prev,
                                  download: { ...prev.download, pinProtected: e.target.checked },
                                }))
                              }
                              className="rounded text-gold focus:ring-gold"
                            />
                            <span className="text-[12px] font-medium text-ink">
                              Require 4-Digit Security PIN to Download
                            </span>
                          </label>
                          {editPermissions.download.pinProtected && (
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="e.g. 4821"
                              value={editPermissions.download.pinCode || ''}
                              onChange={(e) =>
                                setEditPermissions((prev) => ({
                                  ...prev,
                                  download: { ...prev.download, pinCode: e.target.value },
                                }))
                              }
                              className="w-full bg-white border border-ink/10 p-2 rounded-lg text-[12px] font-mono tracking-widest outline-none focus:border-gold"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Viewing Rights */}
                <div className="p-4 bg-canvas border border-ink/10 rounded-xl space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-ink/5 pb-3">
                    <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
                      <Eye size={16} />
                    </div>
                    <div>
                      <h4 className="font-serif text-[15px]">Viewing Rights & Security</h4>
                      <p className="text-[11px] text-ink/50">
                        Define visibility boundaries and password restrictions
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.05em] text-ink/60 font-semibold mb-1">
                        Access Tier
                      </label>
                      <select
                        value={editPermissions.viewing.accessLevel}
                        onChange={(e) =>
                          setEditPermissions((prev) => ({
                            ...prev,
                            viewing: { ...prev.viewing, accessLevel: e.target.value as any },
                          }))
                        }
                        className="w-full bg-white border border-ink/10 p-2.5 rounded-lg text-[12px] outline-none focus:border-gold"
                      >
                        <option value="Client & Team Only">
                          Client & Team Only (Email Restricted)
                        </option>
                        <option value="Password Protected">Password Protected</option>
                        <option value="Public">Public (Anyone with link)</option>
                        <option value="Private">Private Vault (Creator Only)</option>
                      </select>
                    </div>

                    {editPermissions.viewing.accessLevel === 'Password Protected' && (
                      <div>
                        <label className="block text-[11px] uppercase tracking-[0.05em] text-ink/60 font-semibold mb-1">
                          Access Password
                        </label>
                        <input
                          type="text"
                          placeholder="Set gallery password"
                          value={editPermissions.viewing.password || ''}
                          onChange={(e) =>
                            setEditPermissions((prev) => ({
                              ...prev,
                              viewing: { ...prev.viewing, password: e.target.value },
                            }))
                          }
                          className="w-full bg-white border border-ink/10 p-2.5 rounded-lg text-[12px] outline-none focus:border-gold"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.05em] text-ink/60 font-semibold mb-1">
                        Viewing Expiration Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={editPermissions.viewing.expirationDate || ''}
                        onChange={(e) =>
                          setEditPermissions((prev) => ({
                            ...prev,
                            viewing: { ...prev.viewing, expirationDate: e.target.value },
                          }))
                        }
                        className="w-full bg-white border border-ink/10 p-2.5 rounded-lg text-[12px] outline-none focus:border-gold"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Commenting & Proofing Rights */}
                <div className="p-4 bg-canvas border border-ink/10 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-ink/5 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
                        <MessageSquare size={16} />
                      </div>
                      <div>
                        <h4 className="font-serif text-[15px]">Commenting & Proofing Rights</h4>
                        <p className="text-[11px] text-ink/50">
                          Enable client feedback, revision notes and proofing
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editPermissions.commenting.enabled}
                        onChange={(e) =>
                          setEditPermissions((prev) => ({
                            ...prev,
                            commenting: { ...prev.commenting, enabled: e.target.checked },
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                    </label>
                  </div>

                  {editPermissions.commenting.enabled && (
                    <div className="space-y-3 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editPermissions.commenting.allowProofingNotes}
                          onChange={(e) =>
                            setEditPermissions((prev) => ({
                              ...prev,
                              commenting: {
                                ...prev.commenting,
                                allowProofingNotes: e.target.checked,
                              },
                            }))
                          }
                          className="rounded text-gold focus:ring-gold"
                        />
                        <span className="text-[12px] text-ink">
                          Allow frame-accurate timestamped / coordinate proofing notes
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editPermissions.commenting.requireClientAuth}
                          onChange={(e) =>
                            setEditPermissions((prev) => ({
                              ...prev,
                              commenting: {
                                ...prev.commenting,
                                requireClientAuth: e.target.checked,
                              },
                            }))
                          }
                          className="rounded text-gold focus:ring-gold"
                        />
                        <span className="text-[12px] text-ink">
                          Require client email sign-in before posting comments
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                {/* 4. Sharing Rights */}
                <div className="p-4 bg-canvas border border-ink/10 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-ink/5 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
                        <Share2 size={16} />
                      </div>
                      <div>
                        <h4 className="font-serif text-[15px]">Sharing Rights</h4>
                        <p className="text-[11px] text-ink/50">
                          Allow clients and team members to generate share links
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editPermissions.sharing.enabled}
                        onChange={(e) =>
                          setEditPermissions((prev) => ({
                            ...prev,
                            sharing: { ...prev.sharing, enabled: e.target.checked },
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                    </label>
                  </div>

                  {editPermissions.sharing.enabled && (
                    <div className="space-y-3 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editPermissions.sharing.allowGuestReshare}
                          onChange={(e) =>
                            setEditPermissions((prev) => ({
                              ...prev,
                              sharing: { ...prev.sharing, allowGuestReshare: e.target.checked },
                            }))
                          }
                          className="rounded text-gold focus:ring-gold"
                        />
                        <span className="text-[12px] text-ink">
                          Allow client to generate guest invitation links
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editPermissions.sharing.showSocialShare}
                          onChange={(e) =>
                            setEditPermissions((prev) => ({
                              ...prev,
                              sharing: { ...prev.sharing, showSocialShare: e.target.checked },
                            }))
                          }
                          className="rounded text-gold focus:ring-gold"
                        />
                        <span className="text-[12px] text-ink">
                          Display direct social media share buttons on client portal
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-end gap-3 border-t border-ink/10">
                  <button
                    type="button"
                    onClick={() => setIsPermissionsModalOpen(false)}
                    className="px-5 py-2.5 text-[12px] font-medium text-ink/60 hover:text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-ink text-white px-6 py-2.5 rounded-full text-[12px] font-medium tracking-[0.05em] hover:bg-gold transition-colors flex items-center gap-2"
                  >
                    <Shield size={14} /> Save Permission Governance
                  </button>
                </div>
              </form>
            </Modal>
          )}
        </>
      )}
    </PortalShell>
  );
}
