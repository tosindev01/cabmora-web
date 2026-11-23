import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import type { PortalVariant } from './components/variant';

const THEME_STORAGE_KEY = 'cabmora_dashboard_theme';
const THEME_EVENT = 'cabmora-dashboard-theme-change';

export function getStoredDashboardTheme(): PortalVariant {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'dark' || stored === 'light' ? stored : 'light';
}

export function setStoredDashboardTheme(next: PortalVariant): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(THEME_STORAGE_KEY, next);
  document.documentElement.setAttribute('data-dashboard-theme', next);
  window.dispatchEvent(new CustomEvent<PortalVariant>(THEME_EVENT, { detail: next }));
}

export function useDashboardTheme(): [PortalVariant, (next: PortalVariant) => void, () => void] {
  const [theme, setThemeState] = useState<PortalVariant>(getStoredDashboardTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-dashboard-theme', theme);
    const handler = (e: Event) => {
      const custom = e as CustomEvent<PortalVariant>;
      if (custom.detail === 'light' || custom.detail === 'dark') {
        setThemeState(custom.detail);
      }
    };
    window.addEventListener(THEME_EVENT, handler);
    return () => window.removeEventListener(THEME_EVENT, handler);
  }, [theme]);

  const setTheme = (next: PortalVariant) => {
    setThemeState(next);
    setStoredDashboardTheme(next);
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return [theme, setTheme, toggleTheme];
}

export function DashboardThemeToggle() {
  const [theme, , toggleTheme] = useDashboardTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`p-2 rounded-xl border transition-colors flex items-center gap-1.5 text-[12px] font-medium ${
        isDark
          ? 'bg-panel-800 border-canvas/15 text-gold hover:bg-canvas/10'
          : 'bg-sand border-ink/10 text-ink/70 hover:text-ink hover:border-gold'
      }`}
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
      <span className="hidden xl:inline">{isDark ? 'Light' : 'Dark'}</span>
    </button>
  );
}
