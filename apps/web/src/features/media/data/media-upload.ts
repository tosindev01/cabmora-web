/**
 * Fixtures and types for the MediaUpload screen.
 *
 * Stand-ins until the API is wired up (WP5). They live here rather than beside
 * the JSX so that swap touches one module instead of the component — and so a
 * test can import them without a DOM.
 */

export interface UploadItem {
  id: string;
  name: string;
  size: number;
  type: 'photo' | 'video' | 'raw' | 'audio';
  progress: number;
  status: 'uploading' | 'paused' | 'completed' | 'error';
  folder?: string;
  speed?: string;
}

export const EXISTING_ALBUMS = [
  'Smith & Wesson Wedding - RAWs',
  'Smith & Wesson Wedding - Highlight Film',
  'Elena Editorial - High Res Edits',
  'TechCorp Corporate Event',
  'Johnson Family Portraits',
  'Unsorted Media',
];
