import { apiFetch, fetchPage } from '@cabmora/api-client';
import type { User, UserRole } from '@cabmora/api-client';
import type {
  Project,
  ProjectDetail,
  ProjectEvent,
  ProjectStage,
  ReleaseMode,
  WatermarkPolicy,
} from '@cabmora/api-client';

// Re-exported so this feature's own modules keep importing from their feature,
// which is the rule. The definitions live in the shared package because
// apps/web reads the same shapes.
export type { Project, ProjectDetail, ProjectEvent, ProjectStage, ReleaseMode, WatermarkPolicy };

/** What a card needs to be acted on without opening the project. */
export interface ProjectSummary {
  photos: number;
  released: number;
  /** Client remarks nobody has dealt with. */
  open_comments: number;
  billed_minor: number;
  paid_minor: number;
  outstanding_minor: number;
}

export const listProjects = (params: Record<string, string | number | boolean | undefined>) =>
  fetchPage<Project>('/admin/projects', params);

/** Payment methods, matching the API's `PaymentMethod`. */
export const PAYMENT_METHODS = ['stripe_card', 'bank_transfer', 'cash', 'other'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/**
 * What a project can be billed in.
 *
 * Mirrors `SUPPORTED_CURRENCIES` in the API's `domain/entities/preferences.py`,
 * which is the source of truth — the entity and the request schema both check
 * against it. If the two drift, the worst case is this dropdown offering
 * something the API refuses with a clear message, rather than a bad value
 * reaching an invoice.
 *
 * Worth narrowing before card payments go live: Stripe's presentment
 * currencies depend on the account's country, and not all of these are
 * chargeable on a UK account.
 */
export const CURRENCIES = ['GBP', 'USD', 'EUR', 'NGN', 'CAD', 'AUD'] as const;

/** How each reads to somebody who is not a developer. */
export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  stripe_card: 'Card, online',
  bank_transfer: 'Bank transfer',
  cash: 'Cash',
  other: 'Something else',
};

export const getProject = (id: string) => apiFetch<ProjectDetail>(`/admin/projects/${id}`);

export const updateProject = (id: string, patch: Partial<Project>) =>
  apiFetch<Project>(`/admin/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });

/** Separate from PATCH so the API's transition rules always run. */
export const changeStage = (id: string, stage: ProjectStage) =>
  apiFetch<Project>(`/admin/projects/${id}/stage`, {
    method: 'POST',
    body: JSON.stringify({ stage }),
  });

export interface CreateProjectBody {
  title: string;
  event_type: string;
  /** Optional — a project can be booked before the client has an account. */
  customer_id?: string;
  description?: string;
  location?: string;
  event_date?: string | null;
  deadline?: string | null;
}

export const createProject = (body: CreateProjectBody) =>
  apiFetch<Project>('/admin/projects', { method: 'POST', body: JSON.stringify(body) });

// ── media ───────────────────────────────────────────────────────────────
/** What the browser knows before it sends a byte. */
export interface UploadRequest {
  content_hash: string;
  filename: string;
  content_type: string;
  byte_size: number;
}

export interface UploadTicket {
  upload_id: string;
  part_size: number;
  part_urls: string[];
}

export interface Asset {
  id: string;
  project_id: string;
  filename: string;
  kind: string;
  content_hash: string;
  /** False until the watermarked preview exists. The original must not be
   *  shown in the meantime — that is the file the watermark protects. */
  renditions_ready: boolean;
  /** Whether the client may see this photograph. False by default — a shoot
   *  contains frames nobody should show. */
  released: boolean;
  /** Which part of the shoot it is filed under, or null for unfiled.
   *  Staff-side organisation — the client's gallery is one flat set. */
  folder_id?: string | null;
}

/** Either something to upload, or an asset that already existed. Never both. */
export interface UploadAuthorisation {
  key: string;
  ticket: UploadTicket | null;
  asset: Asset | null;
}

export const requestUpload = (projectId: string, body: UploadRequest) =>
  apiFetch<UploadAuthorisation>(`/projects/${projectId}/uploads`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const confirmUpload = (
  projectId: string,
  body: UploadRequest & { upload_id: string; etags: string[]; replaces?: string },
) =>
  apiFetch<Asset>(`/projects/${projectId}/uploads/confirm`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

/** An asset plus a link that expires, when the viewer may be handed one. */
export interface VisibleAsset extends Asset {
  /** Null when this person may not see the file yet. */
  url: string | null;
  is_original: boolean;
  /** What `url` points at. A gallery draws a player for `video/*` and an
   *  image for anything else; the filename is not a reliable substitute. */
  content_type?: string | null;
  /** Set when a later upload replaced this frame. Only the team is sent
   *  these rows — the client sees the correction in its place. */
  superseded_by?: string | null;
  /** The watermarked copy does not exist yet, so the client cannot be shown
   *  this however released it is. Normally true for a second or two after
   *  upload. */
  preview_pending?: boolean;
  /** The worker tried and gave up: the file is not one it can read.
   *  Means the same as `preview_pending` for display purposes — no
   *  preview exists — but this one never resolves on its own. */
  preview_failed?: boolean;
  /** How many earlier frames this one replaced. Above zero means there is a
   *  before-and-after to look at; the frames come from `listAssetVersions`. */
  supersedes_count?: number;
}

