import React, { createContext, useContext, useState, ReactNode } from 'react';

import { initialSettings } from '@/shared/store';
import type { PlatformSettings } from '@/shared/store';

/** Re-exported so pages can keep importing the vocabulary from one place. */
export * from '@/shared/store/types';

/**
 * Platform settings, held in the browser until there is an API behind them.
 *
 * This provider used to carry seeded users, projects, enquiries, reviews and
 * transactions as well — invented people with invented emails, shipped in the
 * production bundle. Every one of those screens reads the real API now, so
 * nothing rendered them: they were a page of fiction nobody could see and
 * everybody downloaded.
 */
interface AdminContextType {
  settings: PlatformSettings;
  updateSettings: (newSettings: Partial<PlatformSettings>) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PlatformSettings>(initialSettings);

  const updateSettings = (newSettings: Partial<PlatformSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <AdminContext.Provider value={{ settings, updateSettings }}>{children}</AdminContext.Provider>
  );
};

export function useAdmin(): AdminContextType {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
