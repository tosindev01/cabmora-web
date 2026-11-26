import {
  collaborationApi,
  creatorLandingApi,
  type ClientBriefingDto,
  type CommunityCollaborationRequestDto,
  type CommunityFeedDto,
  type CommunityFollowerDto,
  type CommunityPostDto,
  type CreatorBookingRequestDto,
  type CreatorBriefingDto,
  type CreatorReferralEntryDto,
  type CreatorReferralSummaryDto,
  type ProjectCallDto,
} from '@cabmora/api-client';

export interface NewClientNotification {
  id: string;
  clientName: string;
  clientEmail: string;
  avatar: string;
  projectTitle: string;
  projectType: 'Wedding' | 'Editorial' | 'Corporate' | 'Commercial' | 'Portrait';
  location: string;
  shootDate: string;
  packageAmount: number;
  status: 'New Booking' | 'Contract Signed' | 'New Enquiry';
  receivedAt: string;
  notes: string;
  acknowledged?: boolean;
}

export interface WeatherDaySlot {
  label: string;
  tempC: number;
  condition: 'Sunny' | 'Golden Clear' | 'Soft Overcast' | 'Light Mist';
  windKmh: number;
  precipChance: number;
}

export interface NextProjectWeatherForecast {
  projectId: string;
  projectTitle: string;
  clientName: string;
  location: string;
  shootDate: string;
  daysUntilShoot: number;
  tempC: number;
  tempF: number;
  condition: string;
  humidity: number;
  windKmh: number;
  windDirection: string;
  droneStatus: 'Optimal for 4K Aerials' | 'Caution — Gusty' | 'Indoor Recommended';
  uvIndex: string;
  goldenHour: string;
  blueHour: string;
  aiLightingNote: string;
  locationImage: string;
  hourlyOrMultiDay: WeatherDaySlot[];
}

export interface PendingClientMessage {
  id: string;
  clientName: string;
  clientEmail: string;
  clientAvatar: string;
  projectId: string;
  projectTitle: string;
  preview: string;
  receivedAt: string;
  unread: boolean;
  category: 'Invoice Request' | 'Revision Note' | 'New Client' | 'Logistics';
  suggestedInvoiceAmount?: number;
  replies: {
    id: string;
    sender: 'client' | 'creator';
    text: string;
    time: string;
    imageUrl?: string;
    callEvent?: {
      mode: 'video' | 'audio';
      status: 'completed' | 'scheduled' | 'live';
      duration: string;
      roomUrl?: string;
    };
  }[];
}

export interface CreatorInvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CreatorGeneratedInvoice {
  id: string;
  client: string;
  clientEmail: string;
  project: string;
  issued: string;
  due: string;
  amount: number;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  status: 'Paid' | 'Outstanding' | 'Overdue';
  notes: string;
  generatedByAi?: boolean;
  lineItems: CreatorInvoiceLineItem[];
}

const INVOICES_STORAGE_KEY = 'cabmora_creator_invoices_v1';
const MESSAGES_STORAGE_KEY = 'cabmora_creator_messages_v1';
const CALLS_STORAGE_KEY = 'cabmora_creator_calls_v1';
const NEW_CLIENTS_STORAGE_KEY = 'cabmora_creator_new_clients_v1';
const REFERRALS_STORAGE_KEY = 'cabmora_creator_referrals_v1';
export const STUDIO_WORKSPACE_EVENT = 'cabmora:studio-workspace-updated';

function notifyUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_WORKSPACE_EVENT));
  }
}

export const INITIAL_NEW_CLIENTS: NewClientNotification[] = [
  {
    id: 'nc-1',
    clientName: 'Clara & Julian Mercer',
    clientEmail: 'clara.mercer@ateliermercer.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
    projectTitle: 'Lake Como Destination Wedding',
    projectType: 'Wedding',
    location: 'Villa Balbianello, Lake Como, Italy',
    shootDate: 'Oct 28, 2025',
    packageAmount: 12500,
    status: 'New Booking',
    receivedAt: '18 mins ago',
    notes: 'Full-day Hybrid Photo + 4K Cinema Reel, aerial drone coverage & rehearsal dinner.',
  },
  {
    id: 'nc-2',
    clientName: 'Maison Lumière Paris',
    clientEmail: 'production@maisonlumiere.fr',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop',
    projectTitle: 'SS26 Haute Couture Lookbook',
    projectType: 'Editorial',
    location: 'Place Vendôme, Paris, France',
    shootDate: 'Nov 12, 2025',
    packageAmount: 6800,
    status: 'Contract Signed',
    receivedAt: '2 hours ago',
    notes: '40 retouched editorial plates + 16:9 & 9:16 social campaign motion cuts.',
  },
  {
    id: 'nc-3',
    clientName: 'Vanguard Ventures',
    clientEmail: 'events@vanguardvc.io',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    projectTitle: 'Vanguard Global Founders Summit',
    projectType: 'Corporate',
    location: 'Shoreditch House, London, UK',
    shootDate: 'Dec 03, 2025',
    packageAmount: 5400,
    status: 'New Enquiry',
    receivedAt: '5 hours ago',
    notes: 'Multi-cam 4K keynote capture, executive portraits & same-day press highlights.',
  },
];

export const PROJECT_WEATHER_FORECASTS: NextProjectWeatherForecast[] = [
  {
    projectId: '1',
    projectTitle: 'Smith & Wesson Wedding',
    clientName: 'Jane Smith',
    location: 'Val d’Orcia, Tuscany, Italy',
    shootDate: 'Oct 12, 2025',
    daysUntilShoot: 3,
    tempC: 24,
    tempF: 75,
    condition: 'Golden Clear Sky',
    humidity: 48,
    windKmh: 8,
    windDirection: 'NW',
    droneStatus: 'Optimal for 4K Aerials',
    uvIndex: '5 (Moderate)',
    goldenHour: '17:42 – 18:35',
    blueHour: '18:35 – 19:05',
    aiLightingNote:
      'Warm 3500K golden hour light across the cypress ridge at 17:45. Low 8 km/h breeze is cleared for 4K ProRes drone flight.',
    locationImage:
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=500&fit=crop',
    hourlyOrMultiDay: [
      { label: '14:00 Prep', tempC: 25, condition: 'Sunny', windKmh: 9, precipChance: 5 },
      { label: '16:00 Ceremony', tempC: 24, condition: 'Golden Clear', windKmh: 8, precipChance: 5 },
      { label: '17:45 Golden Hr', tempC: 22, condition: 'Golden Clear', windKmh: 6, precipChance: 0 },
      { label: '19:00 Reception', tempC: 19, condition: 'Golden Clear', windKmh: 5, precipChance: 0 },
    ],
  },
  {
    projectId: '2',
    projectTitle: "Elena's Editorial Shoot",
    clientName: 'Elena Vance',
    location: 'Le Marais & Place Vendôme, Paris, France',
    shootDate: 'Nov 04, 2025',
    daysUntilShoot: 11,
    tempC: 16,
    tempF: 61,
    condition: 'Soft Overcast (Natural Diffuser)',
    humidity: 62,
    windKmh: 14,
    windDirection: 'W',
    droneStatus: 'Caution — Gusty',
    uvIndex: '3 (Low)',
    goldenHour: '16:50 – 17:30',
    blueHour: '17:30 – 18:00',
    aiLightingNote:
      'High overcast cloud deck acts as a giant softbox — ideal for editorial skin tones without harsh specular highlights.',
    locationImage:
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=500&fit=crop',
    hourlyOrMultiDay: [
      { label: '09:00 Call Time', tempC: 13, condition: 'Soft Overcast', windKmh: 12, precipChance: 15 },
      { label: '12:00 Street Look', tempC: 16, condition: 'Soft Overcast', windKmh: 14, precipChance: 15 },
      { label: '15:30 Courtyard', tempC: 15, condition: 'Golden Clear', windKmh: 11, precipChance: 10 },
      { label: '17:00 Dusk Wrap', tempC: 13, condition: 'Golden Clear', windKmh: 9, precipChance: 10 },
    ],
  },
  {
    projectId: '3',
    projectTitle: 'Corporate Event - TechCorp',
    clientName: 'David Miller',
    location: 'Southbank Centre, London, UK',
    shootDate: 'Dec 15, 2025',
    daysUntilShoot: 24,
    tempC: 9,
    tempF: 48,
    condition: 'Light Mist • Indoor Stage',
    humidity: 76,
    windKmh: 19,
    windDirection: 'SW',
    droneStatus: 'Indoor Recommended',
    uvIndex: '1 (Low)',
    goldenHour: '15:35 – 16:10',
    blueHour: '16:10 – 16:45',
    aiLightingNote:
      'Exterior mist expected; bring weather-sealed 24-70mm f/2.8 for red-carpet arrivals and match 4800K LED wall indoors.',
    locationImage:
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=500&fit=crop',
    hourlyOrMultiDay: [
      { label: '08:30 Rigging', tempC: 7, condition: 'Light Mist', windKmh: 18, precipChance: 35 },
      { label: '11:00 Keynote', tempC: 9, condition: 'Soft Overcast', windKmh: 19, precipChance: 25 },
      { label: '14:30 Breakouts', tempC: 9, condition: 'Soft Overcast', windKmh: 16, precipChance: 20 },
      { label: '17:30 Gala Mixer', tempC: 8, condition: 'Light Mist', windKmh: 14, precipChance: 30 },
    ],
  },
];

