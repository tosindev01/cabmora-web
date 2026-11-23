export interface EnquiryCreate {
  first_name: string;
  last_name: string;
  email: string;
  /** Both carry their dialling code — see `countries.ts`. */
  phone?: string;
  whatsapp?: string;
  event_type: string;
  event_date?: string;
  message: string;
  /** The instant the visitor asked for. A request, not a booking. */
  preferred_slot?: string;
}

export interface Enquiry extends EnquiryCreate {
  id: string;
  /** Derived server-side from the two parts. */
  full_name: string;
  /** Mirrors EnquiryStatus in the API. Was 'converted' | 'closed', which the
   *  API stopped using when the lead pipeline gained a quoting stage. */
  status: 'new' | 'contacted' | 'consultation_booked' | 'quoted' | 'won' | 'lost';
  created_at: string;
}

/** What `GET /enquiries/availability` returns. */
export interface OpenSlots {
  /** ISO instants, ascending. Already filtered to what is bookable. */
  slots: string[];
  duration_minutes: number;
}
