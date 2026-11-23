/**
 * Fixtures and types for the ProjectDetails screen.
 *
 * Stand-ins until the API is wired up (WP5). They live here rather than beside
 * the JSX so that swap touches one module instead of the component — and so a
 * test can import them without a DOM.
 */
export const PROJECT_DATA = {
  id: '1',
  name: 'Smith & Wesson Wedding',
  type: 'Wedding',
  date: 'Oct 12, 2025',
  location: 'Tuscany, Italy',
  status: 'In Progress',
  progress: 65,
  image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=400&fit=crop',
  description:
    'Full-day wedding coverage including preparation, ceremony, reception, and a post-wedding editorial shoot in the Tuscan countryside.',
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
  client: {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+44 7700 900077',
  },
  payment: {
    total: 8500,
    paid: 4250,
    status: 'Partially Paid',
    nextDue: 'Oct 01, 2025',
  },
  creators: [
    {
      id: 1,
      name: 'Sarah Cabmora',
      role: 'Lead Photographer',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    },
    {
      id: 2,
      name: 'Michael Chang',
      role: 'Videographer',
      image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop',
    },
    {
      id: 3,
      name: 'Emma Wilson',
      role: 'Second Shooter',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    },
  ],
  timeline: [
    {
      id: 1,
      title: 'Initial Consultation',
      date: 'Jan 15, 2025',
      status: 'completed',
      description: 'Discussed vision, style preferences, and coverage needs.',
    },
    {
      id: 2,
      title: 'Contract Signed & Deposit',
      date: 'Jan 20, 2025',
      status: 'completed',
      description: '50% deposit received, dates secured.',
    },
    {
      id: 3,
      title: 'Venue Walkthrough',
      date: 'Aug 10, 2025',
      status: 'in-progress',
      description: 'Scouting locations for portraits and lighting checks.',
    },
    {
      id: 4,
      title: 'Wedding Day',
      date: 'Oct 12, 2025',
      status: 'pending',
      description: 'Full day coverage starting at 9:00 AM.',
    },
    {
      id: 5,
      title: 'Gallery Delivery',
      date: 'Nov 15, 2025',
      status: 'pending',
      description: 'Final edited images and highlight film.',
    },
  ],
  deliverables: [
    { id: 1, name: 'Engagement Session Gallery', type: 'gallery', items: 120, status: 'completed' },
    { id: 2, name: 'Wedding Preview', type: 'gallery', items: 50, status: 'pending' },
    { id: 3, name: 'Full Wedding Gallery', type: 'gallery', items: 800, status: 'pending' },
    { id: 4, name: 'Highlight Film (5-7 mins)', type: 'video', items: 1, status: 'pending' },
  ],
  comments: [
    {
      id: 1,
      user: 'Jane Smith',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
      text: 'We love the engagement photos! Can we make sure to get similar lighting for the wedding day portraits?',
      time: '2 days ago',
    },
    {
      id: 2,
      user: 'Sarah Cabmora',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
      text: "Absolutely. I've noted the golden hour time for Tuscany on your date, we'll plan a 30-min window for those specific shots.",
      time: '1 day ago',
    },
  ],
};
