/**
 * Post-build: give a crawler something to read.
 *
 * Before this, every URL on the site returned the same document — one title,
 * no description, no canonical, and an empty <div id="root">. Google renders
 * JavaScript, so it would eventually see the pages, but it had nothing to tell
 * them apart in the meantime and no sitemap to find them from. `/robots.txt`
 * and `/sitemap.xml` both returned the HTML shell with a 200, because nginx
 * falls back to index.html for anything it cannot find on disk: Google asked
 * for the robots file and was handed a web page.
 *
 * This writes, into dist/:
 *   robots.txt      — real, with the portal disallowed
 *   sitemap.xml     — every public page and every journal post
 *   <route>/index.html — a copy of the shell with that page's own head
 *
 * The last one works because of the same nginx line that caused the problem:
 * `try_files $uri $uri/ /index.html` serves dist/about/index.html for /about
 * when the file exists, and falls through to the SPA when it does not.
 *
 * What this is NOT: pre-rendering. The <body> is still an empty root and the
 * app still boots to fill it. It fixes discovery and the per-URL metadata,
 * which is what is broken; rendering the content into the HTML needs a
 * headless browser at build time and is a separate decision.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const app = resolve(here, '..');
const dist = join(app, 'dist');

const read = (p) => JSON.parse(readFileSync(p, 'utf8'));
const { site, pages, private: privatePaths } = read(join(app, 'src/shared/seo/pages.json'));
const { posts } = read(join(app, 'src/shared/journal/posts.json'));

if (!existsSync(join(dist, 'index.html'))) {
  // Loud, not silent: a build that quietly skipped this would ship the broken
  // version again and nobody would know until Search Console said so weeks later.
  console.error('[seo] dist/index.html is missing — run the build first.');
  process.exit(1);
}

const shell = readFileSync(join(dist, 'index.html'), 'utf8');

/** Entity-escape anything going into markup or XML. */
const esc = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// ── every URL that should be indexed ────────────────────────────────────
const urls = [
  ...pages.map((page) => ({ ...page, lastmod: null })),
  ...posts.map((post) => ({
    path: `/blog/${post.id}`,
    title: `${post.title} | Cabmora Media`,
    // The opening paragraph, trimmed at a word boundary. Google shows about
    // 155 characters and cutting mid-word looks like a broken page.
    description: summarise(post.body[0] ?? ''),
    priority: '0.6',
    lastmod: post.published,
    image: post.img,
    post,
  })),
];

function summarise(text, limit = 155) {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

// ── robots.txt ──────────────────────────────────────────────────────────
const robots = [
  '# Cabmora Media',
  '',
  'User-agent: *',
  'Allow: /',
  '',
  '# The portal and anything behind a token. Nothing here is useful in a',
  '# search result, and a share link is meant for one recipient.',
  ...privatePaths.map((path) => `Disallow: ${path}`),
  '',
  `Sitemap: ${site.origin}/sitemap.xml`,
  '',
].join('\n');

writeFileSync(join(dist, 'robots.txt'), robots);

// ── sitemap.xml ─────────────────────────────────────────────────────────
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((url) =>
    [
      '  <url>',
      `    <loc>${esc(site.origin)}${esc(url.path)}</loc>`,
      url.lastmod ? `    <lastmod>${esc(url.lastmod)}</lastmod>` : null,
      `    <priority>${esc(url.priority)}</priority>`,
      '  </url>',
    ]
      .filter(Boolean)
      .join('\n'),
  ),
  '</urlset>',
  '',
].join('\n');

writeFileSync(join(dist, 'sitemap.xml'), sitemap);

// ── a head per route ────────────────────────────────────────────────────
/** Absolute, which og:image must be — and some of ours already are.
 *  The journal still points at Unsplash, so prefixing blindly produced
 *  `https://cabmoramedia.comhttps://images.unsplash.com/...`. */
function absolute(path) {
  return /^https?:\/\//.test(path) ? path : `${site.origin}${path}`;
}

function headFor(url) {
  const canonical = `${site.origin}${url.path}`;
  const image = absolute(url.image ?? '/portfolio/work/img-2856.jpg');
  return [
    `    <title>${esc(url.title)}</title>`,
    `    <meta name="description" content="${esc(url.description)}" />`,
    `    <link rel="canonical" href="${canonical}" />`,
    `    <meta property="og:type" content="${url.path.startsWith('/blog/') ? 'article' : 'website'}" />`,
    `    <meta property="og:site_name" content="${esc(site.name)}" />`,
    `    <meta property="og:locale" content="${esc(site.locale)}" />`,
    `    <meta property="og:title" content="${esc(url.title)}" />`,
    `    <meta property="og:description" content="${esc(url.description)}" />`,
    `    <meta property="og:url" content="${canonical}" />`,
    `    <meta property="og:image" content="${image}" />`,
    '    <meta name="twitter:card" content="summary_large_image" />',
    `    <meta name="twitter:title" content="${esc(url.title)}" />`,
    `    <meta name="twitter:description" content="${esc(url.description)}" />`,
    `    <meta name="twitter:image" content="${image}" />`,
  ].join('\n');
}

