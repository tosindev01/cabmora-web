/**
 * Fixtures and types for the Projects screen.
 *
 * Stand-ins until the API is wired up (WP5). They live here rather than beside
 * the JSX so that swap touches one module instead of the component — and so a
 * test can import them without a DOM.
 */

export interface ProjectPermissions {
  download: {
    enabled: boolean;
    quality: 'Original High-Res' | 'Web-Optimized (2K)' | 'Both';
    requireWatermark: boolean;
    pinProtected: boolean;
    pinCode?: string;
  };
  viewing: {
    accessLevel: 'Public' | 'Password Protected' | 'Client & Team Only' | 'Private';
    password?: string;
    expirationDate?: string;
  };
  commenting: {
    enabled: boolean;
    allowProofingNotes: boolean;
    requireClientAuth: boolean;
  };
  sharing: {
    enabled: boolean;
    allowGuestReshare: boolean;
    showSocialShare: boolean;
  };
}

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  assignedTo: string;
}

export interface Project {
  id: number;
  name: string;
  type: 'Wedding' | 'Editorial' | 'Corporate' | 'Portrait' | 'Commercial' | 'Event';
  partnerType: 'Photographer' | 'Videographer' | 'Hybrid';
  clientName: string;
  clientEmail: string;
  date: string;
  deadline: string;
  location: string;
  status: 'Planning' | 'Shooting' | 'Culling' | 'Editing' | 'Review' | 'Completed';
  progress: number;
  deliverables: string;
  image: string;
  tasks: TaskItem[];
  permissions?: ProjectPermissions;
}

