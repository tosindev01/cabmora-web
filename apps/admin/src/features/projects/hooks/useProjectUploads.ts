import { useCallback, useRef, useState } from 'react';

import { ApiError } from '@cabmora/api-client';

import { confirmUpload, requestUpload, type Asset } from '@/features/projects/api';

/** Where a file is in its journey. */
export type UploadPhase = 'hashing' | 'uploading' | 'finishing' | 'done' | 'deduped' | 'failed';

export interface UploadItem {
  /** Stable across retries, so React keys and progress do not jump. */
  id: string;
  file: File;
  phase: UploadPhase;
  /** 0–100 across hashing and transfer together, so the bar never stalls. */
  progress: number;
  error: string | null;
  asset: Asset | null;
  /** The photograph this upload corrects, when it is a replacement rather
   *  than a new frame. Kept on the item so a retry stays a replacement. */
  replaces?: string;
}

/** Chunks are read one at a time rather than the whole file at once: a folder
 *  of 60 MB RAWs would otherwise sit entirely in memory before anything moved. */
const HASH_CHUNK = 8 * 1024 * 1024;

/** A dropped connection is the normal case on site wifi, not an exception. */
const MAX_PART_ATTEMPTS = 3;

async function sha256(file: File, onProgress: (fraction: number) => void): Promise<string> {
  // `crypto.subtle.digest` cannot stream, so a large file must be reduced in
  // pieces. This reads sequentially and keeps only one chunk alive at a time.
  const chunks: Uint8Array[] = [];
  for (let offset = 0; offset < file.size; offset += HASH_CHUNK) {
    const slice = await file.slice(offset, offset + HASH_CHUNK).arrayBuffer();
    chunks.push(new Uint8Array(slice));
    onProgress(Math.min(1, (offset + HASH_CHUNK) / file.size));
  }
  const whole = new Uint8Array(file.size);
  let at = 0;
  for (const chunk of chunks) {
    whole.set(chunk, at);
    at += chunk.length;
  }
  const digest = await crypto.subtle.digest('SHA-256', whole);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function putPart(url: string, body: Blob, signal: AbortSignal): Promise<string> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_PART_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, { method: 'PUT', body, signal });
      if (!response.ok) throw new Error(`Chunk rejected (${response.status})`);
      const etag = response.headers.get('ETag');
      if (!etag) {
        // The bucket's CORS policy must expose ETag or the browser cannot read
        // it, and the upload can never be assembled. Worth saying plainly —
        // the symptom otherwise looks like a server fault.
        throw new Error('The storage bucket is not exposing ETag headers.');
      }
      return etag;
    } catch (err) {
      if (signal.aborted) throw err;
      lastError = err;
      // Back off a little before trying the same chunk again.
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Chunk failed');
}

export function useProjectUploads(projectId: string, onFinished: () => void) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const aborter = useRef(new AbortController());

  const patch = useCallback((id: string, changes: Partial<UploadItem>) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...changes } : item)));
  }, []);

  const runOne = useCallback(
    async (item: UploadItem) => {
      const { file, id } = item;
      try {
        // Hashing is a third of the bar: on a large file it is a real wait,
        // and a bar that sits at zero looks broken.
        patch(id, { phase: 'hashing', progress: 0 });
        const contentHash = await sha256(file, (fraction) =>
          patch(id, { progress: Math.round(fraction * 30) }),
        );

        const body = {
          content_hash: contentHash,
          filename: file.name,
          content_type: file.type || 'application/octet-stream',
          byte_size: file.size,
        };

        const authorisation = await requestUpload(projectId, body);
        if (authorisation.asset) {
          // Identical bytes were already held — nothing to send.
          patch(id, { phase: 'deduped', progress: 100, asset: authorisation.asset });
          return;
        }

        const ticket = authorisation.ticket!;
        patch(id, { phase: 'uploading', progress: 30 });

        const etags: string[] = [];
        for (let n = 0; n < ticket.part_urls.length; n += 1) {
          const chunk = file.slice(n * ticket.part_size, (n + 1) * ticket.part_size);
          etags.push(await putPart(ticket.part_urls[n], chunk, aborter.current.signal));
          patch(id, {
            progress: 30 + Math.round(((n + 1) / ticket.part_urls.length) * 65),
          });
        }

        patch(id, { phase: 'finishing', progress: 97 });
        const asset = await confirmUpload(projectId, {
          ...body,
          upload_id: ticket.upload_id,
          etags,
          replaces: item.replaces,
        });
        patch(id, { phase: 'done', progress: 100, asset });
      } catch (err) {
        patch(id, {
          phase: 'failed',
          error: err instanceof ApiError ? err.message : (err as Error).message,
        });
      }
    },
    [patch, projectId],
  );

  const add = useCallback(
    /** `replaces` marks the whole batch as a correction of one photograph,
     *  which in practice is always a single file. */
    async (files: File[], replaces?: string) => {
      const queued: UploadItem[] = files.map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        phase: 'hashing',
        progress: 0,
        error: null,
        asset: null,
        replaces,
      }));
      setItems((current) => [...current, ...queued]);

      // Sequential on purpose. Browsers cap concurrent connections per origin,
      // and twenty files racing makes every progress bar crawl at once instead
      // of finishing one photograph at a time.
      for (const item of queued) {
        await runOne(item);
      }
      onFinished();

      // The list is a progress log, not the gallery. Once the photographs are
      // on screen above, successful rows are noise — failures stay, because
      // those still need a decision.
      setTimeout(() => {
        setItems((current) => current.filter((item) => item.phase === 'failed'));
      }, 2500);
    },
    [onFinished, runOne],
  );

  const retry = useCallback(
    (id: string) => {
      const item = items.find((candidate) => candidate.id === id);
      if (item) void runOne({ ...item, phase: 'hashing', progress: 0, error: null });
    },
    [items, runOne],
  );

  const clearFinished = useCallback(() => {
    setItems((current) => current.filter((item) => item.phase === 'failed'));
  }, []);

  return { items, add, retry, clearFinished };
}
