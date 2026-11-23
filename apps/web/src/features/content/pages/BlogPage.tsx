import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { Footer, Navigation } from '@/shared/site';
import { FadeIn } from '@cabmora/ui';
import {} from '@/shared/portal';
import {
  formatJournalDate,
  journalCategories,
  journalExcerpt,
  journalPostsByDate,
  readingTime,
} from '@/shared/journal';

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  /* The journal used to list seven posts nobody had written — Tuscany, the
     Amalfi Coast, Aspen — and every one of them opened the same article. It
     now lists what actually exists: the newest post takes the featured slot
     and the rest fill the grid below it. */
  const [featured, ...rest] = journalPostsByDate();
  const categories = journalCategories(rest);

  const filteredPosts = rest.filter((post) => {
    const matchesCategory = activeCategory === 'All' || post.tag === activeCategory;
    const needle = searchQuery.toLowerCase();
    const matchesSearch =
      post.title.toLowerCase().includes(needle) ||
      journalExcerpt(post).toLowerCase().includes(needle);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-canvas text-ink overflow-x-hidden min-h-screen">
      <Navigation theme="light" />

      <main className="pt-[140px] pb-32">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-14">
          {/* Header */}
          <FadeIn>
            <div className="mb-16">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-px bg-gold" />
                <span className="text-[11.5px] tracking-[0.32em] uppercase text-gold font-medium">
                  Journal
                </span>
              </div>
              <h1 className="font-serif text-[clamp(40px,5vw,72px)] text-ink font-normal leading-[1.1]">
                Stories & Insights
              </h1>
            </div>
          </FadeIn>

          {/* Featured Post */}
          <FadeIn delay={100}>
            <Link to={`/blog/${featured.id}`} className="block group mb-24">
              <div className="relative aspect-[16/9] lg:aspect-[2.35/1] overflow-hidden mb-8">
                <img
                  src={featured.img}
                  alt={featured.alt}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute top-6 left-6 bg-canvas px-4 py-2 text-[11.5px] tracking-[0.2em] uppercase font-semibold">
                  Featured
                </div>
              </div>
              <div className="max-w-4xl">
                <div className="flex items-center gap-4 text-[11.5px] tracking-[0.15em] uppercase text-ink/50 mb-4 font-medium">
                  <span>{featured.tag}</span>
                  <span className="w-1 h-1 rounded-full bg-gold" />
                  <span>{formatJournalDate(featured.published)}</span>
                </div>
                <h2 className="font-serif text-3xl lg:text-5xl leading-[1.2] mb-6 group-hover:text-gold transition-colors duration-300">
                  {featured.title}
                </h2>
                <p className="text-[17px] leading-[1.8] text-ink/60 mb-8 max-w-2xl">
                  {journalExcerpt(featured)}
                </p>
                <div className="inline-flex items-center gap-3 text-[11.5px] tracking-[0.18em] uppercase font-semibold text-ink group-hover:text-gold transition-colors duration-300">
                  Read Article
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </div>
              </div>
            </Link>
          </FadeIn>

          {/* Filters & Search */}
          <FadeIn delay={200}>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16 border-y border-ink/10 py-6">
              {/* Categories */}
              <div className="flex flex-wrap gap-4 lg:gap-8">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`text-[11.5px] tracking-[0.15em] uppercase font-medium transition-colors duration-300 ${
                      activeCategory === category ? 'text-gold' : 'text-ink/50 hover:text-ink'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full lg:w-72">
                <Search
                  size={16}
                  className="absolute left-0 top-1/2 -translate-y-1/2 text-ink/30"
                />
                <input
                  type="text"
                  placeholder="SEARCH ARTICLES..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-b border-ink/20 pl-8 pr-4 py-2 text-[11.5px] tracking-[0.15em] uppercase outline-none focus:border-gold transition-colors duration-300 placeholder:text-ink/30"
                />
              </div>
            </div>
          </FadeIn>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
            {filteredPosts.map((post, i) => (
              <FadeIn key={post.id} delay={100 * (i % 3)}>
                <Link to={`/blog/${post.id}`} className="block group">
                  <div className="aspect-[4/3] overflow-hidden mb-6">
                    <img
                      src={post.img}
                      alt={post.alt}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex items-center gap-3 text-[11.5px] tracking-[0.15em] uppercase text-ink/50 mb-3 font-medium">
                    <span className="text-gold">{post.tag}</span>
                    <span className="w-1 h-1 rounded-full bg-ink/20" />
                    <span>{readingTime(post.body)}</span>
                  </div>
                  <h3 className="font-serif text-[22px] leading-[1.3] mb-4 group-hover:text-gold transition-colors duration-300">
                    {post.title}
                  </h3>
                  <p className="text-[15px] leading-[1.6] text-ink/60">{journalExcerpt(post)}</p>
                </Link>
              </FadeIn>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="py-20 text-center text-ink/50 text-[15px] tracking-[0.05em]">
              No articles found matching your criteria.
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
