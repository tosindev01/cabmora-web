import { UPLOAD_ACCEPT, isVideo } from '@/features/projects/media';
import { useCallback, useEffect, useRef, useState, type DragEvent } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronLeft,
  FolderPlus,
  Folder as FolderIcon,
  ChevronRight,
  Circle,
  CloudUpload,
  Eye,
  EyeOff,
  History,
  ImageOff,
  Replace,
  RotateCw,
  Sparkles,
  X,
} from 'lucide-react';

import { Modal, SwipeArea, VideoStage, useArrowSteps } from '@cabmora/ui';
import { ApiError, type Project } from '@cabmora/api-client';

import {
  createFolder,
  deleteAsset,
  deleteFolder,
  fileAssets,
  listFolders,
  listProjectAssets,
  renameFolder,
  releaseAssets,
  type Folder,
  type ProjectComment,
  type VisibleAsset,
} from '@/features/projects/api';
import { AssetVersionsDialog } from '@/features/projects/components/AssetVersionsDialog';
import {
  ShareConfirmDialog,
  type ShareRequest,
} from '@/features/projects/components/ShareConfirmDialog';
import { useProjectUploads, type UploadItem } from '@/features/projects/hooks/useProjectUploads';

interface Props {
  /** The whole project, not just its id: the confirmation step needs to name
   *  the client and read the stage, and passing four fields separately is the
   *  same coupling with more to keep in step. */
  project: Project;
  /** The thread, so a replacement can be shown beside what was asked for.
   *  The gallery does not fetch it — the page already has it for the Feedback
   *  tab, and a second copy would be a second thing to keep current. */
  comments: ProjectComment[];
  /** Close a change request. Offered after a correction is uploaded, because
   *  that is the moment somebody knows whether it is actually done. */
  onResolveComment: (commentId: string) => Promise<void>;
  onUploaded: () => void;
}

const CARD = 'bg-white border border-ink/10 rounded-xl shadow-xs';
const ACTION =
  'text-[12.5px] uppercase tracking-[0.08em] font-bold text-ink/50 hover:text-ink cursor-pointer disabled:opacity-40 disabled:cursor-default';

/** How often, and for how long, to wait on a preview being made. Two minutes
 *  in total: long enough for a large file on a busy container, short enough
 *  that a genuine failure stops pretending to be progress. */
const PREVIEW_POLL_MS = 3000;
const PREVIEW_POLLS = 40;

/** What the person watching should read, not what the system is doing. */
const PHASE_LABEL: Record<UploadItem['phase'], string> = {
  hashing: 'Preparing',
  uploading: 'Uploading',
  finishing: 'Finishing',
  done: 'Uploaded',
  // Said out loud rather than shown as a plain tick, because otherwise two
  // hundred photographs finishing in seconds looks like a bug.
  deduped: 'Already in your library',
  failed: 'Failed',
};

