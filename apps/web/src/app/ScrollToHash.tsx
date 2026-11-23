import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scroll to `#services` and friends after the page that holds them exists.
 *
 * The navigation's section links used to be plain anchors, so reaching one
 * from another page meant a full reload of `/` and letting the browser find
 * the fragment. On a single-page app it looks for that element while the
 * document is still an empty root — React has not rendered yet — finds
 * nothing, and leaves the reader at the top of a page they did not ask to be
 * at the top of.
 *
 * So the links are routes now and the scrolling happens here, once the
 * section is actually in the document. The offset for the fixed header is
 * already handled by `section[id] { scroll-margin-top }` in the stylesheet.
 */

/** How long to keep looking. A landing page with images settles well inside
 *  this; beyond it the id is simply wrong and retrying would not help. */
const GIVE_UP_AFTER_MS = 2000;

export function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    if (!id) return;

    let frame = 0;
    const started = performance.now();

    const look = () => {
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ block: 'start' });
        return;
      }
      // Each frame rather than one timeout: the section usually appears on
      // the very next paint, and waiting a fixed delay would be a visible
      // pause on the common path to cover the rare one.
      if (performance.now() - started < GIVE_UP_AFTER_MS) {
        frame = requestAnimationFrame(look);
      }
    };

    frame = requestAnimationFrame(look);
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return null;
}
