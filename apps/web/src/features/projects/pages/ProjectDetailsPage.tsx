import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Image as ImageIcon,
  ChevronLeft,
  Calendar,
  MapPin,
  CheckCircle2,
  Circle,
  Shield,
  Video,
  CheckSquare,
  Plus,
  Trash2,
  Clock,
  Activity,
  UploadCloud,
  Sparkles,
  AlertTriangle,
  Navigation,
  Share2,
  CloudSun,
} from 'lucide-react';
import { PortalAvatar, PortalBell, PortalShell, PortalTopbar } from '@/shared/portal';
import { Modal } from '@cabmora/ui';
import {
  collaborationApi,
  type ProjectCallDto,
  type ProjectCommentDto,
  type ProjectTaskDto,
  type TaskPriority,
  type TaskStatus,
} from '@cabmora/api-client';
import { useAuth } from '@/shared/auth';
import {
  INITIAL_PROJECTS,
  PROJECT_DATA,
  STAGES,
  type Project,
} from '@/features/projects/data';
import {
  FigmaCommentWorkspace,
  type CanvasAssetItem,
} from '@/shared/collaboration/FigmaCommentWorkspace';
import { ProjectCallPanel } from '@/shared/collaboration/ProjectCallPanel';
import {
  PROJECT_WEATHER_FORECASTS,
  formatLiveCountdown,
  getProjectLogisticsMeta,
  shareCompletedProjectToCommunity,
} from '@/shared/collaboration/studioWorkspaceStore';

