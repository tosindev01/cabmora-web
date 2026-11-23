import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Moon, Sun } from 'lucide-react';

import type { User } from '@cabmora/api-client';

import { ClientPortalShell } from '@/features/client/components/ClientPortalShell';
import { useDashboardTheme } from '@/shared/portal';
import {
  CurrencySection,
  LocaleSection,
  NotificationsSection,
  PasswordSection,
  ProfileSection,
  destinationFor,
  sectionsFor,
  useAnchoredToggle,
  usePreferences,
} from '@/shared/account';
import { useAuth } from '@/shared/auth';

/**
 * The customer's account settings.
 *
 * There was no settings screen on the client side at all — a customer could
 * not change their own name, let alone their password or their picture.
 *
 * Every section Cabmora asked for is listed, including the ones that are not
 * built. Listing them is the point: a reader can see where a thing will live,
 * and a section that cannot work yet says why instead of showing a control
 * that quietly does nothing.
 */
export default function ClientSettingsPage() {
  const { user, logout, refresh } = useAuth();
  const [open, setOpen] = useState<string>('profile');
  /* Toggling a section changes the page's height, and when the panel that
     closes is above the viewport the browser clamps the scroll offset —
     which on an iPad in landscape landed the reader at the bottom of the
     page. This keeps the header they tapped under their thumb. */
  const anchor = useAnchoredToggle(open);
  // One fetch for the three sections that read the same row — three would be
  // three requests and three chances to disagree with each other.
  const { preferences, error: prefError, saving, save } = usePreferences();
  const [theme, setTheme] = useDashboardTheme();

  if (!user) return null;

  /* The session copy has to move with the saved one, or the sidebar keeps
     showing the old picture until the next full page load. */
  const absorb = (_updated: User) => {
    void refresh();
  };

  return (
    <ClientPortalShell title="Settings" subtitle="Your account, and how we reach you">
      <div className="max-w-[860px] space-y-3">
        <div className="bg-white border border-ink/10 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-[17px] font-semibold">Dashboard Appearance</h3>
            <p className="text-[12.5px] text-ink/60">
              Choose Light or Dark theme across your portal. Saved automatically.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-sand p-1 rounded-xl border border-ink/10">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`px-3.5 py-2 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 transition-colors ${
                theme === 'light' ? 'bg-gold text-ink shadow-sm' : 'text-ink/65 hover:text-ink'
              }`}
            >
              <Sun size={14} /> Light
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`px-3.5 py-2 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 transition-colors ${
                theme === 'dark' ? 'bg-gold text-ink shadow-sm' : 'text-ink/65 hover:text-ink'
              }`}
            >
              <Moon size={14} /> Dark
            </button>
          </div>
        </div>
        {sectionsFor('customer').map((section) => {
          const Icon = section.icon;
          const to = destinationFor(section, 'customer');
          const expanded = open === section.id;

          const header = (
            <>
              <span className="w-10 h-10 rounded-full bg-ink/5 flex items-center justify-center text-ink/60 shrink-0">
                <Icon size={18} strokeWidth={1.5} />
              </span>
              <span className="min-w-0 text-left">
                <span className="block font-serif text-[18px] text-ink">{section.label}</span>
                <span className="block text-[13px] text-ink/50 mt-0.5">{section.description}</span>
              </span>
            </>
          );

          /* A link, not a panel: these already have a home, and a second copy
             here would be a second place to keep in step. */
          if (section.state === 'elsewhere' && to) {
            return (
              <Link
                key={section.id}
                to={to}
                className="flex items-center gap-4 bg-white border border-ink/8 p-5 hover:border-ink/20 transition-colors"
              >
                {header}
                <ArrowRight size={16} className="text-ink/30 ml-auto shrink-0" />
              </Link>
            );
          }

          if (section.state === 'planned') {
            return (
              <div key={section.id} className="bg-white border border-ink/8 p-5 opacity-70">
                <div className="flex items-center gap-4">
                  {header}
                  <span className="ml-auto shrink-0 text-[10px] tracking-[0.18em] uppercase text-ink/35 border border-ink/12 px-2.5 py-1">
                    Not yet
                  </span>
                </div>
                {section.note && (
                  <p className="text-[12.5px] text-ink/45 leading-[1.65] mt-4 pl-14">
                    {section.note}
                  </p>
                )}
              </div>
            );
          }

          if (section.id === 'logout') {
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => void logout()}
                className="w-full flex items-center gap-4 bg-white border border-ink/8 p-5 hover:border-red-300 transition-colors"
              >
                {header}
                <ArrowRight size={16} className="text-ink/30 ml-auto shrink-0" />
              </button>
            );
          }

          return (
            <div key={section.id} className="bg-white border border-ink/8">
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={`section-${section.id}`}
                onClick={(event) => {
                  anchor(event.currentTarget);
                  setOpen(expanded ? '' : section.id);
                }}
                className="w-full flex items-center gap-4 p-5 text-left"
              >
                {header}
              </button>
              {expanded && (
                <div id={`section-${section.id}`} className="px-5 pb-8 pt-2 border-t border-ink/6">
                  {section.id === 'profile' && <ProfileSection user={user} onSaved={absorb} />}
                  {section.id === 'password' && <PasswordSection />}

                  {/* The three that read preferences. Each saves on change
                      rather than behind a button: one control, one value, and
                      a "Save" for a single dropdown is a step that only exists
                      to be forgotten. */}
                  {preferences && section.id === 'currency' && (
                    <CurrencySection
                      preferences={preferences}
                      saving={saving}
                      onSave={(changes) => void save(changes)}
                    />
                  )}
                  {preferences && section.id === 'locale' && (
                    <LocaleSection
                      preferences={preferences}
                      saving={saving}
                      onSave={(changes) => void save(changes)}
                    />
                  )}
                  {preferences && section.id === 'notifications' && (
                    <NotificationsSection
                      preferences={preferences}
                      saving={saving}
                      onSave={(changes) => void save(changes)}
                    />
                  )}
                  {!preferences && ['currency', 'locale', 'notifications'].includes(section.id) && (
                    <p className="text-[13px] text-ink/45">
                      {prefError ?? 'Loading your settings…'}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ClientPortalShell>
  );
}
