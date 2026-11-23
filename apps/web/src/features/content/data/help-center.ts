/**
 * Fixtures and types for the HelpCenter screen.
 *
 * Stand-ins until the API is wired up (WP5). They live here rather than beside
 * the JSX so that swap touches one module instead of the component — and so a
 * test can import them without a DOM.
 */
import { Book, PlayCircle, HelpCircle, FileText } from 'lucide-react';

export const HELP_CATEGORIES = [
  { id: 'getting-started', label: 'Getting Started', icon: Book },
  { id: 'account', label: 'Account & Billing', icon: FileText },
  { id: 'troubleshooting', label: 'Troubleshooting', icon: HelpCircle },
  { id: 'video-guides', label: 'Video Tutorials', icon: PlayCircle },
];

export const POPULAR_ARTICLES = [
  { id: '1', title: 'How to set up your creator profile', category: 'Getting Started' },
  { id: '2', title: 'Understanding your payout schedule', category: 'Account & Billing' },
  { id: '3', title: 'Best practices for video uploads', category: 'Video Tutorials' },
  { id: '4', title: 'Troubleshooting upload errors', category: 'Troubleshooting' },
  { id: '5', title: 'Connecting your social accounts', category: 'Getting Started' },
  { id: '6', title: 'How to edit your billing details', category: 'Account & Billing' },
];

export const ONBOARDING_GUIDES = [
  {
    id: 'guide-1',
    title: 'The Ultimate Guide to Cabmora',
    description:
      'Learn everything you need to know about setting up your account, managing your content, and getting paid.',
    readTime: '10 min read',
  },
  {
    id: 'guide-2',
    title: 'Mastering the Client Portal',
    description:
      'A step-by-step walkthrough of the client portal features to streamline your communication.',
    readTime: '8 min read',
  },
];

export const FAQS = [
  {
    question: 'How do I reset my password?',
    answer:
      "You can reset your password by clicking on the 'Forgot Password' link on the login page. We'll send you an email with instructions.",
  },
  {
    question: 'When do I get paid?',
    answer:
      'Payouts are processed automatically on the 1st and 15th of every month. You can view your upcoming payouts in the Billing section.',
  },
  {
    question: 'Can I change my subscription plan?',
    answer:
      'Yes, you can upgrade or downgrade your plan at any time from your Account Settings. Changes take effect on your next billing cycle.',
  },
  {
    question: 'What file formats do you support for videos?',
    answer:
      'We support MP4, MOV, and WEBM formats. For the best quality, we recommend 1080p or 4K resolution.',
  },
];
