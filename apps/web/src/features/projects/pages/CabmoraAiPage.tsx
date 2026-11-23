import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  FolderKanban,
  CheckSquare,
  AlertCircle,
  MessageSquare,
  CalendarClock,
  PhoneIncoming,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { PortalAvatar, PortalBell, PortalShell, PortalTopbar } from '@/shared/portal';
import {
  collaborationApi,
  type BriefingActionItemDto,
  type CreatorBriefingDto,
} from '@cabmora/api-client';
import { useAuth } from '@/shared/auth';
import { PROJECTS } from '@/features/projects/data';
import { CreatorAiAssistantPanel } from '@/features/projects/components/CreatorAiAssistantPanel';

type KindFilter = 'all' | BriefingActionItemDto['kind'];

const KIND_BADGE: Record<string, { label: string; badge: string; icon: typeof CheckSquare }> = {
  call: {
    label: 'Call Request',
    badge: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
    icon: PhoneIncoming,
  },
  revision: {
    label: 'Revision',
    badge: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
    icon: AlertCircle,
  },
  deadline: {
    label: 'Deadline',
    badge: 'bg-rose-500/15 text-rose-500 border-rose-500/30',
    icon: CalendarClock,
  },
  task: {
    label: 'Task',
    badge: 'bg-gold/15 text-gold border-gold/30',
    icon: CheckSquare,
  },
  comment: {
    label: 'Comment',
    badge: 'bg-flow-sky/15 text-flow-sky border-flow-sky/30',
    icon: MessageSquare,
  },
};