export const DEFAULT_PROJECT_PERMISSIONS: ProjectPermissions = {
  download: {
    enabled: true,
    quality: 'Original High-Res',
    requireWatermark: false,
    pinProtected: true,
    pinCode: '4821',
  },
  viewing: {
    accessLevel: 'Client & Team Only',
    password: '',
    expirationDate: '',
  },
  commenting: {
    enabled: true,
    allowProofingNotes: true,
    requireClientAuth: true,
  },
  sharing: {
    enabled: true,
    allowGuestReshare: true,
    showSocialShare: false,
  },
};

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 1,
    name: 'Smith & Wesson Wedding',
    type: 'Wedding',
    partnerType: 'Hybrid',
    clientName: 'Jane Smith',
    clientEmail: 'jane.smith@example.com',
    date: 'Oct 12, 2025',
    deadline: 'Nov 15, 2025',
    location: 'Tuscany, Italy',
    status: 'Editing',
    progress: 65,
    deliverables: '800 Edited Photos + 7-min 4K Highlight Film',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop',
    tasks: [
      {
        id: 't1',
        title: 'Location Scout & Lighting Plan',
        completed: true,
        assignedTo: 'Sarah Cabmora',
      },
      { id: 't2', title: 'RAW Audio & Drone Backup', completed: true, assignedTo: 'Michael Chang' },
      {
        id: 't3',
        title: 'Color Grading Highlight Film',
        completed: false,
        assignedTo: 'Michael Chang',
      },
      {
        id: 't4',
        title: 'Export High-Res Proof Gallery',
        completed: false,
        assignedTo: 'Sarah Cabmora',
      },
    ],
    permissions: {
      download: {
        enabled: true,
        quality: 'Original High-Res',
        requireWatermark: false,
        pinProtected: true,
        pinCode: '4821',
      },
      viewing: { accessLevel: 'Client & Team Only', password: '', expirationDate: '2026-12-31' },
      commenting: { enabled: true, allowProofingNotes: true, requireClientAuth: true },
      sharing: { enabled: true, allowGuestReshare: true, showSocialShare: false },
    },
  },
  {
    id: 2,
    name: "Elena's Editorial Shoot",
    type: 'Editorial',
    partnerType: 'Photographer',
    clientName: 'Elena Vance',
    clientEmail: 'elena@vancemodels.com',
    date: 'Nov 04, 2025',
    deadline: 'Nov 20, 2025',
    location: 'Paris, France',
    status: 'Review',
    progress: 90,
    deliverables: '45 Retouched Cover Shots + TIFF Prints',
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=600&fit=crop',
    tasks: [
      { id: 't1', title: 'Moodboard Approval', completed: true, assignedTo: 'Sarah Cabmora' },
      { id: 't2', title: 'Studio Lighting Rigging', completed: true, assignedTo: 'Sarah Cabmora' },
      { id: 't3', title: 'High-End Skin Retouching', completed: true, assignedTo: 'Sarah Cabmora' },
      { id: 't4', title: 'Client Proof Selection', completed: false, assignedTo: 'Elena Vance' },
    ],
    permissions: {
      download: {
        enabled: true,
        quality: 'Original High-Res',
        requireWatermark: true,
        pinProtected: false,
        pinCode: '',
      },
      viewing: { accessLevel: 'Password Protected', password: 'Vance2025', expirationDate: '' },
      commenting: { enabled: true, allowProofingNotes: true, requireClientAuth: true },
      sharing: { enabled: true, allowGuestReshare: false, showSocialShare: false },
    },
  },
  {
    id: 3,
    name: 'Corporate Event - TechCorp',
    type: 'Corporate',
    partnerType: 'Videographer',
    clientName: 'David Miller',
    clientEmail: 'david.m@techcorp.io',
    date: 'Dec 15, 2025',
    deadline: 'Dec 22, 2025',
    location: 'London, UK',
    status: 'Planning',
    progress: 20,
    deliverables: 'Keynote 4K Multicam + 3 Recap Reels',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop',
    tasks: [
      { id: 't1', title: 'Av Logistics & Cable Run', completed: true, assignedTo: 'Michael Chang' },
      {
        id: 't2',
        title: 'Speaker Audio Wireless Check',
        completed: false,
        assignedTo: 'Michael Chang',
      },
      { id: 't3', title: 'Drone Permit Request', completed: false, assignedTo: 'Michael Chang' },
    ],
    permissions: {
      download: {
        enabled: true,
        quality: 'Web-Optimized (2K)',
        requireWatermark: false,
        pinProtected: true,
        pinCode: '9910',
      },
      viewing: { accessLevel: 'Client & Team Only', password: '', expirationDate: '' },
      commenting: { enabled: true, allowProofingNotes: true, requireClientAuth: true },
      sharing: { enabled: false, allowGuestReshare: false, showSocialShare: false },
    },
  },
  {
    id: 4,
    name: 'Johnson Family Portraits',
    type: 'Portrait',
    partnerType: 'Photographer',
    clientName: 'Mark Johnson',
    clientEmail: 'johnson.family@gmail.com',
    date: 'Jan 10, 2026',
    deadline: 'Jan 25, 2026',
    location: 'Central Park, NY',
    status: 'Completed',
    progress: 100,
    deliverables: '85 Color Corrected Portraits + Canvas Album',
    image: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800&h=600&fit=crop',
    tasks: [
      { id: 't1', title: 'Golden Hour Shooting', completed: true, assignedTo: 'Sarah Cabmora' },
      { id: 't2', title: 'Culling & Selection', completed: true, assignedTo: 'Sarah Cabmora' },
      { id: 't3', title: 'Print Delivery', completed: true, assignedTo: 'Sarah Cabmora' },
    ],
    permissions: {
      download: {
        enabled: true,
        quality: 'Original High-Res',
        requireWatermark: false,
        pinProtected: false,
        pinCode: '',
      },
      viewing: { accessLevel: 'Client & Team Only', password: '', expirationDate: '' },
      commenting: { enabled: true, allowProofingNotes: true, requireClientAuth: false },
      sharing: { enabled: true, allowGuestReshare: true, showSocialShare: true },
    },
  },
  {
    id: 5,
    name: 'Summer Collection Campaign',
    type: 'Commercial',
    partnerType: 'Hybrid',
    clientName: 'Aura Apparel',
    clientEmail: 'press@aurafashion.com',
    date: 'Feb 22, 2026',
    deadline: 'Mar 10, 2026',
    location: 'Malibu, CA',
    status: 'Shooting',
    progress: 40,
    deliverables: 'Lookbook Gallery + 60s Brand Spot',
    image: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=800&h=600&fit=crop',
    tasks: [
      { id: 't1', title: 'Talent Casting & Fitting', completed: true, assignedTo: 'Sarah Cabmora' },
      { id: 't2', title: 'Beach Sunset Shoot', completed: true, assignedTo: 'Michael Chang' },
      {
        id: 't3',
        title: 'Sound Design & Music License',
        completed: false,
        assignedTo: 'Michael Chang',
      },
    ],
    permissions: {
      download: {
        enabled: true,
        quality: 'Both',
        requireWatermark: false,
        pinProtected: true,
        pinCode: '1234',
      },
      viewing: { accessLevel: 'Password Protected', password: 'Aura2026', expirationDate: '' },
      commenting: { enabled: true, allowProofingNotes: true, requireClientAuth: true },
      sharing: { enabled: true, allowGuestReshare: true, showSocialShare: true },
    },
  },
  {
    id: 6,
    name: 'Williams Anniversary Gala',
    type: 'Event',
    partnerType: 'Photographer',
    clientName: 'Robert Williams',
    clientEmail: 'robert@williams.co.uk',
    date: 'Mar 05, 2026',
    deadline: 'Mar 20, 2026',
    location: 'Lake Como, Italy',
    status: 'Culling',
    progress: 50,
    deliverables: '450 Event Highlights + Online Guest Gallery',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=600&fit=crop',
    tasks: [
      { id: 't1', title: 'Venue Setup Check', completed: true, assignedTo: 'Sarah Cabmora' },
      { id: 't2', title: 'RAW Backup to SSD', completed: true, assignedTo: 'Sarah Cabmora' },
      {
        id: 't3',
        title: 'AI Cull & Duplicate Removal',
        completed: false,
        assignedTo: 'Sarah Cabmora',
      },
    ],
    permissions: {
      download: {
        enabled: false,
        quality: 'Web-Optimized (2K)',
        requireWatermark: true,
        pinProtected: false,
        pinCode: '',
      },
      viewing: { accessLevel: 'Client & Team Only', password: '', expirationDate: '' },
      commenting: { enabled: false, allowProofingNotes: false, requireClientAuth: true },
      sharing: { enabled: true, allowGuestReshare: false, showSocialShare: false },
    },
  },
];

export const STAGES: Project['status'][] = [
  'Planning',
  'Shooting',
  'Culling',
  'Editing',
  'Review',
  'Completed',
];
