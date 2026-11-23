/**
 * Fixtures and types for the Galleries screen.
 *
 * Stand-ins until the API is wired up (WP5). They live here rather than beside
 * the JSX so that swap touches one module instead of the component — and so a
 * test can import them without a DOM.
 */
export interface ClientAccess {
  id: string;
  clientName: string;
  clientEmail: string;
  accessLevel: 'view' | 'download' | 'full';
  grantedAt: string;
  pinCode?: string;
  status: 'active' | 'revoked';
}

export interface MediaAsset {
  id: string;
  name: string;
  album: string;
  type: 'photo' | 'video' | 'raw';
  size: string;
  dimensions: string;
  exif: {
    camera: string;
    lens: string;
    iso: string;
    aperture: string;
    shutter: string;
  };
  date: string;
  url: string;
  deleted?: boolean;
  clientAccess?: ClientAccess[];
  isLocked?: boolean;
  accessPin?: string;
}

export const INITIAL_ALBUMS = [
  {
    id: 'a1',
    name: 'Smith & Wesson Wedding - RAWs',
    type: 'Wedding',
    itemCount: 12,
    cover: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop',
  },
  {
    id: 'a2',
    name: 'Smith & Wesson Wedding - Highlight Film',
    type: 'Wedding',
    itemCount: 4,
    cover: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&h=600&fit=crop',
  },
  {
    id: 'a3',
    name: 'Elena Editorial - High Res Edits',
    type: 'Editorial',
    itemCount: 8,
    cover: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=600&fit=crop',
  },
  {
    id: 'a4',
    name: 'TechCorp Corporate Event',
    type: 'Corporate',
    itemCount: 15,
    cover: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop',
  },
  {
    id: 'a5',
    name: 'Johnson Family Portraits',
    type: 'Portrait',
    itemCount: 6,
    cover: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800&h=600&fit=crop',
  },
];

export const INITIAL_ASSETS: MediaAsset[] = [
  {
    id: 'm1',
    name: 'Tuscany_Ceremony_RAW_0042.CR3',
    album: 'Smith & Wesson Wedding - RAWs',
    type: 'raw',
    size: '48.5 MB',
    dimensions: '8192 x 5464 px',
    exif: {
      camera: 'Canon EOS R5',
      lens: 'RF 85mm f/1.2L',
      iso: 'ISO 100',
      aperture: 'f/1.4',
      shutter: '1/2000s',
    },
    date: 'Oct 12, 2025',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=800&fit=crop',
    clientAccess: [
      {
        id: 'ca1',
        clientName: 'Robert Smith',
        clientEmail: 'robert@smithwesson.com',
        accessLevel: 'full',
        grantedAt: 'Oct 15, 2025',
        status: 'active',
      },
    ],
  },
  {
    id: 'm2',
    name: 'Tuscany_Bridal_Prep_4K_ProRes.mov',
    album: 'Smith & Wesson Wedding - Highlight Film',
    type: 'video',
    size: '1.42 GB',
    dimensions: '3840 x 2160 (4K UHD)',
    exif: {
      camera: 'Sony FX6',
      lens: 'FE 24-70mm f/2.8 GM II',
      iso: 'ISO 800',
      aperture: 'f/2.8',
      shutter: '1/50s',
    },
    date: 'Oct 12, 2025',
    url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1200&h=800&fit=crop',
    clientAccess: [
      {
        id: 'ca2',
        clientName: 'Robert Smith',
        clientEmail: 'robert@smithwesson.com',
        accessLevel: 'download',
        grantedAt: 'Oct 15, 2025',
        status: 'active',
      },
    ],
  },
  {
    id: 'm3',
    name: 'Paris_Editorial_Cover_012.jpg',
    album: 'Elena Editorial - High Res Edits',
    type: 'photo',
    size: '18.2 MB',
    dimensions: '6000 x 4000 px',
    exif: {
      camera: 'Hasselblad X2D 100C',
      lens: 'XCD 90mm f/2.5',
      iso: 'ISO 64',
      aperture: 'f/4.0',
      shutter: '1/500s',
    },
    date: 'Nov 04, 2025',
    url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&h=800&fit=crop',
    clientAccess: [
      {
        id: 'ca3',
        clientName: 'Elena Rostova',
        clientEmail: 'elena@editorial.fr',
        accessLevel: 'view',
        grantedAt: 'Nov 05, 2025',
        status: 'active',
      },
    ],
  },
  {
    id: 'm4',
    name: 'Tuscany_Sunset_Couple_0088.CR3',
    album: 'Smith & Wesson Wedding - RAWs',
    type: 'raw',
    size: '46.1 MB',
    dimensions: '8192 x 5464 px',
    exif: {
      camera: 'Canon EOS R5',
      lens: 'RF 50mm f/1.2L',
      iso: 'ISO 200',
      aperture: 'f/1.8',
      shutter: '1/1000s',
    },
    date: 'Oct 12, 2025',
    url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&h=800&fit=crop',
    clientAccess: [
      {
        id: 'ca4',
        clientName: 'Robert Smith',
        clientEmail: 'robert@smithwesson.com',
        accessLevel: 'full',
        grantedAt: 'Oct 15, 2025',
        status: 'active',
      },
    ],
  },
  {
    id: 'm5',
    name: 'TechCorp_Keynote_Recap_Master.mp4',
    album: 'TechCorp Corporate Event',
    type: 'video',
    size: '820 MB',
    dimensions: '3840 x 2160 (4K UHD)',
    exif: {
      camera: 'Sony A7S III',
      lens: 'FE 16-35mm f/2.8 GM',
      iso: 'ISO 1600',
      aperture: 'f/2.8',
      shutter: '1/100s',
    },
    date: 'Dec 15, 2025',
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&h=800&fit=crop',
    clientAccess: [],
    isLocked: true,
  },
  {
    id: 'm6',
    name: 'Johnson_Family_CentralPark_005.jpg',
    album: 'Johnson Family Portraits',
    type: 'photo',
    size: '14.8 MB',
    dimensions: '5472 x 3648 px',
    exif: {
      camera: 'Canon EOS R6',
      lens: 'RF 70-200mm f/2.8L',
      iso: 'ISO 400',
      aperture: 'f/2.8',
      shutter: '1/800s',
    },
    date: 'Jan 10, 2026',
    url: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=1200&h=800&fit=crop',
    clientAccess: [
      {
        id: 'ca5',
        clientName: 'Johnson Family',
        clientEmail: 'johnson@family.com',
        accessLevel: 'download',
        grantedAt: 'Jan 11, 2026',
        status: 'active',
      },
    ],
  },
];
