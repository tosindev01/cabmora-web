export { PORTRAIT_BIAS, focalStyle } from './focal';

/**
 * What kind of file is behind a link.
 *
 * In `shared/` because three features ask it — the client gallery, the public
 * share page and the project screens — and a `.endsWith('.mp4')` in each is
 * how a `.mov` ends up inside an `<img>` tag.
 *
 * Reads the media type the API sends rather than the filename. `final.mov` can
 * be H.264 or ProRes and the extension says nothing about it; the server knows
 * what was uploaded.
 */
export function isVideo(media: { content_type?: string | null }): boolean {
  return Boolean(media.content_type?.startsWith('video/'));
}
