import { useId } from 'react';

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'tel' | 'password';
  autoComplete?: string;
  hint?: string;
}

/**
 * One labelled input.
 *
 * `useId` rather than a hand-passed id: two of these on one page with the same
 * label would otherwise share an id, and clicking the second label would focus
 * the first input.
 */
export function Field({ label, value, onChange, type = 'text', autoComplete, hint }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[10px] tracking-[0.2em] uppercase text-ink/45 font-medium mb-2"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-describedby={hint ? hintId : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-white border border-ink/12 px-4 py-3 text-[14px] text-ink outline-none focus:border-gold transition-colors"
      />
      {hint && (
        <p id={hintId} className="text-[12px] text-ink/40 mt-1.5">
          {hint}
        </p>
      )}
    </div>
  );
}

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  hint?: string;
}

/**
 * A detail the reader needs to see but may not change.
 *
 * Not a disabled `<input>`: a disabled control is skipped by keyboard
 * navigation and, in several screen readers, not announced at all — so the one
 * thing it is there to communicate is the thing that goes missing. Plain text
 * is read like any other text.
 */
export function ReadOnlyField({ label, value, hint }: ReadOnlyFieldProps) {
  return (
    <div>
      <span className="block text-[10px] tracking-[0.2em] uppercase text-ink/45 font-medium mb-2">
        {label}
      </span>
      <p className="w-full bg-ink/4 border border-ink/8 px-4 py-3 text-[14px] text-ink/70 break-all">
        {value}
      </p>
      {hint && <p className="text-[12px] text-ink/40 mt-1.5">{hint}</p>}
    </div>
  );
}
