/**
 * What kind of file a gallery tile is holding.
 *
 * One answer in one place, because three screens ask it — the grid, the
 * lightbox and the replace control — and a `.endsWith('.mp4')` in each is how
 * a `.mov` ends up inside an `<img>` tag.
 *
 * Reads the media type the API sends rather than the filename. A file called
 * `final.mov` can be H.264 or ProRes and the extension says nothing about it;
 * the server knows what was uploaded.
 */
export function isVideo(asset: { content_type?: string | null }): boolean {
  return Boolean(asset.content_type?.startsWith('video/'));
}

/**
 * What a file picker should offer.
 *
 * Both are accepted now. Camera-native video — ProRes, BRAW — uploads and
 * stores correctly but will not play back until there is transcoding, which
 * is why the gallery says so rather than silently showing a dead player.
 */
export const UPLOAD_ACCEPT = 'image/*,video/*';
