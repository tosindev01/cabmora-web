import { useState, type ReactNode } from 'react';

import type { PortalNavItem } from '@/shared/portal/data';
import { PortalSidebar } from './PortalSidebar';
import { useSidebarCollapsed } from '@/shared/portal/useSidebarCollapsed';
import { useDashboardTheme } from '@/shared/portal/theme';
import {
  CONTENT_OFFSET,
  CONTENT_OFFSET_COLLAPSED,
  PAGE_SURFACE,
  type PortalVariant,
} from './variant';

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
  /** Swap the nav for a different audience — see CLIENT_NAV. */
  nav?: { items?: PortalNavItem[]; secondary?: PortalNavItem[]; footer?: PortalNavItem[] };
}

/**
 * Chrome shared by every creator portal screen: fixed sidebar, mobile
 * off-canvas behaviour, and the content column that clears it.
 *
 * Each page previously carried its own copy of this — the sidebar markup, the
 * `isSidebarOpen` state, and the mobile backdrop — roughly 60 duplicated lines
 * per page across ten pages.
 */
export function PortalShell({ variant: _variant, nav, children }: PortalShellProps) {
  const [open, setOpen] = useState(false);
  const toggleSidebar = () => setOpen((v) => !v);
  const [collapsed, toggleCollapsed] = useSidebarCollapsed();
  const [theme] = useDashboardTheme();

  return (
    /* `overflow-x-clip`, never `overflow-hidden`: an ancestor with
       `overflow: hidden` becomes the sticky containing block, and since it never
       scrolls, the sticky topbar degrades to static and scrolls away — taking
       the only mobile menu button with it. `clip` clips horizontally without
       creating a scroll container. */
    <div
      data-portal-theme={theme}
      className={`portal-theme-scope min-h-screen flex overflow-x-clip ${PAGE_SURFACE[theme]}`}
    >
      <PortalSidebar
        open={open}
        variant={theme}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        {...nav}
      />

      <div
        /* Must move with the column, or the content keeps a 260px gutter
           beside a 76px rail. */
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? CONTENT_OFFSET_COLLAPSED : CONTENT_OFFSET[theme]
        }`}
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
