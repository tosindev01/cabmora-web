import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  listProjectAssets,
  addProjectComment,
  listProjectComments,
  resolveComment,
  type ProjectComment,
  type VisibleAsset,
} from '@/features/projects/api';

/** The thread plus everything the console needs to render and act on it. */
export interface ProjectFeedbackState {
  /** Null while loading — distinct from an empty thread, which is a finding. */
  comments: ProjectComment[] | null;
  byAsset: Map<string, VisibleAsset>;
  /** Unresolved change requests — what the client is still waiting on. */
  outstanding: number;
  resolving: string[];
  error: string | null;
  resolve: (commentId: string) => Promise<void>;
  /** Post an answer on the project. Resolves once the thread has reloaded. */
  /** `assetId` pins the reply to one photograph, as the client's own
   *  remarks are pinned. Omit it and the reply is about the project. */
  reply: (body: string, assetId?: string) => Promise<void>;
  reload: () => Promise<void>;
}

/**
 * What the client has said, with the photograph each remark is about.
 *
 * The assets are fetched alongside the thread because "could we try this one
 * warmer?" is unreadable without the frame beside it, and the gallery
 * endpoint already holds the only link that can show it.
 */
export function useProjectFeedback(projectId: string): ProjectFeedbackState {
  const [comments, setComments] = useState<ProjectComment[] | null>(null);
  const [assets, setAssets] = useState<VisibleAsset[]>([]);
  const [resolving, setResolving] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [thread, media] = await Promise.all([
        listProjectComments(projectId),
        listProjectAssets(projectId),
      ]);
      setComments(thread);
      setAssets(media);
      setError(null);
    } catch {
      // An empty thread and a message, rather than a blank tab that looks
      // like the client simply has not said anything.
      setComments([]);
      setError('Could not load the feedback on this project.');
    }
  }, [projectId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const byAsset = useMemo(() => new Map(assets.map((asset) => [asset.id, asset])), [assets]);

  const resolve = useCallback(async (commentId: string) => {
    setResolving((current) => [...current, commentId]);
    try {
      const updated = await resolveComment(commentId);
      // Replaced in place rather than re-fetched: resolving one request
      // should not scroll the reader away from the rest of the thread.
      setComments((current) =>
        (current ?? []).map((item) => (item.id === updated.id ? updated : item)),
      );
      setError(null);
    } catch {
      setError('Could not mark that as done.');
    } finally {
      setResolving((current) => current.filter((id) => id !== commentId));
    }
  }, []);

  const reply = useCallback(
    async (body: string, assetId?: string) => {
      const saved = await addProjectComment(projectId, body, assetId);
      // Appended rather than re-fetched: whoever just wrote it is reading the
      // thread, and a reload would scroll them off what they answered.
      setComments((current) => [...(current ?? []), saved]);
      setError(null);
    },
    [projectId],
  );

  const outstanding = (comments ?? []).filter((item) => item.needs_action).length;

  return { comments, byAsset, outstanding, resolving, error, resolve, reload: refresh, reply };
}
