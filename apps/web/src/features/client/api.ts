import { apiFetch, fetchPage } from '@cabmora/api-client';
import type { ProjectStage } from '@cabmora/api-client';

export type { ProjectStage };

export interface ProjectEvent {
  id: string;
  kind: string;
  payload: Record<string, unknown>;
  occurred_at: string;
}

/**
 * Counts and totals for one project, as the client is shown them.
 *
 * The same figures the console sees, and all of them already theirs: their
 * photographs, their change requests, their invoice. Absent on the
 * single-project endpoint, where the screen asks those questions directly.
 */
export interface ClientProjectSummary {
  /** Photographs on the project, including ones not released to them yet. */
  photos: number;
  /** How many they can actually look at. */
  released: number;
  /** Changes they have asked for that we have not dealt with. */
  open_comments: number;
  billed_minor: number;
  paid_minor: number;
  /** Never negative — an overpayment is a credit, not a debt. */
  outstanding_minor: number;
}

export interface ClientProject {
  id: string;
  title: string;
  description: string;
  event_type: string;
  location: string;
  event_date: string | null;
  /** When the work is due with them. The question every client actually has. */
  deadline: string | null;
  stage: ProjectStage;
  progress: number;
  creator_name: string | null;
  /** What the job costs, in minor units. Null until it has been agreed. */
  price_minor: number | null;
  summary?: ClientProjectSummary | null;
  /** Whether the studio has allowed this gallery to be shared by link. */
  allow_client_sharing: boolean;
  /** Whether a save button is offered at all. */
  allow_downloads: boolean;
  /** What decides whether they hold proofs or the finished files. */
  watermark_policy: 'always' | 'until_paid' | 'never';
  /** Null until the client signs the work off. */
  approved_at: string | null;
  created_at: string;
}

export interface ClientProjectDetail extends ClientProject {
  /** Whose project this is. Approval belongs to them and nobody else, so a
   *  member of staff viewing the client portal needs to be told that rather
   *  than shown a button that answers 403. */
  customer_id: string | null;
  events: ProjectEvent[];
}

/**
 * The caller's own projects.
 *
 * No customer id is sent — the API takes it from the session. Accepting one
 * here would make every client's work readable by changing a number.
 */
export const listMyProjects = () => fetchPage<ClientProject>('/projects', { limit: 50 });

export const getMyProject = (id: string) => apiFetch<ClientProjectDetail>(`/projects/${id}`);

// ── rating ──────────────────────────────────────────────────────────────
export interface ProjectRating {
  stars: number;
  words: string;
  /** Whether they agreed to be quoted publicly. */
  may_publish: boolean;
  created_at: string;
  updated_at: string | null;
  /** Google's own review form with our listing chosen, or null when no
   *  listing has been configured. A link out, never a post: nobody can submit
   *  a review on somebody else's behalf. */
  google_review_url: string | null;
}

/** PUT, because there is one rating per project — sending it twice means they
 *  changed their mind, not that they left two. */
