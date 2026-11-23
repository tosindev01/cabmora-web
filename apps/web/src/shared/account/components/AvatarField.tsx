import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';

import { accountApi, ApiError, type User } from '@cabmora/api-client';

/** Matches the server's limit, so an oversized file is refused before it is
 *  hashed and before a round trip — the server still refuses it as well. */
const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPT = 'image/jpeg,image/png,image/webp';

interface AvatarFieldProps {
  user: User;
  /** Hand back the account the server returned, so the rest of the page and
   *  the session both see the new picture without a reload. */
  onUploaded: (user: User) => void;
}

function initials(user: User): string {
  return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
}

/**
 * The profile picture, and the control that replaces it.
 *
 * `avatar_url` is a signed URL that expires in about fifteen minutes, so it is
 * rendered from whatever the latest response carried and never cached. When
 * there is no picture the initials stand in — a generic silhouette tells the
 * reader nothing about whose account they are looking at.
 */
export function AvatarField({ user, onUploaded }: AvatarFieldProps) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function choose(file: File) {
    setError(null);

    if (file.size > MAX_BYTES) {
      setError(`That image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 8 MB.`);
      return;
    }

    setBusy(true);
    try {
      onUploaded(await accountApi.uploadAvatar(file));
    } catch (err: unknown) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : 'The picture could not be uploaded.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-ink/8 flex items-center justify-center">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt=""
              className="w-full h-full object-cover"
              /* Decorative: the name sits beside it, so announcing the picture
                 as well only repeats what was just read. */
            />
          ) : (
            <span className="font-serif text-[22px] text-ink/45">{initials(user)}</span>
          )}
        </div>
        {busy && (
          <div className="absolute inset-0 rounded-full bg-ink/55 flex items-center justify-center">
            <Loader2 size={20} className="text-white animate-spin" />
          </div>
        )}
      </div>

      <div className="min-w-0">
        <input
          ref={input}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            // Cleared so picking the same file twice in a row still fires.
            event.target.value = '';
            if (file) void choose(file);
          }}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          className="inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase font-medium text-ink border border-ink/15 px-5 py-3 hover:border-ink hover:bg-ink hover:text-canvas transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Camera size={14} />
          {busy ? 'Uploading…' : user.avatar_url ? 'Change picture' : 'Add a picture'}
        </button>
        <p className="text-[12px] text-ink/45 mt-2">JPEG, PNG or WebP, up to 8 MB.</p>
        {error && (
          <p role="alert" className="text-[12px] text-red-700 mt-2">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
