import { useEffect, useState } from 'react';

/**
 * Shown once, to teach a gesture that is otherwise invisible.
 *
 * A swipe has no affordance — nothing on screen says it is there — so the
 * first time somebody opens a gallery they will not find it unless they
 * happen to try. The buttons and arrow keys exist for everyone who never
 * does; this is for the people who would have liked it.
 *
 * It says something different depending on what you are holding, because
 * "swipe" is meaningless on a laptop and "two fingers" is meaningless on a
 * phone. `(hover: hover)` is the honest test: it asks whether there is a
 * pointer, not whether the screen is narrow.
 *
 * It removes itself after a few seconds, and on the first touch of any kind.
 * A demonstration that outstays its welcome is just something in the way.
 */
const SHOWN_FOR = 5200;

export function SwipeHint({ storageKey }: { storageKey: string }) {
  const [visible, setVisible] = useState(false);
  const [pointer, setPointer] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = window.localStorage.getItem(storageKey) === 'seen';
    } catch {
      // Private browsing, blocked site data, a preview frame. Not knowing
      // whether it has been seen is not a reason to fail — showing it once
      // more is the harmless outcome.
    }
    if (seen) return;

    setPointer(window.matchMedia('(hover: hover)').matches);
    setVisible(true);
    try {
      window.localStorage.setItem(storageKey, 'seen');
    } catch {
      // As above. Worst case it appears again next time.
    }

    const timer = window.setTimeout(() => setVisible(false), SHOWN_FOR);
    const dismiss = () => setVisible(false);
    // Any gesture at all means they are already doing it, or busy with
    // something else. Either way the lesson is over.
    window.addEventListener('pointerdown', dismiss, { once: true });
    window.addEventListener('wheel', dismiss, { once: true, passive: true });
    window.addEventListener('keydown', dismiss, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pointerdown', dismiss);
      window.removeEventListener('wheel', dismiss);
      window.removeEventListener('keydown', dismiss);
    };
  }, [storageKey]);

  if (!visible) return null;

  return (
    <div
      role="status"
      /* Above the photograph and under every control. It must never be the
         thing a finger lands on. */
      className="absolute inset-x-0 bottom-6 z-20 flex justify-center pointer-events-none px-4"
    >
      <div className="cab-fade-in flex items-center gap-3 rounded-full bg-noir/75 backdrop-blur-sm px-4 py-2.5 text-canvas shadow-lg">
        <span className="relative flex h-5 w-16 items-center justify-center">
          {pointer ? (
            /* Two dots, because a trackpad flick is two fingers. */
            <span className="cab-swipe flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-gold" />
              <span className="h-2 w-2 rounded-full bg-gold" />
            </span>
          ) : (
            <span className="cab-swipe h-2.5 w-2.5 rounded-full bg-gold" />
          )}
        </span>
        <span className="text-[12.5px] font-medium whitespace-nowrap">
          {pointer ? 'Two fingers to move between photographs' : 'Swipe to see the next'}
        </span>
      </div>
    </div>
  );
}
