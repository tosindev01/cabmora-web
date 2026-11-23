import { useEffect, useState } from 'react';

import { FlowLightModal } from '@/shared/site/FlowLightModal';

/**
 * Listens for the request to show the Flow introduction, and shows it.
 *
 * The banner's "Quick Overview" fires a `open-flow-modal` event on `window`
 * rather than calling anything directly, because the banner lives inside the
 * site header and the dialog does not — a shared event is how the designer
 * connected two things that have no parent in common. Mounted once beside the
 * router so any page can raise it.
 *
 * **Not opened automatically.** The designer's version also opened this on
 * `/`, `/media` and `/split`, which would put an interstitial in front of
 * every visitor who came to look at wedding photographs — including returning
 * clients, on every visit, with no memory of having dismissed it. That is a
 * decision about who the front page is for rather than a piece of wiring, so
 * it is left to be made rather than inherited.
 */
export function FlowIntroHost() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener('open-flow-modal', show);
    return () => window.removeEventListener('open-flow-modal', show);
  }, []);

  return <FlowLightModal open={open} onClose={() => setOpen(false)} />;
}
