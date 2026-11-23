import type { LucideIcon } from 'lucide-react';
import { History, Images, MessageSquare, Play, Image as ImageIcon } from 'lucide-react';

import { isVideo } from '@/shared/media';

/**
 * Apple Photos-style filter chips over a client's gallery.
 *
 * **Derived, never filed.** Every chip is computed from the files themselves —
 * the same way Apple's Media Types row works — so nobody has to tag anything
 * and a chip can never go stale or sit empty because somebody skipped the
 * filing on a busy week.
 *
 * That also means there is deliberately no "Ceremony" or "Reception" here. An
 * asset carries `content_type`, `released_at`, `supersedes` and `created_at`
 * and nothing else; a chip named after a moment needs somebody to assign every
 * photograph to it, which is a different feature with a table behind it.
 *
 * That feature now exists — `GalleryFolders`, rendered directly above this
 * row, with `folders` on the API. The two are separate on purpose and should
 * stay separate: a folder is filed by a person and a chip is read off the
 * file, so folding either into the other would mean somebody tagging films as
 * films, or the gallery guessing which part of a wedding a photograph is
 * from.
 */

/** The shape a chip needs. Structural, so the gallery's row type can grow
 *  without this file caring. */
export interface Categorisable {
  content_type?: string | null;
  /** Above zero means this photograph was changed after the client asked. */
  corrections: number;
  /** How many remarks sit against it. */
  comments: number;
}

export type GalleryCategory = 'all' | 'photos' | 'videos' | 'updated' | 'commented';

interface Chip {
  id: GalleryCategory;
  label: string;
  icon: LucideIcon;
  /** Null for "all" — it is never filtered and never hidden. */
  match: ((item: Categorisable) => boolean) | null;
}

const CHIPS: Chip[] = [
  { id: 'all', label: 'All', icon: Images, match: null },
  { id: 'photos', label: 'Photos', icon: ImageIcon, match: (item) => !isVideo(item) },
  { id: 'videos', label: 'Films', icon: Play, match: isVideo },
  // The two that answer "what has moved since I last looked", which is the
  // real question a client opens their gallery with on the second visit.
  { id: 'updated', label: 'Updated', icon: History, match: (item) => item.corrections > 0 },
  {
    id: 'commented',
    label: 'Commented',
    icon: MessageSquare,
    match: (item) => item.comments > 0,
  },
];

/** The filter for a category, for the gallery to apply. */
export function matcherFor(category: GalleryCategory) {
  return CHIPS.find((chip) => chip.id === category)?.match ?? null;
}

export function GalleryChips<T extends Categorisable>({
  items,
  value,
  onChange,
}: {
  items: T[];
  value: GalleryCategory;
  onChange: (category: GalleryCategory) => void;
}) {
  const counts = CHIPS.map((chip) => ({
    ...chip,
    count: chip.match ? items.filter(chip.match).length : items.length,
  }));

  /* A chip earns its place only if it divides the set.
     
     Hidden at zero, the same choice Apple makes: a gallery of forty
     photographs and no film should not offer a "Films (0)" button, because a
     control that can only disappoint is worse than no control.
     
     Hidden at *everything* too, which matters more here than it does for Apple.
     A wedding gallery is often entirely photographs, and "All 40 | Photos 40"
     is two buttons that do the same thing — the second filters nothing and
     only makes the reader wonder what the difference is. */
  const visible = counts.filter(
    (chip) => chip.id === 'all' || (chip.count > 0 && chip.count < items.length),
  );

  // One real choice is no choice. Nothing to filter, nothing to show.
  if (visible.length < 2) return null;

  return (
    <div
      role="group"
      aria-label="Filter photographs"
      /* Scrolls sideways on a phone rather than wrapping to three rows and
         pushing the photographs below the fold. `no-scrollbar` because a
         visible bar under four chips reads as a broken layout. */
      className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar -mx-1 px-1"
    >
      {visible.map((chip) => {
        const Icon = chip.icon;
        const selected = chip.id === value;
        return (
          <button
            key={chip.id}
            type="button"
            onClick={() => onChange(chip.id)}
            /* `aria-pressed`, not just a colour. These are toggles, and a
               screen reader given four identically-named buttons has no way to
               say which one is on. */
            aria-pressed={selected}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
              selected
                ? 'bg-ink text-white'
                : 'bg-white border border-ink/10 text-ink/70 hover:bg-canvas'
            }`}
          >
            <Icon size={14} />
            {chip.label}
            <span className={selected ? 'text-white/60' : 'text-ink/40'}>{chip.count}</span>
          </button>
        );
      })}
    </div>
  );
}
