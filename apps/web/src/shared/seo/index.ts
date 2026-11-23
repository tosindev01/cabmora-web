import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import seo from './pages.json';
import { JOURNAL_POSTS } from '@/shared/journal';

/**
 * Keeping the head right after the first load.
 *
 * The build writes a real `<head>` into the HTML for every public route, which
 * is what a crawler reads — this is not that. This is for what happens
 * afterwards: a visitor who lands on `/` and clicks through to `/about` never
 * fetches a new document, so without this the tab, the bookmark and anything
 * reading `document.title` would still say "Cabmora Media — Wedding & Event
 * Photography".
 *
 * Reads the same `pages.json` the build script does, so a title cannot be
 * right in the HTML and wrong a click later.
 */

interface SeoPage {
  path: string;
  title: string;
  description: string;
}

const PAGES: SeoPage[] = seo.pages;
const { origin, name } = seo.site;

/** The opening paragraph, trimmed at a word boundary — same rule as the build
 *  script, because the two must not describe a page differently. */
function summarise(text: string, limit = 155): string {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

function pageFor(pathname: string): SeoPage | null {
  const exact = PAGES.find((page) => page.path === pathname);
  if (exact) return exact;

  // Journal posts are not in the table — they come from the journal itself,
  // for the same reason the sitemap takes them from there.
  const match = /^\/blog\/([^/]+)$/.exec(pathname);
  const post = match && JOURNAL_POSTS.find((entry) => entry.id === match[1]);
  if (post) {
    return {
      path: pathname,
      title: `${post.title} | ${name}`,
      description: summarise(post.body[0] ?? ''),
    };
  }
  return null;
}

/** Set or replace one `<meta>`, by whichever attribute identifies it. */
function setMeta(attribute: 'name' | 'property', key: string, content: string): void {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

/**
 * Mounted once, at the router. Not per page: a hook each page had to remember
 * to call is a hook the next page forgets, and the symptom — one screen with
 * the wrong title — is invisible until somebody shares the link.
 */
export function useDocumentMeta(): void {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = pageFor(pathname);
    // Portal screens are not in the table and are disallowed in robots.txt.
    // Left alone rather than given an invented title.
    if (!page) return;

    document.title = page.title;
    setMeta('name', 'description', page.description);
    setMeta('property', 'og:title', page.title);
    setMeta('property', 'og:description', page.description);
    setMeta('property', 'og:url', `${origin}${page.path}`);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${origin}${page.path}`;
  }, [pathname]);
}