export default function CabmoraAiPage() {
  const { user } = useAuth();
  const [briefing, setBriefing] = useState<CreatorBriefingDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [kindFilter, setKindFilter] = useState<KindFilter>('all');

  const loadBriefing = () => {
    setLoading(true);
    collaborationApi
      .getCreatorBriefing()
      .then((data) => setBriefing(data))
      .catch(() => {
        setBriefing({
          headline: `Welcome back${user?.first_name ? `, ${user.first_name}` : ''}! Here's what needs your attention today.`,
          summary_text: `${PROJECTS.length} active studio project(s) synced in your workspace.`,
          projects_in_progress: PROJECTS.length,
          pending_tasks_count: 3,
          revision_requests_count: 1,
          unread_comments_count: 2,
          upcoming_deadlines_count: 1,
          pending_calls_count: 0,
          action_items: PROJECTS.slice(0, 4).map((p) => ({
            kind: 'task',
            title: 'Review deliverables & client feedback',
            subtitle: `${p.status} • Due ${p.date}`,
            project_id: String(p.id),
            project_title: p.name,
            url: `/projects/${p.id}`,
            priority: 'high',
          })),
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadBriefing();
  }, [user?.first_name]);

  const filteredItems = (briefing?.action_items ?? []).filter(
    (item) => kindFilter === 'all' || item.kind === kindFilter,
  );

  return (
    <PortalShell>
      {({ toggleSidebar }) => (
        <>
          <PortalTopbar
            title="Cabmora AI"
            subtitle="Your intelligent studio briefing, summaries, and action queue"
            icon={Sparkles}
            onToggleSidebar={toggleSidebar}
          >
            <button
              type="button"
              onClick={loadBriefing}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-ink/15 text-[12px] font-medium hover:border-gold transition-colors cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-gold' : 'text-gold'} />
              <span>Refresh Summary</span>
            </button>
            <PortalBell />
            <PortalAvatar
              src={
                user?.avatar_url ||
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'
              }
            />
          </PortalTopbar>

          <main className="flex-1 w-full p-5 sm:p-6 lg:p-8 overflow-y-auto">
            <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              {/* Left 7 Columns: Executive Summary + Things To Do */}
              <div className="xl:col-span-7 space-y-6 min-w-0">
                {/* AI Briefing Hero Banner */}
                <div className="bg-forest text-canvas border border-gold/30 rounded-2xl p-6 sm:p-8 space-y-5 shadow-lg">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-gold font-bold">
                    <Sparkles size={14} /> Daily Workspace Summary
                  </div>
                  <h2 className="font-serif text-[24px] sm:text-[28px] font-bold text-white leading-snug">
                    {briefing?.headline || 'Analyzing your studio workspace…'}
                  </h2>
                  <p className="text-[14px] text-canvas/80 leading-relaxed">
                    {briefing?.summary_text ||
                      'Gathering live projects, tasks, comments, deadlines, and call requests.'}
                  </p>

                  {/* 5 Interactive Summary Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                    {[
                      {
                        label: 'In Progress',
                        value: briefing?.projects_in_progress ?? 0,
                        icon: FolderKanban,
                        filter: 'all' as KindFilter,
                      },
                      {
                        label: 'Tasks To Do',
                        value: briefing?.pending_tasks_count ?? 0,
                        icon: CheckSquare,
                        filter: 'task' as KindFilter,
                      },
                      {
                        label: 'Revisions',
                        value: briefing?.revision_requests_count ?? 0,
                        icon: AlertCircle,
                        filter: 'revision' as KindFilter,
                      },
                      {
                        label: 'Comments',
                        value: briefing?.unread_comments_count ?? 0,
                        icon: MessageSquare,
                        filter: 'comment' as KindFilter,
                      },
                      {
                        label: 'Deadlines / Calls',
                        value:
                          (briefing?.upcoming_deadlines_count ?? 0) +
                          (briefing?.pending_calls_count ?? 0),
                        icon: CalendarClock,
                        filter: 'deadline' as KindFilter,
                      },
                    ].map((stat) => {
                      const Icon = stat.icon;
                      return (
                        <button
                          key={stat.label}
                          type="button"
                          onClick={() => setKindFilter(stat.filter)}
                          className={`p-3.5 rounded-xl border text-center space-y-1 cursor-pointer transition-all ${
                            kindFilter === stat.filter
                              ? 'bg-forest-light border-gold text-white'
                              : 'bg-forest-dark/70 border-canvas/10 hover:bg-forest-light/60'
                          }`}
                        >
                          <Icon size={15} className="text-gold mx-auto" />
                          <div className="font-serif text-[22px] font-bold text-white">
                            {stat.value}
                          </div>
                          <div className="text-[10px] uppercase tracking-wider text-canvas/65">
                            {stat.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Prioritised Things To Do */}
                <div className="bg-white border border-ink/10 rounded-2xl p-6 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-4">
                    <div>
                      <h3 className="font-serif text-[20px] font-semibold">
                        Things To Do & Action Queue ({filteredItems.length})
                      </h3>
                      <p className="text-[12.5px] text-ink/60">
                        Click any item to jump directly to the project workspace.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[11.5px]">
                      {(
                        [
                          { id: 'all', label: 'All' },
                          { id: 'task', label: 'Tasks' },
                          { id: 'revision', label: 'Revisions' },
                          { id: 'call', label: 'Calls' },
                          { id: 'deadline', label: 'Deadlines' },
                          { id: 'comment', label: 'Comments' },
                        ] as { id: KindFilter; label: string }[]
                      ).map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setKindFilter(tab.id)}
                          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                            kindFilter === tab.id
                              ? 'bg-gold text-ink font-semibold'
                              : 'bg-sand text-ink/65 hover:text-ink'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredItems.length === 0 ? (
                    <div className="py-12 text-center text-ink/50 text-[13.5px]">
                      No items in this category right now. Everything is on track!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredItems.map((item, idx) => {
                        const style = KIND_BADGE[item.kind] ?? KIND_BADGE.task;
                        const Icon = style.icon;
                        return (
                          <Link
                            key={`${item.project_id}-${idx}`}
                            to={item.url}
                            className="p-4 rounded-xl border border-ink/10 hover:border-gold bg-sand/30 hover:bg-sand/60 flex items-center justify-between gap-4 transition-all group cursor-pointer"
                          >
                            <div className="flex items-start gap-3.5 min-w-0">
                              <span className={`p-2 rounded-xl border shrink-0 ${style.badge}`}>
                                <Icon size={16} />
                              </span>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-semibold text-[14px] group-hover:text-gold transition-colors">
                                    {item.title}
                                  </span>
                                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-gold/15 text-ink font-medium">
                                    {item.project_title}
                                  </span>
                                </div>
                                <p className="text-[12.5px] text-ink/65 mt-0.5">{item.subtitle}</p>
                              </div>
                            </div>
                            <ArrowRight
                              size={16}
                              className="text-ink/40 group-hover:text-gold shrink-0 transition-colors"
                            />
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right 5 Columns: Cabmora AI Interactive Chatbot */}
              <div className="xl:col-span-5">
                <CreatorAiAssistantPanel briefing={briefing} />
              </div>
            </div>
          </main>
        </>
      )}
    </PortalShell>
  );
}
