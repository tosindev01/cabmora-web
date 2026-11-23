import { Select } from '@cabmora/ui';

import { DIALLING_CODES } from '@/features/enquiry/countries';

interface Props {
  id: string;
  label: string;
  /** Rendered in lighter type beside the label. */
  hint?: string;
  dialIso: string;
  onDialChange: (iso: string) => void;
  number: string;
  onNumberChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
}

/**
 * A phone number with the country it belongs to.
 *
 * Two controls, one field: the code is a choice and the number is typed, and
 * asking somebody to remember "+44" is how a form ends up full of numbers
 * nobody can ring. The select carries an accessible label of its own, because
 * "United Kingdom +44" next to a box is obvious to look at and silent to a
 * screen reader.
 */
export function PhoneField({
  id,
  label,
  hint,
  dialIso,
  onDialChange,
  number,
  onNumberChange,
  placeholder,
  autoComplete,
}: Props) {
  const dial = DIALLING_CODES.find((c) => c.iso === dialIso)?.dial ?? '';

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[11px] tracking-[0.15em] uppercase text-ink/60 font-medium mb-3"
      >
        {label}
        {hint && <span className="text-ink/35 normal-case tracking-normal"> {hint}</span>}
      </label>

      <div className="flex">
        <Select
          value={dialIso}
          onChange={(e) => onDialChange(e.target.value)}
          aria-label={`Country code for ${label.toLowerCase()}`}
          className="bg-canvas border border-ink/10 border-r-0 pl-4 pr-9 py-3 text-[14px] outline-none focus:border-gold transition-colors duration-300 shrink-0 w-[124px]"
        >
          {DIALLING_CODES.map((country) => (
            <option key={country.iso} value={country.iso}>
              {country.iso} {country.dial}
            </option>
          ))}
        </Select>

        <input
          type="tel"
          id={id}
          value={number}
          onChange={(e) => onNumberChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="w-full min-w-0 bg-canvas border border-ink/10 px-4 py-3 text-[14px] outline-none focus:border-gold transition-colors duration-300"
        />
      </div>

      <p className="text-[11px] text-ink/35 mt-2">Dialled as {dial}</p>
    </div>
  );
}