function readableSize(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  if (bytes >= 1024 ** 2) return `${Math.round(bytes / 1024 ** 2)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function ProjectGallery({ project, comments, onResolveComment, onUploaded }: Props) {
  const projectId = project.id;
  const [assets, setAssets] = useState<VisibleAsset[] | null>(null);
  // What the person has asked to share or hide, held until they confirm it.
  const [confirming, setConfirming] = useState<ShareRequest | null>(null);
  // Picking several at once. A mode rather than a checkbox on every tile:
  // the tiles already carry two buttons, and a third permanent control on
  // each of four hundred photographs is noise for the sake of a gesture most
  // people use occasionally.
  const [picking, setPicking] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [history, setHistory] = useState<VisibleAsset | null>(null);
  const [onlyCorrected, setOnlyCorrected] = useState(false);
  // Change requests left on the frame currently being corrected. Captured
  // when the file is chosen rather than read afterwards, because by the time
  // the upload lands the old frame has been superseded and the thread is
  // about a photograph no longer in the grid.
  const answering = useRef<ProjectComment[]>([]);
  const [answered, setAnswered] = useState<ProjectComment[]>([]);
  // The hidden input a "Replace" click opens, and which frame it is for.
  const replaceInput = useRef<HTMLInputElement>(null);
  const replacing = useRef<string | null>(null);
  const [lightbox, setLightbox] = useState<VisibleAsset | null>(null);
  const [releasing, setReleasing] = useState<string[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  /** Set when the listing failed, so an error is never shown as empty. */
  const [loadFailed, setLoadFailed] = useState<string | null>(null);
  /** Which part of the shoot the grid is showing: everything, one folder, or
   *  the photographs nobody has filed yet. */
  const [folderView, setFolderView] = useState<string>('all');
  /** Open when a selection is being filed somewhere. */
  const [filing, setFiling] = useState(false);
  /** The name being typed, and whether it is a new folder or a rename of the
   *  open one. Null when neither is happening. */
  const [draft, setDraft] = useState<{ mode: 'create' | 'rename'; value: string } | null>(null);
  const [dropping, setDropping] = useState<Folder | null>(null);
  /** The assets currently under the cursor's drag, and the chip they are
   *  hovering. Desktop only — HTML5 drag does not exist on touch, which is
   *  why Select → Move to… stays the way everyone can do it. */
  const [carrying, setCarrying] = useState<string[]>([]);
  const [over, setOver] = useState<string | null>(null);
  const [folderError, setFolderError] = useState<string | null>(null);
  const [busyFolder, setBusyFolder] = useState(false);

  const loadFolders = useCallback(async () => {
    try {
      setFolders(await listFolders(projectId));
    } catch {
      // Folders are organisation, not the work. If they cannot be read the
      // grid still has to show the photographs.
      setFolders([]);
    }
  }, [projectId]);

  const refresh = useCallback(async () => {
    try {
      const all = await listProjectAssets(projectId);
      // Replaced frames are returned to the team so older feedback can still
      // find its photograph, but the grid shows the current set — two nearly
      // identical pictures side by side is exactly the confusion a
      // replacement is meant to end.
      setAssets(all.filter((asset) => !asset.superseded_by));
    } catch (error) {
      // The gallery failing to load must not swallow the upload panel, which
      // is how you would fix it — but it must not pretend to be an empty
      // gallery either. It used to set [] here, so a project holding two
      // photographs showed "no media yet" while the card beside it still
      // counted them: the count comes from the database and the grid needs
      // storage, so the two disagreed with no way to tell which was lying.
      setAssets([]);
      setLoadFailed(error instanceof ApiError ? error.message : 'The gallery could not be loaded.');
      return;
    }
    setLoadFailed(null);
  }, [projectId]);

  useEffect(() => {
    void refresh();
    void loadFolders();
  }, [refresh, loadFolders]);

  // A folder that has just been deleted must not go on filtering the grid,
  // which would leave the screen empty with no way back that looks obvious.
  useEffect(() => {
    if (folderView === 'all' || folderView === 'unfiled') return;
    if (!folders.some((folder) => folder.id === folderView)) setFolderView('all');
  }, [folders, folderView]);

  // Previews are made just after the upload is confirmed, so a frame arrives
  // here pending and turns viewable a second or two later. Ask again until
  // none are outstanding, rather than leaving "Preparing preview" on screen
  // until somebody thinks to reload — which reads as stuck.
  //
  // It gives up after a while instead of polling forever: a render that has
  // genuinely failed will not resolve by being asked about, and a tab left
  // open overnight should not keep talking to the server.
  const pending = assets?.some((asset) => asset.preview_pending) ?? false;
  useEffect(() => {
    if (!pending) return;
    let polls = 0;
    const timer = window.setInterval(() => {
      if (++polls > PREVIEW_POLLS) {
        window.clearInterval(timer);
        return;
      }
      void refresh();
    }, PREVIEW_POLL_MS);
    return () => window.clearInterval(timer);
  }, [pending, refresh]);

  /* Deleting is not hiding.

     "Hide" takes a photograph out of the client's gallery and leaves the file
     where it is; this removes the file, its watermarked rendition and any
     version it replaced, and releases the bytes once nothing else points at
     them. There is no undo, which is why it asks first and reports how many
     files went rather than how many tiles were selected. */
  const [deleting, setDeleting] = useState<string[] | null>(null);
  const [removing, setRemoving] = useState(false);
  /* `toggleRelease` reports nothing when it fails, which is survivable for a
     toggle somebody can see the result of. A delete that quietly does nothing
     leaves somebody believing they have freed space they are still paying
     for, so this one says so. */
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deleteSelected = useCallback(
    async (ids: string[]) => {
      setRemoving(true);
      setDeleteError(null);
      try {
        // Sequential, not parallel. Each delete decrements a reference count,
        // and firing them at once at the same shared blob is the race that
        // leaves a count insisting somebody needs bytes nobody points at.
        let files = 0;
        for (const id of ids) {
          files += (await deleteAsset(projectId, id)).removed;
        }
        setDeleting(null);
        setPicking(false);
        setPicked([]);
        await refresh();
        onUploaded();
      } catch (err) {
        setDeleteError(err instanceof ApiError ? err.message : 'Those could not be deleted.');
      } finally {
        setRemoving(false);
      }
    },
    [projectId, refresh, onUploaded],
  );

  const toggleRelease = useCallback(
    async (ids: string[], released: boolean, message?: string) => {
      setReleasing(ids);
      try {
        await releaseAssets(projectId, ids, released, message);
        // Re-read rather than patch locally: under ALL_AT_ONCE the server may
        // have released the whole set, and guessing which would be wrong.
        await refresh();
      } finally {
        setReleasing([]);
        setConfirming(null);
        setPicking(false);
        setPicked([]);
      }
    },
    [projectId, refresh],
  );

  const { items, add, retry, clearFinished } = useProjectUploads(projectId, () => {
    void refresh();
    onUploaded();
    // Offered, never assumed. An upload is usually the fix, but "I have sent
    // a new version" and "this request is settled" are different claims, and
    // only the person who made the change knows which one is true.
    if (answering.current.length > 0) {
      setAnswered(answering.current);
      answering.current = [];
    }
  });
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);
  const input = useRef<HTMLInputElement>(null);

  const accept = useCallback(
    (files: FileList | null) => {
      if (files?.length) void add(Array.from(files));
    },
    [add],
  );

  /** Whether a drag is files from the desktop rather than a tile from this
   *  grid. Without this a photograph dragged towards a folder also reads as
   *  an upload, and the panel lights up offering to add files that are
   *  already here. */
  const isFileDrag = (event: DragEvent<HTMLDivElement>) =>
    Array.from(event.dataTransfer.types ?? []).includes('Files');

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      if (!isFileDrag(event)) return;
      event.preventDefault();
      depth.current = 0;
      setDragging(false);
      accept(event.dataTransfer.files);
    },
    [accept],
  );

  // Counted rather than toggled: moving the cursor over a thumbnail fires
  // `leave` on the panel, and a plain boolean would flicker the whole way
  // across the grid.
  const onDragEnter = useCallback((event: DragEvent<HTMLDivElement>) => {
    if (!isFileDrag(event)) return;
    depth.current += 1;
    setDragging(true);
  }, []);

  const onDragLeave = useCallback(() => {
    depth.current -= 1;
    if (depth.current <= 0) setDragging(false);
  }, []);

  const busy = items.some((item) => !['done', 'deduped', 'failed'].includes(item.phase));
  const settled = items.filter((item) => item.phase !== 'failed').length;

  const empty = assets !== null && assets.length === 0 && items.length === 0;
  const shown = assets?.filter((asset) => asset.released).length ?? 0;
  const corrected = assets?.filter((asset) => (asset.supersedes_count ?? 0) > 0) ?? [];
  // After a client's notes several photographs come back at once, and the
  // only way to review them was to hunt the grid for gold badges. Narrowing
  // to them is the difference between checking the round and hoping.
  // Falls back to everything when the filter would empty the grid — a
  // replacement can be superseded in turn, and being left staring at nothing
  // with no obvious way back is worse than ignoring the filter.
  const filtering = onlyCorrected && corrected.length > 0;
  const inView = (asset: VisibleAsset) =>
    folderView === 'all'
      ? true
      : folderView === 'unfiled'
        ? !asset.folder_id
        : asset.folder_id === folderView;
  const listed = (filtering ? corrected : (assets ?? [])).filter(inView);
  // True whenever the grid is showing less than the project. "Share all" has
  // to disappear here: it means every photograph on the project, and the
  // screen in front of you is showing nine of them.
  const narrowed = filtering || folderView !== 'all';
  const openFolder = folders.find((folder) => folder.id === folderView) ?? null;
  const unfiledCount = assets?.filter((asset) => !asset.folder_id).length ?? 0;

  /** Both chip states as literal strings. Tailwind reads class names
   *  statically, so a built-up string compiles to nothing at all. */
  const chipClass = (active: boolean) =>
    active
      ? 'inline-flex items-center gap-1.5 text-[12.5px] px-3 py-1.5 rounded-full border border-gold bg-gold/10 text-ink font-medium cursor-pointer'
      : 'inline-flex items-center gap-1.5 text-[12.5px] px-3 py-1.5 rounded-full border border-ink/15 text-ink/60 hover:text-ink hover:border-ink/30 cursor-pointer';

  const saveDraft = async () => {
    if (!draft) return;
    const name = draft.value.trim();
    if (!name) return;
    setBusyFolder(true);
    setFolderError(null);
    try {
      if (draft.mode === 'create') {
        const made = await createFolder(projectId, name);
        setDraft(null);
        await loadFolders();
        // Straight into the new folder: it was made to put something in.
        setFolderView(made.id);
      } else if (openFolder) {
        await renameFolder(projectId, openFolder.id, name);
        setDraft(null);
        await loadFolders();
      }
    } catch (error) {
      // The server owns the rules — duplicate names, the folder cap — so its
      // sentence is the one worth showing rather than a guess made here.
      setFolderError(error instanceof ApiError ? error.message : 'That could not be saved.');
    } finally {
      setBusyFolder(false);
    }
  };

  const fileInto = async (folderId: string | null, ids: string[] = picked) => {
    if (ids.length === 0) return;
    setBusyFolder(true);
    setFolderError(null);
    try {
      await fileAssets(projectId, ids, folderId);
      setFiling(false);
      setPicking(false);
      setPicked([]);
      await Promise.all([refresh(), loadFolders()]);
    } catch (error) {
      setFolderError(error instanceof ApiError ? error.message : 'Those could not be moved.');
    } finally {
      setBusyFolder(false);
    }
  };

  /** Props for a chip that can receive photographs. `target` is null for
   *  Unfiled, which is a real destination: taking something out of a folder
   *  is as much a move as putting it in one. */
  const dropTarget = (key: string, target: string | null) => ({
    onDragOver: (event: DragEvent<HTMLElement>) => {
      if (carrying.length === 0) return;
      // Without preventDefault the browser refuses the drop and shows the
      // 'no entry' cursor, which reads as the feature being broken.
      event.preventDefault();
      setOver(key);
    },
    onDragLeave: () => setOver((current) => (current === key ? null : current)),
    onDrop: (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setOver(null);
      if (carrying.length > 0) void fileInto(target, carrying);
    },
  });

  const removeFolder = async (folder: Folder) => {
    setBusyFolder(true);
    try {
      await deleteFolder(projectId, folder.id);
      setDropping(null);
      setFolderView('all');
      await Promise.all([refresh(), loadFolders()]);
    } catch (error) {
      setFolderError(
        error instanceof ApiError ? error.message : 'That folder could not be removed.',
      );
    } finally {
      setBusyFolder(false);
    }
  };

  // Moving along the row without going back to the grid each time. Only
  // frames with a preview, because those are the only ones the lightbox can
  // open — stepping onto one still being rendered would blank the screen.
  const openable = listed.filter((asset) => asset.url);
  const step = (by: 1 | -1) => {
    if (!lightbox || openable.length === 0) return;
    const at = openable.findIndex((asset) => asset.id === lightbox.id);
    if (at === -1) return;
    setLightbox(openable[(at + by + openable.length) % openable.length]!);
  };

  useArrowSteps(Boolean(lightbox), step);

  return (
    <>
      {/* One input for the whole grid rather than one per tile: which frame
          is being corrected is held in a ref, and forty hidden inputs on a
          wedding gallery would be forty inputs. */}
      <input
        ref={replaceInput}
        type="file"
        accept={UPLOAD_ACCEPT}
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          const target = replacing.current;
          // Cleared first: the same file chosen twice in a row fires no
          // change event unless the input is reset.
          event.target.value = '';
          replacing.current = null;
          if (!file || !target) return;
          answering.current = comments.filter(
            (comment) => comment.asset_id === target && comment.needs_action,
          );
          void add([file], target);
        }}
      />
      <div
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
        className={`space-y-4 rounded-xl transition-colors ${
          dragging ? 'outline-2 outline-dashed outline-gold outline-offset-4' : ''
        }`}
      >
        {/* Its own card, above the grid and not inside it.

            The rail used to live in the grid card, which is gated on
            there being photographs — so a project with nothing uploaded
            yet offered no way to make a folder at all. That contradicted
            the rule the API is written to: a folder may be empty,
            because the structure is how somebody thinks about the work
            before they have sorted it. */}
        {loadFailed && (
          <div className={`${CARD} p-5 flex items-center justify-between gap-4 flex-wrap`}>
            <div>
              <p className="text-[13.5px] font-medium text-ink">
                The photographs could not be loaded.
              </p>
              {/* The server's own sentence. Whatever is wrong, saying nothing
                  and drawing an empty gallery is the one answer guaranteed
                  to be misleading. */}
              <p className="text-[12.5px] text-ink/55 mt-0.5">{loadFailed}</p>
            </div>
            <button type="button" onClick={() => void refresh()} className={ACTION}>
              Try again
            </button>
          </div>
        )}

        {assets !== null && (
          <div className={`${CARD} p-5`}>
            {/* The parts of the shoot. Filing only — nothing here changes
              what the client can see, which is why a folder never shows a
              share state and "Share all" hides while one is open. */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <button
                type="button"
                onClick={() => setFolderView('all')}
                className={chipClass(folderView === 'all')}
              >
                All
                <span className="text-ink/40">{assets.length}</span>
              </button>
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => setFolderView(folder.id)}
                  {...dropTarget(folder.id, folder.id)}
                  className={`${chipClass(folderView === folder.id)} ${
                    over === folder.id ? 'ring-2 ring-gold ring-offset-1' : ''
                  }`}
                >
                  <FolderIcon size={13} />
                  {folder.name}
                  <span className="text-ink/40">{folder.asset_count}</span>
                </button>
              ))}
              {unfiledCount > 0 && (
                <button
                  type="button"
                  onClick={() => setFolderView('unfiled')}
                  {...dropTarget('unfiled', null)}
                  className={`${chipClass(folderView === 'unfiled')} ${
                    over === 'unfiled' ? 'ring-2 ring-gold ring-offset-1' : ''
                  }`}
                >
                  Unfiled
                  <span className="text-ink/40">{unfiledCount}</span>
                </button>
              )}

              {draft === null ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setFolderError(null);
                      setDraft({ mode: 'create', value: '' });
                    }}
                    className={`${ACTION} inline-flex items-center gap-1.5`}
                  >
                    <FolderPlus size={14} />
                    New folder
                  </button>
                  {openFolder && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setFolderError(null);
                          setDraft({ mode: 'rename', value: openFolder.name });
                        }}
                        className={ACTION}
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        onClick={() => setDropping(openFolder)}
                        className={`${ACTION} text-red-700 hover:text-red-800`}
                      >
                        Remove folder
                      </button>
                    </>
                  )}
                </>
              ) : (
                <form
                  className="inline-flex items-center gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void saveDraft();
                  }}
                >
                  <input
                    autoFocus
                    value={draft.value}
                    onChange={(event) => setDraft({ mode: draft.mode, value: event.target.value })}
                    placeholder="Ceremony"
                    maxLength={60}
                    /* 16px: anything smaller and iOS zooms the page the
                     moment the field takes focus. */
                    className="text-[16px] sm:text-[13px] px-3 py-1.5 rounded-full border border-ink/20 focus:border-gold outline-none"
                  />
                  <button type="submit" disabled={busyFolder} className={ACTION}>
                    {draft.mode === 'create' ? 'Create' : 'Save'}
                  </button>
                  <button type="button" onClick={() => setDraft(null)} className={ACTION}>
                    Cancel
                  </button>
                </form>
              )}
              {folderError && <span className="text-[12.5px] text-red-700">{folderError}</span>}
            </div>
          </div>
        )}

        {assets !== null && assets.length > 0 && (
          <div className={`${CARD} p-5`}>
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <p className="text-[12.5px] uppercase tracking-[0.12em] font-bold text-ink/50">
                {picking ? (
                  <span className="text-ink">{picked.length} selected</span>
                ) : (
                  <>
                    {assets.length} photograph{assets.length === 1 ? '' : 's'}
                    {shown > 0 && <span className="text-gold"> · {shown} shared</span>}
                    {corrected.length > 0 && (
                      <>
                        {' · '}
                        <button
                          type="button"
                          onClick={() => setOnlyCorrected((current) => !current)}
                          aria-pressed={filtering}
                          className={`uppercase tracking-[0.12em] font-bold cursor-pointer ${
                            filtering ? 'text-ink underline' : 'text-ink/50 hover:text-ink'
                          }`}
                        >
                          {corrected.length} updated
                        </button>
                      </>
                    )}
                  </>
                )}
              </p>

              <div className="flex items-center gap-4">
                {picking ? (
                  <>
                    {/* Both directions offered, because a selection is as
                        often "these were a mistake" as "send these". */}
                    <button
                      type="button"
                      disabled={picked.length === 0 || releasing.length > 0}
                      onClick={() => setConfirming({ ids: picked, released: true })}
                      className={ACTION}
                    >
                      Share selected
                    </button>
                    <button
                      type="button"
                      disabled={picked.length === 0 || releasing.length > 0}
                      onClick={() => setConfirming({ ids: picked, released: false })}
                      className={ACTION}
                    >
                      Hide selected
                    </button>
                    <button
                      type="button"
                      disabled={picked.length === 0 || busyFolder}
                      onClick={() => {
                        setFolderError(null);
                        setFiling(true);
                      }}
                      className={ACTION}
                    >
                      Move to…
                    </button>
                    <button
                      type="button"
                      disabled={picked.length === 0 || releasing.length > 0}
                      onClick={() => setDeleting(picked)}
                      /* Red, and last in the row. It is the only control here
                         that cannot be undone, and it should not sit where a
                         hand goes for "Hide selected". */
                      className={`${ACTION} text-red-700 hover:text-red-800`}
                    >
                      Delete selected
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPicking(false);
                        setPicked([]);
                      }}
                      className={ACTION}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    {/* The reason this exists: every share sends the client
                        its own email, so releasing fifteen frames one at a
                        time sends fifteen. */}
                    <button type="button" onClick={() => setPicking(true)} className={ACTION}>
                      Select
                    </button>
                    {/* Hidden while the grid is filtered: "all" would mean
                        every photograph on the project, and the screen in
                        front of you is showing three of them. */}
                    {!narrowed && (
                      <button
                        type="button"
                        disabled={releasing.length > 0}
                        onClick={() =>
                          setConfirming({
                            ids: assets
                              .filter((a) => (shown === assets.length ? a.released : !a.released))
                              .map((a) => a.id),
                            released: shown !== assets.length,
                          })
                        }
                        className={ACTION}
                      >
                        {shown === assets.length ? 'Hide all' : 'Share all'}
                      </button>
                    )}
                    {/* Delete has its own way in, rather than only appearing
                        once you are already selecting.
                    
                        It used to be reachable only after pressing Select,
                        which is fine if you know it is there and invisible if
                        you do not. This enters the same selection mode — the
                        tick boxes, then one confirmation naming how many
                        files go — so nothing is destroyed by pressing it. */}
                    <button
                      type="button"
                      onClick={() => {
                        setPicked([]);
                        setPicking(true);
                      }}
                      className={`${ACTION} text-red-700 hover:text-red-800`}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>

            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {listed.map((asset) => (
                <li key={asset.id}>
                  {/* The frame and its overlays, in their own positioning
                      context: the filename sits below, and a control pinned
                      to the bottom of the <li> would land on top of it. */}
                  <div
                    className="relative"
                    /* Dragging one of a selection carries the whole
                       selection — otherwise picking nine and dragging the
                       tenth would quietly move only the tenth. */
                    draggable={!picking || picked.includes(asset.id)}
                    onDragStart={(event) => {
                      const ids = picking && picked.includes(asset.id) ? picked : [asset.id];
                      setCarrying(ids);
                      event.dataTransfer.effectAllowed = 'move';
                      // Something has to be set or Firefox cancels the drag.
                      event.dataTransfer.setData('text/plain', ids.join(','));
                    }}
                    onDragEnd={() => {
                      setCarrying([]);
                      setOver(null);
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        picking
                          ? setPicked((current) =>
                              current.includes(asset.id)
                                ? current.filter((id) => id !== asset.id)
                                : [...current, asset.id],
                            )
                          : asset.url && setLightbox(asset)
                      }
                      /* Selectable even without a preview: a frame still being
                       rendered is still one you may want in the batch. */
                      disabled={!picking && !asset.url}
                      title={asset.filename}
                      aria-pressed={picking ? picked.includes(asset.id) : undefined}
                      className={`group w-full aspect-[4/3] rounded-lg overflow-hidden bg-canvas border relative cursor-pointer disabled:cursor-default transition-all ${
                        picking && picked.includes(asset.id)
                          ? 'border-gold ring-2 ring-gold'
                          : asset.released
                            ? 'border-gold'
                            : 'border-ink/10'
                      }`}
                    >
                      {asset.url && isVideo(asset) ? (
                        /* `preload="metadata"` so the grid fetches headers and
                           a poster frame rather than the whole film — forty
                           tiles each pulling a 6 GB file would be forty times
                           the egress for one page nobody has played yet.
                           `muted` because a grid that makes noise on hover is
                           a grid people close. */
                        <video
                          src={asset.url}
                          preload="metadata"
                          muted
                          playsInline
                          controls
                          className="w-full h-full object-cover bg-ink/80"
                        />
                      ) : asset.url ? (
                        <img
                          src={asset.url}
                          alt={asset.filename}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      ) : (
                        /* A row with no link still appears: the client can see
                       that work exists without being handed it. */
                        <span className="w-full h-full flex items-center justify-center text-ink/25">
                          <ImageOff size={18} />
                        </span>
                      )}
                      {/* Dimmed rather than hidden: a withheld frame is still
                      yours to look at, it is just not theirs. */}
                      {!asset.released && (
                        <span className="absolute inset-0 bg-ink/35 pointer-events-none" />
                      )}
                      {/* Said on the frame itself, because this is the one
                      state that looks like success from here and like an
                      empty gallery to the client: released, and still not
                      viewable. It clears on its own within seconds. */}
                      {picking && (
                        <span className="absolute top-2 left-2 text-canvas drop-shadow">
                          {picked.includes(asset.id) ? (
                            <CheckCircle2 size={20} className="fill-gold text-ink" />
                          ) : (
                            <Circle size={20} />
                          )}
                        </span>
                      )}
                      {/* "Preparing" and "failed" are different things.
                          Both mean no preview exists, but one resolves itself
                          and the other never will — this tile badged a dead
                          upload as "Preparing preview" indefinitely, which is
                          an instruction to keep waiting for something that is
                          not coming.

                          Failed is checked first because it implies pending:
                          an abandoned asset stays "awaiting renditions" on
                          purpose, so the gallery keeps refusing to hand over
                          the unwatermarked original. */}
                      {asset.preview_failed ? (
                        <span
                          title="This file could not be read as an image. Re-upload it."
                          className="absolute inset-x-0 bottom-0 bg-red-900/85 text-canvas text-[11.5px] font-bold uppercase tracking-[0.1em] px-2 py-1.5 text-center"
                        >
                          Preview failed
                        </span>
                      ) : asset.preview_pending ? (
                        <span className="absolute inset-x-0 bottom-0 bg-noir/75 text-canvas text-[11.5px] font-bold uppercase tracking-[0.1em] px-2 py-1.5 text-center">
                          Preparing preview
                        </span>
                      ) : null}
                    </button>

                    <button
                      type="button"
                      hidden={picking}
                      disabled={releasing.includes(asset.id)}
                      onClick={() => setConfirming({ ids: [asset.id], released: !asset.released })}
                      aria-label={
                        asset.released
                          ? `Stop showing ${asset.filename} to the client`
                          : `Show ${asset.filename} to the client`
                      }
                      title={asset.released ? 'Shared with the client' : 'Not shared'}
                      className={`absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-sm cursor-pointer transition-colors disabled:opacity-40 ${
                        asset.released
                          ? 'bg-gold text-ink'
                          : 'bg-noir/60 text-canvas hover:bg-noir/80'
                      }`}
                    >
                      {asset.released ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>

                    {/* On the frame rather than beside the filename, where it
                      was easy to miss. Only the few photographs that were
                      ever corrected carry it: a replacement is otherwise
                      invisible once it has happened, since the old frame
                      leaves the grid and nothing says a fix was made. */}
                    {(asset.supersedes_count ?? 0) > 0 && !picking && (
                      <button
                        type="button"
                        onClick={() => setHistory(asset)}
                        aria-label={`Compare ${asset.filename} with the version it replaced`}
                        title="Compare with what it replaced"
                        className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-gold text-ink text-[11px] font-bold backdrop-blur-sm hover:bg-gold-dark cursor-pointer transition-colors"
                      >
                        <History size={12} />v{(asset.supersedes_count ?? 0) + 1}
                      </button>
                    )}

                    <button
                      type="button"
                      hidden={picking}
                      onClick={() => {
                        replacing.current = asset.id;
                        replaceInput.current?.click();
                      }}
                      aria-label={`Replace ${asset.filename} with a corrected version`}
                      title="Replace with a corrected version"
                      className="absolute top-2 left-2 p-1.5 rounded-lg backdrop-blur-sm bg-noir/60 text-canvas hover:bg-noir/80 cursor-pointer transition-colors"
                    >
                      <Replace size={13} />
                    </button>
                  </div>
                  <p className="mt-1.5 text-[12.5px] text-ink/50 truncate" title={asset.filename}>
                    {asset.filename}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Dragging is handled by the panel, not this box: dropping anywhere in
          the gallery works, and the box is an affordance rather than a target.
          It fills the space when there is nothing to show and shrinks to a
          control once there are photographs. */}
        <div
          className={`${CARD} text-center border-dashed transition-colors ${
            empty ? 'py-20' : 'py-8'
          } ${dragging ? 'border-gold bg-gold/5' : 'border-ink/15'}`}
        >
          <CloudUpload
            size={empty ? 34 : 24}
            className="mx-auto text-ink/30 mb-3"
            strokeWidth={1.5}
          />
          <p className="text-[15.5px] text-ink/70 font-medium mb-1">
            {empty ? 'Drop photographs anywhere here' : 'Add more photographs'}
          </p>
          {empty && (
            <p className="text-[14.5px] text-ink/50 mb-4 max-w-[420px] mx-auto">
              They upload straight to storage — large files are sent in pieces and pick up where
              they left off if the connection drops.
            </p>
          )}
          <div className={empty ? '' : 'mt-3'} />
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="px-4 py-2 rounded-full text-[13.5px] font-bold uppercase tracking-[0.05em] bg-ink text-white hover:bg-gold hover:text-ink transition-colors cursor-pointer"
          >
            Choose files
          </button>
          <input
            ref={input}
            type="file"
            multiple
            accept={UPLOAD_ACCEPT}
            className="hidden"
            onChange={(event) => {
              accept(event.target.files);
              // Cleared so choosing the same file twice still fires a change.
              event.target.value = '';
            }}
          />
        </div>

        {/* Every share and every hide asks first. A single frame is not a
            smaller decision than a gallery — it is the same email, the same
            stage move, and under "all at once" the same whole set. */}
        {answered.length > 0 && (
          <Modal
            open
            onOpenChange={(next) => !next && setAnswered([])}
            title={
              answered.length === 1
                ? 'Does that settle their request?'
                : 'Do those settle their requests?'
            }
            size="sm"
          >
            <div className="space-y-3">
              {answered.map((comment) => (
                <p key={comment.id} className="text-[13.5px] leading-relaxed text-ink/75">
                  <strong className="font-semibold">{comment.author_name}</strong> asked:{' '}
                  {comment.body}
                </p>
              ))}
              <p className="text-[12.5px] text-ink/50 leading-relaxed">
                Marking it done tells them the change has been made. Leave it open if the new
                version is a step rather than the answer.
              </p>
            </div>
            <div className="flex items-center gap-2 border-t border-ink/10 pt-4 mt-6">
              <button
                type="button"
                onClick={() => {
                  const closing = answered;
                  setAnswered([]);
                  void Promise.all(closing.map((comment) => onResolveComment(comment.id)));
                }}
                className="px-5 py-2.5 text-[12px] font-bold rounded-full uppercase tracking-[0.05em] bg-ink text-white hover:bg-gold hover:text-ink transition-colors cursor-pointer"
              >
                {answered.length === 1 ? 'Mark it done' : 'Mark them done'}
              </button>
              <button
                type="button"
                onClick={() => setAnswered([])}
                className="px-5 py-2.5 text-[12px] font-bold rounded-full uppercase tracking-[0.05em] border border-ink/15 text-ink/70 hover:bg-canvas transition-colors cursor-pointer"
              >
                Not yet
              </button>
            </div>
          </Modal>
        )}

        {history && (
          <AssetVersionsDialog
            projectId={projectId}
            assetId={history.id}
            filename={history.filename}
            comments={comments}
            corrected={corrected}
            onShow={setHistory}
            onClose={() => setHistory(null)}
          />
        )}

        {deleting && (
          <Modal
            open
            onOpenChange={(next) => !next && !removing && setDeleting(null)}
            title={`Delete ${deleting.length} photograph${deleting.length === 1 ? '' : 's'}?`}
            description="The files go, and the space comes back. Hiding them instead takes them out of the client's gallery and keeps the originals."
            size="sm"
          >
            <div className="space-y-4">
              {/* Says what else goes. Somebody selecting three tiles and
                  seeing "7 files deleted" afterwards would reasonably think
                  it had taken more than they asked for. */}
              <p className="text-[13.5px] text-ink/60 leading-[1.7]">
                Watermarked previews and any earlier versions of these photographs are removed with
                them. This cannot be undone.
              </p>
              {deleteError && (
                <p role="alert" className="text-[13px] text-red-700">
                  {deleteError}
                </p>
              )}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={removing}
                  onClick={() => setDeleting(null)}
                  className={ACTION}
                >
                  Keep them
                </button>
                <button
                  type="button"
                  disabled={removing}
                  onClick={() => void deleteSelected(deleting)}
                  className="bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-[13px] font-bold uppercase tracking-[0.08em] cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  {removing ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {confirming && (
          <ShareConfirmDialog
            project={project}
            request={confirming}
            busy={releasing.length > 0}
            onCancel={() => setConfirming(null)}
            onConfirm={(message) =>
              void toggleRelease(confirming.ids, confirming.released, message)
            }
          />
        )}

        {filing && (
          <Modal
            open
            onOpenChange={(next) => !next && setFiling(false)}
            title={`Move ${picked.length} photograph${picked.length === 1 ? '' : 's'}`}
            size="sm"
          >
            <div className="space-y-2">
              {/* Said plainly, because it is the thing people assume wrongly:
                  moving does not share, and a folder is not a release. */}
              <p className="text-[13px] text-ink/60 mb-3">
                Filing only. This does not change what the client can see.
              </p>
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  type="button"
                  disabled={busyFolder}
                  onClick={() => void fileInto(folder.id)}
                  className="w-full flex items-center gap-2 text-left text-[13.5px] px-3 py-2.5 rounded-lg border border-ink/10 hover:border-gold hover:bg-gold/5 cursor-pointer"
                >
                  <FolderIcon size={14} className="text-gold" />
                  {folder.name}
                  <span className="ml-auto text-ink/40">{folder.asset_count}</span>
                </button>
              ))}
              <button
                type="button"
                disabled={busyFolder}
                onClick={() => void fileInto(null)}
                className="w-full text-left text-[13.5px] px-3 py-2.5 rounded-lg border border-ink/10 hover:border-ink/30 cursor-pointer"
              >
                Take out of its folder
              </button>
              {folders.length === 0 && (
                <p className="text-[13px] text-ink/50 pt-1">
                  There are no folders yet. Close this and make one first.
                </p>
              )}
              {folderError && <p className="text-[12.5px] text-red-700 pt-1">{folderError}</p>}
            </div>
          </Modal>
        )}

        {dropping && (
          <Modal
            open
            onOpenChange={(next) => !next && setDropping(null)}
            title={`Remove ${dropping.name}?`}
            size="sm"
          >
            <p className="text-[13.5px] text-ink/70 leading-relaxed">
              The folder goes. Its {dropping.asset_count} photograph
              {dropping.asset_count === 1 ? '' : 's'} stay on the project and become unfiled —
              nothing is deleted.
            </p>
            <div className="flex justify-end gap-3 mt-5">
              <button type="button" onClick={() => setDropping(null)} className={ACTION}>
                Keep it
              </button>
              <button
                type="button"
                disabled={busyFolder}
                onClick={() => void removeFolder(dropping)}
                className={`${ACTION} text-red-700 hover:text-red-800`}
              >
                Remove folder
              </button>
            </div>
          </Modal>
        )}

        {lightbox && lightbox.url && (
          <Modal
            open
            onOpenChange={(next) => !next && setLightbox(null)}
            title={lightbox.filename}
            chrome="none"
            size="xl"
          >
            <div className="relative">
              {/* `chrome="none"` paints no surface, so the modal supplies no
                  close control of its own. Escape has always worked and the
                  overlay has always been clickable, but neither is visible —
                  and a viewer with no way out that you can see reads as one
                  that is stuck.
              
                  A dark disc rather than a bare glyph: this sits over a
                  photograph, and a white X on a white dress is nothing. */}
              <button
                type="button"
                onClick={() => setLightbox(null)}
                aria-label="Close"
                className="absolute top-3 right-3 z-30 w-10 h-10 rounded-full bg-noir/60 hover:bg-noir/80 text-canvas flex items-center justify-center backdrop-blur-sm transition-colors"
              >
                <X size={20} />
              </button>

              {isVideo(lightbox) ? (
                <VideoStage
                  src={lightbox.url}
                  className="w-full max-h-[80vh]"
                  onSwipe={(direction) => step(direction === 'next' ? 1 : -1)}
                />
              ) : (
                <SwipeArea onSwipe={(direction) => step(direction === 'next' ? 1 : -1)}>
                  <img
                    src={lightbox.url}
                    alt={lightbox.filename}
                    className="w-full h-auto max-h-[80vh] object-contain rounded-lg select-none"
                    draggable={false}
                  />
                </SwipeArea>
              )}

              {/* Buttons as well as the flick: this screen is worked on a
                  desktop with a mouse, where there is no swipe at all. */}
              {openable.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous frame"
                    onClick={() => step(-1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-noir/50 hover:bg-noir/70 text-canvas flex items-center justify-center backdrop-blur-sm transition-colors"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    aria-label="Next frame"
                    onClick={() => step(1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-noir/50 hover:bg-noir/70 text-canvas flex items-center justify-center backdrop-blur-sm transition-colors"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
            </div>
          </Modal>
        )}

        {items.length > 0 && (
          <div className={`${CARD} overflow-hidden`}>
            <div className="px-5 py-3 flex items-center justify-between border-b border-ink/10">
              <p className="text-[12.5px] uppercase tracking-[0.12em] font-bold text-ink/50">
                {busy
                  ? `Uploading — ${settled} of ${items.length}`
                  : `${items.length} file${items.length === 1 ? '' : 's'}`}
              </p>
              {!busy && (
                <button
                  type="button"
                  onClick={clearFinished}
                  className="text-[12.5px] uppercase tracking-[0.08em] font-bold text-ink/40 hover:text-ink cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <ul>
              {items.map((item) => (
                <li
                  key={item.id}
                  className="px-5 py-3 border-b border-ink/5 last:border-b-0 flex items-center gap-3"
                >
                  <span className="flex-shrink-0">
                    {item.phase === 'done' && <Check size={15} className="text-emerald-600" />}
                    {item.phase === 'deduped' && <Sparkles size={15} className="text-gold" />}
                    {item.phase === 'failed' && (
                      <AlertTriangle size={15} className="text-red-600" />
                    )}
                    {!['done', 'deduped', 'failed'].includes(item.phase) && (
                      <span className="block w-[15px] h-[15px] rounded-full border-2 border-ink/15 border-t-gold animate-spin" />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <p className="text-[14.5px] text-ink truncate">{item.file.name}</p>
                      <span className="text-[12.5px] text-ink/40 flex-shrink-0">
                        {readableSize(item.file.size)}
                      </span>
                    </div>
                    <p
                      className={`text-[12.5px] ${
                        item.phase === 'failed' ? 'text-red-700' : 'text-ink/45'
                      }`}
                    >
                      {item.error ?? PHASE_LABEL[item.phase]}
                    </p>
                    {!['done', 'deduped', 'failed'].includes(item.phase) && (
                      <div className="mt-1.5 h-[3px] bg-ink/8 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gold transition-[width] duration-200"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {item.phase === 'failed' && (
                    <button
                      type="button"
                      onClick={() => retry(item.id)}
                      aria-label={`Retry ${item.file.name}`}
                      className="flex-shrink-0 p-1.5 rounded-lg text-ink/50 hover:text-ink hover:bg-canvas cursor-pointer"
                    >
                      <RotateCw size={14} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
