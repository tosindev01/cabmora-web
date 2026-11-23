/**
 * The journal — Cabmora's own posts, in Cabmora's own words.
 *
 * In `shared/` rather than in a feature because two features read it: the
 * homepage's "Latest Stories" strip lives in `features/marketing`, and the
 * post page lives in `features/content`, and a feature may not import another
 * feature. The rule in CLAUDE.md is the short version — if two features both
 * want it, it is not a feature.
 *
 * `body` is paragraphs rather than an HTML string. The post page renders
 * trusted copy either way, but a plain array cannot carry markup, so nothing
 * here can ever reach `dangerouslySetInnerHTML` with something a future editor
 * pasted in.
 *
 * Still fixtures, like everything else outside `auth` and `enquiry`, until
 * WP5 moves content behind the API.
 */
import data from './posts.json';

export interface JournalPost {
  /** The `/blog/:id` segment. */
  id: string;
  /** The small gold eyebrow above the title, and the category filter value. */
  tag: string;
  /**
   * ISO, not a display string. Two screens print the date and one of them
   * sorts by it, and sorting '05 Jun 2026' against '08 Jul 2026' as text puts
   * June after July. `formatJournalDate` does the printing.
   */
  published: string;
  title: string;
  img: string;
  /** Crop centre, when the site-wide upward bias is wrong for this photo.
   *  See shared/media/focal.ts. */
  focal?: string;
  alt: string;
  body: string[];
}

/**
 * The posts themselves live in `posts.json`.
 *
 * Data rather than a TypeScript literal because two things read them: this
 * module, and the build script that writes `sitemap.xml` and the per-route
 * HTML. A build script cannot import a `.ts` file without a transpile step, so
 * keeping the posts in TypeScript meant the sitemap either duplicated the
 * slugs or silently missed a post the moment one was added. One file, two
 * readers, nothing to keep in step.
 *
 * Listed in the order Ayo supplied them, which is oldest first and therefore
 * no longer the newest-first order the strip used to be in. Reorder in the
 * JSON if the homepage should lead with the most recent.
 */
export const JOURNAL_POSTS: JournalPost[] = data.posts;

/** `undefined` for an id nobody wrote a post for — the caller decides. */
export function findJournalPost(id: string | undefined): JournalPost | undefined {
  return JOURNAL_POSTS.find((post) => post.id === id);
}

/** Newest first — what the journal index leads with. Never mutates the source. */
export function journalPostsByDate(): JournalPost[] {
  return [...JOURNAL_POSTS].sort((a, b) => b.published.localeCompare(a.published));
}

/** '2026-06-05' → '05 Jun 2026'. Fixed to en-GB so it reads the same anywhere. */
export function formatJournalDate(published: string): string {
  return new Date(`${published}T00:00:00`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Reading time from the text itself, at the usual 200 words a minute. */
export function readingTime(body: string[]): string {
  const words = body.join(' ').split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

/** The opening paragraph stands in as the excerpt — nothing extra to write. */
export function journalExcerpt(post: JournalPost): string {
  return post.body[0] ?? '';
}

/**
 * The filter row: 'All' plus the tags present in `posts`.
 *
 * Takes the posts rather than reading the whole journal, because the index
 * holds its newest post back for the featured slot. Offering its tag as a
 * filter gives you a button whose only possible result is "No articles found".
 */
export function journalCategories(posts: JournalPost[]): string[] {
  return ['All', ...new Set(posts.map((post) => post.tag))];
}
