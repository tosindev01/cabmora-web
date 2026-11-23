import { isVideo } from '@/shared/media';
import {
  GalleryChips,
  matcherFor,
  type GalleryCategory,
} from '@/features/client/components/GalleryChips';
import { GalleryFolders } from '@/features/client/components/GalleryFolders';
import {
  Modal,
  PinnedCrop,
  TAP_ZOOM,
  SwipeHint,
  VideoStage,
  ZoomableImage,
  useArrowSteps,
  type ZoomableHandle,
} from '@cabmora/ui';
import { DownloadButton } from '@/features/client/components/DownloadButton';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  Share2,
  Lock,
  Star,
  ExternalLink,
  ChevronRight,
  Maximize2,
  X,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronUp,
  Filter,
  Grid,
  Paperclip,
  Check,
  ThumbsUp,
  ThumbsDown,
  Columns2,
  History,
  Crosshair,
  MapPin,
  Video,
} from 'lucide-react';
import {
  ApiError,
  collaborationApi,
  type ProjectCallDto,
  type ProjectCommentDto,
} from '@cabmora/api-client';
import { FigmaCommentWorkspace } from '@/shared/collaboration/FigmaCommentWorkspace';
import { ProjectCallPanel } from '@/shared/collaboration/ProjectCallPanel';
import { ClientPortalShell } from '@/features/client/components/ClientPortalShell';
import { useMyProject } from '@/features/client/hooks/useMyProject';
import { getMyProjectRating, rateMyProject, type ProjectRating } from '@/features/client/api';
import { useAuth } from '@/shared/auth';
import { useKeyboardInset } from '@/features/client/hooks/useKeyboardInset';
import { ShareCollectionModal } from '@/features/client/components/ShareCollectionModal';
import { listMyAssetVersions, type AssetVersion } from '@/features/client/api';

/**
 * One project, as the client sees it — gallery, comments, approval, sharing.
 *
 * Routed at /client/projects/:id: a client can have several projects, so this
 * is the per-project view rather than the whole portal. Its chrome moved into
 * `ClientPortalShell` — the same sidebar, topbar and tokens the creator
 * portal uses — so both sides of the product are one design system.
 *
 * The gallery and the conversation are real. A client sees only photographs
 * that have been released to them *and* have a watermarked preview made — so
 * this may hold fewer frames than the admin console shows for the same
 * project, which is the release gate working rather than a fault.
 *
 * Four controls are deliberately disabled and labelled: sharing, per-photo
 * approve/reject, the star rating and video. None has a server behind it yet,
 * and a control that looks live and does nothing is worse than one that says
 * so — the same reasoning as the admin console's "soon" tabs.
 */
/** Shown on every control that has no server behind it yet. */
const NOT_YET = 'Not available yet';