export const INITIAL_STUDIO_CALLS: ProjectCallDto[] = [
  {
    id: 'call-101',
    project_id: '1',
    project_title: 'Smith & Wesson Wedding',
    requester_id: 'client-jane',
    requester_name: 'Jane Smith',
    recipient_id: 'creator-me',
    recipient_name: 'Sarah Cabmora',
    title: 'Final Sunset Timeline & Drone Shot List Review',
    notes: 'Confirming golden hour family portraits & ceremony mic placement in Tuscany.',
    proposed_at: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    duration_minutes: 30,
    status: 'pending',
    meeting_room_id: 'cabmora-tuscany-101',
    meeting_url: 'https://meet.jit.si/cabmora-tuscany-101',
    responded_at: null,
    created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: 'call-102',
    project_id: '2',
    project_title: "Elena's Editorial Shoot",
    requester_id: 'client-elena',
    requester_name: 'Elena Vance',
    recipient_id: 'creator-me',
    recipient_name: 'Sarah Cabmora',
    title: 'Paris Lookbook Color Grade & Cover Selection',
    notes: 'Walking through the 12 retouched hero plates before magazine print lock.',
    proposed_at: new Date(Date.now() + 22 * 3600 * 1000).toISOString(),
    duration_minutes: 45,
    status: 'pending',
    meeting_room_id: 'cabmora-paris-102',
    meeting_url: 'https://meet.jit.si/cabmora-paris-102',
    responded_at: null,
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'call-103',
    project_id: '3',
    project_title: 'Corporate Event - TechCorp',
    requester_id: 'client-david',
    requester_name: 'David Miller',
    recipient_id: 'creator-me',
    recipient_name: 'Sarah Cabmora',
    title: 'Keynote Multicam & Stage Audio Sync',
    notes: 'Reviewing XLR feed handoff with venue AV engineers.',
    proposed_at: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    duration_minutes: 30,
    status: 'accepted',
    meeting_room_id: 'cabmora-techcorp-103',
    meeting_url: 'https://meet.jit.si/cabmora-techcorp-103',
    responded_at: new Date(Date.now() - 1800 * 1000).toISOString(),
    created_at: new Date(Date.now() - 86400 * 1000).toISOString(),
  },
];

export const INITIAL_PENDING_MESSAGES: PendingClientMessage[] = [
  {
    id: 'msg-1',
    clientName: 'Jane Smith',
    clientEmail: 'jane.smith@example.com',
    clientAvatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
    projectId: '1',
    projectTitle: 'Smith & Wesson Wedding',
    preview:
      'Hi! Can we add 2 hours of rehearsal dinner coverage & drone aerials to our invoice before Friday?',
    receivedAt: '12m ago',
    unread: true,
    category: 'Invoice Request',
    suggestedInvoiceAmount: 4850,
    replies: [
      {
        id: 'm1-0',
        sender: 'client',
        text: 'Hi Sarah! We loved the venue walkthrough in Val d’Orcia yesterday.',
        time: 'Yesterday, 16:10',
      },
      {
        id: 'm1-0b',
        sender: 'creator',
        text: 'It was magical, Jane! I mapped out the 17:42 golden hour ridge spots and checked the 18.4 km studio route to the villa.',
        time: 'Yesterday, 16:28',
      },
      {
        id: 'm1-0c',
        sender: 'creator',
        text: 'Completed a 22-minute Timeline & Lighting Video Call',
        time: 'Yesterday, 17:00',
        callEvent: {
          mode: 'video',
          status: 'completed',
          duration: '22m 15s',
          roomUrl: 'https://meet.jit.si/cabmora-tuscany-101',
        },
      },
      {
        id: 'm1-1',
        sender: 'client',
        text: 'Hi! Can we add 2 hours of rehearsal dinner coverage & drone aerials to our invoice before Friday?',
        time: '12m ago',
      },
    ],
  },
  {
    id: 'msg-2',
    clientName: 'Clara & Julian Mercer',
    clientEmail: 'clara.mercer@ateliermercer.com',
    clientAvatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
    projectId: '6',
    projectTitle: 'Lake Como Destination Wedding',
    preview:
      'We just submitted our new client booking! Could you generate the 50% retainer invoice ($6,250) so we can lock the date?',
    receivedAt: '28m ago',
    unread: true,
    category: 'New Client',
    suggestedInvoiceAmount: 6250,
    replies: [
      {
        id: 'm2-0',
        sender: 'creator',
        text: 'Welcome to Cabmora Studio, Clara & Julian! Thrilled to capture your Villa Balbianello celebration.',
        time: '1h ago',
      },
      {
        id: 'm2-1',
        sender: 'client',
        text: 'We just submitted our new client booking! Could you generate the 50% retainer invoice ($6,250) so we can lock the date?',
        time: '28m ago',
      },
    ],
  },
  {
    id: 'msg-3',
    clientName: 'Elena Vance',
    clientEmail: 'elena@vancemodels.com',
    clientAvatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop',
    projectId: '2',
    projectTitle: "Elena's Editorial Shoot",
    preview:
      'Left 4 pinned notes on the Paris lookbook selects — love the warm kodak grain on shot #14! Can we warm up #18 to match?',
    receivedAt: '1h ago',
    unread: true,
    category: 'Revision Note',
    replies: [
      {
        id: 'm3-0',
        sender: 'creator',
        text: 'Hi Elena! I just uploaded 45 retouched cover shots from our Place Vendôme session.',
        time: '3h ago',
      },
      {
        id: 'm3-1',
        sender: 'client',
        text: 'Left 4 pinned notes on the Paris lookbook selects — love the warm kodak grain on shot #14! Can we warm up #18 to match?',
        time: '1h ago',
      },
    ],
  },
  {
    id: 'msg-4',
    clientName: 'David Miller',
    clientEmail: 'david.m@techcorp.io',
    clientAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    projectId: '3',
    projectTitle: 'Corporate Event - TechCorp',
    preview:
      'Shared the Southbank keynote stage lighting plot and speaker run-of-show for December.',
    receivedAt: '3h ago',
    unread: false,
    category: 'Logistics',
    replies: [
      {
        id: 'm4-1',
        sender: 'client',
        text: 'Shared the Southbank keynote stage lighting plot and speaker run-of-show for December.',
        time: '3h ago',
      },
      {
        id: 'm4-2',
        sender: 'creator',
        text: 'Received, David! Our multicam crew is 6.4 km from Southbank Centre and ready for the morning XLR audio check.',
        time: '2h ago',
      },
    ],
  },
];

