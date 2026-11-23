import { useState, type ReactNode } from 'react';

import { PortalSidebar } from './PortalSidebar';
import { CONTENT_OFFSET, PAGE_SURFACE, type PortalVariant } from './variant';

interface PortalShellProps {
  /**
   * Which skin this screen wears. Light is the working surface (projects,
   * media, billing); dark is the account/messaging surface.
   */
  variant?: PortalVariant;
  /**
   * Page content, given the sidebar toggle so a page's own topbar can render
   * the mobile hamburger.
   *
   * A render prop rather than a context: the toggle is needed by markup the
   * page owns, and a hook would have to be called inside the provider, which
   * the page component sits outside of.
   */
  children: (api: { toggleSidebar: () => void }) => ReactNode;
}

/**
 * Chrome shared by every creator portal screen: fixed sidebar, mobile
 * off-canvas behaviour, and the content column that clears it.
 *
 * Each page previously carried its own copy of this — the sidebar markup, the
 * `isSidebarOpen` state, and the mobile backdrop — roughly 60 duplicated lines
 * per page across ten pages.
 */
export function PortalShell({ variant = 'light', children }: PortalShellProps) {
  const [open, setOpen] = useState(false);
  const toggleSidebar = () => setOpen((v) => !v);

  return (
    <div className={`min-h-screen flex overflow-hidden ${PAGE_SURFACE[variant]}`}>
      <PortalSidebar open={open} variant={variant} />

      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${CONTENT_OFFSET[variant]}`}
      >
        {children({ toggleSidebar })}
      </div>

      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
