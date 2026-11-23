import type { NotificationKind, Preferences } from '@cabmora/api-client';

/**
 * Plain English for each switch, and what it actually controls.
 *
 * Every description says **email**, because that is all these gate. They are
 * applied at the send boundary by `PreferenceAwareEmailSender`; the bell in the
 * header is a separate channel and shows everything either way. Saying "when an
 * invoice is raised" would promise silence this switch cannot deliver.
 */
const NOTIFICATIONS: Record<NotificationKind, { label: string; description: string }> = {
  invoices: {
    label: 'Invoices',
    description: 'Email when an invoice is raised or updated.',
  },
  bookings: {
    label: 'Bookings',
    description: 'Email for consultation confirmations and reminders.',
  },
  messages: {
    label: 'Messages',
    description: 'Email for replies on your projects, and amendments marked done.',
  },
};

const CURRENCY_NAMES: Record<string, string> = {
  GBP: 'British pound',
  USD: 'US dollar',
  EUR: 'Euro',
  NGN: 'Nigerian naira',
  CAD: 'Canadian dollar',
  AUD: 'Australian dollar',
};

interface SectionProps {
  preferences: Preferences;
  saving: boolean;
  onSave: (changes: Partial<Preferences>) => void;
}

function labelClass() {
  return 'block text-[10px] tracking-[0.2em] uppercase text-ink/45 font-medium mb-2';
}

function selectClass() {
  return 'w-full bg-white border border-ink/12 px-4 py-3 text-[14px] text-ink outline-none focus:border-gold transition-colors';
}

/** Preferred currency. */
export function CurrencySection({ preferences, saving, onSave }: SectionProps) {
  return (
    <div className="max-w-[420px]">
      <label htmlFor="pref-currency" className={labelClass()}>
        Currency
      </label>
      <select
        id="pref-currency"
        value={preferences.currency}
        disabled={saving}
        onChange={(event) => onSave({ currency: event.target.value })}
        className={selectClass()}
      >
        {preferences.available_currencies.map((code) => (
          <option key={code} value={code}>
            {code} — {CURRENCY_NAMES[code] ?? code}
          </option>
        ))}
      </select>
      {/* Said plainly, because the opposite is what people assume. */}
      <p className="text-[12px] text-ink/45 mt-2 leading-[1.6]">
        Used for invoices raised from now on. An invoice keeps the currency it was raised in.
        changing this does not re-price anything you already have.
      </p>
    </div>
  );
}

/** Language, date format and time zone. */
export function LocaleSection({ preferences, saving, onSave }: SectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-[560px]">
      <div>
        <label htmlFor="pref-language" className={labelClass()}>
          Language
        </label>
        <select
          id="pref-language"
          value={preferences.language}
          disabled={saving || preferences.available_languages.length < 2}
          onChange={(event) => onSave({ language: event.target.value })}
          className={selectClass()}
        >
          {preferences.available_languages.map((code) => (
            <option key={code} value={code}>
              {code === 'en-GB' ? 'English (UK)' : code}
            </option>
          ))}
        </select>
        {preferences.available_languages.length < 2 && (
          <p className="text-[12px] text-ink/45 mt-2">The only one we publish in so far.</p>
        )}
      </div>

      <div>
        <label htmlFor="pref-date" className={labelClass()}>
          Date format
        </label>
        <select
          id="pref-date"
          value={preferences.date_format}
          disabled={saving}
          onChange={(event) => onSave({ date_format: event.target.value })}
          className={selectClass()}
        >
          {preferences.available_date_formats.map((format) => (
            <option key={format} value={format}>
              {format}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="pref-tz" className={labelClass()}>
          Time zone
        </label>
        {/* The browser's own list rather than a hardcoded one: it is the
            complete IANA set, it is already on the device, and it stays
            current without anybody maintaining it here. */}
        <select
          id="pref-tz"
          value={preferences.timezone}
          disabled={saving}
          onChange={(event) => onSave({ timezone: event.target.value })}
          className={selectClass()}
        >
          {zones(preferences.timezone).map((zone) => (
            <option key={zone} value={zone}>
              {zone.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/**
 * Every IANA zone the browser knows, with the stored one guaranteed present.
 *
 * `supportedValuesOf` is missing in older Safari, so a short fallback keeps the
 * control usable rather than empty. The current value is always included —
 * otherwise a zone this browser does not list would silently re-select itself
 * as something else the moment the page rendered.
 */
function zones(current: string): string[] {
  // Typed by hand: `supportedValuesOf` is ES2022 and this project's lib target
  // does not declare it, while the runtime has had it for years. Narrowing the
  // cast to the one function keeps the rest of `Intl` properly typed.
  const intl = Intl as typeof Intl & {
    supportedValuesOf?: (key: 'timeZone') => string[];
  };
  const supported =
    typeof intl.supportedValuesOf === 'function'
      ? intl.supportedValuesOf('timeZone')
      : ['Europe/London', 'Africa/Lagos', 'America/New_York', 'Europe/Paris', 'UTC'];
  return supported.includes(current) ? supported : [current, ...supported];
}

/** Which emails to receive. */
export function NotificationsSection({ preferences, saving, onSave }: SectionProps) {
  const toggle = (kind: NotificationKind) => {
    const muted = new Set(preferences.muted);
    if (muted.has(kind)) muted.delete(kind);
    else muted.add(kind);
    onSave({ muted: [...muted] });
  };

  return (
    <div className="space-y-4 max-w-[560px]">
      {preferences.mutable_notifications.map((kind) => {
        const on = !preferences.muted.includes(kind);
        const copy = NOTIFICATIONS[kind];
        return (
          <label
            key={kind}
            className="flex items-start gap-4 cursor-pointer border border-ink/8 bg-white p-4"
          >
            <input
              type="checkbox"
              checked={on}
              disabled={saving}
              onChange={() => toggle(kind)}
              className="mt-1 w-4 h-4 accent-gold"
            />
            <span>
              <span className="block text-[14px] text-ink">{copy.label}</span>
              <span className="block text-[12.5px] text-ink/50 mt-0.5">{copy.description}</span>
            </span>
          </label>
        );
      })}

      {/* Two honest caveats: what this list cannot turn off, and what it does
          not reach at all. */}
      <p className="text-[12px] text-ink/45 leading-[1.6] pt-2">
        These control email only. The bell in the header still shows everything that happens on your
        projects, so turning an email off means a quieter inbox rather than missing something.
      </p>
      <p className="text-[12px] text-ink/45 leading-[1.6]">
        Sign-in links, password resets and “your photographs are ready” are always sent. They are
        not on this list because turning them off would lock you out or leave you waiting for work
        that was already finished.
      </p>
    </div>
  );
}