/**
 * Who Cabmora is, in a form a search engine can read.
 *
 * This is the half of "show information about Cabmora when somebody searches
 * for it" that lives in code. The other half is a **Google Business Profile**,
 * which is a registration rather than markup — the panel with photos, opening
 * hours, directions and reviews comes from there and cannot be produced by
 * anything in this repository. What this does is let Google connect the site
 * to the business and show a sensible title, description and sitelinks.
 *
 * `@id` on both, cross-referenced: without a stable identifier Google treats
 * the organisation on one page and the organisation on another as two
 * different things it has to guess about.
 */
const organisation = {
  '@type': 'ProfessionalService',
  '@id': `${site.origin}/#organisation`,
  name: site.name,
  legalName: 'Cabmora Limited',
  description: pages[0].description,
  slogan: 'Capturing Stories. Creating Impact.',
  url: site.origin,
  logo: `${site.origin}/portfolio/work/img-2856.jpg`,
  image: `${site.origin}/portfolio/work/img-2856.jpg`,
  email: 'hello@cabmoramedia.com',
  telephone: '+44 77 8010 5876',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Manchester',
    addressCountry: 'GB',
  },
  areaServed: [
    { '@type': 'Country', name: 'United Kingdom' },
    { '@type': 'Place', name: 'Worldwide' },
  ],
  // What somebody would actually search for. Each one is a service the site
  // genuinely describes — listing things we do not do is how a rich result
  // gets ignored.
  knowsAbout: [
    'Wedding photography',
    'Wedding videography',
    'Event photography',
    'Corporate event coverage',
    'Product photography',
    'Podcast production',
    'Documentary filmmaking',
  ],
  sameAs: [
    'https://instagram.com/cabmoramedia',
    'https://facebook.com/cabmoramedia',
    'https://pinterest.com/cabmoramedia',
  ],
};

/** Lets Google offer a search box under the result, and names the site as a
 *  thing distinct from the company that runs it. */
const website = {
  '@type': 'WebSite',
  '@id': `${site.origin}/#website`,
  url: site.origin,
  name: site.name,
  publisher: { '@id': `${site.origin}/#organisation` },
  inLanguage: 'en-GB',
};

/** One graph rather than several loose blocks: the cross-references only mean
 *  something if the things they point at are in the same document. */
const homeGraph = {
  '@context': 'https://schema.org',
  '@graph': [organisation, website],
};

/** A journal post, so it can appear as a rich result rather than a blue link. */
function articleGraph(url, post) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${site.origin}${url.path}#article`,
        headline: post.title,
        description: url.description,
        image: absolute(post.img),
        datePublished: post.published,
        dateModified: post.published,
        articleSection: post.tag,
        // The studio, not a person. Cabmora writes these; inventing a byline
        // to satisfy a schema would be a false statement about authorship.
        author: { '@id': `${site.origin}/#organisation` },
        publisher: { '@id': `${site.origin}/#organisation` },
        mainEntityOfPage: `${site.origin}${url.path}`,
        inLanguage: 'en-GB',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: site.origin },
          { '@type': 'ListItem', position: 2, name: 'Journal', item: `${site.origin}/blog` },
          { '@type': 'ListItem', position: 3, name: post.title },
        ],
      },
    ],
  };
}

let written = 0;
for (const url of urls) {
  // The shell already carries a <title>; replace it rather than add a second,
  // which browsers tolerate and crawlers report as a duplicate.
  let html = shell.replace(/[ \t]*<title>.*?<\/title>\n?/s, '');
  let head = headFor(url);
  const graph =
    url.path === '/'
      ? homeGraph
      : url.post
        ? articleGraph(url, url.post)
        : null;
  if (graph) {
    head += `\n    <script type="application/ld+json">${JSON.stringify(graph)}</script>`;
  }
  // Matches the closing tag with its own indentation, so the injected block
  // does not inherit it and come out double-indented.
  html = html.replace(/\n[ \t]*<\/head>/, `\n${head}\n  </head>`);

  if (url.path === '/') {
    writeFileSync(join(dist, 'index.html'), html);
  } else {
    // `<route>.html`, never `<route>/index.html`. A directory makes nginx
    // issue its own 301 from /about to /about/ — and because Railway
    // terminates TLS and proxies to this container over plain HTTP on an
    // internal port, that redirect comes out as
    // `http://cabmoramedia.com:8080/about/`: the wrong scheme, a port nobody
    // outside can reach, and a canonical tag pointing back at the URL that
    // redirected. A flat file is served directly, with no redirect at all.
    const file = join(dist, `${url.path.slice(1)}.html`);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, html);
  }
  written += 1;
}

console.log(
  `[seo] robots.txt, sitemap.xml (${urls.length} urls), and ${written} pages with their own head`,
);
