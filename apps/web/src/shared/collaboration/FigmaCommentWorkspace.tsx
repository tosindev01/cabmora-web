import { useMemo, useState, type MouseEvent, type FormEvent } from 'react';
import {
  MessageSquare,
  CheckCircle2,
  RotateCcw,
  Send,
  Crosshair,
  CornerDownRight,
  AlertCircle,
  Filter,
} from 'lucide-react';
import type { ProjectCommentDto } from '@cabmora/api-client';

export interface CanvasAssetItem {
  id: string;
  title: string;
  url: string;
  isVideo?: boolean;
}

interface FigmaCommentWorkspaceProps {
  assets: CanvasAssetItem[];
  comments: ProjectCommentDto[];
  currentUserId?: string;
  canResolve?: boolean;
  onAddComment: (payload: {
    body: string;
    asset_id?: string | null;
    parent_id?: string | null;
    point_x?: number | null;
    point_y?: number | null;
    kind?: 'comment' | 'amendment';
  }) => Promise<void>;
  onResolveComment: (commentId: string) => Promise<void>;
  onReopenComment: (commentId: string) => Promise<void>;
}

const READ_COMMENTS_KEY = 'cabmora_read_comment_ids_v1';

function loadReadIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(READ_COMMENTS_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(READ_COMMENTS_KEY, JSON.stringify(Array.from(ids).slice(-500)));
  } catch {
    // ignore
  }
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function AvatarBubble({ name, url }: { name: string; url?: string | null }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="w-7 h-7 rounded-full object-cover border border-gold/40 shrink-0"
      />
    );
  }
  return (
    <div className="w-7 h-7 rounded-full bg-gold/20 border border-gold/40 text-gold text-[11px] font-bold flex items-center justify-center shrink-0">
      {initials || '?'}
    </div>
  );
}

