import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '@cabmora/api-client';

import {
  addMyProjectComment,
  approveMyProject,
  getMyProject,
  listMyProjectAssets,
  listMyProjectComments,
  type ClientAsset,
  type ClientProjectDetail,
  type ProjectComment,
  listMyFolders,
  type ClientFolder,
} from '@/features/client/api';

/**
 * One project as its client sees it: the work, and the conversation about it.
 *
 * Loaded together because the gallery and the comments are one screen, and two
 * independent spinners on the same view is worse than one wait.
 */
export function useMyProject(projectId: string) {
  const [project, setProject] = useState<ClientProjectDetail | null>(null);
  const [assets, setAssets] = useState<ClientAsset[]>([]);
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [folders, setFolders] = useState<ClientFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!projectId) return;
    try {
      const [detail, media, thread, parts] = await Promise.all([
        getMyProject(projectId),
        listMyProjectAssets(projectId),
        listMyProjectComments(projectId),
        // Alongside the rest, not after it: one wait, as the comment above
        // says. But caught on its own, unlike the rest.
        //
        // Folders are how the work is arranged; the gallery *is* the work.
        // Inside the shared catch, a folders failure took the whole project
        // view down with it — the client saw "Something went wrong" over an
        // empty page while their photographs sat there perfectly fine. The
        // admin gallery already treated folders this way and the client
        // should have from the start.
        listMyFolders(projectId).catch(() => []),
      ]);
      setProject(detail);
      // Only what they may actually look at. A row with no link means the
      // work exists but is not theirs yet, which belongs in a count rather
      // than as a broken tile in the gallery.
      setAssets(media.filter((asset) => asset.url));
      setComments(thread);
      setFolders(parts);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load this project.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  const comment = useCallback(
    async (
      body: string,
      options: {
        assetId?: string;
        amendment?: boolean;
        /** Where on the photograph, 0–1. Omitted for a remark about the
         *  whole picture, which stays the common case. */
        point?: { x: number; y: number };
      } = {},
    ) => {
      const saved = await addMyProjectComment(projectId, {
        body,
        asset_id: options.assetId,
        kind: options.amendment ? 'amendment' : 'comment',
        point_x: options.point?.x,
        point_y: options.point?.y,
      });
      // Appended rather than re-fetched: the client just wrote it, and a full
      // reload would scroll them away from what they were looking at.
      setComments((current) => [...current, saved]);
      return saved;
    },
    [projectId],
  );

  const approve = useCallback(async () => {
    await approveMyProject(projectId);
    // Reloaded rather than patched in place: approval can take the watermark
    // off, so every link in the gallery has to be minted again. Patching the
    // project alone would leave the client looking at watermarked previews
    // they had just been told were unlocked.
    await load();
  }, [projectId, load]);

  return {
    project,
    assets,
    comments,
    folders,
    loading,
    error,
    comment,
    approve,
    reload: load,
  };
}