export const INITIAL_CREATOR_INVOICES: CreatorGeneratedInvoice[] = [
  {
    id: 'INV-2025-042',
    client: 'Jane Smith',
    clientEmail: 'jane.smith@example.com',
    project: 'Smith & Wesson Wedding',
    issued: 'Sep 15, 2025',
    due: 'Oct 01, 2025',
    subtotal: 4250,
    taxRate: 0,
    taxAmount: 0,
    amount: 4250,
    status: 'Outstanding',
    notes: 'Milestone 2: Full-Day Tuscany Wedding Photography & 4K Highlight Reel.',
    lineItems: [
      {
        id: 'li-1',
        description: 'Full-Day Hybrid Wedding Coverage (10 hrs)',
        quantity: 1,
        unitPrice: 3200,
      },
      {
        id: 'li-2',
        description: '4K Drone Aerial Cinematography & Color Grading',
        quantity: 1,
        unitPrice: 1050,
      },
    ],
  },
  {
    id: 'INV-2025-041',
    client: 'Elena Vance',
    clientEmail: 'elena@vancemodels.com',
    project: "Elena's Editorial Shoot",
    issued: 'Aug 20, 2025',
    due: 'Sep 05, 2025',
    subtotal: 1200,
    taxRate: 0,
    taxAmount: 0,
    amount: 1200,
    status: 'Paid',
    notes: 'Paris Editorial Lookbook Retouching & Print Licensing.',
    lineItems: [
      {
        id: 'li-3',
        description: 'Editorial Studio & On-Location Photography',
        quantity: 1,
        unitPrice: 900,
      },
      {
        id: 'li-4',
        description: 'High-End Beauty Retouching (15 Plates)',
        quantity: 1,
        unitPrice: 300,
      },
    ],
  },
  {
    id: 'INV-2025-040',
    client: 'TechCorp Inc.',
    clientEmail: 'david.m@techcorp.io',
    project: 'Corporate Event - TechCorp',
    issued: 'Aug 10, 2025',
    due: 'Aug 25, 2025',
    subtotal: 3500,
    taxRate: 0,
    taxAmount: 0,
    amount: 3500,
    status: 'Overdue',
    notes: '50% Production Retainer for Multi-Cam Keynote Capture.',
    lineItems: [
      {
        id: 'li-5',
        description: '3-Camera 4K Keynote Production & Audio Capture',
        quantity: 1,
        unitPrice: 2500,
      },
      {
        id: 'li-6',
        description: 'Same-Day Social Highlight Cuts (3x Reels)',
        quantity: 1,
        unitPrice: 1000,
      },
    ],
  },
  {
    id: 'INV-2025-039',
    client: 'Jane Smith',
    clientEmail: 'jane.smith@example.com',
    project: 'Smith & Wesson Wedding',
    issued: 'Jan 15, 2025',
    due: 'Jan 30, 2025',
    subtotal: 4250,
    taxRate: 0,
    taxAmount: 0,
    amount: 4250,
    status: 'Paid',
    notes: '50% Booking Retainer — Tuscany Wedding.',
    lineItems: [
      {
        id: 'li-7',
        description: '50% Booking Retainer & Date Lock',
        quantity: 1,
        unitPrice: 4250,
      },
    ],
  },
];

export function getStudioInvoices(): CreatorGeneratedInvoice[] {
  if (typeof window === 'undefined') return INITIAL_CREATOR_INVOICES;
  try {
    const raw = window.localStorage.getItem(INVOICES_STORAGE_KEY);
    if (!raw) return INITIAL_CREATOR_INVOICES;
    const parsed = JSON.parse(raw) as CreatorGeneratedInvoice[];
    return parsed.length > 0 ? parsed : INITIAL_CREATOR_INVOICES;
  } catch {
    return INITIAL_CREATOR_INVOICES;
  }
}

export function saveStudioInvoice(invoice: CreatorGeneratedInvoice): CreatorGeneratedInvoice[] {
  const current = getStudioInvoices();
  const exists = current.some((i) => i.id === invoice.id);
  const next = exists
    ? current.map((i) => (i.id === invoice.id ? invoice : i))
    : [invoice, ...current];
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(next));
      notifyUpdate();
    } catch {
      // ignore storage errors
    }
  }
  // Fire-and-forget backend persistence so backend /creators/me/invoices/ai is always in sync
  void collaborationApi
    .createAiGeneratedInvoice({
      client_name: invoice.client,
      client_email: invoice.clientEmail,
      project_title: invoice.project,
      amount: invoice.amount,
      include_drone: invoice.lineItems.some((l) => l.description.toLowerCase().includes('drone')),
      include_rehearsal: invoice.lineItems.some((l) =>
        l.description.toLowerCase().includes('rehearsal'),
      ),
    })
    .catch(() => undefined);

  return next;
}

export const INITIAL_CREATOR_REFERRALS: CreatorReferralEntryDto[] = [
  {
    id: 'ref-1',
    referred_name: 'Marcus Vance Studio',
    referred_email: 'marcus@vancestudios.co.uk',
    role: 'creator',
    status: 'Reward Paid',
    date: 'Oct 04, 2025',
    reward_amount: 350,
    bonus_storage_gb: 250,
  },
  {
    id: 'ref-2',
    referred_name: 'Sienna & Lucas Sterling',
    referred_email: 'sienna.sterling@luxuryevents.it',
    role: 'client',
    status: 'First Project Booked',
    date: 'Oct 11, 2025',
    reward_amount: 850,
    bonus_storage_gb: 250,
  },
  {
    id: 'ref-3',
    referred_name: 'Aurelia Editorial Paris',
    referred_email: 'contact@aureliaparis.fr',
    role: 'creator',
    status: 'Joined Studio',
    date: 'Oct 19, 2025',
    reward_amount: 350,
    bonus_storage_gb: 250,
  },
  {
    id: 'ref-4',
    referred_name: 'Julian & Clara Mercer',
    referred_email: 'clara.mercer@ateliermercer.com',
    role: 'client',
    status: 'First Project Booked',
    date: 'Oct 24, 2025',
    reward_amount: 1300,
    bonus_storage_gb: 750,
  },
];