export default function ClientPortalPage() {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const { project, assets, comments, folders, loading, error, comment, approve } = useMyProject(id);

  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isDesignCommentsOpen, setIsDesignCommentsOpen] = useState(false);
  const [projectCalls, setProjectCalls] = useState<ProjectCallDto[]>([]);
  const [richComments, setRichComments] = useState<ProjectCommentDto[]>([]);

  useEffect(() => {
    if (!id) return;
    let active = true;
    collaborationApi
      .listProjectCalls(id)
      .then((rows) => active && setProjectCalls(rows))
      .catch(() => undefined);
    collaborationApi
      .listProjectComments(id)
      .then((rows) => active && setRichComments(rows))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [id]);
  const [rating, setRating] = useState(0);
  const [words, setWords] = useState('');
  // Off unless they say so. Writing something in a private portal is
  // not an offer to appear on a website, and defaulting this on would
  // make the consent meaningless.
  const [mayPublish, setMayPublish] = useState(false);
  // What they have already said, so the stars open where they left them and
  // the Google link appears once there is something to share.
  const [savedRating, setSavedRating] = useState<ProjectRating | null>(null);
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);
  const [hoverRating, setHoverRating] = useState(0);
  // The frames this photograph replaced, and which of them is on screen.
  // An index rather than a before/after flag, because a photograph can be
  // corrected more than once and "before" stops meaning anything when it has.
  const [versions, setVersions] = useState<AssetVersion[] | null>(null);
  const [showing, setShowing] = useState(0);
  const [sideBySide, setSideBySide] = useState(false);
  // The overlay is sized against the layout viewport, which on iOS does not
  // shrink for the keyboard — so the comment box sat behind it.
  const keyboard = useKeyboardInset();
  /* Which chip is active. Derived categories, not albums — see
     GalleryChips for why there is no "Ceremony" here. */
  const [category, setCategory] = useState<GalleryCategory>('all');
  /** Which part of the day, or `'all'`. Composes with the chip above: a
   *  folder says when, a chip says what. */
  const [folder, setFolder] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState(1);

  /* Pinning a comment to a spot. `pinning` is an explicit mode rather than
     "a tap always places a pin" — on a phone every pan would otherwise leave
     a pin behind, and the gallery would fill with accidents. */
  const [pinning, setPinning] = useState(false);
  const [pinScale, setPinScale] = useState(1);
  const [openPinId, setOpenPinId] = useState<string | null>(null);
  /** Whether the feedback sheet is open on a phone. Ignored from `md` up,
   *  where it is a side panel with room of its own.
   *
   *  Closed to start, because the photograph is what somebody opened. It was
   *  taking half a phone screen to show "No feedback yet" — half of the
   *  scarcest surface there is, in a product whose job is looking at
   *  pictures. */
  const [sheetOpen, setSheetOpen] = useState(false);
  const zoomable = useRef<ZoomableHandle>(null);
  const [itemStatuses, setItemStatuses] = useState<
    Record<number, 'approved' | 'rejected' | 'pending'>
  >({});

  const handleStatusChange = (id: number, status: 'approved' | 'rejected' | 'pending') => {
    setItemStatuses((prev) => ({ ...prev, [id]: status }));
  };

  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  // A remark and a change request read the same but mean different things:
  // only the second is work somebody owes back. The thread already badges
  // them differently, so the composer has to be able to say which it is.
  const [isRequest, setIsRequest] = useState(false);

  /** How many comments sit against each photograph. */
  const countByAsset = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of comments) {
      if (item.asset_id) counts[item.asset_id] = (counts[item.asset_id] ?? 0) + 1;
    }
    return counts;
  }, [comments]);

  /**
   * Real photographs, in the shape this screen already renders.
   *
   * The grid keys on a numeric id and the lightbox walks the array by
   * position, so adapting here keeps every piece of markup below untouched —
   * only where the data comes from changes.
   */
  const gallery = useMemo(
    () =>
      assets.map((asset, index) => ({
        id: index,
        assetId: asset.id,
        url: asset.url as string,
        // Carried from the API rather than assumed. This said `'photo' as
        // const` with a comment that video needed transcoding first — true of
        // a camera master, not of the delivered film, which uploads and plays
        // like anything else.
        content_type: asset.content_type,
        filename: asset.filename,
        //: Whether this link is the untouched file or the watermarked copy,
        //: so the save button can say which one it is handing over.
        isOriginal: asset.is_original,
        type: 'photo' as const,
        //: Was `album: 'All'` — a placeholder standing in for a concept the
        //: API did not have. It has one now.
        folderId: asset.folder_id ?? null,
        comments: countByAsset[asset.id] ?? 0,
        //: Above zero means this is a photograph we changed after they
        //: asked — so the before is worth offering.
        // Above zero means this is a photograph we changed after they
        // asked, so the version before it is worth offering.
        corrections: asset.supersedes_count ?? 0,
      })),
    [assets, countByAsset],
  );

  /* Two filters, deliberately independent. The chips read what the files
     already say — photograph or film, changed since you asked, has remarks on
     it — the way Apple's Media Types row works, so nothing needs filing. The
     folder is the part of the day, which no file can tell you and somebody
     had to decide. "The films from the reception" needs both. */
  const filteredGallery = useMemo(() => {
    const matches = matcherFor(category);
    const byChip = matches ? gallery.filter(matches) : gallery;
    return folder === 'all' ? byChip : byChip.filter((item) => item.folderId === folder);
  }, [gallery, category, folder]);

  const selected = selectedImageIndex !== null ? gallery[selectedImageIndex] : null;

  /* Where this photograph sits in **what you are currently looking at**, not in
     the whole gallery.
     
     `selectedImageIndex` is an index into `gallery`, so `selected` above stays
     right. But the arrows and the counter have to work on the filtered set: with
     "Films" chosen, stepping off the last film onto a photograph would take you
     out of the set you asked for, and a counter reading "3 / 40" while you look
     at the first of two films is simply wrong.
     
     -1 when the active chip no longer contains the open photograph — which
     happens if the filter changes while the lightbox is up. The controls fall
     back to the full gallery rather than disappearing. */
  const viewing = useMemo(
    () => filteredGallery.findIndex((item) => item.id === selectedImageIndex),
    [filteredGallery, selectedImageIndex],
  );
  const reel = viewing === -1 ? gallery : filteredGallery;
  const position = viewing === -1 ? (selectedImageIndex ?? 0) : viewing;

  /** Step through the reel, wrapping at both ends. */
  const step = (by: 1 | -1) => {
    if (reel.length === 0) return;
    const next = (position + by + reel.length) % reel.length;
    setSelectedImageIndex(reel[next]!.id);
    setZoomLevel(1);
  };

  // The arrows as well as the flick and the chevrons. The hook declines to
  // fire while a comment is being written, which matters here more than in
  // the other viewers: this one holds the feedback box.
  useArrowSteps(selectedImageIndex !== null, step);
  const threadForSelected = selected
    ? comments.filter((item) => item.asset_id === selected.assetId)
    : [];

  // Fetched when a corrected photograph is opened, not with the gallery:
  // almost nothing has history, and paying for links to it on every load
  // would be paying for something nobody opened.
  const corrections = selected?.corrections ?? 0;
  const selectedAssetId = selected?.assetId;

  // Pinning writes below the photograph — "line up the spot, then write
  // below" is the instruction — so the composer has to be there.
  useEffect(() => {
    if (pinning) setSheetOpen(true);
  }, [pinning]);

  useEffect(() => {
    setShowing(0);
    setSideBySide(false);
    setVersions(null);
    if (!selectedAssetId || corrections === 0) return;
    let cancelled = false;
    listMyAssetVersions(id, selectedAssetId)
      .then((result) => !cancelled && setVersions(result))
      .catch(() => {
        // Silent: not being able to show the earlier version is a missing
        // extra, not a broken gallery, and an error over their photographs
        // would read as something being wrong with the photographs.
      });
    return () => {
      cancelled = true;
    };
  }, [id, selectedAssetId, corrections]);

  // What they are actually holding, read off the links they were given — the
  // same linker decides it, so this cannot disagree with the gallery.
  const holdsOriginals = assets.some((asset) => asset.is_original);
  // Staff cross into this portal from the studio to see what a client sees.
  // Approving is the one act here that is not theirs: the record of who
  // signed the work off is what a dispute turns on, so the API refuses it and
  // the screen should say so rather than offering a button that answers 403.
  const isTheClient = Boolean(project && user && project.customer_id === user.id);
  // Accepting happens once. After that this screen is only about the rating,
  // which a client may leave or revise whenever they like.
  const alreadyAccepted = Boolean(project?.approved_at);
  // What they said last time, so reopening this shows their own words rather
  // than an empty form that looks like nothing was ever saved.
  useEffect(() => {
    if (!isReviewModalOpen || !id) return;
    let cancelled = false;
    getMyProjectRating(id)
      .then((existing) => {
        if (cancelled || !existing) return;
        setRating(existing.stars);
        setWords(existing.words);
        setMayPublish(existing.may_publish);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [isReviewModalOpen, id]);

  const history = versions ?? [];
  const before = history[1] ?? null;
  const comparable = history.filter((version) => version.url).length > 1;

  async function submitComment() {
    if (!draft.trim() || !selected) return;
    setSending(true);
    try {
      // The coordinate is read at *send*, not at the tap that started this.
      // The tap only gets you close; everything after it is the adjusting,
      // and taking the position any earlier would throw that away.
      const point = pinning ? zoomable.current?.centre() : undefined;
      await comment(draft, {
        assetId: selected.assetId,
        amendment: isRequest,
        point: point && { x: point.x, y: point.y },
      });
      setDraft('');
      // Back to a plain remark, so the next thing said is not silently
      // filed as work owed.
      setIsRequest(false);
      setPinning(false);
    } finally {
      setSending(false);
    }
  }

  return (
    <ClientPortalShell title={project?.title ?? 'Your project'} subtitle="Gallery">
      <div className="space-y-8">
        {error && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-800 px-5 py-3 rounded-xl text-[13px]"
          >
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-serif text-[28px] mb-1">
              {project?.title ?? 'Your project'} - Gallery
            </h2>
            <p className="text-[14px] text-ink/60">
              {loading
                ? 'Loading your photographs…'
                : gallery.length === 0
                  ? 'Nothing has been shared with you yet. Your photographer will release work here as it is ready.'
                  : `${gallery.length} photograph${gallery.length === 1 ? '' : 's'} shared with you. Tap any of them to comment.`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Offered whatever the stage.
            
                This used to grey out on a draft, mirroring an API rule that
                refused one. Both are gone: sharing is already an explicit
                per-project decision by staff, and drafts are visible to
                clients anyway, so the stage was a second gate on a door
                somebody had deliberately opened. The modal still says when
                the studio has not allowed it, and the watermark policy still
                decides what a recipient is handed. */}
            <button
              type="button"
              onClick={() => setIsCallModalOpen(true)}
              className="flex items-center gap-2 bg-gold text-ink px-5 py-2.5 rounded-full text-[13px] font-semibold shadow-sm mr-2 hover:bg-gold-dark transition-colors cursor-pointer"
            >
              <Video size={16} />
              Video Call
              {projectCalls.filter((c) => c.status === 'pending' || c.status === 'accepted').length >
                0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-noir text-gold text-[10px]">
                    {
                      projectCalls.filter((c) => c.status === 'pending' || c.status === 'accepted')
                        .length
                    }
                  </span>
                )}
            </button>
            <button
              type="button"
              onClick={() => setIsDesignCommentsOpen(true)}
              className="flex items-center gap-2 bg-white border border-ink/15 text-ink px-4 py-2.5 rounded-full text-[13px] font-medium shadow-sm mr-2 hover:border-gold transition-colors cursor-pointer"
            >
              <MessageSquare size={15} className="text-gold" />
              Design Comments
            </button>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-2 bg-ink text-white px-5 py-2.5 rounded-full text-[13px] font-medium shadow-sm mr-2 hover:bg-gold hover:text-ink transition-colors cursor-pointer"
            >
              <Share2 size={16} />
              Share Collection
            </button>
            <button
              disabled
              title={NOT_YET}
              className="w-10 h-10 flex items-center justify-center bg-white border border-ink/10 rounded-full text-ink/25 shadow-sm cursor-not-allowed"
            >
              <Grid size={16} />
            </button>
            <button
              disabled
              title={NOT_YET}
              className="w-10 h-10 flex items-center justify-center bg-white border border-ink/10 rounded-full text-ink/25 shadow-sm cursor-not-allowed"
            >
              <Filter size={16} />
            </button>
          </div>
        </div>

        {/* Replaces a strip that rendered one button reading "All" — a
            placeholder for albums the API never had. */}
        {/* Above the chips: which part of the day comes before what kind of
            file, because that is the order somebody looks for a photograph
            in. Both narrow the same grid. */}
        <GalleryFolders
          folders={folders}
          value={folder}
          onChange={setFolder}
          total={gallery.length}
        />
        <GalleryChips items={gallery} value={category} onChange={setCategory} />

        {!loading && gallery.length === 0 && (
          <div className="bg-white border border-ink/10 rounded-xl p-16 text-center">
            <Lock size={28} className="mx-auto text-ink/20 mb-4" strokeWidth={1.5} />
            <p className="text-[15px] text-ink/70 mb-1">Nothing shared yet</p>
            <p className="text-[13px] text-ink/50 max-w-[380px] mx-auto">
              Photographs appear here once your photographer releases them. You will be able to
              comment on each one and ask for changes.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {filteredGallery.map((media) => (
            /* `role="button"` and a key handler rather than an actual
               `<button>`: the approve and reject controls are nested inside,
               and a button inside a button is invalid markup that browsers
               resolve by dropping one of them. This is the standard pattern
               when an activatable region has to contain its own controls, and
               it is what makes the tile reachable without a mouse — WCAG 2.2
               AA is a stated standard for this product, not a nice-to-have. */
            <div
              key={media.id}
              role="button"
              tabIndex={0}
              aria-label={`Open ${media.filename}`}
              className="group relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              style={{
                borderColor:
                  itemStatuses[media.id] === 'approved'
                    ? '#22c55e'
                    : itemStatuses[media.id] === 'rejected'
                      ? '#ef4444'
                      : 'transparent',
              }}
              onClick={() => setSelectedImageIndex(media.id)}
              onKeyDown={(event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                // Space scrolls the page by default, which on a grid of
                // photographs moves the one you were trying to open.
                event.preventDefault();
                setSelectedImageIndex(media.id);
              }}
            >
              {isVideo(media) ? (
                /* `preload="metadata"` so a grid of films fetches headers and
                   a poster frame, not the films themselves — a client opening
                   their gallery should not pull gigabytes to see four tiles. */
                <video
                  src={media.url ?? undefined}
                  preload="metadata"
                  muted
                  playsInline
                  controls
                  className="w-full h-full object-cover bg-black"
                />
              ) : (
                <img
                  src={media.url}
                  alt={`Gallery item ${media.id}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}

              {/* So a client who asked for three changes can find those three
                  without opening forty photographs to look for them. */}
              {media.corrections > 0 && (
                <span className="absolute top-3 left-3 flex items-center gap-1 bg-gold text-ink text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded-full z-20">
                  <History size={11} />
                  Updated
                </span>
              )}

              {/* Visible on a phone, hover-revealed on a desktop.
                  
                  This was `opacity-0 group-hover:opacity-100`, and Tailwind v4
                  wraps `hover:` in `@media (hover: hover)` — so on a touch
                  device the reveal never fires and these two buttons stayed at
                  `opacity-0` for ever. `opacity: 0` does not remove an element
                  from hit testing, so they were invisible and still tappable:
                  a tap in the bottom-right of any photograph hit one of them,
                  `stopPropagation` swallowed it, and the gallery did not open.
                  That is the "tapping a photograph does nothing on iOS Safari"
                  report, and the same bug also meant a client on a phone had
                  no way to reach these controls at all.
                  
                  Every class here is literal. Tailwind reads them statically,
                  so an arbitrary variant assembled at runtime generates
                  nothing — see CLAUDE.md §5. */}
              <div className="absolute bottom-3 right-3 flex items-center gap-1 z-20 transition-opacity duration-300 opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(media.id, 'approved');
                  }}
                  className="w-8 h-8 rounded-full bg-white/90 text-ink flex items-center justify-center hover:bg-green-50 hover:text-green-600 transition-colors shadow-sm"
                  title="Approve"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(media.id, 'rejected');
                  }}
                  className="w-8 h-8 rounded-full bg-white/90 text-ink flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
                  title="Reject"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Status Badges */}
              {itemStatuses[media.id] === 'approved' && (
                <div className="absolute top-3 right-3 bg-green-500 text-white p-1 rounded-full shadow-sm z-10">
                  <Check size={14} />
                </div>
              )}
              {itemStatuses[media.id] === 'rejected' && (
                <div className="absolute top-3 right-3 bg-red-500 text-white p-1 rounded-full shadow-sm z-10">
                  <X size={14} />
                </div>
              )}

              {/* Overlay for actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Maximize2 className="text-white w-8 h-8" />
              </div>

              {/* Comment Badge */}
              {media.comments > 0 && (
                <div
                  className={`absolute top-3 ${itemStatuses[media.id] ? 'right-10' : 'right-3'} bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 shadow-sm z-10 transition-all`}
                >
                  <MessageSquare size={12} className="text-gold" />
                  {media.comments}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Final Acceptance Banner */}
        <div className="mt-8 p-6 bg-canvas border border-gold/30 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="font-serif text-[18px] mb-1">Ready to accept?</h4>
            {/* No longer promises a download. Accepting says the work is
                right; the finished files follow the money, and tying the two
                together told clients their photographs would unlock the
                moment they approved — which stopped being true, and was never
                true on a project watermarked always. */}
            <p className="text-[13px] text-ink/70">
              {!isTheClient
                ? 'Only the client can accept their own work. You are looking at their portal.'
                : alreadyAccepted
                  ? 'You accepted this work. You can still leave or change how you rated it.'
                  : 'Accepting tells us the work is right. You can still ask for changes afterwards.'}
            </p>
          </div>
          {isTheClient && (
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="shrink-0 bg-gold text-white px-8 py-3 rounded-full text-[13px] uppercase tracking-[0.1em] font-medium hover:bg-gold-dark transition-colors"
            >
              {alreadyAccepted ? 'Rate this work' : 'Accept & Review'}
            </button>
          )}
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Video Call Request & Meeting Room Modal */}
      {isCallModalOpen && (
        <Modal
          open
          onOpenChange={(next) => {
            if (!next) setIsCallModalOpen(false);
          }}
          size="lg"
          title="Project Video Calls & Scheduling"
        >
          <ProjectCallPanel
            calls={projectCalls}
            currentUserId={user?.id}
            onRequestCall={async (payload) => {
              const created = await collaborationApi.requestProjectCall(id, payload);
              setProjectCalls((prev) => [created, ...prev]);
            }}
            onRespondCall={async (callId, action, proposedAt) => {
              const updated = await collaborationApi.respondToProjectCall(callId, {
                action,
                proposed_at: proposedAt,
              });
              setProjectCalls((prev) => prev.map((c) => (c.id === callId ? updated : c)));
            }}
          />
        </Modal>
      )}

      {/* Figma-Style Design Comments Modal */}
      {isDesignCommentsOpen && (
        <Modal
          open
          onOpenChange={(next) => {
            if (!next) setIsDesignCommentsOpen(false);
          }}
          layout="fullscreen"
          title="Design Comments & Pin Feedback"
        >
          <div className="p-6 max-w-7xl mx-auto">
            <FigmaCommentWorkspace
              assets={assets.map((a) => ({
                id: a.id,
                title: a.filename,
                url: a.url ?? '',
                isVideo: isVideo(a),
              }))}
              comments={richComments}
              currentUserId={user?.id}
              canResolve={false}
              onAddComment={async (payload) => {
                const created = await collaborationApi.addProjectComment(id, payload);
                setRichComments((prev) => [...prev, created]);
              }}
              onResolveComment={async (commentId) => {
                const updated = await collaborationApi.resolveComment(commentId);
                setRichComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
              }}
              onReopenComment={async (commentId) => {
                const updated = await collaborationApi.reopenComment(commentId);
                setRichComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
              }}
            />
          </div>
        </Modal>
      )}

      {/* Secure Media Viewer & Comment Modal */}
      {selectedImageIndex !== null && (
        <Modal
          open
          onOpenChange={(next) => {
            if (!next) {
              setSelectedImageIndex(null);
            }
          }}
          layout="fullscreen"
          chrome="none"
          title="Gallery proofing viewer"
        >
          <div
            className="flex h-full w-full flex-col overflow-hidden bg-black md:flex-row"
            style={keyboard > 0 ? { height: `calc(100% - ${keyboard}px)` } : undefined}
          >
            {/* Top Controls Overlay */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/80 to-transparent z-20 flex items-center justify-between px-6 pointer-events-none">
              <div className="text-white/80 text-[13px] font-medium pointer-events-auto">
                {position + 1} / {reel.length}
              </div>
              <div className="flex items-center gap-4 pointer-events-auto">
                {/* Only on a photograph that was actually changed. The point
                    is answering "did they do what I asked?" at the moment
                    they are looking at it, rather than from memory. */}
                {comparable && (
                  <>
                    <button
                      onClick={() => {
                        setSideBySide(false);
                        setShowing((previous) => (previous + 1) % history.length);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${showing !== 0 && !sideBySide
                        ? 'bg-gold text-ink'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                        }`}
                    >
                      <History size={14} />
                      {showing !== 0 && !sideBySide ? 'Showing an older one' : 'See what changed'}
                    </button>
                    <button
                      onClick={() => setSideBySide((previous) => !previous)}
                      title="Show both at once"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${sideBySide
                        ? 'bg-gold text-ink'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                        }`}
                    >
                      <Columns2 size={14} />
                      Both
                    </button>
                  </>
                )}
                <button
                  onClick={() => setZoomLevel((prev) => Math.min(prev + 0.5, 3))}
                  className="text-white/60 hover:text-white transition-colors p-2"
                  title="Zoom In"
                >
                  <ZoomIn size={20} />
                </button>
                <button
                  onClick={() => setZoomLevel((prev) => Math.max(prev - 0.5, 1))}
                  className="text-white/60 hover:text-white transition-colors p-2"
                  title="Zoom Out"
                >
                  <ZoomOut size={20} />
                </button>
                <button
                  /* On its own circle, because this sits over the
                     photograph: white-on-white vanished the moment somebody
                     opened a bright frame, and the one control that closes
                     the lightbox is the last one that should be hard to
                     find. */
                  className="rounded-full bg-noir/55 backdrop-blur-sm text-white/90 hover:text-white hover:bg-noir/75 transition-colors p-2 md:hidden"
                  onClick={() => {
                    setSelectedImageIndex(null);
                    setZoomLevel(1);
                  }}
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Media Area */}
            <div
              /* `min-h-0` is what makes `flex-1` able to shrink here. A
                 flex item defaults to min-height:auto, so without it this
                 column refuses to go below its content and the photograph
                 pushes past the bottom of the screen instead of fitting. */
              className="flex-1 min-h-0 relative flex items-center justify-center p-4 lg:p-12 overflow-hidden bg-noir-deep"
              onClick={() => {
                setSelectedImageIndex(null);
                setZoomLevel(1);
              }}
            >
              {/* Only when there is somewhere to swipe to. */}
              {reel.length > 1 && <SwipeHint storageKey="cabmora.hint.gallery-swipe" />}

              {/* Inside the picture area, not the modal. At `top-1/2` of the
                  whole lightbox these sat at the middle of the screen — which
                  on a phone is behind the feedback sheet, so they simply were
                  not there. Half of the photograph is where a hand reaches
                  for them. */}
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm z-20 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
              >
                <ChevronLeft size={24} />
              </button>

              <button
                className="absolute right-4 md:right-[420px] top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm z-20 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
              >
                <ChevronRight size={24} />
              </button>

              <div
                /* A definite size, not shrink-to-fit.
                
                   This was `relative` alone, so it sized to its content —
                   while the ZoomableImage inside is `w-full h-full` and the
                   plate within that is computed from the frame's measured
                   height. Height depending on content depending on height:
                   every step round the loop settled a little smaller, which
                   is why the photograph shrank each time you moved to the
                   next one and back. */
                className="relative w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
                style={{ transform: `scale(${zoomLevel})` }}
                onClick={(e) => e.stopPropagation()}
              >
                {sideBySide && before?.url ? (
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <Version url={before.url} caption={versionLabel(history, 1)} />
                    <Version url={selected!.url} caption="Now" />
                  </div>
                ) : comparable ? (
                  <>
                    {/* Every version mounted, one shown. A swap of the same
                        `src` fetches on the first switch and flashes, and a
                        comparison with a flash in the middle of it compares
                        nothing. */}
                    {history.map((version, index) =>
                      version.url ? (
                        <img
                          key={version.id}
                          src={version.url}
                          alt={
                            index === 0 ? 'Your photograph' : 'Your photograph before the change'
                          }
                          className={`max-w-full max-h-[85vh] object-contain rounded shadow-2xl ${index === showing ? '' : 'hidden'
                            }`}
                        />
                      ) : null,
                    )}
                    {/* Said on the photograph, not only on the strip below
                        it. Two versions of one frame look alike, and somebody
                        must never be left comparing the old one against their
                        memory of the old one. */}
                    {showing !== 0 && (
                      <span className="absolute top-3 left-3 bg-noir/80 text-canvas text-[11px] font-bold uppercase tracking-[0.12em] px-3 py-1.5 rounded-full pointer-events-none">
                        {versionLabel(history, showing)}
                      </span>
                    )}
                  </>
                ) : selected && isVideo(selected) ? (
                  /* A film, which until now fell through to `ZoomableImage`
                     and so rendered as an `<img src="...mov">` — a broken
                     image icon where the clip should have been. Nothing in
                     the zoom-and-pin machinery applies to video. */
                  <VideoStage
                    src={selected.url ?? undefined}
                    className="w-full h-full max-w-[1200px]"
                    onSwipe={(direction) => step(direction === 'next' ? 1 : -1)}
                  />
                ) : (
                  /* Pinch, pan and pin. The old markup was a plain <img>
                     inside a container that applied `scale()` with no
                     translation — you could zoom in and only ever see the
                     middle, which makes "which part of this photograph" an
                     unanswerable question. */
                  /* Fills what the column actually leaves, rather than
                     claiming 80vh of the viewport.
                  
                     On a phone this lightbox is a column: the photograph on
                     top, the feedback sheet under it taking roughly half the
                     screen. An `h-[80vh]` box in a ~45vh space overflows, and
                     the parent's `overflow-hidden` crops it — so the top of
                     somebody's head and their feet were simply gone. The
                     desktop cap stays, where the row has the room. */
                  <div className="w-full h-full max-w-[1200px]">
                    <ZoomableImage
                      ref={zoomable}
                      src={selected!.url}
                      alt="Your photograph"
                      className="w-full h-full"
                      onScaleChange={setPinScale}
                      /* Only fires unzoomed — see `ZoomableImage`. Pinning is
                         left alone too: a pin is placed by a tap, and a tap
                         travels nowhere near far enough to read as a flick. */
                      onSwipe={(direction) => step(direction === 'next' ? 1 : -1)}
                      onTap={(point) => {
                        if (!pinning) return;
                        // First tap gets you close; after that a tap just
                        // moves the crosshair, or you would ratchet to 6x by
                        // accident. See `TAP_ZOOM` for why 3.
                        zoomable.current?.zoomTo(point, Math.max(pinScale, TAP_ZOOM));
                      }}
                    ></ZoomableImage>

                    {/* Fixed at the centre of the frame, not under the finger.
                        A fingertip is ~44px, which on a 2048px preview shown
                        at phone width is around 470 real pixels — so placing a
                        pin by touching it is hopeless, and the finger covers
                        the spot anyway. Moving the photograph under a fixed
                        crosshair solves both. */}
                    {pinning && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <Crosshair
                          size={44}
                          className="text-gold drop-shadow-lg"
                          strokeWidth={1.5}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Pin mode. An explicit toggle rather than "a tap always
                  pins": on a phone every pan would otherwise leave a pin
                  behind. Hidden while comparing versions, where a point on
                  the picture is ambiguous between two of them. */}
              {!comparable && !sideBySide && selected?.url && !isVideo(selected) && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setPinning((on) => !on);
                  }}
                  aria-pressed={pinning}
                  className={`absolute top-4 left-4 z-30 inline-flex items-center gap-2 text-[12px] font-medium px-4 py-2.5 rounded-full shadow-lg transition-colors ${pinning ? 'bg-gold text-ink' : 'bg-white/90 hover:bg-white text-ink'
                    }`}
                >
                  <MapPin size={15} />
                  {pinning ? 'Line up the spot, then write below' : 'Point at something'}
                </button>
              )}

              {/* Only when the project allows it. The admin decides per
                  project and the default is off — the PRD asks for galleries
                  that are not downloadable, so handing files out has to be a
                  deliberate act rather than the default. */}
              {project?.allow_downloads && selected?.url && (
                <div className="absolute top-4 right-16 z-30" onClick={(e) => e.stopPropagation()}>
                  {/* The link is minted on the click, so there is no stale
                      one to retry: this gallery is made to be lingered over,
                      and the fifteen-minute view links it holds are what
                      used to make a save report that the link had expired. */}
                  <DownloadButton assetId={selected.assetId} isOriginal={selected.isOriginal} />
                </div>
              )}

              {/* The versions, as pictures. Along the bottom rather than down
                  a side: both sides already carry the arrows that move
                  through the gallery, and a client reaching for "the older
                  one" must never hit "the next photograph" instead. */}
              {comparable && !sideBySide && (
                <ul
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 backdrop-blur-sm rounded-xl p-2 z-20"
                  onClick={(e) => e.stopPropagation()}
                >
                  {history.map((version, index) =>
                    version.url ? (
                      <li key={version.id}>
                        <button
                          onClick={() => setShowing(index)}
                          aria-current={index === showing}
                          className={`block w-[72px] rounded-lg overflow-hidden border-2 transition-colors ${index === showing
                            ? 'border-gold'
                            : 'border-transparent hover:border-white/40'
                            }`}
                        >
                          <img
                            src={version.url}
                            alt={versionLabel(history, index)}
                            className="w-full aspect-[4/3] object-cover"
                          />
                        </button>
                        <span
                          className={`block text-center text-[10px] font-bold uppercase tracking-[0.08em] mt-1 ${index === showing ? 'text-gold' : 'text-white/55'
                            }`}
                        >
                          {versionLabel(history, index)}
                        </span>
                      </li>
                    ) : null,
                  )}
                </ul>
              )}
            </div>

            {/* Comments Sidebar */}
            <div
              className={`w-full md:w-[400px] bg-white flex flex-col rounded-t-2xl md:rounded-none overflow-hidden z-30 shrink-0 md:h-full ${sheetOpen
                ? // While they are typing the photograph is not what they
                // are looking at, so the panel takes the room the
                // keyboard left.
                keyboard > 0
                  ? 'h-full'
                  : 'h-1/2'
                : // Just the bar. The grid above gets the rest.
                'h-16'
                }`}
            >
              <div
                /* The whole bar is the handle on a phone — a 44px target
                   rather than a chevron somebody has to aim at. Inert from
                   `md` up, where the panel never collapses. */
                role="button"
                tabIndex={0}
                onClick={() => setSheetOpen((open) => !open)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return;
                  event.preventDefault();
                  setSheetOpen((open) => !open);
                }}
                aria-expanded={sheetOpen}
                className="h-16 border-b border-ink/10 flex items-center justify-between px-6 shrink-0 bg-canvas cursor-pointer md:cursor-default"
              >
                <h3 className="font-medium text-[15px] flex items-center gap-2">
                  <MessageSquare size={16} className="text-gold" />
                  Feedback
                  {/* The count while it is shut, so a remark already left on
                      this photograph is not hidden behind a tap nobody knew
                      to make. */}
                  {threadForSelected.length > 0 && (
                    <span className="md:hidden inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-gold text-ink text-[11px] font-bold">
                      {threadForSelected.length}
                    </span>
                  )}
                  <ChevronUp
                    size={16}
                    className={`md:hidden text-ink/40 transition-transform ${sheetOpen ? 'rotate-180' : ''
                      }`}
                  />
                </h3>
                <div className="flex items-center gap-2">
                  {/* Approval is not built. Asking for a change is — that is
                      what the comment box below does, and it reaches the team
                      as outstanding work. */}
                  <button
                    disabled
                    title={NOT_YET}
                    className="px-3 py-1.5 rounded-full text-[12px] font-medium border bg-white text-ink/25 border-ink/10 cursor-not-allowed"
                  >
                    <ThumbsUp size={14} className="inline mr-1" />
                    Approve
                  </button>
                  <button
                    disabled
                    title={NOT_YET}
                    className="px-3 py-1.5 rounded-full text-[12px] font-medium border bg-white text-ink/25 border-ink/10 cursor-not-allowed"
                  >
                    <ThumbsDown size={14} className="inline mr-1" />
                    Reject
                  </button>
                  <button
                    className="hidden md:block text-ink/50 hover:text-ink transition-colors p-2 ml-2"
                    onClick={() => {
                      setSelectedImageIndex(null);
                      setZoomLevel(1);
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div
                className={`flex-1 overflow-y-auto p-6 space-y-6 md:block ${sheetOpen ? '' : 'hidden'
                  }`}
              >
                {threadForSelected.length > 0 ? (
                  threadForSelected.map((item) => (
                    <div
                      key={item.id}
                      ref={(node) => {
                        // Scrolled to when its pin is tapped. A thread of
                        // twenty on a phone would otherwise leave the reader
                        // hunting for the one they just pointed at.
                        if (node && openPinId === item.id) {
                          node.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }}
                      onClick={() => item.point_x != null && setOpenPinId(item.id)}
                      className={`flex gap-3 -mx-2 px-2 py-2 rounded-lg transition-colors ${openPinId === item.id ? 'bg-gold/10' : ''
                        } ${item.point_x != null ? 'cursor-pointer' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-ink text-white flex items-center justify-center text-[10px] shrink-0 font-medium">
                        {item.author_name
                          .split(' ')
                          .map((part) => part[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-medium text-[13px]">{item.author_name}</span>
                          <span className="text-[10px] text-ink/40">
                            {new Date(item.created_at).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                          {/* Says whether anybody owes an answer. A remark
                              does not, a change request does. */}
                          {item.needs_action && (
                            <span className="text-[9px] uppercase tracking-[0.08em] bg-gold/15 text-gold px-1.5 py-0.5 rounded">
                              awaiting
                            </span>
                          )}
                        </div>
                        {/* The spot itself, beside the words that are about
                            it. A number told you which remark; this tells you
                            what the remark is about, and tapping it takes the
                            photograph there. */}
                        <div className="flex gap-2.5 items-start">
                          {item.point_x != null && item.point_y != null && selected?.url && (
                            <PinnedCrop
                              src={selected.url}
                              at={{ x: item.point_x, y: item.point_y }}
                              onClick={() => {
                                setOpenPinId(item.id);
                                zoomable.current?.zoomTo(
                                  { x: item.point_x!, y: item.point_y! },
                                  TAP_ZOOM,
                                );
                              }}
                            />
                          )}
                          <div className="bg-canvas p-3 rounded-tr-lg rounded-b-lg text-[13px] text-ink/80 leading-relaxed border border-ink/5 break-words min-w-0">
                            {item.body}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-ink/40 px-4">
                    <MessageSquare size={32} className="mb-4 text-ink/20" />
                    <p className="text-[13px] mb-1">No feedback yet</p>
                    <p className="text-[11px]">
                      Leave a comment below to request an edit or highlight what you love.
                    </p>
                  </div>
                )}
              </div>

              <div
                className={`p-4 border-t border-ink/10 bg-white shrink-0 md:block ${sheetOpen ? '' : 'hidden'
                  }`}
              >
                <div className="flex items-center gap-1.5 mb-2.5">
                  {([false, true] as const).map((request) => (
                    <button
                      key={String(request)}
                      type="button"
                      onClick={() => setIsRequest(request)}
                      aria-pressed={isRequest === request}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${isRequest === request
                        ? 'bg-gold/15 text-gold'
                        : 'text-ink/40 hover:text-ink/70'
                        }`}
                    >
                      {request ? 'Request a change' : 'Comment'}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') void submitComment();
                    }}
                    disabled={sending}
                    placeholder={isRequest ? 'What would you like changed?' : 'Add a comment...'}
                    className="w-full bg-canvas border border-ink/10 rounded-full pl-4 pr-20 py-3 text-[13px] outline-none focus:border-gold transition-colors disabled:opacity-60"
                  />
                  <button
                    disabled
                    title={NOT_YET}
                    className="absolute right-10 top-1/2 -translate-y-1/2 text-ink/20 p-1.5 cursor-not-allowed"
                  >
                    <Paperclip size={16} />
                  </button>
                  <button
                    onClick={() => void submitComment()}
                    disabled={sending || !draft.trim()}
                    aria-label="Send comment"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center bg-ink text-white hover:bg-gold transition-colors disabled:opacity-40 disabled:hover:bg-ink"
                  >
                    <Send size={14} className="ml-0.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Share Link Modal */}
      {isShareModalOpen && project && (
        <ShareCollectionModal
          projectId={id}
          allowed={project.allow_client_sharing}
          // Read off what they have actually been handed rather than asked
          // for separately: the same linker decides both, so a link that
          // disagreed with the gallery would be the bug, not the answer.
          handsOverOriginals={holdsOriginals}
          /* The gallery as it stands on screen, not `assets` raw: these are
             already the frames this client may see, so the picker offers
             exactly what they are looking at. `url` is guarded because an
             item without one cannot be drawn as a thumbnail — and the
             server checks the chosen ids again regardless. */
          photographs={gallery
            .filter((item) => Boolean(item.url))
            .map((item) => ({ id: item.assetId, filename: item.filename, url: item.url }))}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}

      {/* Accept & Rate Modal */}
      {isReviewModalOpen && (
        <Modal
          open
          onOpenChange={(next) => {
            if (!next) setIsReviewModalOpen(false);
          }}
          size="md"
          chrome="minimal"
          title="Accept Work & Rate"
        >
          <div className="p-8">
            <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mb-6 text-gold">
              <Star size={24} className="fill-current" />
            </div>
            <h3 className="font-serif text-[24px] mb-2">Accept Work & Rate</h3>
            {/* What accepting actually does for *this* project. It used to
                promise that downloads unlock instantly, which stopped being
                true when the watermark moved onto payment — and was never
                true on a project set to watermark always. Telling somebody
                their files will unlock and then not unlocking them is worse
                than asking them to accept with no reward at all. */}
            <p className="text-[14px] text-ink/60 leading-relaxed mb-8">
              {alreadyAccepted
                ? 'You have already accepted this work. This is just about how it went. '
                : 'By accepting, you confirm that you are satisfied with the work and we will mark it delivered. '}
              {holdsOriginals
                ? 'You already have the full-resolution files.'
                : project?.watermark_policy === 'always'
                  ? 'Your photographer will send the full-resolution files separately.'
                  : 'The full-resolution files and downloads follow once the balance is settled. Accepting now is fine either way.'}
            </p>

            <div className="mb-8">
              <div className="text-[12px] uppercase tracking-[0.1em] font-medium text-ink/50 mb-3 text-center">
                How was your experience?
              </div>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    aria-label={`${star} star${star === 1 ? '' : 's'}`}
                    aria-pressed={rating === star}
                    className="p-1 transition-transform hover:scale-110 cursor-pointer"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      size={32}
                      className={`transition-colors ${(hoverRating || rating) >= star ? 'text-gold fill-gold' : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {rating > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-6 space-y-4">
                <textarea
                  value={words}
                  onChange={(event) => setWords(event.target.value)}
                  maxLength={2000}
                  placeholder="A few words about how it went. Optional."
                  className="w-full h-24 bg-canvas border border-ink/10 rounded-lg p-4 text-[13px] outline-none focus:border-gold transition-colors resize-none"
                />

                {/* Asked at the moment they write it, because that is the
                    only moment they are thinking about what they said. The
                    studio can hide anything, but cannot put this on the site
                    without it, because nobody can consent on somebody else's
                    behalf. */}
                {words.trim() !== '' && (
                  <label className="flex items-start gap-3 p-4 border border-ink/10 rounded-lg cursor-pointer hover:bg-canvas transition-colors">
                    <input
                      type="checkbox"
                      checked={mayPublish}
                      onChange={(event) => setMayPublish(event.target.checked)}
                      className="mt-1 accent-gold"
                    />
                    <span>
                      <span className="block text-[13px] font-medium mb-1">
                        Happy for us to quote this on our website?
                      </span>
                      <span className="block text-[11.5px] text-ink/50">
                        Only your first name and the first letter of your surname would appear. Say
                        no and this stays between us. It still tells us how we did.
                      </span>
                    </span>
                  </label>
                )}
              </div>
            )}

            {/* Offered after the rating is saved, never before, and as a link
                they follow themselves. The old version was a ticked checkbox
                promising to "post automatically to Google Reviews" — which
                nothing can do: Google has no way to submit a review on
                somebody else's behalf, so the honest version opens their own
                form with our listing already chosen. */}
            {savedRating?.google_review_url && (
              <a
                href={savedRating.google_review_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 p-4 border border-ink/10 rounded-lg hover:bg-canvas transition-colors mb-6"
              >
                <ExternalLink size={14} className="text-gold mt-0.5 shrink-0" />
                <span>
                  <span className="block text-[13px] font-medium mb-1">
                    Would you say that publicly?
                  </span>
                  <span className="block text-[11.5px] text-ink/50">
                    Opens your Google review form with Cabmora already chosen. You write it, and it
                    is yours to edit or delete afterwards.
                  </span>
                </span>
              </a>
            )}

            {approveError && (
              <p role="alert" className="text-[12px] text-red-700 mb-3">
                {approveError}
              </p>
            )}

            <button
              disabled={approving}
              className="w-full bg-ink disabled:bg-ink/10 disabled:text-ink/30 text-white py-4 rounded-full text-[13px] uppercase tracking-[0.1em] font-medium hover:bg-gold transition-colors shadow-md"
              onClick={async () => {
                if (savedRating) {
                  setIsReviewModalOpen(false);
                  return;
                }
                setApproving(true);
                setApproveError(null);
                try {
                  // Safe to send either way now: accepting is idempotent
                  // server-side, so a second press keeps the first sign-off
                  // rather than failing. Skipped when it is already done
                  // simply to save a round trip.
                  if (!alreadyAccepted) await approve();
                  if (rating > 0) {
                    setSavedRating(
                      await rateMyProject(id, {
                        stars: rating,
                        words,
                        may_publish: mayPublish,
                      }),
                    );
                  } else {
                    setIsReviewModalOpen(false);
                  }
                } catch (err) {
                  // Kept open with the reason showing: closing the modal on a
                  // failure would read as acceptance.
                  setApproveError(err instanceof ApiError ? err.message : 'Could not save that.');
                } finally {
                  setApproving(false);
                }
              }}
            >
              {approving
                ? 'Saving…'
                : savedRating
                  ? 'Done'
                  : alreadyAccepted
                    ? 'Save my rating'
                    : 'Accept the work'}
            </button>
          </div>
        </Modal>
      )}
    </ClientPortalShell>
  );
}

/** One version in the side-by-side view, labelled so the pair cannot be read
 *  the wrong way round. */
function Version({ url, caption }: { url: string; caption: string }) {
  return (
    <figure className="min-w-0">
      <figcaption className="text-white/70 text-[11px] font-bold uppercase tracking-[0.14em] mb-2 text-center">
        {caption}
      </figcaption>
      <img
        src={url}
        alt={caption}
        className="max-w-full max-h-[70vh] object-contain rounded shadow-2xl"
      />
    </figure>
  );
}

/** Names for the versions, as the console names them. */
function versionLabel(all: AssetVersion[], index: number): string {
  if (index === 0) return 'Now';
  if (all.length === 2) return 'Before';
  return `Version ${all.length - index}`;
}
