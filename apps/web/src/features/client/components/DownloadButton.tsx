import { useState } from 'react';
import { Check, Download } from 'lucide-react';
import { downloadUrl } from '@/features/client/api';

interface DownloadButtonProps {
  /** The photograph to save. The link is minted from this on the click. */
  assetId: string;
  /** What the viewer is actually saving, so the label can be honest. */
  isOriginal: boolean;
  /** Icon only, for a caption line under a thumbnail where a pill would
   *  crowd out the project name. The words still arrive as a tooltip. */
  compact?: boolean;
}

/**
 * Save the file you are looking at, to the device.
 *
 * Only rendered when the project allows downloads — an admin decides that per
 * project, and the default is off because the PRD asks for galleries that are
 * not downloadable.
 *
 * Two earlier versions of this did not work, and both failed in the same
 * direction: the photograph opened in a tab rather than arriving in
 * Downloads.
 *
 * The first was `<a href={presignedUrl} download>`. A `download` attribute is
 * **ignored for cross-origin URLs**, and a presigned storage link always is
 * one, so the browser simply navigated to the picture. The query string would
 * have named the file after the signature anyway.
 *
 * The second fetched the bytes and saved a blob. That asks the bucket for a
 * CORS grant the moment a client clicks — so it failed wherever the policy
 * had not been updated, which is how this reached UAT as "clients cannot
 * download" — and it holds the entire file in the tab's memory, which can
 * never work for the video this platform is sold on.
 *
 * So the disposition is set where a browser cannot ignore it: on the stored
 * object, signed into the link the API mints. Following that link downloads
 * the file, under its real name, streamed by the browser's own download
 * manager. Nothing here reads a byte.
 */
export function DownloadButton({ assetId, isOriginal, compact = false }: DownloadButtonProps) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const url = await downloadUrl(assetId);

      // An anchor click, not `location.href`: a navigation that turns out to
      // render rather than download would take the client out of the portal,
      // and this is the one surface where that is the failure being fixed.
      const link = document.createElement('a');
      link.href = url;
      link.rel = 'noreferrer';
      // Honoured only if the file ever comes back same-origin — the local
      // development store does. Harmless otherwise: the signed disposition
      // is what decides, and it carries the name too.
      link.download = '';
      document.body.appendChild(link);
      link.click();
      link.remove();

      setDone(true);
      window.setTimeout(() => setDone(false), 2500);
    } catch (failure) {
      // The API answers in sentences — "Downloads are not enabled for this
      // project" is the common one, and it is worth showing rather than
      // replacing with something generic.
      setError(
        failure instanceof Error && failure.message
          ? failure.message
          : 'That file could not be saved. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          void save();
        }}
        disabled={busy}
        title={isOriginal ? 'Save the full-resolution file' : 'Save the watermarked copy'}
        className={
          compact
            ? 'shrink-0 inline-flex items-center text-ink/40 hover:text-gold transition-colors disabled:opacity-60'
            : 'inline-flex items-center gap-2 bg-white/90 hover:bg-white text-ink text-[12px] font-medium px-4 py-2.5 rounded-full shadow-lg transition-colors disabled:opacity-60'
        }
      >
        {done ? <Check size={15} className="text-emerald-600" /> : <Download size={15} />}
        {!compact &&
          (done ? 'Saved' : busy ? 'Saving…' : isOriginal ? 'Download' : 'Download preview')}
      </button>
      {error && (
        <span role="alert" className="text-[11px] text-white bg-red-700/90 px-2 py-1 rounded">
          {error}
        </span>
      )}
    </div>
  );
}