export function getCreatorReferralSummary(firstName?: string | null): CreatorReferralSummaryDto {
  let entries = INITIAL_CREATOR_REFERRALS;
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(REFERRALS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CreatorReferralEntryDto[];
        if (parsed.length > 0) entries = parsed;
      }
    } catch {
      // ignore
    }
  }
  const prefix = (firstName || 'SARAH').toUpperCase().replace(/\s+/g, '').slice(0, 8);
  const code = `${prefix}-CABMORA-VIP`;
  const totalEarnings = entries.reduce((sum, r) => sum + r.reward_amount, 0);
  const pendingPayouts = entries
    .filter((r) => r.status !== 'Reward Paid')
    .reduce((sum, r) => sum + r.reward_amount, 0);
  const bonusStorage = entries.reduce((sum, r) => sum + r.bonus_storage_gb, 0);

  return {
    referral_code: code,
    referral_link: `https://cabmora.com/flow/apply?ref=${code}`,
    tier: 'Gold Studio Ambassador',
    next_tier: 'Platinum Partner (0% Platform Fee)',
    tier_progress_percent: 76,
    total_earnings: totalEarnings,
    pending_payouts: pendingPayouts,
    bonus_storage_gb: bonusStorage,
    conversion_rate: 68,
    referrals: entries,
  };
}

export async function addCreatorReferralInvite(params: {
  name: string;
  email: string;
  role: 'creator' | 'client';
  personalNote?: string;
  firstName?: string | null;
}): Promise<CreatorReferralSummaryDto> {
  const current = getCreatorReferralSummary(params.firstName).referrals;
  const newEntry: CreatorReferralEntryDto = {
    id: `ref-${Date.now()}`,
    referred_name: params.name,
    referred_email: params.email,
    role: params.role,
    status: 'Invited',
    date: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }),
    reward_amount: params.role === 'creator' ? 350 : 250,
    bonus_storage_gb: 250,
  };
  const next = [newEntry, ...current];
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(REFERRALS_STORAGE_KEY, JSON.stringify(next));
      notifyUpdate();
    } catch {
      // ignore
    }
  }
  try {
    return await collaborationApi.inviteCreatorReferral({
      name: params.name,
      email: params.email,
      role: params.role,
      personal_note: params.personalNote,
    });
  } catch {
    return getCreatorReferralSummary(params.firstName);
  }
}

export function markStudioInvoicePaid(invoiceId: string): CreatorGeneratedInvoice[] {
  const current = getStudioInvoices();
  const next = current.map((inv) =>
    inv.id === invoiceId ? { ...inv, status: 'Paid' as const } : inv,
  );
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(next));
      notifyUpdate();
    } catch {
      // ignore
    }
  }
  return next;
}

export function buildAiInvoiceDraft(params: {
  clientName?: string;
  clientEmail?: string;
  projectTitle?: string;
  amount?: number;
  includeDrone?: boolean;
  includeRehearsal?: boolean;
  customDescription?: string;
}): CreatorGeneratedInvoice {
  const existing = getStudioInvoices();
  const nextNum = 43 + existing.length;
  const id = `INV-2025-0${nextNum}`;
  const client = params.clientName || 'Clara & Julian Mercer';
  const clientEmail = params.clientEmail || 'clara.mercer@ateliermercer.com';
  const project = params.projectTitle || 'Lake Como Destination Wedding';

  const lineItems: CreatorInvoiceLineItem[] = [];

  if (params.customDescription && params.amount) {
    lineItems.push({
      id: `li-${Date.now()}-1`,
      description: params.customDescription,
      quantity: 1,
      unitPrice: params.amount,
    });
  } else {
    const baseAmount = params.amount ? Math.round(params.amount * 0.7) : 3400;
    const postAmount = params.amount ? params.amount - baseAmount : 1450;
    lineItems.push(
      {
        id: `li-${Date.now()}-1`,
        description: `${project} — Lead Photography & 4K Cinema Coverage`,
        quantity: 1,
        unitPrice: baseAmount,
      },
      {
        id: `li-${Date.now()}-2`,
        description: 'Master Color Grading, High-Res Proofing Vault & Delivery',
        quantity: 1,
        unitPrice: postAmount,
      },
    );
    if (params.includeDrone) {
      lineItems.push({
        id: `li-${Date.now()}-3`,
        description: '4K ProRes Aerial Drone Cinematography Add-On',
        quantity: 1,
        unitPrice: 650,
      });
    }
    if (params.includeRehearsal) {
      lineItems.push({
        id: `li-${Date.now()}-4`,
        description: 'Rehearsal Dinner Coverage (2 Hours)',
        quantity: 2,
        unitPrice: 350,
      });
    }
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxRate = 0;
  const taxAmount = 0;
  const amount = subtotal + taxAmount;

  const today = new Date();
  const due = new Date(today.getTime() + 14 * 86400 * 1000);

  return {
    id,
    client,
    clientEmail,
    project,
    issued: today.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    due: due.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    subtotal,
    taxRate,
    taxAmount,
    amount,
    status: 'Outstanding',
    notes: `AI-Generated Creator Studio Invoice for ${client} (${project}). Includes net-14 online payment link & automated receipt.`,
    generatedByAi: true,
    lineItems,
  };
}

export function getPendingMessages(): PendingClientMessage[] {
  if (typeof window === 'undefined') return INITIAL_PENDING_MESSAGES;
  try {
    const raw = window.localStorage.getItem(MESSAGES_STORAGE_KEY);
    if (!raw) return INITIAL_PENDING_MESSAGES;
    const parsed = JSON.parse(raw) as PendingClientMessage[];
    return parsed.length > 0 ? parsed : INITIAL_PENDING_MESSAGES;
  } catch {
    return INITIAL_PENDING_MESSAGES;
  }
}

export function replyToPendingMessage(
  messageId: string,
  replyText: string,
  imageUrl?: string,
  sender: 'creator' | 'client' = 'creator',
  callEvent?: {
    mode: 'video' | 'audio';
    status: 'completed' | 'scheduled' | 'live';
    duration: string;
    roomUrl?: string;
  },
): PendingClientMessage[] {
  const current = getPendingMessages();
  const next = current.map((msg) => {
    if (msg.id !== messageId) return msg;
    return {
      ...msg,
      unread: sender === 'client',
      preview: replyText,
      receivedAt: 'Just now',
      replies: [
        ...msg.replies,
        {
          id: `r-${Date.now()}`,
          sender,
          text: replyText,
          time: 'Just now',
          imageUrl,
          callEvent,
        },
      ],
    };
  });
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(next));
      notifyUpdate();
    } catch {
      // ignore
    }
  }
  return next;
}

export function markMessageRead(messageId: string): PendingClientMessage[] {
  const current = getPendingMessages();
  const next = current.map((m) => (m.id === messageId ? { ...m, unread: false } : m));
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(next));
      notifyUpdate();
    } catch {
      // ignore
    }
  }
  return next;
}

export function getStudioCalls(apiCalls?: ProjectCallDto[]): ProjectCallDto[] {
  let localCalls = INITIAL_STUDIO_CALLS;
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(CALLS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ProjectCallDto[];
        if (parsed.length > 0) localCalls = parsed;
      }
    } catch {
      // ignore
    }
  }
  if (apiCalls && apiCalls.length > 0) {
    const apiIds = new Set(apiCalls.map((c) => c.id));
    return [...apiCalls, ...localCalls.filter((c) => !apiIds.has(c.id))];
  }
  return localCalls;
}

