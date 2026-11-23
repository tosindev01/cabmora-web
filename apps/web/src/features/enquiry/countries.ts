/**
 * Dialling codes for the phone fields.
 *
 * A number with no country code cannot be rung from anywhere else, and this
 * studio says on its own About page that it works worldwide — so the code is
 * chosen rather than assumed. The browser's `tel` input defaults to whatever
 * the device thinks it is, which for most people testing this was the US.
 *
 * Not every country on earth: a select of 250 rows is worse to use than one
 * of sixty, and these cover where Cabmora's clients actually are. Add a row
 * when somebody needs one — that is the whole maintenance cost.
 */

export interface DiallingCode {
  /** ISO 3166-1 alpha-2, used as the option's stable value. */
  iso: string;
  name: string;
  /** With the leading plus, because that is what gets stored and dialled. */
  dial: string;
}

/** Where the picker starts. Cabmora is a Manchester studio. */
export const DEFAULT_DIAL_ISO = 'GB';

export const DIALLING_CODES: DiallingCode[] = [
  { iso: 'GB', name: 'United Kingdom', dial: '+44' },
  { iso: 'IE', name: 'Ireland', dial: '+353' },
  { iso: 'US', name: 'United States', dial: '+1' },
  { iso: 'CA', name: 'Canada', dial: '+1' },
  { iso: 'NG', name: 'Nigeria', dial: '+234' },
  { iso: 'GH', name: 'Ghana', dial: '+233' },
  { iso: 'KE', name: 'Kenya', dial: '+254' },
  { iso: 'ZA', name: 'South Africa', dial: '+27' },
  { iso: 'AE', name: 'United Arab Emirates', dial: '+971' },
  { iso: 'IN', name: 'India', dial: '+91' },
  { iso: 'AU', name: 'Australia', dial: '+61' },
  { iso: 'NZ', name: 'New Zealand', dial: '+64' },
  { iso: 'FR', name: 'France', dial: '+33' },
  { iso: 'DE', name: 'Germany', dial: '+49' },
  { iso: 'ES', name: 'Spain', dial: '+34' },
  { iso: 'IT', name: 'Italy', dial: '+39' },
  { iso: 'PT', name: 'Portugal', dial: '+351' },
  { iso: 'NL', name: 'Netherlands', dial: '+31' },
  { iso: 'BE', name: 'Belgium', dial: '+32' },
  { iso: 'CH', name: 'Switzerland', dial: '+41' },
  { iso: 'AT', name: 'Austria', dial: '+43' },
  { iso: 'SE', name: 'Sweden', dial: '+46' },
  { iso: 'NO', name: 'Norway', dial: '+47' },
  { iso: 'DK', name: 'Denmark', dial: '+45' },
  { iso: 'FI', name: 'Finland', dial: '+358' },
  { iso: 'IS', name: 'Iceland', dial: '+354' },
  { iso: 'PL', name: 'Poland', dial: '+48' },
  { iso: 'CZ', name: 'Czechia', dial: '+420' },
  { iso: 'GR', name: 'Greece', dial: '+30' },
  { iso: 'RO', name: 'Romania', dial: '+40' },
  { iso: 'HU', name: 'Hungary', dial: '+36' },
  { iso: 'TR', name: 'Turkey', dial: '+90' },
  { iso: 'RU', name: 'Russia', dial: '+7' },
  { iso: 'UA', name: 'Ukraine', dial: '+380' },
  { iso: 'IL', name: 'Israel', dial: '+972' },
  { iso: 'SA', name: 'Saudi Arabia', dial: '+966' },
  { iso: 'QA', name: 'Qatar', dial: '+974' },
  { iso: 'KW', name: 'Kuwait', dial: '+965' },
  { iso: 'EG', name: 'Egypt', dial: '+20' },
  { iso: 'MA', name: 'Morocco', dial: '+212' },
  { iso: 'TN', name: 'Tunisia', dial: '+216' },
  { iso: 'TZ', name: 'Tanzania', dial: '+255' },
  { iso: 'UG', name: 'Uganda', dial: '+256' },
  { iso: 'RW', name: 'Rwanda', dial: '+250' },
  { iso: 'ZM', name: 'Zambia', dial: '+260' },
  { iso: 'ZW', name: 'Zimbabwe', dial: '+263' },
  { iso: 'CM', name: 'Cameroon', dial: '+237' },
  { iso: 'CI', name: "Côte d'Ivoire", dial: '+225' },
  { iso: 'SN', name: 'Senegal', dial: '+221' },
  { iso: 'CN', name: 'China', dial: '+86' },
  { iso: 'HK', name: 'Hong Kong', dial: '+852' },
  { iso: 'JP', name: 'Japan', dial: '+81' },
  { iso: 'KR', name: 'South Korea', dial: '+82' },
  { iso: 'SG', name: 'Singapore', dial: '+65' },
  { iso: 'MY', name: 'Malaysia', dial: '+60' },
  { iso: 'TH', name: 'Thailand', dial: '+66' },
  { iso: 'PH', name: 'Philippines', dial: '+63' },
  { iso: 'ID', name: 'Indonesia', dial: '+62' },
  { iso: 'PK', name: 'Pakistan', dial: '+92' },
  { iso: 'BD', name: 'Bangladesh', dial: '+880' },
  { iso: 'LK', name: 'Sri Lanka', dial: '+94' },
  { iso: 'BR', name: 'Brazil', dial: '+55' },
  { iso: 'AR', name: 'Argentina', dial: '+54' },
  { iso: 'MX', name: 'Mexico', dial: '+52' },
  { iso: 'CL', name: 'Chile', dial: '+56' },
  { iso: 'CO', name: 'Colombia', dial: '+57' },
  { iso: 'JM', name: 'Jamaica', dial: '+1876' },
  { iso: 'TT', name: 'Trinidad & Tobago', dial: '+1868' },
];

/**
 * Join a code and a number into what gets stored.
 *
 * Empty when there is no number: a lone "+44" is not a phone number, and
 * storing one would put a dead dialling code on the lead.
 */
export function composePhone(dialIso: string, number: string): string | undefined {
  const digits = number.trim();
  if (!digits) return undefined;
  const code = DIALLING_CODES.find((c) => c.iso === dialIso)?.dial ?? '';
  // Already international — believe what they typed rather than prefixing
  // a second code onto it.
  if (digits.startsWith('+')) return digits;
  // A national trunk zero is dropped: "+44 07700 900000" reaches nobody.
  return `${code} ${digits.replace(/^0+/, '')}`.trim();
}
