/**
 * The parts of the shoot, as a client browses them.
 *
 * The other half of `GalleryChips`. Those chips are *derived* — photograph or
 * film, changed since you asked, has remarks on it — computed from the files
 * so nobody files anything and no chip goes stale. These are *filed*: someone
 * decided this frame belongs to the ceremony, and no amount of reading the
 * file would ever reveal that.
 *
 * The two compose rather than compete. A folder says which part of the day, a
 * chip says what kind of thing it is, and "the films from the reception" needs
 * both.
 *
 * Unlike a chip, a folder is not hidden when it holds everything. "All 40 |
 * Photos 40" is two buttons doing one job, but "All 40 | Ceremony 40" tells
 * the reader what they are looking at — the name carries something the count
 * cannot. There is deliberately no "Unfiled" here either: that is the studio's
 * filing state, not a part of anybody's wedding.
 */
export interface GalleryFolder {
  id: string;
  name: string;
  asset_count: number;
}

export function GalleryFolders({
  folders,
  value,
  onChange,
  total,
}: {
  folders: GalleryFolder[];
  /** A folder id, or `'all'`. */
  value: string;
  onChange: (folder: string) => void;
  total: number;
}) {
  // Nothing filed, nothing to offer. The client should never learn that
  // folders exist as a feature when their gallery has none.
  if (folders.length === 0) return null;

  const options = [{ id: 'all', name: 'All', asset_count: total }, ...folders];

  return (
    <div
      role="group"
      aria-label="Filter by part of the day"
      /* Scrolls sideways on a phone rather than wrapping, same as the chips
         below it — a wedding can run to six or seven parts. */
      className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar -mx-1 px-1"
    >
      {options.map((folder) => {
        const selected = folder.id === value;
        return (
          <button
            key={folder.id}
            type="button"
            onClick={() => onChange(folder.id)}
            aria-pressed={selected}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
              selected
                ? 'bg-ink text-white'
                : 'bg-white border border-ink/10 text-ink/70 hover:bg-canvas'
            }`}
          >
            {folder.name}
            <span className={selected ? 'text-white/55' : 'text-ink/40'}>{folder.asset_count}</span>
          </button>
        );
      })}
    </div>
  );
}