export function updateStudioCallStatus(
  callId: string,
  action: 'accept' | 'decline',
): ProjectCallDto[] {
  const current = getStudioCalls();
  const nextStatus = action === 'accept' ? 'accepted' : 'declined';
  const next = current.map((c) =>
    c.id === callId
      ? { ...c, status: nextStatus as ProjectCallDto['status'], responded_at: new Date().toISOString() }
      : c,
  );
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(CALLS_STORAGE_KEY, JSON.stringify(next));
      notifyUpdate();
    } catch {
      // ignore
    }
  }
  return next;
}

export function getNewClientNotifications(): NewClientNotification[] {
  if (typeof window === 'undefined') return INITIAL_NEW_CLIENTS;
  try {
    const raw = window.localStorage.getItem(NEW_CLIENTS_STORAGE_KEY);
    if (!raw) return INITIAL_NEW_CLIENTS;
    const parsed = JSON.parse(raw) as NewClientNotification[];
    return parsed.length > 0 ? parsed : INITIAL_NEW_CLIENTS;
  } catch {
    return INITIAL_NEW_CLIENTS;
  }
}

export function acknowledgeNewClient(id: string): NewClientNotification[] {
  const current = getNewClientNotifications();
  const next = current.map((c) => (c.id === id ? { ...c, acknowledged: true } : c));
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(NEW_CLIENTS_STORAGE_KEY, JSON.stringify(next));
      notifyUpdate();
    } catch {
      // ignore
    }
  }
  return next;
}

/**
 * Ensures the AI Studio Briefing is rich and populated even when the backend returns
 * zeroed-out counts for a newly created creator account.
 */
export function ensureRichBriefing(
  data: CreatorBriefingDto | null,
  firstName?: string | null,
): CreatorBriefingDto {
  const calls = getStudioCalls();
  const pendingCallsCount = calls.filter((c) => c.status === 'pending').length;
  const messages = getPendingMessages();
  const unreadMessagesCount = messages.filter((m) => m.unread).length;
  const newClients = getNewClientNotifications();

  const defaultItems: CreatorBriefingDto['action_items'] = [
    {
      kind: 'call',
      title: 'Pending Video Call: Final Sunset Timeline & Drone Shot List',
      subtitle: 'Jane Smith requested a 30-min call today • Tuscany shoot in 3 days',
      project_id: '1',
      project_title: 'Smith & Wesson Wedding',
      url: '/projects/1',
      priority: 'urgent',
    },
    {
      kind: 'comment',
      title: 'Unread Client Message: Add Rehearsal Dinner & Retainer Invoice',
      subtitle: 'Jane Smith & Clara Mercer sent invoice & coverage requests',
      project_id: '1',
      project_title: 'Smith & Wesson Wedding',
      url: '/messages',
      priority: 'urgent',
    },
    {
      kind: 'revision',
      title: '4 Pinned Color-Grade Notes on Paris Lookbook Selects',
      subtitle: 'Elena Vance requested warmer Kodak film grain on hero plate #18',
      project_id: '2',
      project_title: "Elena's Editorial Shoot",
      url: '/projects/2',
      priority: 'high',
    },
    {
      kind: 'deadline',
      title: 'Export High-Res Proof Gallery & 4K Highlight Film',
      subtitle: 'Tuscany weather forecast: 24°C Golden Clear Sky (Optimal for Drone)',
      project_id: '1',
      project_title: 'Smith & Wesson Wedding',
      url: '/projects/1',
      priority: 'high',
    },
    {
      kind: 'task',
      title: 'Onboard New Client: Clara & Julian Mercer ($12,500 Package)',
      subtitle: 'Lake Como Destination Wedding • Generate 50% retainer invoice ($6,250)',
      project_id: '6',
      project_title: 'Lake Como Destination Wedding',
      url: '/billing',
      priority: 'high',
    },
  ];

  const isEmptyApi =
    !data ||
    (data.projects_in_progress === 0 &&
      data.pending_tasks_count === 0 &&
      data.action_items.length === 0);

  if (isEmptyApi) {
    return {
      headline:
        data?.headline ||
        `Welcome back${firstName ? `, ${firstName}` : ''}! Here's what needs your attention today.`,
      summary_text: `${newClients.length} new client notifications, ${pendingCallsCount} pending call requests, ${unreadMessagesCount} unread client messages, and a 24°C Golden Clear forecast for your next shoot in Tuscany.`,
      projects_in_progress: 6,
      pending_tasks_count: 5,
      revision_requests_count: 2,
      unread_comments_count: Math.max(4, unreadMessagesCount),
      upcoming_deadlines_count: 3,
      pending_calls_count: Math.max(2, pendingCallsCount),
      action_items: defaultItems,
    };
  }

  return {
    ...data,
    pending_calls_count: Math.max(data.pending_calls_count, pendingCallsCount),
    unread_comments_count: Math.max(data.unread_comments_count, unreadMessagesCount),
    action_items: data.action_items.length > 0 ? data.action_items : defaultItems,
  };
}

// ── Project Countdown, Venue Distance & Deadline Warning Metadata ────────────

export interface ProjectLogisticsMeta {
  projectId: string;
  venueDistanceKm: number;
  venueTravelTime: string;
  venueRouteSummary: string;
  targetOffsetHours: number;
  deadlineWarningLevel: 'critical' | 'warning' | 'on_track' | 'completed';
  deadlineWarningText: string;
}

const PROJECT_LOGISTICS_MAP: Record<string, ProjectLogisticsMeta> = {
  '1': {
    projectId: '1',
    venueDistanceKm: 18.4,
    venueTravelTime: '26 mins drive from Studio Base',
    venueRouteSummary: 'Via SR2 Cassia to Val d’Orcia Villa, Tuscany',
    targetOffsetHours: 58,
    deadlineWarningLevel: 'critical',
    deadlineWarningText:
      'URGENT DEADLINE WARNING: Final Proof Gallery & 4K Highlight Film due in 2 days (2 tasks pending)!',
  },
  '2': {
    projectId: '2',
    venueDistanceKm: 9.2,
    venueTravelTime: '18 mins drive from Paris Studio',
    venueRouteSummary: 'Via Rue de Rivoli to Place Vendôme, Paris',
    targetOffsetHours: 92,
    deadlineWarningLevel: 'warning',
    deadlineWarningText:
      'DEADLINE WARNING: Client Cover Proof Selection & Kodak Grain Retouching due in 3 days!',
  },
  '3': {
    projectId: '3',
    venueDistanceKm: 6.4,
    venueTravelTime: '15 mins transit from Shoreditch Studio',
    venueRouteSummary: 'Via Waterloo Bridge to Southbank Centre, London',
    targetOffsetHours: 164,
    deadlineWarningLevel: 'on_track',
    deadlineWarningText: 'Upcoming Deadline: Drone Permit & Wireless Audio Check due in 6 days.',
  },
  '4': {
    projectId: '4',
    venueDistanceKm: 12.6,
    venueTravelTime: '22 mins from Manhattan Studio',
    venueRouteSummary: 'Via 5th Ave to Bethesda Terrace, Central Park, NY',
    targetOffsetHours: 0,
    deadlineWarningLevel: 'completed',
    deadlineWarningText: 'Project Completed & Delivered on Time • Ready to Share to Community!',
  },
  '5': {
    projectId: '5',
    venueDistanceKm: 21.0,
    venueTravelTime: '31 mins via Pacific Coast Hwy',
    venueRouteSummary: 'Via PCH to El Matador Beach, Malibu, CA',
    targetOffsetHours: 118,
    deadlineWarningLevel: 'warning',
    deadlineWarningText: 'DEADLINE WARNING: 60s Brand Spot Sound Design due in 4 days.',
  },
  '6': {
    projectId: '6',
    venueDistanceKm: 28.5,
    venueTravelTime: '38 mins drive + water taxi',
    venueRouteSummary: 'Via SS340 Regina to Villa Balbianello, Lake Como',
    targetOffsetHours: 76,
    deadlineWarningLevel: 'critical',
    deadlineWarningText:
      'URGENT DEADLINE WARNING: AI Cull & Guest Gallery Release due in 3 days!',
  },
};

