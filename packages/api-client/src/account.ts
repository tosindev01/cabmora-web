import { apiFetch } from './client';
import type { User } from './types';

/**
 * What a signed-in person can change about their own account.
 *
 * Every call here is implicitly scoped to the caller — none of them takes a
 * user id, because the API derives the subject from the session. Editing
 * somebody else goes through the admin endpoints instead.
 */

/**
 * No `email`. The address is the login and where resets and invites are sent,
 * so changing it is an administrative act rather than a profile edit — and the
 * API refuses the field outright, it does not merely ignore it.
 */
export interface ProfileChanges {
  first_name?: string;
  last_name?: string;
  /** An empty string clears it; omitting the key leaves it alone. */
  phone?: string;
  whatsapp?: string;
}

export function updateProfile(changes: ProfileChanges) {
  return apiFetch<User>('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(changes),
  });
}

export function changePassword(currentPassword: string, newPassword: string) {
  return apiFetch<void>('/auth/me/password', {
    method: 'POST',
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
}

/**
 * Upload a profile picture and return the updated account.
 *
 * One request, with the file in it. This used to be three: hash the file, ask
 * for signed URLs, PUT the parts straight to the bucket, then confirm. That
 * shape exists for 40 GB films and was never right for an 8 MB photograph —
 * it needed a CORS policy on the bucket and an exposed ETag header to work at
 * all, and when either was missing it failed with nothing that explained why.
 *
 * The server holds the bytes now, so it can check the file really is an
 * image, resize it, and strip the EXIF block — which is where a phone records
 * the GPS coordinates of wherever the picture was taken.
 */
export async function uploadAvatar(file: File): Promise<User> {
  const form = new FormData();
  form.append('file', file);
  return apiFetch<User>('/auth/me/avatar', { method: 'POST', body: form });
}
export type NotificationKind = 'invoices' | 'bookings' | 'messages';

export interface Preferences {
  currency: string;
  language: string;
  timezone: string;
  date_format: string;
  /** What they have turned off. Everything else they receive. */
  muted: NotificationKind[];
  /** Sent by the server so a screen offers exactly what it accepts — a list
   *  kept here instead would drift, and the first sign would be a 422. */
  available_currencies: string[];
  available_languages: string[];
  available_date_formats: string[];
  mutable_notifications: NotificationKind[];
}

export interface PreferenceChanges {
  currency?: string;
  language?: string;
  timezone?: string;
  date_format?: string;
  /** Omit to leave notifications alone; `[]` means "send me everything". */
  muted?: NotificationKind[];
}

export function getPreferences() {
  return apiFetch<Preferences>('/auth/me/preferences');
}

export function updatePreferences(changes: PreferenceChanges) {
  return apiFetch<Preferences>('/auth/me/preferences', {
    method: 'PATCH',
    body: JSON.stringify(changes),
  });
}