type WorkspaceTab = 'canvas' | 'tasks' | 'calls' | 'activity';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function ProjectDetailsPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isUuid = UUID_RE.test(id);

  const matchedProject: Project = (() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem('cabmora_studio_projects_v1');
        if (raw) {
          const list = JSON.parse(raw) as Project[];
          const found = list.find((p) => String(p.id) === id);
          if (found) return found;
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_PROJECTS.find((p) => String(p.id) === id) ?? INITIAL_PROJECTS[0]!;
  })();

  const [activeTab, setActiveTab] = useState<WorkspaceTab>('canvas');
  const [stageLabel, setStageLabel] = useState<Project['status']>(matchedProject.status);
  const [progress, setProgress] = useState(matchedProject.progress);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setStageLabel(matchedProject.status);
    setProgress(matchedProject.progress);
  }, [matchedProject.id, matchedProject.status, matchedProject.progress]);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const logistics = getProjectLogisticsMeta(id || '1', stageLabel);
  const countdown = formatLiveCountdown(logistics.targetOffsetHours, tick);
  const projectWeather =
    PROJECT_WEATHER_FORECASTS.find((w) => w.projectId === String(matchedProject.id)) ??
    PROJECT_WEATHER_FORECASTS[0]!;

  const updateProjectStageAndSave = (nextStage: Project['status']) => {
    let nextProgress = progress;
    if (nextStage === 'Planning') nextProgress = 10;
    else if (nextStage === 'Shooting') nextProgress = 30;
    else if (nextStage === 'Culling') nextProgress = 50;
    else if (nextStage === 'Editing') nextProgress = 70;
    else if (nextStage === 'Review') nextProgress = 90;
    else if (nextStage === 'Completed') nextProgress = 100;

    setStageLabel(nextStage);
    setProgress(nextProgress);

    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem('cabmora_studio_projects_v1');
        const list: Project[] = raw ? (JSON.parse(raw) as Project[]) : INITIAL_PROJECTS;
        const updated = list.map((p) =>
          String(p.id) === String(matchedProject.id)
            ? { ...p, status: nextStage, progress: nextProgress }
            : p,
        );
        window.localStorage.setItem('cabmora_studio_projects_v1', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    showToast(`Project status updated to ${nextStage}.`);
  };

  const handleShareCompletedToCommunity = () => {
    if (stageLabel !== 'Completed') {
      showToast('Mark this project as Completed first to share to the Community!');
      return;
    }
    shareCompletedProjectToCommunity({
      projectId: String(matchedProject.id),
      projectTitle: matchedProject.name,
      projectType: matchedProject.type,
      clientName: matchedProject.clientName,
      location: matchedProject.location,
      deliverablesSummary: matchedProject.deliverables,
      caption: `Completed and delivered "${matchedProject.name}" in ${matchedProject.location} for ${matchedProject.clientName}. Open to creator and client collaborations!`,
      mediaUrls: [matchedProject.image],
      creatorName: user?.full_name || 'Sarah Cabmora',
    });
    showToast(`Shared completed job "${matchedProject.name}" to the Creator Community!`);
  };

  // Tasks state
  const [tasks, setTasks] = useState<ProjectTaskDto[]>(() =>
    PROJECT_DATA.deliverables.map((d, idx) => ({
      id: `local-task-${idx}`,
      project_id: id || 'demo',
      title: d.name,
      description: `${d.type} • ${d.items} item(s)`,
      status: d.status === 'completed' ? 'completed' : 'todo',
      priority: idx === 0 ? 'high' : 'medium',
      due_at: null,
      assignee_id: null,
      created_by: user?.id ?? 'creator',
      created_at: new Date().toISOString(),
    })),
  );
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');

  const demoAssets: CanvasAssetItem[] = [
    {
      id: 'asset-hero',
      title: `${PROJECT_DATA.name} — Hero Select`,
      url: PROJECT_DATA.image,
    },
    {
      id: 'asset-portrait',
      title: 'Tuscany Golden Hour Portrait',
      url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&auto=format&fit=crop&q=80',
    },
    {
      id: 'asset-ceremony',
      title: 'Ceremony Processional Frame',
      url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&auto=format&fit=crop&q=80',
    },
  ];

  // Comments state
  const [comments, setComments] = useState<ProjectCommentDto[]>(() =>
    PROJECT_DATA.comments.map((c, idx) => ({
      id: `local-comment-${c.id}`,
      project_id: id || 'demo',
      asset_id: demoAssets[idx % demoAssets.length]?.id ?? null,
      parent_id: null,
      point_x: idx === 0 ? 0.42 : 0.65,
      point_y: idx === 0 ? 0.36 : 0.52,
      author_id: `author-${c.id}`,
      author_name: c.user,
      author_avatar_url: c.image,
      author_role: c.user === PROJECT_DATA.client.name ? 'customer' : 'creator',
      body: c.text,
      kind: idx === 0 ? 'amendment' : 'comment',
      resolved: false,
      needs_action: idx === 0,
      created_at: new Date().toISOString(),
    })),
  );

  // Calls state
  const [calls, setCalls] = useState<ProjectCallDto[]>([]);

  // Permissions Modal
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [editPermissions, setEditPermissions] = useState(PROJECT_DATA.permissions);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!isUuid) return;
    let active = true;

    collaborationApi
      .listProjectTasks(id)
      .then((rows) => active && rows.length > 0 && setTasks(rows))
      .catch(() => undefined);

    collaborationApi
      .listProjectComments(id)
      .then((rows) => active && setComments(rows))
      .catch(() => undefined);

    collaborationApi
      .listProjectCalls(id)
      .then((rows) => active && setCalls(rows))
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [id, isUuid]);

  const canvasAssets: CanvasAssetItem[] = demoAssets;

  const handleAddTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    if (isUuid) {
      try {
        const created = await collaborationApi.createProjectTask(id, {
          title: newTaskTitle.trim(),
          priority: newTaskPriority,
        });
        setTasks((prev) => [created, ...prev]);
        setNewTaskTitle('');
        showToast('Task added to project.');
        return;
      } catch {
        // Fallback below
      }
    }
    const local: ProjectTaskDto = {
      id: `local-task-${Date.now()}`,
      project_id: id || 'demo',
      title: newTaskTitle.trim(),
      description: '',
      status: 'todo',
      priority: newTaskPriority,
      due_at: null,
      assignee_id: user?.id ?? null,
      created_by: user?.id ?? 'creator',
      created_at: new Date().toISOString(),
    };
    setTasks((prev) => [local, ...prev]);
    setNewTaskTitle('');
  };

  const handleCycleTaskStatus = async (task: ProjectTaskDto) => {
    const nextStatus: TaskStatus =
      task.status === 'todo'
        ? 'in_progress'
        : task.status === 'in_progress'
          ? 'completed'
          : 'todo';
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));
    if (isUuid && UUID_RE.test(task.id)) {
      await collaborationApi.updateProjectTask(task.id, { status: nextStatus }).catch(() => undefined);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (isUuid && UUID_RE.test(taskId)) {
      await collaborationApi.deleteProjectTask(taskId).catch(() => undefined);
    }
  };

  const handleAddComment = async (payload: {
    body: string;
    asset_id?: string | null;
    parent_id?: string | null;
    point_x?: number | null;
    point_y?: number | null;
    kind?: 'comment' | 'amendment';
  }) => {
    if (isUuid) {
      try {
        const created = await collaborationApi.addProjectComment(id, payload);
        setComments((prev) => [...prev, created]);
        return;
      } catch {
        // Fallback below
      }
    }
    const local: ProjectCommentDto = {
      id: `local-comment-${Date.now()}`,
      project_id: id || 'demo',
      asset_id: payload.asset_id ?? null,
      parent_id: payload.parent_id ?? null,
      point_x: payload.point_x ?? null,
      point_y: payload.point_y ?? null,
      author_id: user?.id ?? 'creator',
      author_name: user?.full_name || 'Sarah Cabmora',
      author_avatar_url: user?.avatar_url,
      author_role: user?.role ?? 'creator',
      body: payload.body,
      kind: payload.kind ?? 'comment',
      resolved: false,
      needs_action: payload.kind === 'amendment',
      created_at: new Date().toISOString(),
    };
    setComments((prev) => [...prev, local]);
  };

  const handleResolveComment = async (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, resolved: true, needs_action: false } : c)),
    );
    if (isUuid && UUID_RE.test(commentId)) {
      await collaborationApi.resolveComment(commentId).catch(() => undefined);
    }
  };

  const handleReopenComment = async (commentId: string) => {
    setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, resolved: false } : c)));
    if (isUuid && UUID_RE.test(commentId)) {
      await collaborationApi.reopenComment(commentId).catch(() => undefined);
    }
  };

  const handleRequestCall = async (payload: {
    title: string;
    proposed_at: string;
    duration_minutes: number;
    notes: string;
  }) => {
    if (isUuid) {
      try {
        const created = await collaborationApi.requestProjectCall(id, payload);
        setCalls((prev) => [created, ...prev]);
        showToast('Call request sent to client.');
        return;
      } catch {
        // Fallback below
      }
    }
    const local: ProjectCallDto = {
      id: `local-call-${Date.now()}`,
      project_id: id || 'demo',
      project_title: PROJECT_DATA.name,
      requester_id: user?.id ?? 'creator',
      requester_name: user?.full_name || 'Sarah Cabmora',
      recipient_id: 'client-1',
      recipient_name: PROJECT_DATA.client.name,
      title: payload.title,
      notes: payload.notes,
      proposed_at: payload.proposed_at,
      duration_minutes: payload.duration_minutes,
      status: 'pending',
      meeting_room_id: null,
      meeting_url: null,
      responded_at: null,
      created_at: new Date().toISOString(),
    };
    setCalls((prev) => [local, ...prev]);
    showToast('Call request created.');
  };

  const handleRespondCall = async (
    callId: string,
    action: 'accept' | 'decline' | 'cancel' | 'complete' | 'reschedule',
    proposedAt?: string,
  ) => {
    if (isUuid && UUID_RE.test(callId)) {
      try {
        const updated = await collaborationApi.respondToProjectCall(callId, {
          action,
          proposed_at: proposedAt,
        });
        setCalls((prev) => prev.map((c) => (c.id === callId ? updated : c)));
        showToast(`Call ${action}ed.`);
        return;
      } catch {
        // Fallback below
      }
    }
    setCalls((prev) =>
      prev.map((c) => {
        if (c.id !== callId) return c;
        if (action === 'accept') {
          return {
            ...c,
            status: 'accepted',
            meeting_room_id: `cabmora-${callId.slice(0, 8)}`,
            meeting_url: `https://meet.jit.si/cabmora-${callId.slice(0, 8)}`,
          };
        }
        if (action === 'decline') return { ...c, status: 'declined' };
        if (action === 'cancel') return { ...c, status: 'cancelled' };
        if (action === 'complete') return { ...c, status: 'completed' };
        return c;
      }),
    );
  };

  const openCommentsCount = comments.filter((c) => !c.parent_id && !c.resolved).length;
  const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;
  const pendingCallsCount = calls.filter((c) => c.status === 'pending').length;

  return (
    <PortalShell>
      {({ toggleSidebar }) => (
        <>
          {toastMsg && (
            <div className="fixed top-6 right-6 z-50 bg-gold text-ink px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 font-semibold text-[13px]">
              <CheckCircle2 size={17} />
              {toastMsg}
            </div>
          )}

          <PortalTopbar
            title={matchedProject.name}
            onToggleSidebar={toggleSidebar}
            leading={
              <button
                type="button"
                aria-label="Back"
                onClick={() => navigate(-1)}
                className="text-ink/60 hover:text-ink transition-colors shrink-0"
              >
                <ChevronLeft size={20} />
              </button>
            }
          >
            {/* Topbar Live Countdown, Weather Forecast, Venue Distance & Deadline Warning Pill */}
            <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-canvas border border-ink/10 text-[11.5px] text-ink/75 whitespace-nowrap">
              <span className="flex items-center gap-1 font-medium text-ink">
                <Clock size={13} className="text-gold" />
                <span className="font-mono font-semibold">
                  {countdown.days}d {countdown.hours}h {countdown.mins}m
                </span>
              </span>
              <span className="text-ink/20">•</span>
              <span className="flex items-center gap-1 font-medium text-ink">
                <CloudSun size={13} className="text-gold" />
                <span>
                  {projectWeather.tempC}°C {projectWeather.condition.split(' ')[0]}
                </span>
              </span>
              <span className="text-ink/20">•</span>
              <span className="flex items-center gap-1">
                <Navigation size={12} className="text-gold" />
                {logistics.venueDistanceKm} km ({logistics.venueTravelTime})
              </span>
              <span className="text-ink/20">•</span>
              <span className="flex items-center gap-1 text-amber-800 font-medium">
                <AlertTriangle size={12} className="text-gold" />
                {stageLabel === 'Completed' ? 'Delivered' : 'Due in 2 days'}
              </span>
            </div>

            <PortalBell />
            <PortalAvatar
              src={
                user?.avatar_url ||
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'
              }
            />
          </PortalTopbar>

          {/* Full-Screen Workspace Content (No narrow max-width constraint) */}
          <main className="flex-1 w-full p-5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
            {/* Workspace Project Overview Strip */}
            <div className="bg-white border border-ink/10 rounded-2xl p-5 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-5 flex items-center gap-4">
                <img
                  src={matchedProject.image}
                  alt={matchedProject.name}
                  className="w-20 h-20 rounded-xl object-cover shrink-0 border border-ink/10"
                />
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gold/20 text-ink">
                      {stageLabel}
                    </span>
                    <span className="text-[11.5px] text-ink/55 flex items-center gap-1">
                      <Calendar size={12} className="text-gold" /> {matchedProject.date}
                    </span>
                    <span className="text-[11.5px] text-ink/55 flex items-center gap-1">
                      <MapPin size={12} className="text-gold" /> {matchedProject.location}
                    </span>
                  </div>
                  <h2 className="font-serif text-[22px] font-bold truncate">
                    {matchedProject.name}
                  </h2>
                  <p className="text-[12.5px] text-ink/65 truncate">
                    Client: {matchedProject.clientName} • {matchedProject.deliverables}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-3 space-y-2">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-ink/60 font-medium">Project Completion</span>
                  <span className="font-bold text-gold">{progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-sand overflow-hidden">
                  <div
                    className="h-full bg-gold transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-ink/50">
                  <span>
                    Tasks: {completedTasksCount}/{tasks.length} done
                  </span>
                  <span>Open Feedback: {openCommentsCount}</span>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-wrap lg:justify-end items-center gap-2">
                <select
                  value={stageLabel}
                  onChange={(e) => updateProjectStageAndSave(e.target.value as Project['status'])}
                  aria-label="Project status stage"
                  className="bg-sand border border-ink/15 rounded-xl px-3 py-2 text-[12.5px] font-semibold outline-none focus:border-gold cursor-pointer"
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setActiveTab('calls')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gold text-ink text-[12px] font-semibold hover:bg-gold-dark transition-colors cursor-pointer"
                >
                  <Video size={14} />
                  <span>Request a Call</span>
                  {pendingCallsCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-noir text-gold text-[10px]">
                      {pendingCallsCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/upload')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-ink/15 text-[12px] font-medium hover:border-gold transition-colors cursor-pointer"
                >
                  <UploadCloud size={14} className="text-gold" />
                  <span>Submit Deliverables</span>
                </button>

                {stageLabel === 'Completed' && (
                  <button
                    type="button"
                    onClick={handleShareCompletedToCommunity}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-ink text-white hover:bg-gold hover:text-ink text-[12px] font-semibold transition-colors cursor-pointer"
                  >
                    <Share2 size={14} />
                    <span>Share to Community</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsPermissionsModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl border border-ink/15 text-[12px] font-medium hover:border-gold flex items-center gap-1.5 cursor-pointer"
                >
                  <Shield size={14} className="text-gold" /> Governance
                </button>
              </div>
            </div>

            {/* Workspace Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-2xl border border-ink/10">
              {(
                [
                  {
                    id: 'canvas',
                    label: `Comments/Feedback (${openCommentsCount} open)`,
                    icon: ImageIcon,
                  },
                  {
                    id: 'tasks',
                    label: `Tasks & Deliverables (${tasks.length - completedTasksCount} pending)`,
                    icon: CheckSquare,
                  },
                  {
                    id: 'calls',
                    label: `Calls & Meetings (${calls.length})`,
                    icon: Video,
                  },
                  {
                    id: 'activity',
                    label: 'Activity & Client Details',
                    icon: Activity,
                  },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2.5 rounded-xl text-[12.5px] font-medium flex items-center gap-2 transition-colors ${active
                      ? 'bg-gold text-ink font-semibold shadow-sm'
                      : 'text-ink/65 hover:text-ink hover:bg-sand'
                      }`}
                  >
                    <Icon size={15} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: FIGMA-STYLE DESIGN COMMENTS & ASSETS */}
            {activeTab === 'canvas' && (
              <FigmaCommentWorkspace
                assets={canvasAssets}
                comments={comments}
                currentUserId={user?.id}
                canResolve
                onAddComment={handleAddComment}
                onResolveComment={handleResolveComment}
                onReopenComment={handleReopenComment}
              />
            )}

            {/* TAB 2: TASKS & DELIVERABLES */}
            {activeTab === 'tasks' && (
              <div className="bg-white border border-ink/10 rounded-2xl p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink/10 pb-4">
                  <div>
                    <h3 className="font-serif text-[20px] font-semibold">
                      Project Tasks & Deliverables
                    </h3>
                    <p className="text-[12.5px] text-ink/60">
                      Click a task status icon to cycle between To Do, In Progress, and Completed.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Add a new deliverable or milestone task..."
                    className="flex-1 bg-sand border border-ink/15 rounded-xl px-4 py-2.5 text-[13.5px] outline-none focus:border-gold"
                  />
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                    className="bg-sand border border-ink/15 rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-gold"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gold text-ink text-[13px] font-semibold hover:bg-gold-dark flex items-center justify-center gap-1.5"
                  >
                    <Plus size={15} /> Add Task
                  </button>
                </form>

                <div className="space-y-2.5">
                  {tasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 rounded-xl border border-ink/10 bg-sand/30 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => void handleCycleTaskStatus(t)}
                          className="shrink-0 text-gold hover:scale-110 transition-transform"
                          title="Cycle task status"
                        >
                          {t.status === 'completed' ? (
                            <CheckCircle2 size={20} className="text-emerald-600" />
                          ) : t.status === 'in_progress' ? (
                            <Clock size={20} className="text-amber-500" />
                          ) : (
                            <Circle size={20} className="text-ink/40" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <div
                            className={`text-[14px] font-semibold ${t.status === 'completed' ? 'line-through text-ink/45' : ''
                              }`}
                          >
                            {t.title}
                          </div>
                          <div className="text-[11.5px] text-ink/55 flex items-center gap-2">
                            <span className="uppercase font-bold text-gold">{t.priority}</span>
                            <span>•</span>
                            <span className="capitalize">{t.status.replace('_', ' ')}</span>
                            {t.description && <span>• {t.description}</span>}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => void handleDeleteTask(t.id)}
                        className="p-1.5 text-ink/40 hover:text-rose-600 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: TWO-WAY CALL REQUESTS & VIDEO CALLING */}
            {activeTab === 'calls' && (
              <div className="bg-white border border-ink/10 rounded-2xl p-6">
                <ProjectCallPanel
                  calls={calls}
                  currentUserId={user?.id}
                  onRequestCall={handleRequestCall}
                  onRespondCall={handleRespondCall}
                />
              </div>
            )}

            {/* TAB 4: ACTIVITY & CLIENT DETAILS */}
            {activeTab === 'activity' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 bg-white border border-ink/10 rounded-2xl p-6 space-y-4">
                  <h3 className="font-serif text-[19px] font-semibold">Client & Brief</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gold/20 border border-gold/40 text-gold font-bold flex items-center justify-center">
                      {PROJECT_DATA.client.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-[15px]">{PROJECT_DATA.client.name}</div>
                      <div className="text-[12px] text-ink/60">{PROJECT_DATA.client.email}</div>
                    </div>
                  </div>
                  <p className="text-[13px] text-ink/75 leading-relaxed">
                    {PROJECT_DATA.description}
                  </p>
                </div>

                <div className="lg:col-span-7 bg-white border border-ink/10 rounded-2xl p-6 space-y-4">
                  <h3 className="font-serif text-[19px] font-semibold flex items-center gap-2">
                    <Sparkles size={17} className="text-gold" />
                    <span>Recent Project Activity</span>
                  </h3>
                  <div className="space-y-3 text-[13px]">
                    {comments.slice(-5).map((c) => (
                      <div
                        key={c.id}
                        className="p-3 rounded-xl bg-sand/40 border border-ink/5 flex items-center justify-between gap-3"
                      >
                        <span>
                          <strong>{c.author_name}</strong> commented: “{c.body}”
                        </span>
                        <span className="text-[11px] text-ink/45 shrink-0">
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* Governance / Permissions Modal */}
          {isPermissionsModalOpen && (
            <Modal
              open
              onOpenChange={(next) => {
                if (!next) setIsPermissionsModalOpen(false);
              }}
              size="md"
              title="Project Governance & Client Permissions"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setIsPermissionsModalOpen(false);
                  showToast('Project permissions updated.');
                }}
                className="space-y-4"
              >
                <label className="flex items-center justify-between p-3 rounded-xl border border-ink/10 cursor-pointer">
                  <span className="text-[13px] font-medium">
                    Allow client to download full-res masters
                  </span>
                  <input
                    type="checkbox"
                    checked={editPermissions.download.enabled}
                    onChange={(e) =>
                      setEditPermissions({
                        ...editPermissions,
                        download: { ...editPermissions.download, enabled: e.target.checked },
                      })
                    }
                    className="w-4 h-4 accent-gold"
                  />
                </label>
                <label className="flex items-center justify-between p-3 rounded-xl border border-ink/10 cursor-pointer">
                  <span className="text-[13px] font-medium">
                    Require watermarks on client downloads
                  </span>
                  <input
                    type="checkbox"
                    checked={editPermissions.download.requireWatermark}
                    onChange={(e) =>
                      setEditPermissions({
                        ...editPermissions,
                        download: {
                          ...editPermissions.download,
                          requireWatermark: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 accent-gold"
                  />
                </label>
                <label className="flex items-center justify-between p-3 rounded-xl border border-ink/10 cursor-pointer">
                  <span className="text-[13px] font-medium">
                    Allow client to generate public share links
                  </span>
                  <input
                    type="checkbox"
                    checked={editPermissions.sharing.enabled}
                    onChange={(e) =>
                      setEditPermissions({
                        ...editPermissions,
                        sharing: { ...editPermissions.sharing, enabled: e.target.checked },
                      })
                    }
                    className="w-4 h-4 accent-gold"
                  />
                </label>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPermissionsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-ink/15 text-[12.5px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gold text-ink font-semibold text-[12.5px]"
                  >
                    Save Permissions
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
