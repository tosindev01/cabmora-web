import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  Heart,
  MessageCircle,
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
  Navigation,
  Search,
  Video,
  Camera,
  Briefcase,
  Play,
  MoreVertical,
  Bell,
  BookOpen,
  ChevronDown,
  Smile,
  Home,
  Compass,
  Plus,
  UserCheck,
  ArrowRight,
  Clapperboard,
} from 'lucide-react';
import { Modal } from '@cabmora/ui';
import { PortalAvatar, PortalShell, PortalTopbar } from '@/shared/portal';
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

type CommunityCategoryFilter = 'all' | 'videos' | 'photos' | 'creators' | 'jobs' | 'collaborate';
type BottomNavTab = 'home' | 'explore' | 'activity' | 'profile';

interface NearbyCreatorProfile {
  id: string;
  name: string;
  handle: string;
  location: string;
  distanceKm: number;
  roleLabel: string;
  avatar: string;
  online: boolean;
  verified: boolean;
  completedJobsCount: number;
}

const NEARBY_CREATORS: NearbyCreatorProfile[] = [
  {
    id: 'creator-klemzy',
    name: 'Klemzy Films',
    handle: '@klemzy_films',
    location: 'Lagos, Nigeria',
    distanceKm: 4.2,
    roleLabel: '4K Music Video & Cinema Director',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop',
    online: true,
    verified: true,
    completedJobsCount: 28,
  },
  {
    id: 'creator-grace',
    name: 'Grace Visuals',
    handle: '@grace_visuals',
    location: 'Lagos, Nigeria',
    distanceKm: 6.8,
    roleLabel: 'Luxury Editorial & Sunset Photographer',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop',
    online: true,
    verified: true,
    completedJobsCount: 34,
  },
  {
    id: 'creator-lenspro',
    name: 'Lens Pro',
    handle: '@lenspro_uk',
    location: 'London, UK',
    distanceKm: 2.4,
    roleLabel: 'Anamorphic DOP & Gimbal Operator',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    online: true,
    verified: true,
    completedJobsCount: 19,
  },
  {
    id: 'creator-dara',
    name: 'Dara Shots',
    handle: '@dara_shots',
    location: 'London, UK',
    distanceKm: 5.1,
    roleLabel: 'Fashion Campaign & Beauty Retoucher',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
    online: true,
    verified: true,
    completedJobsCount: 41,
  },
  {
    id: 'creator-tunde',
    name: 'Tunde Media',
    handle: '@tunde_media',
    location: 'Manchester, UK',
    distanceKm: 9.3,
    roleLabel: 'Aerial Drone & Commercial Producer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    online: true,
    verified: true,
    completedJobsCount: 23,
  },
  {
    id: 'creator-sarah',
    name: 'Sarah Cabmora',
    handle: '@sarahcabmora_studio',
    location: 'London, UK',
    distanceKm: 1.2,
    roleLabel: 'Lead Editorial & Destination Wedding',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    online: true,
    verified: true,
    completedJobsCount: 52,
  },
];

function getPostHashtags(post: CommunityPostDto): string[] {
  if (post.creator_name.toLowerCase().includes('klemzy')) {
    return ['#MusicVideo', '#Filmmaking', '#CreativeLife', '#4KAnamorphic'];
  }
  if (post.creator_name.toLowerCase().includes('grace')) {
    return ['#GoldenHour', '#EditorialPhotography', '#LuxuryVisuals', '#CompletedJob'];
  }
  if (post.project_type.toLowerCase().includes('wedding')) {
    return ['#DestinationWedding', '#CinemaDelivery', '#CabmoraStudio', '#ColorGrading'];
  }
  if (post.project_type.toLowerCase().includes('editorial')) {
    return ['#HauteCouture', '#FashionEditorial', '#ParisLookbook', '#StudioDelivery'];
  }
  return ['#MediumFormat', '#PortraitSession', '#GoldenHour', '#VerifiedDelivery'];
}

function isVideoPost(post: CommunityPostDto): boolean {
  const combined =
    `${post.project_title} ${post.deliverables_summary} ${post.caption} ${post.creator_specialization}`.toLowerCase();
  return (
    combined.includes('video') ||
    combined.includes('film') ||
    combined.includes('cinema') ||
    combined.includes('4k') ||
    combined.includes('anamorphic')
  );
}