export const rateMyProject = (
  projectId: string,
  body: { stars: number; words: string; may_publish: boolean },
) =>
  apiFetch<ProjectRating>(`/projects/${projectId}/rating`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

export const getMyProjectRating = (projectId: string) =>
  apiFetch<ProjectRating | null>(`/projects/${projectId}/rating`);

/**
 * Accept the work.
 *
 * Its own endpoint rather than a stage change: moving a project along is the
 * team's job, and this is the one move that belongs to the client. On a
 * project watermarked "until approved", this is also what takes the mark off
 * the photographs.
 */
export const approveMyProject = (id: string) =>
  apiFetch<ClientProject>(`/projects/${id}/approve`, { method: 'POST' });

/** Client-facing wording. "in_review" is our word; "Ready for you" is theirs. */
export const STAGE_LABEL: Record<ProjectStage, string> = {
  draft: 'Being set up',
  booked: 'Booked',
  shooting: 'Shoot scheduled',
  editing: 'Being edited',
  in_review: 'Ready for your review',
  delivered: 'Delivered',
  closed: 'Complete',
};

/**
 * What the stage means for them, in a sentence.
 *
 * The label alone says where the project is; this says what it means and
 * what happens next, which is the thing a client is actually asking when
 * they open the portal. Written from their side — "we" is Cabmora.
 */
export const STAGE_NOTE: Record<ProjectStage, string> = {
  draft: 'We are still putting the details together. Nothing is needed from you yet.',
  booked: 'Your date is confirmed and in the diary. We will be in touch before the day.',
  shooting: 'The shoot is scheduled. Your photographs will follow once we have them.',
  editing: 'We are working through your photographs. You will hear from us when they are ready.',
  in_review:
    'Your photographs are ready. Have a look, ask for any changes, and approve when happy.',
  delivered: 'Approved and delivered. Your photographs are yours to download.',
  closed: 'This project is complete. Everything stays here if you need it again.',
};

export const STAGE_PILL: Record<ProjectStage, string> = {
  draft: 'bg-ink/8 text-ink/50',
  booked: 'bg-blue-50 text-blue-800',
  shooting: 'bg-purple-50 text-purple-800',
  editing: 'bg-amber-50 text-amber-900',
  in_review: 'bg-gold/25 text-ink',
  delivered: 'bg-emerald-50 text-emerald-800',
  closed: 'bg-ink/8 text-ink/45',
};

export function formatDate(value: string | null): string {
  if (!value) return 'To be confirmed';
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ── the gallery ─────────────────────────────────────────────────────────
/**
 * A photograph as the client is allowed to see it.
 *
 * `url` is null when the work exists but is not theirs to look at yet —
 * withheld, or its watermarked preview not made. The row still comes back, so
 * a client can tell there is work in progress without being handed it.
 */
export interface ClientAsset {
  id: string;
  project_id: string;
  filename: string;
  kind: string;
  content_hash: string;
  renditions_ready: boolean;
  released: boolean;
  url: string | null;
  is_original: boolean;
  /** Which part of the shoot it belongs to, or null. */
  folder_id?: string | null;
  /** What `url` points at, so a gallery draws a player for a film and an
   *  image for a photograph. */
  content_type?: string | null;
  /** How many earlier frames this one replaced. Above zero means you asked
   *  for a change and this is the version that answered it. */
  supersedes_count?: number;
}

/** One frame in a photograph's history. */
export interface AssetVersion {
  id: string;
  filename: string;
  url: string | null;
  uploaded_at: string;
  is_current: boolean;
}

/**
 * This photograph and the one it replaced, newest first.
 *
 * A client may see an earlier version for the same reason they may see the
 * one that replaced it: a correction inherits the release state of the frame
 * it corrected, so anything with history here was already theirs to look at.
 * Asked for only when they open a comparison, never on gallery load.
 */
export const listMyAssetVersions = (projectId: string, assetId: string) =>
  apiFetch<AssetVersion[]>(`/projects/${projectId}/assets/${assetId}/versions`);

export const listMyProjectAssets = (projectId: string) =>
  apiFetch<ClientAsset[]>(`/projects/${projectId}/assets`);

// ── the conversation ────────────────────────────────────────────────────
export interface ProjectComment {
  id: string;
  project_id: string;
  asset_id: string | null;
  author_id: string;
  author_name: string;
  body: string;
  kind: 'comment' | 'amendment';
  resolved: boolean;
  /** An amendment nobody has dealt with yet. */
  needs_action: boolean;
  created_at: string; /** Where on the photograph, 0–1 on each axis. Null for a remark about
   *  the picture as a whole. */
  point_x?: number | null;
  point_y?: number | null;
}

// ── messages ────────────────────────────────────────────────────────────
/**
 * One project's thread, as the Messages screen shows it.
 *
 * Nothing new is stored behind this. A comment with no `asset_id` has always
 * meant a remark about the project rather than one photograph; this is the
 * first screen that surfaces them.
 */
export interface Conversation {
  project_id: string;
  project_title: string;
  event_type: string;
  stage: ProjectStage;
  messages: ProjectComment[];
}

/** Scoped to the caller by the API — no project id is sent. */
export const listMyConversations = () => apiFetch<Conversation[]>('/conversations');

export const listMyProjectComments = (projectId: string) =>
  apiFetch<ProjectComment[]>(`/projects/${projectId}/comments`);

/**
 * Leave feedback. `asset_id` pins it to one photograph; omit it and the
 * comment is about the project as a whole.
 *
 * `kind: 'amendment'` marks it as a change request rather than a remark —
 * only those count as outstanding work for the team.
 */
export const addMyProjectComment = (
  projectId: string,
  body: {
    body: string;
    asset_id?: string;
    kind?: 'comment' | 'amendment';
    /** Where on the photograph, 0–1 on each axis. Both or neither. */
    point_x?: number;
    point_y?: number;
  },
) =>
  apiFetch<ProjectComment>(`/projects/${projectId}/comments`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

// ── share links ─────────────────────────────────────────────────────────
/**
 * A link that lets somebody see this gallery without an account.
 *
 * The secret is not here. It comes back once, from the call that creates the
 * link, and cannot be recovered afterwards — the server stores only a hash,
 * for the same reason it stores only a hash of a password. Losing a link
 * means making another and revoking the old one.
 */
export interface GalleryShare {
  id: string;
  label: string;
  created_at: string;
  expires_at: string;
  revoked_at: string | null;
  last_viewed_at: string | null;
  views: number;
  /** Live right now — the API works this out rather than leaving the browser
   *  to compare two timestamps against its own clock. */
  active: boolean;
  /** How many photographs are behind the link, or null for the whole
   *  gallery. Null and 0 are different answers: one is everything, the other
   *  is a chosen few that have since been deleted. */
  photograph_count: number | null;
}

export interface IssuedShare extends GalleryShare {
  /** The whole link. Shown once. */
  url: string;
}

export const listShares = (projectId: string) =>
  apiFetch<GalleryShare[]>(`/projects/${projectId}/shares`);

/**
 * Hand out a link.
 *
 * `assetIds` of null shares the whole gallery, which is what every link did
 * before there was a choice. A list shares those photographs and no others.
 * An empty list is refused by the server rather than guessed at — "none" and
 * "all" differ by the entire gallery there.
 *
 * The server checks the ids against what this person may actually pass on,
 * so the picker chooses between permitted photographs rather than granting
 * anything.
 */
export const createShare = (projectId: string, label: string, assetIds: string[] | null = null) =>
  apiFetch<IssuedShare>(`/projects/${projectId}/shares`, {
    method: 'POST',
    body: JSON.stringify({ label, asset_ids: assetIds }),
  });

export const revokeShare = (projectId: string, shareId: string) =>
  apiFetch<GalleryShare>(`/projects/${projectId}/shares/${shareId}`, { method: 'DELETE' });

// ── the public view ─────────────────────────────────────────────────────
export interface SharedPhotograph {
  id: string;
  filename: string;
  url: string;
  content_type?: string | null;
}

export interface SharedGallery {
  project_title: string;
  event_type: string;
  photographs: SharedPhotograph[];
  expires_at: string;
  /** Whether these are the finished files or marked proofs, so the page can
   *  say which instead of leaving somebody puzzled by the watermark. */
  hands_over_originals: boolean;
}

/** No session is sent or needed. The token in the path is the whole claim. */
export const viewSharedGallery = (token: string) =>
  apiFetch<SharedGallery>(`/shared/${encodeURIComponent(token)}`);

// ── money ───────────────────────────────────────────────────────────────
export type { Invoice, InvoiceDetail, Payment } from '@cabmora/api-client';

/** Where a transfer should go. Null until the studio has configured it —
 *  never a placeholder, because somebody will pay whatever they are shown. */
export interface PaymentInstructions {
  account_name: string;
  bank_name: string;
  sort_code: string;
  account_number: string;
  iban: string | null;
}

export const listMyInvoices = () => fetchPage<ClientInvoice>('/invoices', { limit: 50 });

/** What this client owes, totalled by the API. Never summed in the browser. */
export interface BillingSummary {
  currency: string;
  outstanding_minor: number;
  paid_minor: number;
  /** Reported by them, not yet confirmed by us. */
  pending_minor: number;
  overdue_count: number;
}

export const getMyBillingSummary = () => apiFetch<BillingSummary>('/billing/summary');

export const getPaymentInstructions = () =>
  apiFetch<PaymentInstructions | null>('/billing/payment-instructions');

/**
 * Tell the studio a payment has been sent.
 *
 * Changes nothing on its own: it lands pending and an administrator has to
 * confirm the money arrived before anything is settled. That is deliberate —
 * it is what makes it safe to let the person who owes the money file it.
 */
export const declareMyPayment = (
  invoiceId: string,
  body: { amount_minor: number; method: 'bank_transfer' | 'cash' | 'other'; reference?: string },
) =>
  apiFetch(`/invoices/${invoiceId}/payments`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

export interface ClientInvoice {
  id: string;
  number: string | null;
  project_id: string;
  currency: string;
  status: 'draft' | 'issued' | 'void';
  settlement: 'unpaid' | 'part_paid' | 'paid' | 'overdue';
  total_minor: number;
  paid_minor: number;
  due_minor: number;
  due_at: string;
  issued_at: string | null;
}

/** A part of the shoot, as the client is allowed to see it.
 *
 * The API narrows this for a client: counts cover only released work, and a
 * folder with nothing released is left out entirely — an empty "Reception"
 * would tell them the reception exists and is being kept from them. */
export interface ClientFolder {
  id: string;
  name: string;
  position: number;
  asset_count: number;
}

export const listMyFolders = (projectId: string) =>
  apiFetch<ClientFolder[]>(`/projects/${projectId}/folders`);

/** One photograph in the client's own library, across every project. */
export interface LibraryItem {
  id: string;
  filename: string;
  url: string;
  content_type?: string | null;
  /** Whether this link is the untouched file rather than the watermarked copy. */
  is_original: boolean;
  /** Whether a save button should appear. Separate from which file is behind
   *  the link: downloads on with the job unpaid saves the watermarked copy. */
  downloadable: boolean;
  released_at: string | null;
  project_id: string;
  project_title: string;
  project_event_type: string;
}

export const listMyMedia = () => apiFetch<LibraryItem[]>('/me/media');

/**
 * Where to send the browser so this file lands on the device.
 *
 * Minted per click rather than taken from the row, which is what makes an
 * expired download impossible: the links a gallery is holding live fifteen
 * minutes, so a tab left open over lunch had nothing but dead ones and the
 * save reported that the link had expired.
 *
 * The URL it returns carries a signed `attachment` disposition. That is the
 * part a browser obeys — a `download` attribute on an anchor is ignored for
 * cross-origin URLs, and a presigned storage link is always cross-origin,
 * which is why the old anchor opened the photograph in a tab instead.
 */
export const downloadUrl = (assetId: string) =>
  apiFetch<{ url: string }>(`/me/media/${assetId}/download`).then((r) => r.url);