/** One frame in a photograph's history. */
export interface AssetVersion {
  id: string;
  filename: string;
  /** Null when this viewer may not be handed this file. */
  url: string | null;
  uploaded_at: string;
  /** True for the frame currently in the gallery. Stated by the API rather
   *  than inferred from list order, so a before/after cannot be drawn the
   *  wrong way round. */
  is_current: boolean;
}

/**
 * A photograph and what it replaced, newest first.
 *
 * A separate request because almost no photograph has history, and a gallery
 * of four hundred should not mint links for something hardly anybody opens.
 * A list of one means this frame has never been corrected.
 */
export const listAssetVersions = (projectId: string, assetId: string) =>
  apiFetch<AssetVersion[]>(`/projects/${projectId}/assets/${assetId}/versions`);

export const listProjectAssets = (projectId: string) =>
  apiFetch<VisibleAsset[]>(`/projects/${projectId}/assets`);

/**
 * Show these photographs to the client, or take them back.
 *
 * `message` is a line carried into the email the client receives. It is
 * ignored when withholding — taking work back is deliberately silent, so a
 * note attached to it would go nowhere.
 */
export const releaseAssets = (
  projectId: string,
  assetIds: string[],
  released: boolean,
  message?: string,
) =>
  apiFetch<Asset[]>(`/projects/${projectId}/assets/release`, {
    method: 'POST',
    body: JSON.stringify({ asset_ids: assetIds, released, message: message ?? null }),
  });

/**
 * What a release would do, before it is done.
 *
 * Every field here could be worked out in the browser, and that is exactly
 * why it is not: the release rules belong to the API, and a second copy in a
 * confirmation dialog would be correct until the day they change. A dialog
 * that confidently describes the wrong thing is worse than no dialog.
 */
export interface ReleasePreview {
  /** How many photographs were picked. */
  selected: number;
  /** How many actually change hands — already allows for the release mode,
   *  and ignores anything already where it should be. */
  affected: number;
  /** Of those, how many have no watermarked copy yet: released, and still
   *  not viewable by the client. */
  preview_pending: number;
  notifies_client: boolean;
  /** Where the project ends up, or null if it stays put. */
  moves_to_stage: ProjectStage | null;
  /** Whether the client gets the originals rather than marked copies. */
  hands_over_originals: boolean;
}

export const previewRelease = (projectId: string, assetIds: string[], released: boolean) =>
  apiFetch<ReleasePreview>(`/projects/${projectId}/assets/release/preview`, {
    method: 'POST',
    body: JSON.stringify({ asset_ids: assetIds, released }),
  });

// ── feedback ────────────────────────────────────────────────────────────
/** One thing that was said, about the shoot or about a single photograph. */
export interface ProjectComment {
  id: string;
  project_id: string;
  /** Null when the remark is about the shoot rather than one frame. */
  asset_id: string | null;
  /** Where on that frame, 0–1 on each axis. Null when the client was talking
   *  about the photograph as a whole rather than a spot on it. */
  point_x?: number | null;
  point_y?: number | null;
  author_id: string;
  author_name: string;
  body: string;
  kind: 'comment' | 'amendment';
  resolved: boolean;
  /** An unresolved amendment — work the client is still waiting on. */
  needs_action: boolean;
  created_at: string;
}

/** The same endpoint the client portal reads. Who may see it is decided by
 *  the API against the project, not by which console asked. */