export default function CommunityPage() {
  const { user } = useAuth();
  const isClientViewer = user?.role === 'customer';
  const [feed, setFeed] = useState<CommunityFeedDto>(() => getCommunityState());
  const [toast, setToast] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [shareCounts, setShareCounts] = useState<Record<string, number>>({
    'post-100': 12,
    'post-100b': 9,
    'post-101': 15,
    'post-102': 18,
    'post-103': 11,
  });

  // Reference UI Interactive Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CommunityCategoryFilter>('videos');
  const [activeBottomTab, setActiveBottomTab] = useState<BottomNavTab>('home');
  const [selectedCreatorFilter, setSelectedCreatorFilter] = useState<string | null>(null);
  const [nearbyLocationActive, setNearbyLocationActive] = useState(false);
  const [studioLocationLabel, setStudioLocationLabel] = useState('London, UK');
  const [showAllCreatorsModal, setShowAllCreatorsModal] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Share Completed Job Modal State (The ONLY way to post to Community)
  const completedProjects = INITIAL_PROJECTS.filter((p) => p.status === 'Completed');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedCompletedId, setSelectedCompletedId] = useState<number>(
    completedProjects[0]?.id ?? 4,
  );
  const [shareCaption, setShareCaption] = useState('');

  // Collaborate / Book Proposal Modal State
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

  const filteredPosts = useMemo(() => {
    return feed.posts.filter((post) => {
      if (selectedCreatorFilter && post.creator_id !== selectedCreatorFilter) {
        const matchByName = post.creator_name
          .toLowerCase()
          .includes(selectedCreatorFilter.replace('creator-', ''));
        if (!matchByName) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          post.creator_name.toLowerCase().includes(q) ||
          post.location.toLowerCase().includes(q) ||
          post.project_title.toLowerCase().includes(q) ||
          post.caption.toLowerCase().includes(q) ||
          post.project_type.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      if (activeCategory === 'photos') {
        return !isVideoPost(post);
      }
      // Keep 'videos', 'all', 'creators', 'jobs', 'collaborate' showing rich feed posts
      return true;
    });
  }, [feed.posts, selectedCreatorFilter, searchQuery, activeCategory]);

  const pendingCollaborationsCount = feed.collaborations.filter(
    (c) => c.status === 'pending',
  ).length;

  const handleUseMyLocation = () => {
    const nextState = !nearbyLocationActive;
    setNearbyLocationActive(nextState);
    if (nextState) {
      setStudioLocationLabel('London, UK • Within 15 km');
      showToast('GPS Location active: Prioritizing verified creators & shoots near London, UK.');
    } else {
      setStudioLocationLabel('London, UK');
      showToast('Showing global Cabmora Community feed.');
    }
  };

  const handleLikePost = (post: CommunityPostDto) => {
    const { state, autoFollowedCreatorName } = toggleCommunityPostLike(post.id);
    setFeed(state);
    if (autoFollowedCreatorName) {
      showToast(
        `First Like: You liked this completed project & automatically followed ${autoFollowedCreatorName}!`,
      );
    }
  };

  const handleSharePostLink = (post: CommunityPostDto) => {
    setShareCounts((prev) => ({
      ...prev,
      [post.id]: (prev[post.id] ?? 12) + 1,
    }));
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(`${window.location.origin}/community?post=${post.id}`);
    }
    showToast(`Copied showcase link for ${post.creator_name}'s completed job!`);
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
    showToast(`Completed job "${proj.name}" published to Cabmora Community!`);
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
      requesterName:
        user?.full_name || (isClientViewer ? 'Elena Vance (Client)' : 'Sarah Cabmora'),
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

  const openBookOrCollabForCreator = (creator: NearbyCreatorProfile) => {
    const matchingPost =
      feed.posts.find(
        (p) =>
          p.creator_id === creator.id ||
          p.creator_name.toLowerCase() === creator.name.toLowerCase(),
      ) ?? {
        id: `post-${creator.id}`,
        project_id: 'comp-nearby',
        project_title: `${creator.name} — Verified Studio Collaboration`,
        project_type: 'Commercial',
        client_name: 'Cabmora Studio Network',
        location: creator.location,
        venue_distance_km: creator.distanceKm,
        completed_date: 'Verified Creator',
        deliverables_summary: creator.roleLabel,
        creator_id: creator.id,
        creator_name: creator.name,
        creator_handle: creator.handle,
        creator_specialization: creator.roleLabel,
        creator_avatar: creator.avatar,
        caption: '',
        media_urls: [],
        likes_count: 100,
        liked_by_me: false,
        comments: [],
        created_at: 'Just now',
      };
    setCollabTargetPost(matchingPost);
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
            title="Cabmora Community"
            subtitle="Connect • Collaborate • Grow — Verified completed studio jobs & nearby creators"
            icon={Users}
            onToggleSidebar={toggleSidebar}
          >
            {!isClientViewer && (
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gold text-ink text-[12px] font-semibold hover:bg-gold-dark transition-colors cursor-pointer shadow-sm"
              >
                <Plus size={14} />
                <span>Post Completed Job</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsNotificationsModalOpen(true)}
              aria-label="Open Studio Collaboration Notifications"
              title="Collaboration Requests & Notifications"
              className="relative w-10 h-10 rounded-full border border-ink/10 hover:border-gold flex items-center justify-center transition-colors cursor-pointer"
            >
              <Bell size={18} />
              {feed.collaborations.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
                  {pendingCollaborationsCount || feed.collaborations.length}
                </span>
              )}
            </button>
            <PortalAvatar
              src={
                user?.avatar_url ||
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'
              }
            />
          </PortalTopbar>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-canvas">
            <div className="max-w-[920px] mx-auto">
              {/* ── MAIN COMMUNITY FEED (Full-Width Centered Layout in Cabmora Forest & Gold Colors) ── */}
              <div className="min-w-0">
                <div className="bg-forest-dark text-canvas rounded-3xl border border-gold/30 shadow-2xl overflow-hidden">
                  {/* 1. HERO COMMUNITY HEADER (Layout from reference image, styled in Cabmora Forest & Gold) */}
                  <div className="relative px-5 sm:px-8 pt-7 pb-6 bg-gradient-to-b from-forest via-forest-dark to-forest-dark border-b border-canvas/10">
                    {/* Decorative subtle clapperboard watermark on right */}
                    <Clapperboard
                      size={120}
                      className="hidden sm:block absolute right-6 top-6 text-gold/10 -rotate-12 pointer-events-none"
                    />

                    <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                      {/* Top-Left: CABMORA Community Brand Lockup */}
                      <div className="text-center sm:text-left space-y-1">
                        <div className="inline-flex items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/50 flex items-center justify-center font-serif font-bold text-gold text-[18px] shadow-md">
                            CM
                          </div>
                          <div>
                            <div className="text-[12px] font-bold uppercase tracking-[0.24em] text-canvas/90 leading-none">
                              CABMORA
                            </div>
                            <h1 className="font-serif text-[26px] sm:text-[30px] font-bold text-gold leading-tight">
                              Community
                            </h1>
                          </div>
                        </div>
                        <p className="text-[12px] italic text-canvas/75 tracking-wide">
                          Connect • Collaborate • Grow
                        </p>
                      </div>

                      {/* Top-Center: Circular Double-Gold Ring Cabmora Media Studio Medallion */}
                      <div className="flex flex-col items-center">
                        <div className="relative">
                          {/* Outer glowing gold ring */}
                          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-gold-deep via-gold to-gold-tint shadow-xl">
                            <div className="w-full h-full rounded-full bg-canvas text-forest flex flex-col items-center justify-center border-2 border-forest p-2 text-center">
                              <span className="font-serif font-black text-[22px] leading-none text-forest tracking-tight">
                                CM
                              </span>
                              <span className="text-[9.5px] font-extrabold uppercase tracking-[0.16em] text-forest mt-1">
                                CABMORA
                              </span>
                              <span className="text-[7.5px] font-bold uppercase tracking-[0.2em] text-gold-deep">
                                MEDIA
                              </span>
                            </div>
                          </div>

                          {/* Top-Right Notification Bell Badge on Medallion */}
                          <button
                            type="button"
                            onClick={() => setIsNotificationsModalOpen(true)}
                            title="View Studio Collaboration Desk & Requests"
                            className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-danger text-white border-2 border-forest-dark flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform"
                          >
                            <Bell size={14} className="fill-white" />
                            {pendingCollaborationsCount > 0 && (
                              <span className="sr-only">
                                {pendingCollaborationsCount} pending requests
                              </span>
                            )}
                          </button>

                          {/* Bottom-Right Verified Badge on Medallion */}
                          <div
                            title="Verified Cabmora Studio"
                            className="absolute bottom-1 right-0 w-7 h-7 rounded-full bg-gold text-ink border-2 border-forest-dark flex items-center justify-center shadow-md"
                          >
                            <CheckCircle2 size={15} />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setStudioLocationLabel((prev) =>
                              prev.includes('London') ? 'Lagos, Nigeria' : 'London, UK',
                            )
                          }
                          className="mt-2.5 inline-flex items-center gap-1 text-[14px] font-semibold text-white hover:text-gold transition-colors cursor-pointer"
                        >
                          <span>Cabmora Media Ltd</span>
                          <ChevronDown size={14} className="text-gold" />
                        </button>

                        <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-light/90 border border-gold/30 text-[11.5px] text-canvas/90 font-medium">
                          <MapPin size={11} className="text-gold" />
                          <span>{studioLocationLabel}</span>
                        </div>
                      </div>

                      {/* Top-Right: Search Circle & Book / Collaborate Circle Buttons */}
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => searchInputRef.current?.focus()}
                          title="Search creators"
                          className="w-12 h-12 rounded-full bg-forest-light/80 border border-canvas/15 hover:border-gold text-canvas hover:text-gold flex items-center justify-center transition-all cursor-pointer shadow-md"
                        >
                          <Search size={19} />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const firstPost = feed.posts[0];
                            if (firstPost) setCollabTargetPost(firstPost);
                          }}
                          className="h-12 px-4 rounded-full bg-forest-light/80 border border-gold/40 hover:bg-gold hover:text-ink text-canvas flex flex-col items-center justify-center transition-all cursor-pointer shadow-md"
                        >
                          <BookOpen size={15} className="text-gold group-hover:text-ink" />
                          <span className="text-[10.5px] font-bold leading-tight mt-0.5">Book</span>
                        </button>
                      </div>
                    </div>

                    {/* 2. SEARCH BAR WITH "Use My Location" */}
                    <div className="mt-6 flex items-center bg-forest/95 border border-canvas/15 focus-within:border-gold rounded-full px-4 py-2.5 shadow-inner">
                      <Search size={18} className="text-canvas/55 shrink-0" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search creators near you..."
                        className="flex-1 bg-transparent px-3 text-[13.5px] text-white placeholder:text-canvas/50 outline-none"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="text-canvas/50 hover:text-white mr-2 cursor-pointer"
                        >
                          <X size={15} />
                        </button>
                      )}
                      <div className="h-5 w-px bg-canvas/15 mx-2" />
                      <button
                        type="button"
                        onClick={handleUseMyLocation}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold transition-colors cursor-pointer ${
                          nearbyLocationActive
                            ? 'bg-gold text-ink'
                            : 'text-gold hover:bg-forest-light'
                        }`}
                      >
                        <Navigation size={13} className="fill-current" />
                        <span>Use My Location</span>
                      </button>
                    </div>

                    {/* 3. CATEGORY FILTER PILLS: Videos | Photos | Creators | Jobs | Collaborate */}
                    <div className="mt-4 flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                      {(
                        [
                          { id: 'videos', label: 'Videos', icon: Video },
                          { id: 'photos', label: 'Photos', icon: Camera },
                          { id: 'creators', label: 'Creators', icon: Users },
                          { id: 'jobs', label: 'Jobs', icon: Briefcase },
                          { id: 'collaborate', label: 'Collaborate', icon: Handshake },
                        ] as const
                      ).map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeCategory === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                              setActiveCategory(isActive ? 'all' : tab.id);
                              if (tab.id === 'creators') {
                                setShowAllCreatorsModal(true);
                              } else if (tab.id === 'jobs' && !isClientViewer) {
                                setIsShareModalOpen(true);
                              } else if (tab.id === 'collaborate') {
                                setIsNotificationsModalOpen(true);
                              }
                            }}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-[12.5px] font-semibold shrink-0 transition-all cursor-pointer ${
                              isActive
                                ? 'bg-gold text-ink shadow-md'
                                : 'bg-forest-light/70 text-canvas/90 border border-canvas/15 hover:border-gold/50'
                            }`}
                          >
                            <Icon size={15} />
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* 4. NEARBY CREATORS CAROUSEL */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="inline-flex items-center gap-2 text-[15px] font-bold text-white">
                          <MapPin size={16} className="text-gold fill-gold/20" />
                          <span>Nearby Creators</span>
                          {selectedCreatorFilter && (
                            <button
                              type="button"
                              onClick={() => setSelectedCreatorFilter(null)}
                              className="ml-2 px-2.5 py-0.5 rounded-full bg-gold/20 text-gold text-[11px] font-semibold hover:bg-gold hover:text-ink cursor-pointer"
                            >
                              Clear filter ✕
                            </button>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowAllCreatorsModal(true)}
                          className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-gold hover:underline cursor-pointer"
                        >
                          <span>See all</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {NEARBY_CREATORS.map((creator) => {
                          const isSelected = selectedCreatorFilter === creator.id;
                          return (
                            <div
                              key={creator.id}
                              className="flex flex-col items-center text-center group"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedCreatorFilter(isSelected ? null : creator.id)
                                }
                                className="relative cursor-pointer focus:outline-none"
                              >
                                <div
                                  className={`w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full p-[2.5px] transition-transform group-hover:scale-105 ${
                                    isSelected
                                      ? 'bg-gold ring-2 ring-gold/60'
                                      : 'bg-gradient-to-tr from-gold-deep via-gold to-gold-tint'
                                  }`}
                                >
                                  <img
                                    src={creator.avatar}
                                    alt={creator.name}
                                    className="w-full h-full rounded-full object-cover border-2 border-forest-dark"
                                  />
                                </div>
                                {/* Online Green Indicator Dot */}
                                <span
                                  title="Online & Open to Collaborate"
                                  className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-forest-dark"
                                />
                              </button>
                              <button
                                type="button"
                                onClick={() => openBookOrCollabForCreator(creator)}
                                className="mt-2 text-[12px] font-semibold text-canvas/90 group-hover:text-gold truncate max-w-[100px] cursor-pointer"
                              >
                                {creator.name}
                              </button>
                              <span className="text-[10px] text-canvas/55">
                                {creator.distanceKm} km
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Verified Completed-Job Rule Pill Bar */}
                  <div className="px-5 sm:px-8 py-3 bg-forest border-b border-canvas/10 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-[11.5px] text-canvas/85">
                      <Lock size={13} className="text-gold shrink-0" />
                      <span>
                        <strong className="text-gold">Verified Portfolio Feed:</strong> Only{' '}
                        <strong>Completed Studio Jobs</strong> can be posted. First like on any post
                        automatically follows the creator.
                      </span>
                    </div>
                    {!isClientViewer && (
                      <button
                        type="button"
                        onClick={() => setIsShareModalOpen(true)}
                        className="px-3.5 py-1.5 rounded-full bg-gold text-ink font-bold text-[11.5px] hover:bg-gold-dark flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Share2 size={12} />
                        <span>Share Completed Job ({completedProjects.length})</span>
                      </button>
                    )}
                  </div>

                  {/* 5. COMMUNITY FEED CARDS (Exact layout from reference image) */}
                  <div className="p-4 sm:p-6 space-y-5 bg-forest-dark">
                    {filteredPosts.length === 0 ? (
                      <div className="p-10 rounded-2xl bg-forest border border-canvas/10 text-center space-y-3">
                        <p className="text-[14px] text-canvas/75">
                          No completed project posts matched your filter.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedCreatorFilter(null);
                            setActiveCategory('all');
                          }}
                          className="px-4 py-2 rounded-xl bg-gold text-ink text-[12.5px] font-semibold cursor-pointer"
                        >
                          Reset Filters
                        </button>
                      </div>
                    ) : (
                      filteredPosts.map((post) => {
                        const isAutoFollowed =
                          post.liked_by_me ||
                          feed.auto_followed_creator_ids.includes(post.creator_id);
                        const isCommentsOpen = Boolean(expandedComments[post.id]);
                        const hashtags = getPostHashtags(post);
                        const videoBadge = isVideoPost(post);
                        const shareCount = shareCounts[post.id] ?? 12;

                        return (
                          <article
                            key={post.id}
                            className="bg-forest border border-canvas/12 hover:border-gold/45 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl transition-all"
                          >
                            {/* Post Creator Header */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-gold-deep via-gold to-gold-tint shrink-0">
                                  <img
                                    src={post.creator_avatar}
                                    alt={post.creator_name}
                                    className="w-full h-full rounded-full object-cover border border-forest-dark"
                                  />
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <h3 className="text-[16px] sm:text-[17px] font-bold text-white">
                                      {post.creator_name}
                                    </h3>
                                    <span
                                      title="Verified Cabmora Creator"
                                      className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gold text-ink"
                                    >
                                      <Check size={11} strokeWidth={3} />
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-forest-light text-gold text-[10px] font-bold uppercase tracking-wider border border-gold/25">
                                      ✓ Completed Job
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[12px] text-canvas/65 mt-0.5">
                                    <MapPin size={12} className="text-gold shrink-0" />
                                    <span>{post.location}</span>
                                    <span>•</span>
                                    <span>{post.created_at}</span>
                                    <span className="hidden sm:inline text-gold/80">
                                      • {post.venue_distance_km} km away
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => setCollabTargetPost(post)}
                                title="Collaborate or Book Creator"
                                className="p-2 rounded-full text-canvas/60 hover:text-gold hover:bg-forest-light transition-colors cursor-pointer"
                              >
                                <MoreVertical size={18} />
                              </button>
                            </div>

                            {/* Post Caption + Hashtags */}
                            <div className="space-y-1.5">
                              <p className="text-[14.5px] text-white/95 leading-relaxed">
                                {post.caption}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-gold">
                                {hashtags.map((tag) => (
                                  <span key={tag} className="hover:underline cursor-pointer">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Hero Media Frame with top-right 00:35 / Deliverable overlay */}
                            <div className="relative rounded-2xl overflow-hidden border border-canvas/10 bg-forest-dark">
                              <img
                                src={post.media_urls[0]}
                                alt={post.project_title}
                                className="w-full h-64 sm:h-80 object-cover"
                              />

                              {/* Top-Right Video Duration / Photo Badge (Matches ▶ 00:35 in reference UI) */}
                              <div className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full bg-forest-dark/85 backdrop-blur-md border border-canvas/15 text-white text-[12px] font-semibold flex items-center gap-1.5 shadow-lg">
                                {videoBadge ? (
                                  <>
                                    <Play size={12} className="fill-white text-white" />
                                    <span>00:35</span>
                                  </>
                                ) : (
                                  <>
                                    <Camera size={12} className="text-gold" />
                                    <span>{post.project_type}</span>
                                  </>
                                )}
                              </div>

                              {/* Bottom Verified Completed Project Overlay Bar */}
                              <div className="absolute inset-x-0 bottom-0 p-3.5 bg-gradient-to-t from-forest-dark/95 via-forest-dark/70 to-transparent flex flex-wrap items-end justify-between gap-2">
                                <div>
                                  <div className="text-[10px] uppercase tracking-wider font-bold text-gold">
                                    {post.project_type} • Client: {post.client_name}
                                  </div>
                                  <div className="text-[13.5px] font-serif font-bold text-white">
                                    {post.project_title}
                                  </div>
                                </div>
                                <span className="text-[11px] text-canvas/80 bg-forest/80 px-2.5 py-1 rounded-lg border border-canvas/10">
                                  {post.deliverables_summary}
                                </span>
                              </div>
                            </div>

                            {/* Secondary thumbnails if post has multiple images */}
                            {post.media_urls.length > 1 && (
                              <div className="grid grid-cols-2 gap-2.5">
                                {post.media_urls.slice(1).map((url, idx) => (
                                  <img
                                    key={idx}
                                    src={url}
                                    alt={`${post.project_title} frame ${idx + 2}`}
                                    className="w-full h-36 object-cover rounded-xl border border-canvas/10"
                                  />
                                ))}
                              </div>
                            )}

                            {/* Engagement Bar: ❤️ 243   💬 48   ↗ 12   |   👥 Following ▾ */}
                            <div className="pt-1 flex items-center justify-between gap-3 border-t border-canvas/10">
                              <div className="flex items-center gap-5">
                                <button
                                  type="button"
                                  onClick={() => handleLikePost(post)}
                                  className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-canvas/90 hover:text-gold transition-colors cursor-pointer"
                                >
                                  <Heart
                                    size={19}
                                    className={
                                      post.liked_by_me
                                        ? 'fill-danger text-danger scale-110 transition-transform'
                                        : 'text-canvas/80'
                                    }
                                  />
                                  <span>{post.likes_count}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedComments((prev) => ({
                                      ...prev,
                                      [post.id]: !prev[post.id],
                                    }))
                                  }
                                  className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-canvas/90 hover:text-gold transition-colors cursor-pointer"
                                >
                                  <MessageCircle size={19} className="text-canvas/80" />
                                  <span>{post.comments.length}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleSharePostLink(post)}
                                  className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-canvas/90 hover:text-gold transition-colors cursor-pointer"
                                >
                                  <Share2 size={18} className="text-canvas/80" />
                                  <span>{shareCount}</span>
                                </button>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="h-4 w-px bg-canvas/15" />
                                {isAutoFollowed ? (
                                  <button
                                    type="button"
                                    onClick={() => setCollabTargetPost(post)}
                                    title="Auto-followed on first like • Click to propose collaboration"
                                    className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-gold hover:text-gold-tint cursor-pointer"
                                  >
                                    <Users size={15} className="text-gold" />
                                    <span>Following</span>
                                    <ChevronDown size={13} />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setCollabTargetPost(post)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 border border-gold/40 text-[12px] font-bold text-gold hover:bg-gold hover:text-ink transition-colors cursor-pointer"
                                  >
                                    <Handshake size={14} />
                                    <span>Collaborate</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Expandable Comments Thread */}
                            {isCommentsOpen && post.comments.length > 0 && (
                              <div className="space-y-2.5 pt-1">
                                {post.comments.map((cm) => (
                                  <div
                                    key={cm.id}
                                    className="p-3 rounded-2xl bg-forest-dark/90 border border-canvas/10 flex items-start gap-3"
                                  >
                                    <img
                                      src={cm.author_avatar}
                                      alt={cm.author_name}
                                      className="w-8 h-8 rounded-full object-cover border border-gold/40 shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                          <span className="text-[12.5px] font-semibold text-white">
                                            {cm.author_name}
                                          </span>
                                          <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold text-[9.5px] font-bold uppercase">
                                            {cm.author_role}
                                          </span>
                                        </div>
                                        <span className="text-[10.5px] text-canvas/45">
                                          {cm.created_at}
                                        </span>
                                      </div>
                                      <p className="text-[12.5px] text-canvas/80 mt-1">{cm.text}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Inline Comment Input Bar (Avatar + Pill Input + Emoji + Gold Send Plane) */}
                            <form
                              onSubmit={(e) => handleAddComment(post.id, e)}
                              className="flex items-center gap-3 pt-1"
                            >
                              <img
                                src={
                                  user?.avatar_url ||
                                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'
                                }
                                alt="Your avatar"
                                className="w-9 h-9 rounded-full object-cover border border-gold/50 shrink-0"
                              />
                              <div className="flex-1 flex items-center bg-forest-dark/95 border border-canvas/15 focus-within:border-gold rounded-full px-4 py-2">
                                <input
                                  type="text"
                                  value={commentInputs[post.id] ?? ''}
                                  onChange={(e) =>
                                    setCommentInputs((prev) => ({
                                      ...prev,
                                      [post.id]: e.target.value,
                                    }))
                                  }
                                  placeholder="Add a comment..."
                                  className="flex-1 bg-transparent text-[13px] text-white placeholder:text-canvas/45 outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setCommentInputs((prev) => ({
                                      ...prev,
                                      [post.id]: `${prev[post.id] ?? ''} 🔥🎬`,
                                    }))
                                  }
                                  title="Add reaction"
                                  className="text-canvas/55 hover:text-gold mr-2.5 cursor-pointer"
                                >
                                  <Smile size={17} />
                                </button>
                                <button
                                  type="submit"
                                  title="Send comment"
                                  className="text-gold hover:text-gold-tint cursor-pointer"
                                >
                                  <Send size={16} />
                                </button>
                              </div>
                            </form>
                          </article>
                        );
                      })
                    )}
                  </div>

                  {/* 6. BOTTOM APP NAVIGATION DOCK (Home | Explore | + Post | Activity | Profile) */}
                  <div className="sticky bottom-0 z-20 px-6 py-3 bg-forest border-t border-gold/25 flex items-center justify-around">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveBottomTab('home');
                        setSelectedCreatorFilter(null);
                        setActiveCategory('all');
                      }}
                      className={`flex flex-col items-center gap-1 text-[11.5px] font-semibold pb-1 border-b-2 transition-colors cursor-pointer ${
                        activeBottomTab === 'home'
                          ? 'text-gold border-gold'
                          : 'text-canvas/65 border-transparent hover:text-white'
                      }`}
                    >
                      <Home size={19} />
                      <span>Home</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveBottomTab('explore');
                        setShowAllCreatorsModal(true);
                      }}
                      className={`flex flex-col items-center gap-1 text-[11.5px] font-semibold pb-1 border-b-2 transition-colors cursor-pointer ${
                        activeBottomTab === 'explore'
                          ? 'text-gold border-gold'
                          : 'text-canvas/65 border-transparent hover:text-white'
                      }`}
                    >
                      <Compass size={19} />
                      <span>Explore</span>
                    </button>

                    {/* Center Raised Gold + Post Button */}
                    <div className="flex flex-col items-center -mt-7">
                      <button
                        type="button"
                        onClick={() => {
                          if (isClientViewer) {
                            const firstPost = feed.posts[0];
                            if (firstPost) setCollabTargetPost(firstPost);
                          } else {
                            setIsShareModalOpen(true);
                          }
                        }}
                        className="w-13 h-13 rounded-full bg-gold hover:bg-gold-dark text-ink shadow-xl border-4 border-forest-dark flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
                      >
                        <Plus size={24} strokeWidth={2.5} />
                      </button>
                      <span className="text-[11px] font-semibold text-canvas/85 mt-1">
                        {isClientViewer ? 'Book' : 'Post'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveBottomTab('activity');
                        setIsNotificationsModalOpen(true);
                      }}
                      className={`relative flex flex-col items-center gap-1 text-[11.5px] font-semibold pb-1 border-b-2 transition-colors cursor-pointer ${
                        activeBottomTab === 'activity'
                          ? 'text-gold border-gold'
                          : 'text-canvas/65 border-transparent hover:text-white'
                      }`}
                    >
                      <div className="relative">
                        <Bell size={19} />
                        <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
                          {pendingCollaborationsCount || feed.collaborations.length}
                        </span>
                      </div>
                      <span>Activity</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveBottomTab('profile');
                        setIsFollowersModalOpen(true);
                      }}
                      className={`flex flex-col items-center gap-1 text-[11.5px] font-semibold pb-1 border-b-2 transition-colors cursor-pointer ${
                        activeBottomTab === 'profile'
                          ? 'text-gold border-gold'
                          : 'text-canvas/65 border-transparent hover:text-white'
                      }`}
                    >
                      <UserCheck size={19} />
                      <span>Profile</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Modal 0: Notifications — Studio Collaboration Desk & Collaboration Requests */}
          {isNotificationsModalOpen && (
            <Modal
              open
              onOpenChange={(next) => !next && setIsNotificationsModalOpen(false)}
              size="md"
              title={`Studio Collaboration Desk • Collaboration Requests (${feed.collaborations.length})`}
            >
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-forest text-canvas border border-gold/30 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10.5px] uppercase tracking-[0.14em] text-gold font-bold flex items-center gap-1.5">
                      <Handshake size={13} /> Incoming & Active Requests
                    </div>
                    <p className="text-[12px] text-canvas/75 mt-0.5">
                      Accept or decline collaboration & booking proposals from creators and clients.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotificationsModalOpen(false);
                      setIsFollowersModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-forest-light border border-gold/30 text-gold text-[11.5px] font-semibold hover:bg-gold hover:text-ink transition-colors shrink-0 cursor-pointer"
                  >
                    Followers ({feed.followers.length})
                  </button>
                </div>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {feed.collaborations.map((col) => (
                    <div
                      key={col.id}
                      className="p-4 rounded-2xl border border-gold/25 bg-forest-dark text-canvas space-y-3 shadow-md"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={col.requester_avatar}
                            alt={col.requester_name}
                            className="w-10 h-10 rounded-full object-cover border border-gold/50 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-[13.5px] text-white truncate">
                                {col.requester_name}
                              </span>
                              <span className="px-1.5 py-0.5 rounded-full bg-gold/20 text-gold text-[9px] font-bold uppercase">
                                {col.requester_role}
                              </span>
                            </div>
                            <div className="text-[11.5px] text-gold font-medium truncate">
                              {col.proposed_role}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10.5px] text-canvas/50 shrink-0">
                          {col.created_at}
                        </span>
                      </div>

                      <div className="text-[12px] text-canvas/85 bg-forest p-3 rounded-xl border border-canvas/10">
                        <div className="font-semibold text-white">{col.project_title}</div>
                        <div className="text-[11px] text-gold/90 mt-0.5">
                          {col.proposed_date} • {col.budget_or_split}
                        </div>
                        <p className="mt-1.5 text-canvas/75 leading-relaxed">{col.message}</p>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span
                          className={`text-[10.5px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                            col.status === 'accepted'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : col.status === 'declined'
                                ? 'bg-danger/20 text-danger border border-danger/30'
                                : 'bg-gold/20 text-gold border border-gold/30'
                          }`}
                        >
                          {col.status}
                        </span>

                        {col.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleRespondCollaboration(col.id, 'accept')}
                              className="px-3.5 py-1.5 rounded-xl bg-gold text-ink hover:bg-gold-dark text-[11.5px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Check size={13} />
                              <span>Accept</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRespondCollaboration(col.id, 'decline')}
                              className="px-3.5 py-1.5 rounded-xl border border-danger/40 text-danger hover:bg-danger/15 text-[11.5px] font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <X size={13} />
                              <span>Decline</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Modal>
          )}

          {/* Modal 0B: Studio Audience — Who Is Following You (Followers Only) */}
          {isFollowersModalOpen && (
            <Modal
              open
              onOpenChange={(next) => !next && setIsFollowersModalOpen(false)}
              size="md"
              title={`Studio Audience • Who Is Following You (${feed.followers.length})`}
            >
              <div className="space-y-4">
                <p className="text-[12.5px] text-ink/70">
                  Creators & clients following your studio (your outgoing following list is kept
                  private).
                </p>
                <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                  {feed.followers.map((fol) => (
                    <div
                      key={fol.id}
                      className="p-3.5 rounded-2xl bg-forest text-canvas border border-gold/25 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={fol.avatar}
                          alt={fol.name}
                          className="w-10 h-10 rounded-full object-cover border border-gold/50 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[13.5px] font-semibold text-white truncate">
                              {fol.name}
                            </span>
                            <span className="px-1.5 py-0.5 rounded-full bg-gold/20 text-gold text-[9.5px] font-bold uppercase">
                              {fol.role}
                            </span>
                          </div>
                          <div className="text-[11.5px] text-canvas/70 truncate">
                            {fol.specialization}
                          </div>
                          <div className="text-[10.5px] text-gold mt-0.5">
                            Followed {fol.followed_at}
                            {fol.auto_followed_via_like ? ' • Auto-followed on first like' : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Modal>
          )}

          {/* Modal 1: Share Completed Job to Community (ONLY Completed projects allowed) */}
          {isShareModalOpen && (
            <Modal
              open
              onOpenChange={(next) => !next && setIsShareModalOpen(false)}
              size="md"
              title="Post Completed Studio Job to Community"
            >
              <form onSubmit={handleShareCompletedJob} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-sand border border-gold/40 text-[12.5px] text-ink/80 flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-gold shrink-0 mt-0.5" />
                  <span>
                    <strong>Verified Portfolio Policy:</strong> Only projects marked{' '}
                    <strong>Completed</strong> in your studio workspace can be shared to the
                    Cabmora Community feed.
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
                    placeholder="On set for a new shoot! Share your camera setup, deliverables, and what creator or client collaborations you're open to..."
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
                    <span>Publish Completed Job</span>
                  </button>
                </div>
              </form>
            </Modal>
          )}

          {/* Modal 2: Propose Collaboration / Book Creator */}
          {collabTargetPost && (
            <Modal
              open
              onOpenChange={(next) => !next && setCollabTargetPost(null)}
              size="md"
              title={`Collaborate with ${collabTargetPost.creator_name}`}
            >
              <form onSubmit={handleSendCollaboration} className="space-y-4">
                <p className="text-[13px] text-ink/65">
                  Send a direct collaboration or booking proposal referencing{' '}
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

          {/* Modal 3: See All Nearby Creators Directory */}
          {showAllCreatorsModal && (
            <Modal
              open
              onOpenChange={(next) => !next && setShowAllCreatorsModal(false)}
              size="md"
              title="Nearby Verified Cabmora Creators"
            >
              <div className="space-y-3">
                {NEARBY_CREATORS.map((creator) => (
                  <div
                    key={creator.id}
                    className="p-3.5 rounded-2xl border border-ink/10 bg-canvas flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={creator.avatar}
                        alt={creator.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gold shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[14px] text-ink truncate">
                            {creator.name}
                          </span>
                          <span className="text-[11px] text-gold font-semibold">
                            • {creator.distanceKm} km
                          </span>
                        </div>
                        <div className="text-[12px] text-ink/65 truncate">{creator.roleLabel}</div>
                        <div className="text-[11px] text-ink/50">
                          {creator.location} • {creator.completedJobsCount} Completed Studio Jobs
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowAllCreatorsModal(false);
                        openBookOrCollabForCreator(creator);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-forest text-canvas hover:bg-gold hover:text-ink text-[12px] font-semibold shrink-0 cursor-pointer transition-colors"
                    >
                      Collaborate
                    </button>
                  </div>
                ))}
              </div>
            </Modal>
          )}
        </>
      )}
    </PortalShell>
  );
}
