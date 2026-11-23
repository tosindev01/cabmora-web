import { apiFetch, fetchPage } from '@cabmora/api-client';

export type EnquiryStatus = 'new' | 'contacted' | 'consultation_booked' | 'quoted' | 'won' | 'lost';

export type MeetingProvider = 'manual' | 'google_meet';

export interface EnquiryEvent {
  id: string;
  kind: string;
  actor_id: string | null;
  payload: Record<string, unknown>;
  occurred_at: string;
}

export type ConsultationStatus = 'requested' | 'confirmed';

export interface Consultation {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  /** `requested` means the client picked this and is waiting to hear. Nothing
   *  is in a diary and there is no link until it is confirmed. */
  status: ConsultationStatus;
  meeting_url: string | null;
  provider: MeetingProvider;
  cancelled_at: string | null;
}

export interface Enquiry {
  id: string;
  first_name: string;
  last_name: string;
  /** Derived server-side from the two parts. */
  full_name: string;
  whatsapp: string | null;
  email: string;
  phone: string | null;
  event_type: string;
  event_date: string | null;
  deadline: string | null;
  message: string;
  status: EnquiryStatus;
  /** Only the legal moves — derived from the same map the API enforces. */
  allowed_next_statuses: EnquiryStatus[];
  assigned_to: string | null;
  assigned_to_name: string | null;
  customer_id: string | null;
  converted_project_id: string | null;
  budget_min_minor: number | null;
  budget_max_minor: number | null;
  created_at: string;
}

/** An account already registered to this lead's email address. */
export interface ExistingAccount {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  /** False for a staff address: the project is created with no client. */
  is_customer: boolean;
}

export interface EnquiryDetail extends Enquiry {
  events: EnquiryEvent[];
  consultations: Consultation[];
  /** Null when converting will create a new account and issue an invite. */
  existing_account: ExistingAccount | null;
}

export interface ConversionResult {
  project_id: string;
  /** Null when the address belonged to a non-customer account. */
  customer_id: string | null;
  /** Shown once; only present outside production and only for new accounts. */
  invite_url: string | null;
  /** The conversion succeeded, but something needs acting on. */
  warning: string | null;
}

export const listEnquiries = (params: Record<string, string | number | boolean | undefined>) =>
  fetchPage<Enquiry>('/admin/enquiries', params);

export const getEnquiry = (id: string) => apiFetch<EnquiryDetail>(`/admin/enquiries/${id}`);

/** What staff may change about a lead. No `email` — see `EnquiryUpdateRequest`. */
export interface EnquiryPatch {
  status?: EnquiryStatus;
  assigned_to?: string;
  budget_min_minor?: number;
  budget_max_minor?: number;
  first_name?: string;
  last_name?: string;
  phone?: string;
  whatsapp?: string;
  event_type?: string;
  message?: string;
  /** Settled on the call, and carried to the project on conversion. */
  event_date?: string;
  deadline?: string;
}

export const updateEnquiry = (id: string, patch: EnquiryPatch) =>
  apiFetch<Enquiry>(`/admin/enquiries/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });

export const addNote = (id: string, body: string) =>
  apiFetch<EnquiryEvent>(`/admin/enquiries/${id}/notes`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });

export const scheduleConsultation = (
  id: string,
  body: { scheduled_at: string; duration_minutes?: number; meeting_url?: string },
) =>
  apiFetch<Consultation>(`/admin/enquiries/${id}/consultations`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

/**
 * Agree a call the client asked for, at their time or another.
 *
 * Passing no `scheduled_at` accepts what they picked. Passing one moves it —
 * the same request, because confirming and rescheduling are one decision and
 * two endpoints would produce the one where the time changed silently.
 */
export const confirmConsultation = (
  enquiryId: string,
  consultationId: string,
  body: { scheduled_at?: string; duration_minutes?: number; meeting_url?: string } = {},
) =>
  apiFetch<Consultation>(`/admin/enquiries/${enquiryId}/consultations/${consultationId}/confirm`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const convertEnquiry = (
  id: string,
  body: {
    first_name: string;
    last_name: string;
    title: string;
    event_type?: string;
    /** Confirmed at conversion and written onto the project. */
    event_date?: string;
    deadline?: string;
  },
) =>
  apiFetch<ConversionResult>(`/admin/enquiries/${id}/convert`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

/**
 * A slot already taken, as the availability grid needs it.
 *
 * `ends_at` comes from the server rather than being recomputed here: the clash
 * rule that refuses a booking uses the same figure, and a grid that disagrees
 * with it would show a slot as free and then be refused on submit.
 */
export interface BookedSlot {
  consultation_id: string;
  enquiry_id: string;
  client_name: string;
  event_type: string;
  starts_at: string;
  ends_at: string;
  duration_minutes: number;
  meeting_url: string | null;
}

export interface Availability {
  start: string;
  end: string;
  /** What is taken. Free slots are the caller's judgement — see the API. */
  booked: BookedSlot[];
}

/** Both bounds are ISO strings; the API caps the window at 31 days. */
export const getAvailability = (start: string, end: string) =>
  apiFetch<Availability>(
    `/admin/enquiries/availability?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
  );

/* ── Triage ─────────────────────────────────────────────────────────────
   Open leads, ordered by how soon the client's event is. The band is decided
   server-side: two frontends that each worked out what "this week" meant would
   eventually disagree, and whichever was wrong would be the one somebody was
   relying on. */

export type UrgencyBand =
  /** The event has gone and the lead is still open — a miss, not a job. */
  | 'passed'
  | 'this_week'
  | 'this_month'
  | 'this_quarter'
  | 'later'
  /** No date on the record. Not the same as `later`: we know nothing, rather
   *  than knowing it is far off. */
  | 'undated';

export interface TriagedEnquiry {
  id: string;
  full_name: string;
  event_type: string;
  event_date: string | null;
  status: EnquiryStatus;
  band: UrgencyBand;
  /** Negative once the event has passed, null when undated. */
  days_until: number | null;
  /** How long it has been waiting for a reply. Always present. */
  days_waiting: number;
  assigned_to_name: string | null;
  /** Still untouched with the event close. */
  needs_chasing: boolean;
  created_at: string;
}

export interface EnquiryTriage {
  items: TriagedEnquiry[];
  /** Every open lead, so a table showing the first N can say what it omits. */
  open_total: number;
}

export const getEnquiryTriage = (limit = 50) =>
  apiFetch<EnquiryTriage>(`/admin/enquiries/triage?limit=${limit}`);
