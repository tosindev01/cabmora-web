import { useEffect, useState, type FormEvent } from 'react';
import {
  Heart,
  MessageSquare,
  Handshake,
  CheckCircle2,
  MapPin,
  Users,
  Sparkles,
  Check,
  X,
  Send,
  Share2,
  Lock,
  Award,
  Navigation,
} from 'lucide-react';
import { Modal } from '@cabmora/ui';
import { PortalAvatar, PortalBell, PortalShell, PortalTopbar } from '@/shared/portal';
import { CLIENT_NAV, CLIENT_NAV_FOOTER, CLIENT_NAV_SECONDARY } from '@/shared/portal/data';
import { useAuth } from '@/shared/auth';
import {
  collaborationApi,
  type CommunityFeedDto,
  type CommunityPostDto,
} from '@cabmora/api-client';
import { INITIAL_PROJECTS } from '@/features/projects/data';
import {
  STUDIO_WORKSPACE_EVENT,
  addCommunityPostComment,
  createCommunityCollaborationRequest,
  getCommunityState,
  respondToCommunityCollaboration,
  shareCompletedProjectToCommunity,
  toggleCommunityPostLike,
} from '@/shared/collaboration/studioWorkspaceStore';

export default function CommunityPage() {
  const { user } = useAuth();
  const isClientViewer = user?.role === 'customer';
  const [feed, setFeed] = useState<CommunityFeedDto>(() => getCommunityState());
  const [toast, setToast] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({
    'post-101': true,
  });

  // Share Completed Job Modal State (The ONLY way to post to Community)
  const completedProjects = INITIAL_PROJECTS.filter((p) => p.status === 'Completed');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedCompletedId, setSelectedCompletedId] = useState<number>(
    completedProjects[0]?.id ?? 4,
  );
  const [shareCaption, setShareCaption] = useState('');

  // Collaborate Proposal Modal State
  const [collabTargetPost, setCollabTargetPost] = useState<CommunityPostDto | null>(null);
  const [proposedRole, setProposedRole] = useState(
    isClientViewer
      ? 'Book Creator for Full Campaign / Event Coverage'
      : 'Second Photographer & 4K Aerial Drone Operator',
  );
  const [proposedDate, setProposedDate] = useState('Nov 22, 2025');
  const [budgetOrSplit, setBudgetOrSplit] = useState(
    isClientViewer ? '$7,500 Production Budget' : '$1,850 Day Rate / 30% Split',
  );
  const [collabMessage, setCollabMessage] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 4200);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    let active = true;

    collaborationApi
      .getCommunityFeed()
      .then((serverFeed) => {
        if (active && serverFeed.posts.length > 0) {
          setFeed(getCommunityState());
        }
      })
      .catch(() => undefined);

    const handleSync = () => setFeed(getCommunityState());
    window.addEventListener(STUDIO_WORKSPACE_EVENT, handleSync);
    return () => {
      active = false;
      window.removeEventListener(STUDIO_WORKSPACE_EVENT, handleSync);
    };
  }, []);

  const handleLikePost = (post: CommunityPostDto) => {
    const { state, autoFollowedCreatorName } = toggleCommunityPostLike(post.id);
    setFeed(state);
    if (autoFollowedCreatorName) {
      showToast(
        `First Like: You liked this completed project & automatically followed ${autoFollowedCreatorName}!`,
      );
    }
  };

  const handleAddComment = (postId: string, e: FormEvent) => {
    e.preventDefault();
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    const updated = addCommunityPostComment({
      postId,
      text,
      authorName: user?.full_name || (isClientViewer ? 'Elena Vance' : 'Sarah Cabmora'),
      authorRole: isClientViewer ? 'client' : 'creator',
    });
    setFeed(updated);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    setExpandedComments((prev) => ({ ...prev, [postId]: true }));
  };

  const handleShareCompletedJob = (e: FormEvent) => {
    e.preventDefault();
    const proj =
      completedProjects.find((p) => p.id === selectedCompletedId) ?? completedProjects[0];
    if (!proj) return;
    const updated = shareCompletedProjectToCommunity({
      projectId: String(proj.id),
      projectTitle: proj.name,
      projectType: proj.type,
      clientName: proj.clientName,
      location: proj.location,
      deliverablesSummary: proj.deliverables,
      caption:
        shareCaption.trim() ||
        `Completed and delivered "${proj.name}" in ${proj.location} (${proj.deliverables}). Open to collaborating with creators and clients on upcoming shoots!`,
      mediaUrls: [proj.image],
      creatorName: user?.full_name || 'Sarah Cabmora',
    });
    setFeed(updated);
    setShareCaption('');
    setIsShareModalOpen(false);
    showToast(`Completed job "${proj.name}" shared to the Community feed!`);
  };

  const handleSendCollaboration = (e: FormEvent) => {
    e.preventDefault();
    if (!collabTargetPost) return;
    const updated = createCommunityCollaborationRequest({
      postId: collabTargetPost.id,
      projectTitle: collabTargetPost.project_title,
      targetCreatorId: collabTargetPost.creator_id,
      targetCreatorName: collabTargetPost.creator_name,
      proposedRole,
      proposedDate,
      budgetOrSplit,
      message:
        collabMessage.trim() ||
        `Loved your completed project "${collabTargetPost.project_title}"! Let's collaborate on an upcoming production.`,
      requesterName: user?.full_name || (isClientViewer ? 'Elena Vance (Client)' : 'Sarah Cabmora'),
      requesterRole: isClientViewer ? 'client' : 'creator',
    });
    setFeed(updated);
    setCollabTargetPost(null);
    setCollabMessage('');
    showToast(`Collaboration request sent to ${collabTargetPost.creator_name}!`);
  };

  const handleRespondCollaboration = (collabId: string, action: 'accept' | 'decline') => {
    const updated = respondToCommunityCollaboration(collabId, action);
    setFeed(updated);
    showToast(
      action === 'accept'
        ? 'Collaboration accepted! Added to your active studio collaborations.'
        : 'Collaboration request declined.',
    );
  };

  const navConfig = isClientViewer
    ? {
        items: CLIENT_NAV,
        secondary: CLIENT_NAV_SECONDARY,
        footer: CLIENT_NAV_FOOTER,
      }
    : undefined;

  return (
    <PortalShell nav={navConfig}>
      {({ toggleSidebar }) => (
        <>
          {toast && (
            <div className="fixed top-6 right-6 z-50 bg-forest text-canvas border border-gold px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-[13px] font-semibold">
              <Sparkles size={16} className="text-gold shrink-0" />
              <span>{toast}</span>
            </div>
          )}

          <PortalTopbar
            title="Cabmora Creator & Client Community"
            subtitle="Verified completed studio deliveries, creative network, and direct project collaborations"
            icon={Users}
            onToggleSidebar={toggleSidebar}
          >
            {!isClientViewer && (
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gold text-ink text-[12px] font-semibold hover:bg-gold-dark transition-colors cursor-pointer shadow-sm"
              >
                <Share2 size={14} />
                <span>Share Completed Job</span>
              </button>
            )}
            <PortalBell />
            <PortalAvatar
              src={
                user?.avatar_url ||
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'
              }
            />
          </PortalTopbar>

          <main className="flex-1 p-5 sm:p-6 lg:p-10 overflow-y-auto">
            <div className="max-w-[1260px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              {/* Left 8 Columns: LinkedIn-Style Verified Completed Job Feed */}
              <div className="xl:col-span-8 space-y-6 min-w-0">
                {/* Verified Completed-Job Only Posting Gate Banner */}
                <div className="bg-forest text-canvas border border-gold/30 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.14em] text-gold font-bold">
                      <Lock size={12} /> Verified Portfolio Rule • Completed Jobs Only
                    </div>
                    <h2 className="font-serif text-[20px] font-bold text-white">
                      Share a Completed Studio Job to the Community
                    </h2>
                    <p className="text-[12.5px] text-canvas/75">
                      To keep the Cabmora network authentic, posts can only be published by sharing a{' '}
                      <strong className="text-gold">Completed & Delivered Project</strong>. Creators
                      and clients can like (first like auto-follows!), comment, and request to
                      collaborate.
                    </p>
                  </div>

                  {!isClientViewer && (
                    <button
                      type="button"
                      onClick={() => setIsShareModalOpen(true)}
                      className="px-5 py-3 rounded-xl bg-gold text-ink font-semibold text-[12.5px] hover:bg-gold-dark flex items-center gap-2 shrink-0 cursor-pointer shadow-md"
                    >
                      <Share2 size={15} />
                      <span>Share Completed Job ({completedProjects.length})</span>
                    </button>
                  )}
                </div>

                {/* LinkedIn-Style Completed Job Showcase Posts */}
                <div className="space-y-6">
                  {feed.posts.map((post) => {
                    const isAutoFollowed = feed.auto_followed_creator_ids.includes(post.creator_id);
                    const isCommentsOpen = Boolean(expandedComments[post.id]);

                    return (
                      <article
                        key={post.id}
                        className="bg-white border border-ink/10 rounded-2xl overflow-hidden shadow-sm hover:border-gold/60 transition-all"
                      >
                        {/* Creator Header */}
                        <div className="p-5 sm:p-6 flex flex-wrap items-start justify-between gap-4 border-b border-ink/5">
                          <div className="flex items-center gap-3.5">
                            <img
                              src={post.creator_avatar}
                              alt={post.creator_name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-gold/40 shrink-0"
                            />
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-serif text-[18px] font-bold text-ink">
                                  {post.creator_name}
                                </h3>
                                <span className="text-[11.5px] text-gold font-medium">
                                  {post.creator_handle}
                                </span>
                                {isAutoFollowed && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                                    ✓ Following (Auto-Followed on First Like)
                                  </span>
                                )}
                              </div>
                              <p className="text-[12px] text-ink/60">
                                {post.creator_specialization}
                              </p>
                              <div className="text-[11px] text-ink/45 mt-0.5">{post.created_at}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 text-[10.5px] font-bold uppercase tracking-wider">
                              <CheckCircle2 size={12} /> Verified Completed Job
                            </span>
                            <button
                              type="button"
                              onClick={() => setCollabTargetPost(post)}
                              className="px-3.5 py-2 rounded-xl bg-ink text-white hover:bg-gold hover:text-ink text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Handshake size={14} />
                              <span>Collaborate</span>
                            </button>
                          </div>
                        </div>

                        {/* Completed Job Metadata Banner */}
                        <div className="px-5 sm:px-6 py-3.5 bg-sand/70 border-b border-ink/5 flex flex-wrap items-center justify-between gap-3 text-[12px]">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-gold block">
                              {post.project_type} • Client: {post.client_name}
                            </span>
                            <div className="font-serif text-[16px] font-semibold text-ink">
                              {post.project_title}
                            </div>
                            <div className="text-[11.5px] text-ink/60">
                              Deliverables: {post.deliverables_summary}
                            </div>
                          </div>

                          <div className="text-right space-y-0.5">
                            <div className="flex items-center justify-end gap-1 text-ink/75 font-medium">
                              <MapPin size={12} className="text-gold" /> {post.location}
                            </div>
                            <div className="flex items-center justify-end gap-1 text-[11px] text-emerald-700 font-semibold">
                              <Navigation size={11} /> {post.venue_distance_km} km from studio
                            </div>
                          </div>
                        </div>

                        {/* Caption */}
                        <div className="p-5 sm:p-6 space-y-4">
                          <p className="text-[13.5px] text-ink/85 leading-relaxed">
                            {post.caption}
                          </p>

                          {/* Media Grid */}
                          <div
                            className={`grid gap-3 ${
                              post.media_urls.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
                            }`}
                          >
                            {post.media_urls.map((url, idx) => (
                              <img
                                key={idx}
                                src={url}
                                alt={post.project_title}
                                className="w-full h-64 object-cover rounded-xl border border-ink/10"
                              />
                            ))}
                          </div>
                        </div>

                        {/* Action Bar: Like (First Like Auto-Follows), Comment, Collaborate */}
                        <div className="px-5 sm:px-6 py-3.5 bg-canvas border-t border-ink/5 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleLikePost(post)}
                              className={`px-3.5 py-2 rounded-xl text-[12.5px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                post.liked_by_me
                                  ? 'bg-rose-500/15 text-rose-600 border border-rose-500/30'
                                  : 'bg-white border border-ink/10 text-ink/75 hover:border-gold hover:text-ink'
                              }`}
                            >
                              <Heart
                                size={15}
                                className={post.liked_by_me ? 'fill-rose-500 text-rose-500' : ''}
                              />
                              <span>
                                {post.liked_by_me ? 'Liked' : 'Like'} ({post.likes_count})
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setExpandedComments((prev) => ({
                                  ...prev,
                                  [post.id]: !prev[post.id],
                                }))
                              }
                              className="px-3.5 py-2 rounded-xl bg-white border border-ink/10 hover:border-gold text-[12.5px] font-semibold text-ink/75 hover:text-ink flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <MessageSquare size={15} />
                              <span>Comments ({post.comments.length})</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => setCollabTargetPost(post)}
                            className="px-4 py-2 rounded-xl bg-gold/20 hover:bg-gold text-ink border border-gold/40 text-[12.5px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Handshake size={15} />
                            <span>Collaborate with {post.creator_name.split(' ')[0]}</span>
                          </button>
                        </div>

                        {/* Comments Drawer */}
                        {isCommentsOpen && (
                          <div className="px-5 sm:px-6 py-4 bg-sand/40 border-t border-ink/5 space-y-3">
                            {post.comments.length > 0 && (
                              <div className="space-y-2.5">
                                {post.comments.map((cm) => (
                                  <div
                                    key={cm.id}
                                    className="p-3 rounded-xl bg-white border border-ink/10 flex items-start gap-3"
                                  >
                                    <img
                                      src={cm.author_avatar}
                                      alt={cm.author_name}
                                      className="w-8 h-8 rounded-full object-cover shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                          <span className="text-[12.5px] font-semibold text-ink">
                                            {cm.author_name}
                                          </span>
                                          <span className="px-2 py-0.5 rounded-full bg-gold/20 text-ink text-[9.5px] font-bold uppercase">
                                            {cm.author_role}
                                          </span>
                                        </div>
                                        <span className="text-[10.5px] text-ink/45">
                                          {cm.created_at}
                                        </span>
                                      </div>
                                      <p className="text-[12.5px] text-ink/75 mt-1">{cm.text}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            <form
                              onSubmit={(e) => handleAddComment(post.id, e)}
                              className="flex items-center gap-2 pt-1"
                            >
                              <input
                                type="text"
                                value={commentInputs[post.id] ?? ''}
                                onChange={(e) =>
                                  setCommentInputs((prev) => ({
                                    ...prev,
                                    [post.id]: e.target.value,
                                  }))
                                }
                                placeholder="Add a comment or collaboration note as Creator or Client..."
                                className="flex-1 bg-white border border-ink/15 rounded-xl px-3.5 py-2 text-[12.5px] outline-none focus:border-gold"
                              />
                              <button
                                type="submit"
                                className="px-4 py-2 rounded-xl bg-ink text-white hover:bg-gold hover:text-ink text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Send size={13} />
                                <span>Post</span>
                              </button>
                            </form>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>

              {/* Right 4 Columns: Followers Only ("Show who is following me, don't show who I'm following") + Collaboration Requests (Accept / Decline) */}
              <div className="xl:col-span-4 space-y-6">
                {/* 1. Collaboration Requests Inbox (Accept or Decline) */}
                <section className="bg-white border border-ink/10 rounded-2xl p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-ink/10 pb-3">
                    <div>
                      <div className="text-[10.5px] uppercase tracking-[0.14em] text-gold font-bold flex items-center gap-1.5">
                        <Handshake size={13} /> Studio Collaboration Desk
                      </div>
                      <h3 className="font-serif text-[19px] font-semibold mt-0.5">
                        Collaboration Requests ({feed.collaborations.length})
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {feed.collaborations.map((col) => (
                      <div
                        key={col.id}
                        className="p-3.5 rounded-xl border border-ink/10 bg-canvas space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={col.requester_avatar}
                              alt={col.requester_name}
                              className="w-9 h-9 rounded-full object-cover border border-gold/40 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-[13px] text-ink truncate">
                                  {col.requester_name}
                                </span>
                                <span className="px-1.5 py-0.5 rounded-full bg-gold/20 text-ink text-[9px] font-bold uppercase">
                                  {col.requester_role}
                                </span>
                              </div>
                              <div className="text-[11px] text-gold font-medium truncate">
                                {col.proposed_role}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] text-ink/45 shrink-0">{col.created_at}</span>
                        </div>

                        <div className="text-[11.5px] text-ink/70 bg-white p-2.5 rounded-lg border border-ink/5">
                          <div className="font-semibold text-ink">{col.project_title}</div>
                          <div className="text-[11px] text-ink/55">
                            {col.proposed_date} • {col.budget_or_split}
                          </div>
                          <p className="mt-1 text-ink/75">{col.message}</p>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <span
                            className={`text-[10.5px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                              col.status === 'accepted'
                                ? 'bg-emerald-500/15 text-emerald-700'
                                : col.status === 'declined'
                                  ? 'bg-rose-500/15 text-rose-700'
                                  : 'bg-gold/20 text-ink'
                            }`}
                          >
                            {col.status}
                          </span>

                          {col.status === 'pending' && (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleRespondCollaboration(col.id, 'accept')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <Check size={12} />
                                <span>Accept</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRespondCollaboration(col.id, 'decline')}
                                className="px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-600 hover:bg-rose-500/10 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <X size={12} />
                                <span>Decline</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 2. Who Is Following Me (Followers ONLY — deliberately hides "Following" per privacy rule) */}
                <section className="bg-forest text-canvas border border-gold/30 rounded-2xl p-5 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between border-b border-canvas/10 pb-3">
                    <div>
                      <div className="text-[10.5px] uppercase tracking-[0.14em] text-gold font-bold flex items-center gap-1.5">
                        <Award size={13} /> Studio Audience
                      </div>
                      <h3 className="font-serif text-[19px] font-bold text-white mt-0.5">
                        Who Is Following You ({feed.followers.length})
                      </h3>
                      <p className="text-[11.5px] text-canvas/65">
                        Creators & clients following your studio (your outgoing following list is
                        kept private).
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {feed.followers.map((fol) => (
                      <div
                        key={fol.id}
                        className="p-3 rounded-xl bg-forest-dark/80 border border-canvas/10 hover:border-gold transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={fol.avatar}
                            alt={fol.name}
                            className="w-9 h-9 rounded-full object-cover border border-gold/40 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[13px] font-semibold text-white truncate">
                                {fol.name}
                              </span>
                              <span className="px-1.5 py-0.5 rounded-full bg-gold/20 text-gold text-[9.5px] font-bold uppercase">
                                {fol.role}
                              </span>
                            </div>
                            <div className="text-[11px] text-canvas/65 truncate">
                              {fol.specialization}
                            </div>
                            <div className="text-[10px] text-emerald-400 mt-0.5">
                              Followed {fol.followed_at}
                              {fol.auto_followed_via_like ? ' • Auto-followed on first like' : ''}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </main>

          {/* Modal 1: Share Completed Job to Community (ONLY Completed projects allowed) */}
          {isShareModalOpen && (
            <Modal
              open
              onOpenChange={(next) => !next && setIsShareModalOpen(false)}
              size="md"
              title="Share Completed Studio Job to Community"
            >
              <form onSubmit={handleShareCompletedJob} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-sand border border-gold/40 text-[12.5px] text-ink/80 flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-gold shrink-0 mt-0.5" />
                  <span>
                    <strong>Verified Portfolio Policy:</strong> Only projects marked{' '}
                    <strong>Completed</strong> in your studio workspace can be shared to the
                    Community feed.
                  </span>
                </div>

                <div>
                  <label className="block text-[11.5px] font-semibold uppercase tracking-wider text-ink/60 mb-1">
                    Select Completed Studio Project
                  </label>
                  <select
                    value={selectedCompletedId}
                    onChange={(e) => setSelectedCompletedId(Number(e.target.value))}
                    className="w-full border border-ink/15 rounded-xl px-3.5 py-2.5 text-[13px] font-medium outline-none focus:border-gold bg-white"
                  >
                    {completedProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        ✓ {p.name} — {p.clientName} ({p.location})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11.5px] font-semibold uppercase tracking-wider text-ink/60 mb-1">
                    Production Story, Lighting Setup & Collaboration Callout
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={shareCaption}
                    onChange={(e) => setShareCaption(e.target.value)}
                    placeholder="Share your lighting setup, lens choices, deliverable highlights, and what kind of creator or client collaborations you are open to..."
                    className="w-full border border-ink/15 rounded-xl p-3.5 text-[13px] outline-none focus:border-gold"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-ink/15 text-[12.5px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gold text-ink font-semibold text-[12.5px] hover:bg-gold-dark flex items-center gap-1.5 cursor-pointer"
                  >
                    <Share2 size={14} />
                    <span>Publish Completed Job to Community</span>
                  </button>
                </div>
              </form>
            </Modal>
          )}

          {/* Modal 2: Propose Collaboration with Creator */}
          {collabTargetPost && (
            <Modal
              open
              onOpenChange={(next) => !next && setCollabTargetPost(null)}
              size="md"
              title={`Collaborate with ${collabTargetPost.creator_name}`}
            >
              <form onSubmit={handleSendCollaboration} className="space-y-4">
                <p className="text-[13px] text-ink/65">
                  Send a direct collaboration proposal referencing{' '}
                  <strong className="text-ink">{collabTargetPost.project_title}</strong>.{' '}
                  {collabTargetPost.creator_name} can accept or decline from their Collaboration
                  Desk.
                </p>

                <div>
                  <label className="block text-[11.5px] font-semibold uppercase tracking-wider text-ink/60 mb-1">
                    Proposed Collaboration Role
                  </label>
                  <input
                    type="text"
                    required
                    value={proposedRole}
                    onChange={(e) => setProposedRole(e.target.value)}
                    className="w-full border border-ink/15 rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-gold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11.5px] font-semibold uppercase tracking-wider text-ink/60 mb-1">
                      Target Shoot Date
                    </label>
                    <input
                      type="text"
                      required
                      value={proposedDate}
                      onChange={(e) => setProposedDate(e.target.value)}
                      className="w-full border border-ink/15 rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold uppercase tracking-wider text-ink/60 mb-1">
                      Day Rate / Revenue Split
                    </label>
                    <input
                      type="text"
                      required
                      value={budgetOrSplit}
                      onChange={(e) => setBudgetOrSplit(e.target.value)}
                      className="w-full border border-ink/15 rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11.5px] font-semibold uppercase tracking-wider text-ink/60 mb-1">
                    Collaboration Brief & Gear/Project Notes
                  </label>
                  <textarea
                    rows={3}
                    value={collabMessage}
                    onChange={(e) => setCollabMessage(e.target.value)}
                    placeholder="Describe the project scope, location, and how you'd like to work together..."
                    className="w-full border border-ink/15 rounded-xl p-3 text-[13px] outline-none focus:border-gold"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCollabTargetPost(null)}
                    className="px-4 py-2 rounded-xl border border-ink/15 text-[12.5px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gold text-ink font-semibold text-[12.5px] hover:bg-gold-dark flex items-center gap-1.5 cursor-pointer"
                  >
                    <Handshake size={14} />
                    <span>Send Collaboration Request</span>
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
