import { apiFetch, buildQuery } from '@cabmora/api-client';
import type { Enquiry, EnquiryCreate, OpenSlots } from '@/features/enquiry/types';

export function submitEnquiry(data: EnquiryCreate) {
  return apiFetch<Enquiry>('/enquiries', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * The times a visitor may ask for.
 *
 * Free slots only — the API never says what is booked, so there is nothing
 * here that identifies a client and a taken hour looks the same as a closed
 * one.
 */
export function fetchOpenSlots(start?: string, end?: string) {
  return apiFetch<OpenSlots>(`/enquiries/availability${buildQuery({ start, end })}`);
}
