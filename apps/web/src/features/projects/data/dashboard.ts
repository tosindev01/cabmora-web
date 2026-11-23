/**
 * Fixtures and types for the Dashboard screen.
 *
 * Stand-ins until the API is wired up (WP5). They live here rather than beside
 * the JSX so that swap touches one module instead of the component — and so a
 * test can import them without a DOM.
 */
import { Image as ImageIcon, Plus, UploadCloud, FileText } from 'lucide-react';

export const RECENT_ACTIVITIES = [
  {
    id: 1,
    title: 'Wedding Gallery Uploaded',
    time: '2 hours ago',
    type: 'gallery',
    status: 'completed',
    detail: '850 RAW photos added to Smith & Wesson album',
  },
  {
    id: 2,
    title: 'Client Feedback Received',
    time: '5 hours ago',
    type: 'message',
    status: 'unread',
    detail: 'Jane Smith commented on Tuscany Highlight Reel',
  },
  {
    id: 3,
    title: 'Invoice Paid - Smith Wedding',
    time: '1 day ago',
    type: 'payment',
    status: 'completed',
    detail: '$4,250 received via Stripe',
  },
  {
    id: 4,
    title: 'New Project Inquiry',
    time: '2 days ago',
    type: 'inquiry',
    status: 'pending',
    detail: 'Editorial shoot inquiry for Paris Fashion Week',
  },
  {
    id: 5,
    title: '4K ProRes Drone Reel Backed Up',
    time: '3 days ago',
    type: 'gallery',
    status: 'completed',
    detail: '62 GB sync completed to Cloud Storage',
  },
];

export const PROJECTS = [
  {
    id: 1,
    name: 'Smith & Wesson Wedding',
    client: 'Jane Smith',
    role: 'Lead Photographer & Videographer',
    date: 'Oct 12, 2025',
    status: 'In Progress',
    progress: 65,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop',
  },
  {
    id: 2,
    name: "Elena's Editorial Shoot",
    client: 'Elena Vance',
    role: 'Creative Director',
    date: 'Nov 04, 2025',
    status: 'Review',
    progress: 90,
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=600&fit=crop',
  },
  {
    id: 3,
    name: 'Corporate Event - TechCorp',
    client: 'David Miller',
    role: 'Lead Videographer',
    date: 'Dec 15, 2025',
    status: 'Planning',
    progress: 20,
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop',
  },
];

export const CLIENTS_OVERVIEW = [
  {
    id: 1,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    project: 'Smith & Wesson Wedding',
    totalBilled: '$8,500',
    status: 'Active',
    portalAccess: 'Granted',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
  },
  {
    id: 2,
    name: 'Elena Vance',
    email: 'elena@vancemodels.com',
    project: "Elena's Editorial Shoot",
    totalBilled: '$4,200',
    status: 'Review',
    portalAccess: 'Granted',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
  },
  {
    id: 3,
    name: 'David Miller',
    email: 'david.m@techcorp.io',
    project: 'TechCorp Summit 2025',
    totalBilled: '$6,800',
    status: 'Contract Signed',
    portalAccess: 'Pending',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
  },
  {
    id: 4,
    name: 'Sarah & Mark Johnson',
    email: 'johnson.family@gmail.com',
    project: 'Johnson Family Portraits',
    totalBilled: '$2,400',
    status: 'Delivered',
    portalAccess: 'Granted',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop',
  },
];

export const QUICK_ACTIONS = [
  { icon: Plus, label: 'New Project', to: '/projects' },
  { icon: UploadCloud, label: 'Upload Media', to: '/upload' },
  { icon: ImageIcon, label: 'Media Library', to: '/galleries' },
  { icon: FileText, label: 'Create Invoice', to: '/billing' },
];
