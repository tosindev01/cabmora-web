import { useCallback, useEffect, useState } from 'react';

const KEY = 'cabmora.sidebar.collapsed';

function read(): boolean {
  // Wrapped because a private window, blocked site data or a browser with
  // storage disabled makes the accessor itself throw, not merely return null.
  try {
    return window.localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Whether the portal sidebar is collapsed to icons, remembered per browser.
 *
 * `localStorage` rather than the account: this is a per-device preference like
 * a window size, not a fact about the person. Someone who collapses it on a
 * laptop has said nothing about what they want on their phone — where the
 * sidebar is off-canvas anyway and this does not apply.
 *
 * Expanded is the default whenever storage cannot be read, so a failure shows
 * the full menu rather than a rail of unlabelled glyphs.
 */
export function useSidebarCollapsed(): [boolean, () => void] {
  const [collapsed, setCollapsed] = useState(read);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, collapsed ? '1' : '0');
    } catch {
      // Nothing to do. The sidebar still works; it just forgets.
    }
  }, [collapsed]);

  return [collapsed, useCallback(() => setCollapsed((v) => !v), [])];
}
