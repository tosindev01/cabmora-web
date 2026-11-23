import React, { createContext, useContext, useState, ReactNode } from 'react';

import {
  ADMIN_USER,
  initialEnquiries,
  initialProjects,
  initialReviews,
  initialSettings,
  initialTransactions,
  initialUsers,
} from '@/data';
import type {
  CustomerReview,
  Enquiry,
  PaymentStatus,
  PlatformSettings,
  Project,
  ReviewStatus,
  Transaction,
  User,
  UserStatus,
} from '@/data';

/** Re-exported so pages can keep importing the vocabulary from one place. */
export * from '@/data/types';

/**
 * The provider's own shape — a context concern, so it stays beside the context
 * rather than travelling with the domain vocabulary.
 */
interface AdminContextType {
  isAdminLoggedIn: boolean;
  adminUser: { name: string; email: string; avatar: string };
  login: (email: string, pass: string) => boolean;
  logout: () => void;

  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  toggleUserStatus: (id: string) => void;
  deleteUser: (id: string) => void;

  projects: Project[];
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  enquiries: Enquiry[];
  updateEnquiry: (id: string, updates: Partial<Enquiry>) => void;
  deleteEnquiry: (id: string) => void;

  reviews: CustomerReview[];
  updateReviewStatus: (id: string, status: ReviewStatus) => void;
  deleteReview: (id: string) => void;

  transactions: Transaction[];
  issueRefund: (id: string) => void;

  settings: PlatformSettings;
  updateSettings: (newSettings: Partial<PlatformSettings>) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(true);
  const adminUser = ADMIN_USER;

  const [users, setUsers] = useState<User[]>(initialUsers);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [enquiries, setEnquiries] = useState<Enquiry[]>(initialEnquiries);
  const [reviews, setReviews] = useState<CustomerReview[]>(initialReviews);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [settings, setSettings] = useState<PlatformSettings>(initialSettings);

  const login = (email: string, pass: string) => {
    // Allows admin login
    if (email.toLowerCase().includes('admin') || pass.length > 0) {
      setIsAdminLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdminLoggedIn(false);
  };

  // User management actions
  const addUser = (newUser: Omit<User, 'id'>) => {
    const user: User = {
      ...newUser,
      id: `usr-${Date.now().toString().slice(-4)}`,
    };
    setUsers((prev) => [user, ...prev]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
  };

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const newStatus: UserStatus = u.status === 'Active' ? 'Suspended' : 'Active';
          return { ...u, status: newStatus };
        }
        return u;
      }),
    );
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // Project management actions
  const addProject = (newProject: Omit<Project, 'id'>) => {
    const proj: Project = {
      ...newProject,
      id: `proj-${Date.now().toString().slice(-4)}`,
    };
    setProjects((prev) => [proj, ...prev]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  // Enquiry actions
  const updateEnquiry = (id: string, updates: Partial<Enquiry>) => {
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const deleteEnquiry = (id: string) => {
    setEnquiries((prev) => prev.filter((e) => e.id !== id));
  };

  // Review actions
  const updateReviewStatus = (id: string, status: ReviewStatus) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const deleteReview = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  // Payment actions
  const issueRefund = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'Refunded' as PaymentStatus } : t)),
    );
  };

  // Settings actions
  const updateSettings = (newSettings: Partial<PlatformSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <AdminContext.Provider
      value={{
        isAdminLoggedIn,
        adminUser,
        login,
        logout,
        users,
        addUser,
        updateUser,
        toggleUserStatus,
        deleteUser,
        projects,
        addProject,
        updateProject,
        deleteProject,
        enquiries,
        updateEnquiry,
        deleteEnquiry,
        reviews,
        updateReviewStatus,
        deleteReview,
        transactions,
        issueRefund,
        settings,
        updateSettings,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