export function getProjectLogisticsMeta(
  projectIdOrTitle: string | number,
  status?: string,
): ProjectLogisticsMeta {
  const key = String(projectIdOrTitle);
  const found =
    PROJECT_LOGISTICS_MAP[key] ||
    (key.toLowerCase().includes('elena')
      ? PROJECT_LOGISTICS_MAP['2']
      : key.toLowerCase().includes('techcorp')
        ? PROJECT_LOGISTICS_MAP['3']
        : key.toLowerCase().includes('johnson')
          ? PROJECT_LOGISTICS_MAP['4']
          : key.toLowerCase().includes('como') || key.toLowerCase().includes('williams')
            ? PROJECT_LOGISTICS_MAP['6']
            : PROJECT_LOGISTICS_MAP['1'])!;

  if (status === 'Completed' || status === 'DELIVERED') {
    return {
      ...found,
      targetOffsetHours: 0,
      deadlineWarningLevel: 'completed',
      deadlineWarningText: 'Completed & Verified Delivery • Ready to Share to Community!',
    };
  }
  return found;
}

export function formatLiveCountdown(offsetHours: number, tickSeconds: number): {
  days: string;
  hours: string;
  mins: string;
  secs: string;
} {
  if (offsetHours <= 0) {
    return { days: '00', hours: '00', mins: '00', secs: '00' };
  }
  const totalSeconds = Math.max(0, offsetHours * 3600 - tickSeconds);
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return {
    days: String(d).padStart(2, '0'),
    hours: String(h).padStart(2, '0'),
    mins: String(m).padStart(2, '0'),
    secs: String(s).padStart(2, '0'),
  };
}

// ── Client AI Briefing Helper ────────────────────────────────────────────────

export function ensureRichClientBriefing(
  data: ClientBriefingDto | null,
  firstName?: string | null,
): ClientBriefingDto {
  if (data && data.action_items.length > 0) return data;
  return {
    headline: `Welcome back${firstName ? `, ${firstName}` : ''}! Your project countdown, venue distance & gallery proofs are live.`,
    summary_text:
      '45 retouched photographs and 1 4K highlight reel are ready for your review. Your shoot venue is 18.4 km away (26 mins drive) with an urgent 2-day proofing deadline warning.',
    active_projects_count: 2,
    photos_ready_count: 45,
    pending_approvals_count: 1,
    upcoming_calls_count: 1,
    next_project_title: 'Smith & Wesson Wedding',
    next_project_venue: 'Val d’Orcia Villa, Tuscany, Italy',
    venue_distance_km: 18.4,
    venue_travel_time: '26 mins drive from Studio Base',
    deadline_iso: new Date(Date.now() + 58 * 3600 * 1000).toISOString(),
    deadline_warning:
      'URGENT DEADLINE WARNING: Final album selection & color-grade approval due in 2 days (10h remaining).',
    action_items: [
      {
        kind: 'revision',
        title: 'Review 45 Released Proof Photographs & Approve Selects',
        subtitle: 'Smith & Wesson Wedding • Venue Distance: 18.4 km • Due in 2 days',
        project_id: '1',
        project_title: 'Smith & Wesson Wedding',
        url: '/client/projects',
        priority: 'urgent',
      },
      {
        kind: 'call',
        title: 'Live Video Sync with Lead Photographer Sarah Cabmora',
        subtitle: 'Final Sunset Timeline & Shot List Walkthrough • Today at 16:30',
        project_id: '1',
        project_title: 'Smith & Wesson Wedding',
        url: '/client/messages',
        priority: 'high',
      },
      {
        kind: 'task',
        title: 'Settle Milestone Invoice INV-2025-042 ($4,250)',
        subtitle: 'Unlocks uncompressed 4K ProRes & RAW master downloads',
        project_id: '1',
        project_title: 'Smith & Wesson Wedding',
        url: '/client/billing',
        priority: 'high',
      },
    ],
  };
}

// ── LinkedIn-Style Creator & Client Community Store ─────────────────────────

const COMMUNITY_STORAGE_KEY = 'cabmora_community_feed_v1';