export const listProjectComments = (projectId: string) =>
  apiFetch<ProjectComment[]>(`/projects/${projectId}/comments`);

/** Close an amendment request. The API refuses this for anyone but the team. */
/**
 * Answer the client.
 *
 * The endpoint always allowed this — `AddComment` only asks whether the
 * project is visible to you — but nothing in the console called it, so a
 * client could ask a question and there was no way in the product to reply.
 *
 * Always a `comment`, never an `amendment`: a change request is something the
 * client is owed, and the studio raising one against itself would put a
 * number in the outstanding count that nobody asked for.
 */
export const addProjectComment = (projectId: string, body: string, assetId?: string) =>
  apiFetch<ProjectComment>(`/projects/${projectId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body, asset_id: assetId, kind: 'comment' }),
  });

export const resolveComment = (commentId: string) =>
  apiFetch<ProjectComment>(`/comments/${commentId}/resolve`, { method: 'POST' });

/**
 * Put Cabmora people on a shoot.
 *
 * The whole set, not a delta — the console edits it as a list, and add and
 * remove endpoints that can disagree are how somebody keeps access they were
 * taken off. Admin-only at the API: a coordinator who could add themselves
 * would reach every client.
 */
export const setProjectMembers = (projectId: string, userIds: string[]) =>
  apiFetch<Project>(`/admin/projects/${projectId}/members`, {
    method: 'PUT',
    body: JSON.stringify({ user_ids: userIds }),
  });

/**
 * People who can be put on a shoot.
 *
 * Its own call rather than reaching into the users feature: "who can work on
 * this project" is a question about projects that happens to read the same
 * endpoint. Customers are excluded by asking only for the two roles that can
 * hold work — the API refuses a client either way, but an interface that
 * offers the option and then rejects it is a worse interface.
 */
export const listAssignableStaff = async (): Promise<User[]> => {
  // One request with a repeated `role`, not one per role: two requests could
  // half-fail and render a list that silently omits every creator.
  const roles: UserRole[] = ['coordinator', 'creator'];
  const page = await fetchPage<User>('/admin/users', { role: roles, limit: 100 });
  return [...page.items].sort((a, b) => a.full_name.localeCompare(b.full_name));
};

/**
 * Categories already in use, for the picker on a project.
 *
 * Derived server-side from the projects themselves, not a managed list: a
 * category exists while something uses it. Typing a new one into the field is
 * how you create one — there is nothing else to do.
 */
export const listEventTypes = () => apiFetch<string[]>('/admin/projects/event-types');

/**
 * Remove a photograph and get the space back.
 *
 * Destructive and not undoable: the asset, its watermarked rendition and any
 * version it replaced all go, and the bytes leave the bucket once nothing
 * else points at them. Returns how many files that came to — more than one is
 * normal, which is why the count is worth showing rather than assuming one.
 */
export const deleteAsset = (projectId: string, assetId: string) =>
  apiFetch<{ removed: number }>(`/projects/${projectId}/assets/${assetId}`, {
    method: 'DELETE',
  });

/** A named part of a shoot. See the API's `folder.py` for why these are filed
 *  rather than derived, and why the order is explicit. */
export interface Folder {
  id: string;
  name: string;
  position: number;
  /** Counted the way the grid counts: originals that have not been replaced. */
  asset_count: number;
}

export const listFolders = (projectId: string) =>
  apiFetch<Folder[]>(`/projects/${projectId}/folders`);

export const createFolder = (projectId: string, name: string) =>
  apiFetch<Folder>(`/projects/${projectId}/folders`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });

export const renameFolder = (projectId: string, folderId: string, name: string) =>
  apiFetch<Folder>(`/projects/${projectId}/folders/${folderId}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });

/** Removes the folder only. Its photographs are unfiled, never deleted. */
export const deleteFolder = (projectId: string, folderId: string) =>
  apiFetch<{ moved: number }>(`/projects/${projectId}/folders/${folderId}`, {
    method: 'DELETE',
  });

/** File a batch, or unfile it with `null`. */
export const fileAssets = (projectId: string, assetIds: string[], folderId: string | null) =>
  apiFetch<{ moved: number }>(`/projects/${projectId}/folders/assets`, {
    method: 'PUT',
    body: JSON.stringify({ asset_ids: assetIds, folder_id: folderId }),
  });