export function FigmaCommentWorkspace({
  assets,
  comments,
  currentUserId,
  canResolve = true,
  onAddComment,
  onResolveComment,
  onReopenComment,
}: FigmaCommentWorkspaceProps) {
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id ?? '');
  const [filterMode, setFilterMode] = useState<'all' | 'open' | 'unread' | 'resolved'>('all');
  const [pinMode, setPinMode] = useState(true);
  const [draftPin, setDraftPin] = useState<{ x: number; y: number } | null>(null);
  const [draftBody, setDraftBody] = useState('');
  const [draftKind, setDraftKind] = useState<'comment' | 'amendment'>('comment');
  const [submitting, setSubmitting] = useState(false);

  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [readIds, setReadIds] = useState<Set<string>>(loadReadIds);

  const activeAsset = assets.find((a) => a.id === selectedAssetId) ?? assets[0];

  const markThreadRead = (rootId: string, replies: ProjectCommentDto[]) => {
    const next = new Set(readIds);
    next.add(rootId);
    replies.forEach((r) => next.add(r.id));
    setReadIds(next);
    saveReadIds(next);
  };

  const isUnread = (c: ProjectCommentDto) =>
    c.author_id !== currentUserId && !readIds.has(c.id);

  // Separate root comments and replies
  const { rootCommentsForAsset, repliesByParent, countsByAsset } = useMemo(() => {
    const repliesMap = new Map<string, ProjectCommentDto[]>();
    const counts = new Map<string, { total: number; open: number; unread: number }>();

    for (const c of comments) {
      if (c.parent_id) {
        const list = repliesMap.get(c.parent_id) ?? [];
        list.push(c);
        repliesMap.set(c.parent_id, list);
      }
      if (c.asset_id && !c.parent_id) {
        const prev = counts.get(c.asset_id) ?? { total: 0, open: 0, unread: 0 };
        prev.total += 1;
        if (!c.resolved) prev.open += 1;
        if (isUnread(c)) prev.unread += 1;
        counts.set(c.asset_id, prev);
      }
    }

    const roots = comments.filter(
      (c) => !c.parent_id && (!activeAsset || c.asset_id === activeAsset.id || c.asset_id === null),
    );

    const filtered = roots.filter((c) => {
      if (filterMode === 'open') return !c.resolved;
      if (filterMode === 'resolved') return c.resolved;
      if (filterMode === 'unread') {
        const replies = repliesMap.get(c.id) ?? [];
        return isUnread(c) || replies.some(isUnread);
      }
      return true;
    });

    return { rootCommentsForAsset: filtered, repliesByParent: repliesMap, countsByAsset: counts };
  }, [comments, activeAsset, filterMode, readIds, currentUserId]);

  const pinnedForActiveAsset = rootCommentsForAsset.filter(
    (c) => c.asset_id === activeAsset?.id && c.point_x !== null && c.point_y !== null,
  );

  const handleCanvasClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!pinMode || !activeAsset || activeAsset.isVideo) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    setDraftPin({ x, y });
  };

  const handleSubmitNew = async (e: FormEvent) => {
    e.preventDefault();
    if (!draftBody.trim()) return;
    setSubmitting(true);
    try {
      await onAddComment({
        body: draftBody.trim(),
        asset_id: activeAsset?.id ?? null,
        point_x: draftPin ? Number(draftPin.x.toFixed(4)) : null,
        point_y: draftPin ? Number(draftPin.y.toFixed(4)) : null,
        kind: draftKind,
      });
      setDraftBody('');
      setDraftPin(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string, e: FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim()) return;
    setSubmitting(true);
    try {
      await onAddComment({
        body: replyBody.trim(),
        asset_id: activeAsset?.id ?? null,
        parent_id: parentId,
        kind: 'comment',
      });
      setReplyBody('');
      setReplyingToId(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Asset Strip with Comment Indicators */}
      {assets.length > 0 && (
        <div className="bg-white border border-ink/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase tracking-[0.14em] font-bold text-ink/50">
              Project Deliverables ({assets.length}) — Click a picture to inspect or comment
            </span>
            <button
              type="button"
              onClick={() => setPinMode((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 border transition-colors ${
                pinMode
                  ? 'bg-gold text-ink border-gold'
                  : 'bg-sand text-ink/70 border-ink/10 hover:text-ink'
              }`}
            >
              <Crosshair size={14} />
              <span>{pinMode ? 'Pin Comment Mode: ON' : 'Pin Comment Mode: OFF'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {assets.map((asset) => {
              const stats = countsByAsset.get(asset.id);
              const selected = activeAsset?.id === asset.id;
              return (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => {
                    setSelectedAssetId(asset.id);
                    setDraftPin(null);
                  }}
                  className={`relative w-28 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all group ${
                    selected ? 'border-gold ring-2 ring-gold/30' : 'border-ink/10 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={asset.url} alt={asset.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                  <span className="absolute bottom-1 left-1.5 right-1.5 text-[10px] text-white font-medium truncate text-left">
                    {asset.title}
                  </span>
                  {stats && stats.total > 0 && (
                    <span
                      className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow ${
                        stats.unread > 0
                          ? 'bg-gold text-ink'
                          : stats.open > 0
                            ? 'bg-noir/90 text-gold border border-gold/40'
                            : 'bg-emerald-600 text-white'
                      }`}
                    >
                      <MessageSquare size={10} />
                      {stats.total}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Split Figma Canvas + Comment Thread Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Design Canvas */}
        <div className="xl:col-span-8 bg-noir rounded-2xl border border-ink/10 overflow-hidden relative shadow-xl">
          {activeAsset ? (
            <div className="relative flex items-center justify-center min-h-[420px] lg:min-h-[560px] p-4">
              <div
                onClick={handleCanvasClick}
                className={`relative inline-block max-w-full ${
                  pinMode && !activeAsset.isVideo ? 'cursor-crosshair' : 'cursor-default'
                }`}
              >
                {activeAsset.isVideo ? (
                  <video
                    src={activeAsset.url}
                    controls
                    className="max-h-[540px] rounded-xl object-contain"
                  />
                ) : (
                  <img
                    src={activeAsset.url}
                    alt={activeAsset.title}
                    className="max-h-[540px] w-auto rounded-xl object-contain select-none"
                  />
                )}

                {/* Existing Comment Pins */}
                {pinnedForActiveAsset.map((c, idx) => {
                  const isActive = activeThreadId === c.id;
                  const unread = isUnread(c);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setActiveThreadId(c.id);
                        markThreadRead(c.id, repliesByParent.get(c.id) ?? []);
                      }}
                      style={{
                        left: `${(c.point_x ?? 0.5) * 100}%`,
                        top: `${(c.point_y ?? 0.5) * 100}%`,
                      }}
                      title={`${c.author_name}: ${c.body}`}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full rounded-bl-none flex items-center justify-center text-[11px] font-bold shadow-xl border-2 transition-transform ${
                        isActive
                          ? 'scale-125 bg-gold text-ink border-white z-20'
                          : c.resolved
                            ? 'bg-emerald-600 text-white border-white/80 opacity-75 hover:opacity-100'
                            : c.kind === 'amendment'
                              ? 'bg-amber-500 text-ink border-white hover:scale-110'
                              : 'bg-noir text-gold border-gold hover:scale-110'
                      }`}
                    >
                      {idx + 1}
                      {unread && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-gold border border-noir" />
                      )}
                    </button>
                  );
                })}

                {/* Draft Pin Marker */}
                {draftPin && (
                  <div
                    style={{ left: `${draftPin.x * 100}%`, top: `${draftPin.y * 100}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full rounded-bl-none bg-gold text-ink border-2 border-white flex items-center justify-center text-[12px] font-bold shadow-2xl animate-bounce"
                  >
                    +
                  </div>
                )}
              </div>

              {pinMode && !activeAsset.isVideo && !draftPin && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-full bg-black/75 text-canvas/85 text-[11px] backdrop-blur-md pointer-events-none">
                  Click anywhere on the picture to pin a comment
                </div>
              )}
            </div>
          ) : (
            <div className="p-16 text-center text-canvas/50 text-[13px]">
              No pictures uploaded to this project yet.
            </div>
          )}
        </div>

        {/* Right: Figma Comment Thread Sidebar */}
        <div className="xl:col-span-4 bg-white border border-ink/10 rounded-2xl flex flex-col max-h-[640px] overflow-hidden shadow-sm">
          {/* Sidebar Header + Filters */}
          <div className="p-4 border-b border-ink/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-serif text-[17px] font-semibold">
                <MessageSquare size={17} className="text-gold" />
                <span>Design Comments ({rootCommentsForAsset.length})</span>
              </div>
              <Filter size={14} className="text-ink/40" />
            </div>

            <div className="grid grid-cols-4 gap-1 bg-sand p-1 rounded-xl text-[11px] font-medium">
              {(['all', 'open', 'unread', 'resolved'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFilterMode(mode)}
                  className={`py-1.5 rounded-lg capitalize transition-colors ${
                    filterMode === mode
                      ? 'bg-white text-ink font-semibold shadow-sm'
                      : 'text-ink/60 hover:text-ink'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* New Comment / Pin Composer */}
          <form onSubmit={handleSubmitNew} className="p-4 border-b border-ink/10 bg-sand/50 space-y-2.5">
            {draftPin && (
              <div className="flex items-center justify-between text-[11px] text-gold-deep font-semibold bg-gold/15 px-2.5 py-1 rounded-lg">
                <span>
                  Pinned at ({Math.round(draftPin.x * 100)}%, {Math.round(draftPin.y * 100)}%)
                </span>
                <button
                  type="button"
                  onClick={() => setDraftPin(null)}
                  className="underline hover:text-ink"
                >
                  Clear pin
                </button>
              </div>
            )}

            <textarea
              rows={2}
              value={draftBody}
              onChange={(e) => setDraftBody(e.target.value)}
              placeholder={
                draftPin
                  ? 'Add feedback on this exact spot...'
                  : 'Comment on this picture (or click image to pin)...'
              }
              className="w-full bg-white border border-ink/15 rounded-xl p-2.5 text-[13px] outline-none focus:border-gold resize-none"
            />

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setDraftKind('comment')}
                  className={`px-2.5 py-1 rounded-lg border ${
                    draftKind === 'comment'
                      ? 'bg-ink text-white border-ink'
                      : 'border-ink/15 text-ink/60'
                  }`}
                >
                  Comment
                </button>
                <button
                  type="button"
                  onClick={() => setDraftKind('amendment')}
                  className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                    draftKind === 'amendment'
                      ? 'bg-amber-500 text-ink font-semibold border-amber-500'
                      : 'border-ink/15 text-ink/60'
                  }`}
                >
                  <AlertCircle size={11} /> Revision
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting || !draftBody.trim()}
                className="px-3.5 py-1.5 rounded-xl bg-gold text-ink text-[12px] font-semibold hover:bg-gold-dark disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send size={13} /> Post
              </button>
            </div>
          </form>

          {/* Comment Threads List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {rootCommentsForAsset.length === 0 ? (
              <div className="py-10 text-center text-ink/45 text-[12.5px]">
                No comments match this filter yet.
              </div>
            ) : (
              rootCommentsForAsset.map((root, idx) => {
                const replies = repliesByParent.get(root.id) ?? [];
                const isActive = activeThreadId === root.id;
                const unread = isUnread(root) || replies.some(isUnread);

                return (
                  <div
                    key={root.id}
                    onClick={() => {
                      setActiveThreadId(root.id);
                      markThreadRead(root.id, replies);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                      isActive
                        ? 'border-gold bg-gold/5 ring-1 ring-gold/30'
                        : 'border-ink/10 bg-white hover:border-gold/50'
                    } ${root.resolved ? 'opacity-70' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <AvatarBubble name={root.author_name} url={root.author_avatar_url} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12.5px] font-semibold truncate">
                              {root.author_name}
                            </span>
                            {unread && (
                              <span className="w-2 h-2 rounded-full bg-gold shrink-0" title="Unread" />
                            )}
                          </div>
                          <span className="text-[10.5px] text-ink/45 block">
                            {formatTime(root.created_at)}
                            {root.point_x !== null && ` • Pin #${idx + 1}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {root.kind === 'amendment' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-700 border border-amber-500/30">
                            Revision
                          </span>
                        )}
                        {canResolve &&
                          (root.resolved ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                void onReopenComment(root.id);
                              }}
                              className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-500/10"
                              title="Reopen thread"
                            >
                              <RotateCcw size={14} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                void onResolveComment(root.id);
                              }}
                              className="p-1 rounded-lg text-ink/45 hover:text-emerald-600 hover:bg-emerald-500/10"
                              title="Resolve thread"
                            >
                              <CheckCircle2 size={15} />
                            </button>
                          ))}
                      </div>
                    </div>

                    <p className="text-[13px] leading-relaxed">{root.body}</p>

                    {/* Replies */}
                    {replies.length > 0 && (
                      <div className="pl-3 border-l-2 border-gold/30 space-y-2 pt-1">
                        {replies.map((rep) => (
                          <div key={rep.id} className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <AvatarBubble name={rep.author_name} url={rep.author_avatar_url} />
                              <span className="text-[11.5px] font-semibold">{rep.author_name}</span>
                              <span className="text-[10px] text-ink/45">
                                {formatTime(rep.created_at)}
                              </span>
                            </div>
                            <p className="text-[12.5px] pl-8 leading-relaxed">{rep.body}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Trigger & Inline Form */}
                    {replyingToId === root.id ? (
                      <form
                        onSubmit={(e) => void handleSubmitReply(root.id, e)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 pt-1"
                      >
                        <input
                          type="text"
                          value={replyBody}
                          onChange={(e) => setReplyBody(e.target.value)}
                          placeholder="Write a reply..."
                          autoFocus
                          className="flex-1 bg-sand border border-ink/15 rounded-lg px-2.5 py-1.5 text-[12px] outline-none focus:border-gold"
                        />
                        <button
                          type="submit"
                          disabled={submitting || !replyBody.trim()}
                          className="px-2.5 py-1.5 rounded-lg bg-gold text-ink text-[11px] font-semibold"
                        >
                          Reply
                        </button>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReplyingToId(root.id);
                        }}
                        className="text-[11px] text-ink/55 hover:text-gold flex items-center gap-1 font-medium"
                      >
                        <CornerDownRight size={12} /> Reply ({replies.length})
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
