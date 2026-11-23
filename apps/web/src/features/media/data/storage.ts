/**
 * Fixtures and types for the Storage screen.
 *
 * Stand-ins until the API is wired up (WP5). They live here rather than beside
 * the JSX so that swap touches one module instead of the component — and so a
 * test can import them without a DOM.
 */

export interface StoragePlan {
  id: string;
  name: string;
  capacity: string;
  capacityGB: number;
  monthlyPrice: number;
  annualPriceMonthly: number;
  description: string;
  features: string[];
  isCurrent?: boolean;
  isPopular?: boolean;
}

export interface AddOnPack {
  id: string;
  name: string;
  boost: string;
  boostGB: number;
  price: number;
  type: 'one-time' | 'annual';
  description: string;
}

export interface ProjectStorageItem {
  id: string;
  name: string;
  client: string;
  type: 'RAW Photography' | '4K Video' | 'Mixed Media' | 'Archive';
  sizeGB: number;
  filesCount: number;
  lastUpdated: string;
  status: 'Active' | 'Delivered' | 'Archived';
  tier: 'Hot SSD' | 'Cold Vault';
}

export const STORAGE_PLANS: StoragePlan[] = [
  {
    id: 'plan-starter',
    name: 'Starter Creator',
    capacity: '500 GB',
    capacityGB: 500,
    monthlyPrice: 15,
    annualPriceMonthly: 12,
    description: 'Ideal for emerging solo photographers managing seasonal client galleries.',
    features: [
      '300 GB Hot SSD + 200 GB Cold Archive',
      'Standard Global CDN Delivery',
      'Full RAW & JPEG Web Proofing',
      '1080p Video Streaming Player',
      'Up to 10 Active Client Galleries',
      'Email & Chat Support',
    ],
  },
  {
    id: 'plan-pro',
    name: 'Pro Studio',
    capacity: '2 TB (2,000 GB)',
    capacityGB: 2000,
    monthlyPrice: 39,
    annualPriceMonthly: 31,
    description: 'Built for high-volume wedding, editorial, and commercial creators.',
    features: [
      '1,500 GB Hot SSD + 500 GB Cold Archive',
      'Ultra-Fast Global Edge CDN',
      'RAW, TIFF & ProRes 4K Streaming',
      'Unlimited Client Galleries & Proofing',
      'Custom Gallery Branding & Watermarking',
      'Automated Cold Storage Archiving Rules',
      'Priority Support & 99.9% Uptime',
    ],
    isCurrent: true,
  },
  {
    id: 'plan-vault',
    name: 'Studio Vault 8K',
    capacity: '8 TB (8,000 GB)',
    capacityGB: 8000,
    monthlyPrice: 99,
    annualPriceMonthly: 79,
    description: 'Designed for 4K/8K cinema teams, drone operators & multi-creator studios.',
    features: [
      '6,000 GB Hot NVMe SSD + 2,000 GB Cold Vault',
      'Dedicated 10Gbps High-Speed Transfer Pipes',
      'ProRes RAW & RED Digital Cinema Playback',
      'Multi-User Team Role Access Governance',
      'Lifetime Cold Vault Client Retention',
      'Automated Local NAS Sync Integration',
      '24/7 VIP Studio Support Line',
    ],
    isPopular: true,
  },
  {
    id: 'plan-enterprise',
    name: 'Unlimited Enterprise',
    capacity: '25 TB+',
    capacityGB: 25000,
    monthlyPrice: 249,
    annualPriceMonthly: 199,
    description: 'Custom enterprise cloud infrastructure for large production agencies.',
    features: [
      'Dedicated Private Cloud Vault Instance',
      'Custom Storage SLA & Zero Retention Limits',
      'API Access for Custom Studio Workflows',
      'Custom SSL & Whitelabel Domain',
      'Dedicated Account Manager',
      'Custom Backup Policy Matrix',
    ],
  },
];

export const ADD_ON_PACKS: AddOnPack[] = [
  {
    id: 'addon-250',
    name: '+250 GB Instant Boost',
    boost: '+250 GB',
    boostGB: 250,
    price: 19,
    type: 'one-time',
    description: 'Instant hot storage boost for heavy wedding deliveries or peak shoot months.',
  },
  {
    id: 'addon-1000',
    name: '+1 TB High-Speed SSD Pack',
    boost: '+1,000 GB',
    boostGB: 1000,
    price: 49,
    type: 'one-time',
    description: 'High-speed NVMe SSD allocation added to your current studio plan.',
  },
  {
    id: 'addon-cold-5000',
    name: '+5 TB Cold Archive Pack',
    boost: '+5,000 GB',
    boostGB: 5000,
    price: 120,
    type: 'one-time',
    description: 'Deep archival vault storage for long-term project backups and RAW assets.',
  },
];

export const INITIAL_PROJECT_STORAGE: ProjectStorageItem[] = [
  {
    id: 'p1',
    name: 'Smith & Wesson Wedding',
    client: 'Jane Smith',
    type: 'Mixed Media',
    sizeGB: 185,
    filesCount: 1240,
    lastUpdated: '2 hours ago',
    status: 'Active',
    tier: 'Hot SSD',
  },
  {
    id: 'p2',
    name: "Elena's Editorial Shoot",
    client: 'Elena Vance',
    type: 'RAW Photography',
    sizeGB: 95,
    filesCount: 680,
    lastUpdated: '1 day ago',
    status: 'Active',
    tier: 'Hot SSD',
  },
  {
    id: 'p3',
    name: 'Corporate Event - TechCorp',
    client: 'David Miller',
    type: '4K Video',
    sizeGB: 82,
    filesCount: 42,
    lastUpdated: '3 days ago',
    status: 'Active',
    tier: 'Hot SSD',
  },
  {
    id: 'p4',
    name: 'Johnson Family Portraits',
    client: 'Sarah & Mark Johnson',
    type: 'RAW Photography',
    sizeGB: 48,
    filesCount: 310,
    lastUpdated: '1 week ago',
    status: 'Delivered',
    tier: 'Hot SSD',
  },
  {
    id: 'p5',
    name: 'Aura Beach Sunset Commercial',
    client: 'Aura Apparel',
    type: '4K Video',
    sizeGB: 40,
    filesCount: 18,
    lastUpdated: '2 weeks ago',
    status: 'Archived',
    tier: 'Cold Vault',
  },
];
