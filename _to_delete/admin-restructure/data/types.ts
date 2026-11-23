/**
 * The admin console's domain vocabulary.
 *
 * These lived at the top of AdminContext.tsx alongside 350 lines of seed rows
 * and the provider itself — one 630-line file that every page imported types
 * from, so touching a fixture meant touching the module the whole app hangs
 * off. Types here, fixtures in ./seed, wiring in the context.
 */

export type UserRole = 'Customer' | 'Creator' | 'Admin';
export type UserStatus = 'Active' | 'Suspended' | 'Pending';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar: string;
  specialization?: string;
  joinedDate: string;
  storageUsedGB: number;
  projectsCount: number;
  totalBilledOrEarned: string;
}

export type ProjectStage = 'Planning' | 'Shooting' | 'Editing' | 'Client Review' | 'Completed';

export interface Project {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string;
  assignedCreatorId: string;
  assignedCreatorName: string;
  stage: ProjectStage;
  progress: number;
  budget: string;
  deadline: string;
  thumbnail: string;
  deliverablesCount: number;
  description: string;
}

export type EnquiryStatus = 'New' | 'Contacted' | 'In Negotiation' | 'Converted' | 'Closed';

export interface Enquiry {
  id: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  serviceRequested: string;
  eventDate: string;
  budget: string;
  message: string;
  status: EnquiryStatus;
  assignedStaff: string;
  createdAt: string;
}

export type ReviewStatus = 'Pending' | 'Approved' | 'Rejected';

export interface CustomerReview {
  id: string;
  reviewerName: string;
  reviewerEmail: string;
  targetCreatorOrProject: string;
  rating: number; // 1-5
  comment: string;
  status: ReviewStatus;
  date: string;
}

export type PaymentStatus = 'Paid' | 'Pending' | 'Refunded' | 'Failed';

export interface Transaction {
  id: string;
  invoiceId: string;
  customerName: string;
  creatorName: string;
  amount: number;
  gateway: 'Stripe' | 'PayPal' | 'Direct Wire';
  status: PaymentStatus;
  date: string;
  description: string;
}

export interface PlatformSettings {
  brandName: string;
  accentColor: string;
  logoUrl: string;
  stripeEnabled: boolean;
  stripePublicKey: string;
  paypalEnabled: boolean;
  currency: string;
  defaultStorageLimitGB: number;
  storageProvider: string;
  smtpHost: string;
  senderEmail: string;
  requireAdmin2FA: boolean;
  sessionTimeoutMinutes: number;
  passwordPolicy: string;
}
