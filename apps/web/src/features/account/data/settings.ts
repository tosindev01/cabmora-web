/**
 * Fixtures and types for the Settings screen.
 *
 * Stand-ins until the API is wired up (WP5). They live here rather than beside
 * the JSX so that swap touches one module instead of the component — and so a
 * test can import them without a DOM.
 */
import LogoWhite from '@/assets/cabmora_white_logo.svg';

export type WatermarkPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'repeat-tile';

export interface WatermarkConfig {
  type: 'image' | 'text';
  imageUrl: string;
  imageName: string;
  text: string;
  fontFamily: string;
  textColor: string;
  opacity: number; // 0 - 100
  scale: number; // 5 - 60
  position: WatermarkPosition;
  rotation: number; // -90 to 90
  blendMode: 'normal' | 'overlay' | 'screen' | 'multiply' | 'soft-light';
  margin: number; // 2 - 12 (%)
  applyToProofGalleries: boolean;
  applyToWebExports: boolean;
  removeOnPaidDownload: boolean;
}

export const SAMPLE_MEDIA = [
  {
    id: 's1',
    name: 'Wedding Portrait (Light)',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=800&fit=crop',
  },
  {
    id: 's2',
    name: 'Moody Editorial (Dark)',
    url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&h=800&fit=crop',
  },
  {
    id: 's3',
    name: 'Commercial Architecture',
    url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1200&h=800&fit=crop',
  },
  {
    id: 's4',
    name: 'Golden Hour Sunset',
    url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&h=800&fit=crop',
  },
];

export const PRESET_LOGOS = [
  { id: 'pl1', name: 'Cabmora Studio Crest', url: LogoWhite },
  {
    id: 'pl2',
    name: 'Minimal Copyright Mark',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=300&fit=crop',
  },
  {
    id: 'pl3',
    name: 'Signature Script',
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&h=300&fit=crop',
  },
];