export const INITIAL_COMMUNITY_FEED: CommunityFeedDto = {
  posts: [
    {
      id: 'post-101',
      project_id: '4',
      project_title: 'Johnson Family Portraits — Central Park Golden Hour',
      project_type: 'Portrait',
      client_name: 'Mark & Sarah Johnson',
      location: 'Central Park, New York, NY',
      venue_distance_km: 12.6,
      completed_date: 'Completed & Delivered • Jan 25, 2026',
      deliverables_summary: '85 Color-Corrected Medium Format Portraits + Archival Linen Album',
      creator_id: 'creator-sarah',
      creator_name: 'Sarah Cabmora',
      creator_handle: '@sarahcabmora_studio',
      creator_specialization: 'Lead Editorial & Destination Wedding Photographer',
      creator_avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
      caption:
        'Thrilled to share our completed delivery for the Johnson Family in Central Park! Shot entirely during a 45-minute golden hour window on 50mm f/1.2 glass with custom Kodak Portra 400 emulation. Open to collaborating with NYC & European filmmakers on upcoming autumn commissions!',
      media_urls: [
        'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=900&h=600&fit=crop',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&h=600&fit=crop',
      ],
      likes_count: 48,
      liked_by_me: false,
      comments: [
        {
          id: 'cm-1',
          author_name: 'Marcus Chang',
          author_role: 'creator',
          author_avatar:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
          text: 'The skin tone roll-off in the highlights is extraordinary! Sent a collaboration request for our Lake Como date.',
          created_at: '1h ago',
        },
        {
          id: 'cm-2',
          author_name: 'Elena Vance',
          author_role: 'client',
          author_avatar:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
          text: 'Love the warmth and editorial framing — we want this exact mood for our Paris SS26 campaign!',
          created_at: '35m ago',
        },
      ],
      created_at: '2 hours ago',
    },
    {
      id: 'post-102',
      project_id: 'comp-202',
      project_title: 'Villa Balbianello Architectural & Bridal Film',
      project_type: 'Wedding',
      client_name: 'Sterling Luxury Events',
      location: 'Lake Como, Italy',
      venue_distance_km: 28.5,
      completed_date: 'Completed & Delivered • Oct 18, 2025',
      deliverables_summary: '12-Min 4K ProRes Master Film + 320 Medium-Format Stills',
      creator_id: 'creator-marcus',
      creator_name: 'Marcus Chang',
      creator_handle: '@marcuschang_cinema',
      creator_specialization: 'Lead 4K Aerial Cinematographer & DaVinci Colorist',
      creator_avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
      caption:
        'Completed our final 4K ProRes delivery from Villa Balbianello! Looking to collaborate with lead still photographers who need dedicated aerial cinema and live color grading on European destination shoots.',
      media_urls: [
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&h=600&fit=crop',
        'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&h=600&fit=crop',
      ],
      likes_count: 74,
      liked_by_me: false,
      comments: [
        {
          id: 'cm-3',
          author_name: 'Clara Mercer',
          author_role: 'client',
          author_avatar:
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
          text: 'The drone perspective over the lake water is breathtaking!',
          created_at: '3h ago',
        },
      ],
      created_at: '5 hours ago',
    },
    {
      id: 'post-103',
      project_id: 'comp-203',
      project_title: 'Maison Lumière Haute Couture Runway Finale',
      project_type: 'Editorial',
      client_name: 'Maison Lumière Paris',
      location: 'Place Vendôme, Paris, France',
      venue_distance_km: 9.4,
      completed_date: 'Completed & Delivered • Oct 10, 2025',
      deliverables_summary: '120 Retouched Press Plates + Backstage Documentary Cut',
      creator_id: 'creator-lucas',
      creator_name: 'Lucas Sterling',
      creator_handle: '@sterling_editorial',
      creator_specialization: 'Haute Couture & Commercial Fashion Photographer',
      creator_avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
      caption:
        'Wrapped and delivered our Paris Fashion Week editorial commission for Maison Lumière. Always excited to team up with lighting directors, retouchers, and brand clients for winter lookbooks!',
      media_urls: [
        'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=900&h=600&fit=crop',
        'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=900&h=600&fit=crop',
      ],
      likes_count: 62,
      liked_by_me: false,
      comments: [],
      created_at: '1 day ago',
    },
  ],
  followers: [
    {
      id: 'fol-1',
      name: 'Elena Vance',
      handle: '@elenavance_paris',
      role: 'client',
      specialization: 'Creative Director • Vance Models Paris',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
      followed_at: '2 hours ago',
      auto_followed_via_like: true,
    },
    {
      id: 'fol-2',
      name: 'Marcus Chang',
      handle: '@marcuschang_cinema',
      role: 'creator',
      specialization: '4K Aerial Cinematographer & Colorist',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
      followed_at: 'Yesterday',
      auto_followed_via_like: true,
    },
    {
      id: 'fol-3',
      name: 'Clara & Julian Mercer',
      handle: '@atelier_mercer',
      role: 'client',
      specialization: 'Luxury Destination Wedding Clients • Lake Como',
      avatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
      followed_at: '2 days ago',
      auto_followed_via_like: true,
    },
    {
      id: 'fol-4',
      name: 'Lucas Sterling',
      handle: '@sterling_editorial',
      role: 'creator',
      specialization: 'Haute Couture & Runway Photographer • Milan',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
      followed_at: '4 days ago',
      auto_followed_via_like: false,
    },
  ],
  followers_count: 4,
  collaborations: [
    {
      id: 'col-1',
      post_id: 'post-101',
      project_title: 'Lake Como Destination Wedding — Hybrid Production',
      requester_name: 'Marcus Chang',
      requester_role: 'creator',
      requester_avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
      target_creator_id: 'creator-sarah',
      target_creator_name: 'Sarah Cabmora',
      proposed_role: 'Co-Lead 4K Drone & Steadicam Operator',
      proposed_date: 'Oct 28, 2025',
      budget_or_split: '$2,200 Day Rate / 35% Cinema Split',
      message:
        'Saw your completed Central Park & Tuscany work in Community! I have Inspire 3 RAW drone clearance in Como and would love to collaborate on your Oct 28 wedding.',
      status: 'pending',
      direction: 'incoming',
      created_at: '42 mins ago',
    },
    {
      id: 'col-2',
      post_id: 'post-101',
      project_title: 'Vogue Italia Bridal Supplement Shoot',
      requester_name: 'Elena Vance (Client)',
      requester_role: 'client',
      requester_avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
      target_creator_id: 'creator-sarah',
      target_creator_name: 'Sarah Cabmora',
      proposed_role: 'Lead Campaign Photographer + Marcus Chang (Video)',
      proposed_date: 'Nov 19, 2025',
      budget_or_split: '$9,500 Full Production Package',
      message:
        'After seeing your completed job in the Community feed, we want to book a joint collaboration with you for our November Milan/Paris supplement.',
      status: 'pending',
      direction: 'incoming',
      created_at: '3 hours ago',
    },
  ],
  auto_followed_creator_ids: [],
};

export function getCommunityState(): CommunityFeedDto {
  if (typeof window === 'undefined') return INITIAL_COMMUNITY_FEED;
  try {
    const raw = window.localStorage.getItem(COMMUNITY_STORAGE_KEY);
    if (!raw) return INITIAL_COMMUNITY_FEED;
    const parsed = JSON.parse(raw) as CommunityFeedDto;
    return parsed.posts && parsed.posts.length > 0 ? parsed : INITIAL_COMMUNITY_FEED;
  } catch {
    return INITIAL_COMMUNITY_FEED;
  }
}

function saveCommunityState(next: CommunityFeedDto): CommunityFeedDto {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(next));
      notifyUpdate();
    } catch {
      // ignore
    }
  }
  return next;
}

export function shareCompletedProjectToCommunity(params: {
  projectId: string;
  projectTitle: string;
  projectType: string;
  clientName: string;
  location: string;
  deliverablesSummary: string;
  caption: string;
  mediaUrls: string[];
  creatorName?: string;
}): CommunityFeedDto {
  const current = getCommunityState();
  const newPost: CommunityPostDto = {
    id: `post-${Date.now()}`,
    project_id: params.projectId,
    project_title: params.projectTitle,
    project_type: params.projectType,
    client_name: params.clientName,
    location: params.location,
    venue_distance_km: getProjectLogisticsMeta(params.projectId, 'Completed').venueDistanceKm,
    completed_date: 'Completed & Verified Delivery • Just now',
    deliverables_summary: params.deliverablesSummary,
    creator_id: 'creator-sarah',
    creator_name: params.creatorName || 'Sarah Cabmora',
    creator_handle: '@sarahcabmora_studio',
    creator_specialization: 'Lead Editorial & Destination Wedding Photographer',
    creator_avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    caption: params.caption,
    media_urls:
      params.mediaUrls.length > 0
        ? params.mediaUrls
        : ['https://images.unsplash.com/photo-1609220136736-443140cffec6?w=900&h=600&fit=crop'],
    likes_count: 1,
    liked_by_me: true,
    comments: [],
    created_at: 'Just now',
  };
  const next: CommunityFeedDto = {
    ...current,
    posts: [newPost, ...current.posts],
  };
  saveCommunityState(next);
  void collaborationApi
    .shareCompletedJobToCommunity({
      project_id: params.projectId,
      project_title: params.projectTitle,
      project_type: params.projectType,
      client_name: params.clientName,
      location: params.location,
      deliverables_summary: params.deliverablesSummary,
      caption: params.caption,
      media_urls: params.mediaUrls,
    })
    .catch(() => undefined);
  return next;
}

/**
 * First like on any creator's post automatically follows that creator.
 */
export function toggleCommunityPostLike(postId: string): {
  state: CommunityFeedDto;
  autoFollowedCreatorName: string | null;
} {
  const current = getCommunityState();
  let autoFollowedCreatorName: string | null = null;
  const autoFollowedSet = new Set(current.auto_followed_creator_ids);

  const posts = current.posts.map((post) => {
    if (post.id !== postId) return post;
    if (!post.liked_by_me) {
      if (!autoFollowedSet.has(post.creator_id)) {
        autoFollowedSet.add(post.creator_id);
        autoFollowedCreatorName = post.creator_name;
      }
      return {
        ...post,
        liked_by_me: true,
        likes_count: post.likes_count + 1,
      };
    }
    return {
      ...post,
      liked_by_me: false,
      likes_count: Math.max(0, post.likes_count - 1),
    };
  });

  const next: CommunityFeedDto = {
    ...current,
    posts,
    auto_followed_creator_ids: Array.from(autoFollowedSet),
  };
  saveCommunityState(next);
  void collaborationApi.toggleLikeCommunityPost(postId).catch(() => undefined);
  return { state: next, autoFollowedCreatorName };
}

