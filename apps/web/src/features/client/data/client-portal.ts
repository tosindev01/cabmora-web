/**
 * Fixtures and types for the ClientPortal screen.
 *
 * Stand-ins until the API is wired up (WP5). They live here rather than beside
 * the JSX so that swap touches one module instead of the component — and so a
 * test can import them without a DOM.
 */
// Mock data for the client
export const CLIENT_PROJECT = {
  id: '1',
  name: 'Smith & Wesson Wedding',
  type: 'Wedding',
  date: 'Oct 12, 2025',
  location: 'Tuscany, Italy',
  status: 'Review',
  progress: 85,
  image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&h=600&fit=crop',
  photographer: 'Sarah Cabmora',
  payment: {
    total: 8500,
    paid: 4250,
    due: 4250,
    status: 'Partially Paid',
    nextDue: 'Oct 01, 2025',
  },
  timeline: [
    { id: 1, title: 'Initial Consultation', date: 'Jan 15, 2025', status: 'completed' },
    { id: 2, title: 'Contract Signed & Deposit', date: 'Jan 20, 2025', status: 'completed' },
    { id: 3, title: 'Wedding Day', date: 'Oct 12, 2025', status: 'completed' },
    { id: 4, title: 'Gallery Review', date: 'Nov 15, 2025', status: 'in-progress' },
    { id: 5, title: 'Final Delivery & Album', date: 'Dec 01, 2025', status: 'pending' },
  ],
  gallery: [
    {
      id: 1,
      type: 'image',
      album: 'Ceremony',
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop',
      comments: 0,
    },
    {
      id: 2,
      type: 'image',
      album: 'Reception',
      url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=600&fit=crop',
      comments: 2,
    },
    {
      id: 3,
      type: 'image',
      album: 'Ceremony',
      url: 'https://images.unsplash.com/photo-1606216794074-735e91ce2c92?w=800&h=600&fit=crop',
      comments: 0,
    },
    {
      id: 4,
      type: 'image',
      album: 'Reception',
      url: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&h=600&fit=crop',
      comments: 1,
    },
    {
      id: 5,
      type: 'image',
      album: 'Preparation',
      url: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=800&h=600&fit=crop',
      comments: 0,
    },
    {
      id: 6,
      type: 'video',
      album: 'Highlights',
      url: 'https://images.unsplash.com/photo-1509927083803-4bd519298ac4?w=800&h=600&fit=crop',
      comments: 0,
    }, // Using image as placeholder for video thumbnail
  ],
};

export const NOTIFICATIONS = [
  { id: 1, type: 'upload', title: 'New Gallery Uploaded', time: '2 hours ago', unread: true },
  {
    id: 2,
    type: 'comment',
    title: 'Sarah replied to your comment',
    time: '5 hours ago',
    unread: true,
  },
  { id: 3, type: 'payment', title: 'Final Payment Reminder', time: '1 day ago', unread: false },
  {
    id: 4,
    type: 'system',
    title: 'System Maintenance Scheduled',
    time: '2 days ago',
    unread: false,
  },
];
