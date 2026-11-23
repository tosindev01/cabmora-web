/**
 * Defaults for the platform settings screen.
 *
 * What stood here before was seed data for the whole console — users,
 * projects, enquiries, reviews and transactions, invented while the API was
 * being built. Those screens all read the API now, so the fixtures rendered
 * nowhere and shipped to production anyway.
 *
 * These remaining values are defaults, not facts. Nothing reads them back
 * from the server, so the settings screen shows what is written here rather
 * than how the platform is actually configured.
 */
import type { PlatformSettings } from './types';

export const initialSettings: PlatformSettings = {
  brandName: 'Cabmora Media & Creator',
  accentColor: '#C9A86A',
  logoUrl: '/src/assets/cabmora_white_logo.svg',
  stripeEnabled: true,
  stripePublicKey: 'pk_live_51CabmoraMediaSecuredKey90123',
  paypalEnabled: true,
  currency: 'USD ($)',
  defaultStorageLimitGB: 500,
  storageProvider: 'Google Cloud Storage / S3 Vault',
  smtpHost: 'smtp.cabmora.com',
  senderEmail: 'admin-notifications@cabmora.studio',
};
