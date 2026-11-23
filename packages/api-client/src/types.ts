/**
 * DTOs mirroring the API's response models.
 *
 * Shared rather than per-app: `apps/web` signs in customers and creators,
 * `apps/admin` signs in admins, and both read the same `/auth/me` shape. A
 * second copy is a second thing to forget when the API changes.
 */

/**
 * Two user types plus staff. `customer` and `creator` are the public site's
 * users; `admin` is internal and lives on its own origin.
 *
 * Mirrors `UserRole` in cabmora-api/app/domain/entities/user.py. Never chosen
 * by the client — the API assigns it, and changing one is an admin action.
 */
/** A section of the console. One per sidebar entry. */
export type Permission =
  | 'projects'
  | 'enquiries'
  | 'payments'
  | 'reviews'
  | 'creator_applications'
  | 'reports'
  | 'users'
  | 'team'
  | 'settings';

export type UserRole = 'customer' | 'creator' | 'coordinator' | 'admin';

/**
 * Three states, not a boolean. A `pending` user can sign in — they need a
 * session to load the "awaiting acceptance" screen — while `suspended` cannot
 * authenticate at all. Mirrors `UserStatus` in the API's domain entity.
 */
export type UserStatus = 'pending' | 'active' | 'suspended';

/** What registration asks for. Never a role — the API refuses that. */
export type AccountType = 'customer' | 'creator';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  /** Derived server-side from the parts. Display only — never sent back. */
  full_name: string;
  /** Null for most accounts — only the enquiry form has ever asked. */
  phone?: string | null;
  whatsapp?: string | null;
  /**
   * A signed URL that expires about fifteen minutes after the response was
   * minted. Never cache it, never store it: re-fetch `/auth/me` instead.
   */
  avatar_url?: string | null;
  role: UserRole;
  status: UserStatus;
  /**
   * Where this person's work is, when it is not on the app they are looking at.
   *
   * Set only for staff, and only when the API has been told the console's
   * address. The public site cannot know it any other way — the console is a
   * separate application on its own origin, and baking the host in at build
   * time would mean one image per environment.
   */
  console_url?: string | null;
  /** Sections granted on top of the role. Empty for almost everybody. */
  granted?: Permission[];
  /** What the groups this person is in give them. Kept apart from `granted`
   *  so the console can say where each permission came from. */
  from_groups?: Permission[];
  /** Names of those groups, for display beside what they give. */
  group_names?: string[];
  /** Everything this account can open, role and grants combined — the same
   *  answer the API's guards use, so the menu cannot disagree with the door. */
  reachable?: Permission[];
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// ── Billing ──────────────────────────────────────────────────
// Shared for the same reason as `User`: `apps/admin` raises and settles
// invoices, `apps/web` reads and pays them, and both read the same shapes. The
// *calls* are not shared — they live in each app's `features/billing/api.ts`,
// because the two apps use different endpoints. Mirrors
// cabmora-api/app/domain/entities/invoice.py.

/** Where the document is. Not whether it has been paid. */
export type InvoiceStatus = 'draft' | 'issued' | 'void';

/**
 * How much of an invoice has been paid. Derived server-side from its payments,
 * never stored, so a total and the payments behind it cannot disagree.
 */
export type Settlement = 'unpaid' | 'part_paid' | 'paid' | 'overdue';

export type PaymentMethod = 'stripe_card' | 'bank_transfer' | 'cash' | 'other';

/**
 * Lifecycle only. There is no `refunded` member: a refund is a separate record
 * against the payment, because one payment can have several partial refunds.
 */
export type PaymentStatus = 'pending' | 'confirmed' | 'failed';

export type RefundStatus = 'pending' | 'confirmed' | 'failed';

/** Derived from a payment's confirmed refunds. */
export type RefundState = 'none' | 'partial' | 'full';

/**
 * What the signed-in actor may legally do next.
 *
 * Derived by the API from the same rules it enforces, exactly like
 * `Project.allowed_next_stages`. Render buttons from this rather than
 * reimplementing "can this be voided?" in the client, or the two drift and the
 * UI starts offering actions that earn a 422.
 */
export type InvoiceAction =
  'edit' | 'issue' | 'delete' | 'void' | 'record_payment' | 'refund' | 'pay';

export interface Refund {
  id: string;
  payment_id: string;
  amount_minor: number;
  reason: string;
  status: RefundStatus;
  issued_by_id: string;
  reference: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount_minor: number;
  /** After confirmed refunds. This is the figure settlement counts. */
  net_minor: number;
  method: PaymentMethod;
  status: PaymentStatus;
  refund_state: RefundState;
  refundable_minor: number;
  /** Bank reference, or the gateway's PaymentIntent id. */
  reference: string | null;
  recorded_by_id: string | null;
  confirmed_by_id: string | null;
  confirmed_at: string | null;
  created_at: string;
  refunds: Refund[];
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  /** Integer minor units — pence. Never a float, and never summed client-side. */
  unit_amount_minor: number;
  amount_minor: number;
}

export interface Invoice {
  id: string;
  /** Null while `draft`; burned from a sequence at issue. */
  number: string | null;
  project_id: string;
  customer_id: string;
  issued_by_id: string;
  /** ISO 4217. Do not assume GBP — the API sends it per invoice. */
  currency: string;
  status: InvoiceStatus;
  settlement: Settlement;
  total_minor: number;
  paid_minor: number;
  due_minor: number;
  refunded_minor: number;
  due_at: string;
  issued_at: string | null;
  created_at: string;
  allowed_actions: InvoiceAction[];
}

export interface InvoiceDetail extends Invoice {
  line_items: InvoiceLineItem[];
  payments: Payment[];
  notes: string | null;
}