export function addCommunityPostComment(params: {
  postId: string;
  text: string;
  authorName: string;
  authorRole: 'creator' | 'client';
}): CommunityFeedDto {
  const current = getCommunityState();
  const posts = current.posts.map((post) => {
    if (post.id !== params.postId) return post;
    return {
      ...post,
      comments: [
        ...post.comments,
        {
          id: `cm-${Date.now()}`,
          author_name: params.authorName,
          author_role: params.authorRole,
          author_avatar:
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
          text: params.text,
          created_at: 'Just now',
        },
      ],
    };
  });
  const next = { ...current, posts };
  saveCommunityState(next);
  void collaborationApi
    .commentOnCommunityPost(params.postId, {
      text: params.text,
      author_role: params.authorRole,
    })
    .catch(() => undefined);
  return next;
}

export function createCommunityCollaborationRequest(params: {
  postId: string;
  projectTitle: string;
  targetCreatorId: string;
  targetCreatorName: string;
  proposedRole: string;
  proposedDate: string;
  budgetOrSplit: string;
  message: string;
  requesterName: string;
  requesterRole: 'creator' | 'client';
}): CommunityFeedDto {
  const current = getCommunityState();
  const newCollab: CommunityCollaborationRequestDto = {
    id: `col-${Date.now()}`,
    post_id: params.postId,
    project_title: params.projectTitle,
    requester_name: params.requesterName,
    requester_role: params.requesterRole,
    requester_avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    target_creator_id: params.targetCreatorId,
    target_creator_name: params.targetCreatorName,
    proposed_role: params.proposedRole,
    proposed_date: params.proposedDate,
    budget_or_split: params.budgetOrSplit,
    message: params.message,
    status: 'pending',
    direction: 'outgoing',
    created_at: 'Just now',
  };
  const next: CommunityFeedDto = {
    ...current,
    collaborations: [newCollab, ...current.collaborations],
  };
  saveCommunityState(next);
  void collaborationApi
    .requestCommunityCollaboration({
      post_id: params.postId,
      project_title: params.projectTitle,
      target_creator_id: params.targetCreatorId,
      target_creator_name: params.targetCreatorName,
      proposed_role: params.proposedRole,
      proposed_date: params.proposedDate,
      budget_or_split: params.budgetOrSplit,
      message: params.message,
      requester_role: params.requesterRole,
    })
    .catch(() => undefined);
  return next;
}

export function respondToCommunityCollaboration(
  collabId: string,
  action: 'accept' | 'decline',
): CommunityFeedDto {
  const current = getCommunityState();
  const collaborations = current.collaborations.map((c) =>
    c.id === collabId
      ? { ...c, status: (action === 'accept' ? 'accepted' : 'declined') as 'accepted' | 'declined' }
      : c,
  );
  const next = { ...current, collaborations };
  saveCommunityState(next);
  void collaborationApi.respondCommunityCollaboration(collabId, action).catch(() => undefined);
  return next;
}

export type {
  CommunityCollaborationRequestDto,
  CommunityFeedDto,
  CommunityFollowerDto,
  CommunityPostDto,
};

// ── Client Bookings Store for Sidebar Bookings Page ──────────────────────────

const BOOKINGS_STORAGE_KEY = 'cabmora_creator_bookings_v1';

export const INITIAL_CLIENT_BOOKINGS: CreatorBookingRequestDto[] = [
  {
    id: 'bk-101',
    creator_slug: 'sarah-cabmora',
    client_name: 'Clara & Julian Mercer',
    client_email: 'clara.mercer@ateliermercer.com',
    client_phone: '+39 031 984 2210',
    company_or_brand: 'Atelier Mercer',
    service_title: 'Signature Hybrid Wedding Cinema & Stills',
    event_type: 'Destination Wedding',
    preferred_date: 'Oct 28, 2025',
    location: 'Villa Balbianello, Lake Como, Italy',
    budget_range: '$12,500',
    project_brief:
      'Full weekend Lake Como coverage including welcome boat transfer, rehearsal dinner, and 4K ProRes drone cinematography.',
    status: 'new',
    created_at: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
  },
  {
    id: 'bk-102',
    creator_slug: 'sarah-cabmora',
    client_name: 'Maison Lumière Paris',
    client_email: 'production@maisonlumiere.fr',
    client_phone: '+33 1 42 68 55 00',
    company_or_brand: 'Maison Lumière',
    service_title: 'Editorial Campaign & Lookbook Production',
    event_type: 'Editorial',
    preferred_date: 'Nov 12, 2025',
    location: 'Place Vendôme, Paris, France',
    budget_range: '$6,800',
    project_brief:
      '40 retouched editorial plates + 16:9 and 9:16 social campaign motion cuts for SS26 Haute Couture.',
    status: 'contacted',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'bk-103',
    creator_slug: 'sarah-cabmora',
    client_name: 'Vanguard Ventures',
    client_email: 'events@vanguardvc.io',
    client_phone: '+44 20 7946 0192',
    company_or_brand: 'Vanguard VC',
    service_title: 'Corporate Keynote & Executive Portraits',
    event_type: 'Corporate Summit',
    preferred_date: 'Dec 03, 2025',
    location: 'Shoreditch House, London, UK',
    budget_range: '$5,400',
    project_brief:
      'Multi-cam 4K keynote capture, founder portrait studio booth, and same-day press highlight reel.',
    status: 'new',
    created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    id: 'bk-104',
    creator_slug: 'sarah-cabmora',
    client_name: 'Sophia & Henri Laurent',
    client_email: 'sophia.laurent@chateaulaurent.fr',
    client_phone: '+33 4 93 76 12 44',
    company_or_brand: 'Château Saint-Jean',
    service_title: '3-Day Côte d’Azur Celebration',
    event_type: 'Destination Wedding',
    preferred_date: 'May 16, 2026',
    location: 'Saint-Jean-Cap-Ferrat, France',
    budget_range: '$16,000',
    project_brief:
      'Three days of medium-format film + digital hybrid coverage along the French Riviera.',
    status: 'booked',
    created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
  },
];

export function getClientBookingsList(): CreatorBookingRequestDto[] {
  if (typeof window === 'undefined') return INITIAL_CLIENT_BOOKINGS;
  try {
    const raw = window.localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (!raw) return INITIAL_CLIENT_BOOKINGS;
    const parsed = JSON.parse(raw) as CreatorBookingRequestDto[];
    return parsed.length > 0 ? parsed : INITIAL_CLIENT_BOOKINGS;
  } catch {
    return INITIAL_CLIENT_BOOKINGS;
  }
}

export function updateClientBookingItemStatus(
  bookingId: string,
  status: CreatorBookingRequestDto['status'],
): CreatorBookingRequestDto[] {
  const current = getClientBookingsList();
  const next = current.map((b) => (b.id === bookingId ? { ...b, status } : b));
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(next));
      notifyUpdate();
    } catch {
      // ignore
    }
  }
  void creatorLandingApi.updateMyCreatorBookingStatus(bookingId, status).catch(() => undefined);
  return next;
}