export interface BillingStats {
  currency: string;
  outstanding_minor: number;
  paid_minor: number;
  pending_minor: number;
  refunded_minor: number;
  overdue_count: number;
}

/**
 * A payment with the invoice and people it belongs to.
 *
 * The extra fields are denormalised by the API for display and are not stored
 * on the payment — same arrangement as `Project.customer_name`.
 */
export interface PaymentRow extends Payment {
  invoice_number: string | null;
  invoice_total_minor: number;
  currency: string;
  customer_name: string | null;
  creator_name: string | null;
  project_title: string | null;
}

// ── Admin analytics ──────────────────────────────────────────
// Mirrors AdminStatsResponse / MonthlyReportResponse in the API.

export interface UserCounts {
  total: number;
  pending: number;
  active: number;
  suspended: number;
  customers: number;
  creators: number;
  admins: number;
}

export interface ProjectCounts {
  total: number;
  /** Anything not closed. Derived server-side so the console and the portal
   *  cannot disagree about what "active" means. */
  active: number;
  in_review: number;
  delivered: number;
}

export interface EnquiryCounts {
  total: number;
  /** Unclaimed — what the dashboard calls "pending". */
  new: number;
  consultation_booked: number;
}

/**
 * Deliberately no revenue and no reviews. Revenue comes from `BillingStats`,
 * which nets off refunds; there is no review entity, and a zero would read as
 * "none pending" rather than "not built".
 */
export interface AdminStats {
  users: UserCounts;
  projects: ProjectCounts;
  enquiries: EnquiryCounts;
}

export interface MonthlyPoint {
  /** "2026-06". Quiet months are present with zeroes, never omitted. */
  month: string;
  customers: number;
  creators: number;
  /** Confirmed payments net of confirmed refunds. */
  revenue_minor: number;
}

export interface MonthlyReport {
  currency: string;
  months: MonthlyPoint[];
}

export interface CreatorPerformance {
  /** Null on the in-house row — a project with no creator is Cabmora's own work. */
  creator_id: string | null;
  name: string;
  is_in_house: boolean;
  projects_total: number;
  projects_active: number;
  /** Billed, not earned: a partner's share needs a commission model. */
  revenue_minor: number;
}

export interface CreatorReport {
  currency: string;
  creators: CreatorPerformance[];
}

// ── Projects ─────────────────────────────────────────────────
// Shared for the same reason as `User`: `apps/admin` manages projects and
// `apps/web` shows the customer their own, and both read the same stage
// vocabulary. It was declared verbatim in both apps before this.

export type ProjectStage =
  'draft' | 'booked' | 'shooting' | 'editing' | 'in_review' | 'delivered' | 'closed';

/** `until_paid` was `until_approved` until the watermark moved onto
 *  payment — approval handed over the finished files before any money
 *  had arrived. */
export type WatermarkPolicy = 'always' | 'until_paid' | 'never';
export type ReleaseMode = 'selective' | 'all_at_once';

export interface ProjectEvent {
  id: string;
  kind: string;
  actor_id: string | null;
  payload: Record<string, unknown>;
  occurred_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  event_type: string;
  location: string;
  event_date: string | null;
  deadline: string | null;
  /** Null until a client is assigned — a project can be booked first. */
  customer_id: string | null;
  /** Resolved server-side for display; not stored on the project. */
  customer_name: string | null;
  /** Null means Cabmora's own work rather than a partner's. */
  creator_id: string | null;
  creator_name: string | null;
  stage: ProjectStage;
  /** Derived from `stage` server-side, so both frontends agree what it means. */
  progress: number;
  /** Only the legal moves — derived from the same transition map the API
   *  enforces, so a control built from it cannot offer a refused change. */
  allowed_next_stages: ProjectStage[];
  /** Cabmora people put on this shoot — ids only. A coordinator sees a
   *  project because their id is in here; nothing else grants it. */
  member_ids: string[];
  /** Counts and totals for the card. Absent on single-project endpoints,
   *  where the detail screens ask those questions directly. */
  summary?: {
    photos: number;
    released: number;
    open_comments: number;
    billed_minor: number;
    paid_minor: number;
    outstanding_minor: number;
  } | null;
  /** When the client accepted the work. Null until they do. */
  approved_at: string | null;
  /** Minor units. Null until agreed, which is not the same as zero. */
  price_minor: number | null;
  /** ISO 4217. What the price is denominated in, and what any invoice
   *  raised for this project inherits. Always present — the API defaults
   *  it to GBP rather than leaving it null. */
  currency: string;
  /** How this client is expected to pay — intent, not a record of money. */
  payment_method: 'stripe_card' | 'bank_transfer' | 'cash' | 'other' | null;
  watermark_policy: WatermarkPolicy;
  release_mode: ReleaseMode;
  require_approval_before_delivery: boolean;
  require_payment_before_delivery: boolean;
  /** Whether the client may hand out a link that needs no account.
   *  Off unless an admin turned it on for this project. */
  allow_client_sharing: boolean;
  /** Whether the client is offered a save button at all. The watermark
   *  policy still decides which file is behind it. */
  allow_downloads: boolean;
  created_at: string;
}

export interface ProjectDetail extends Project {
  /** Read from the client's account, so a changed number changes once. */
  customer_email: string | null;
  customer_phone: string | null;
  customer_whatsapp: string | null;
  events: ProjectEvent[];
}

/** A named bundle of permissions, assignable to coordinators. */
export interface AccessGroup {
  id: string;
  name: string;
  permissions: Permission[];
  /** How many people are in it — what an edit is about to affect. */
  member_count: number;
  created_at: string;
}
