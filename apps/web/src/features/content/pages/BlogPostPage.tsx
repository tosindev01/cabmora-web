import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Share2, Facebook, Twitter } from 'lucide-react';
import { Footer, Navigation } from '@/shared/site';
import { FadeIn } from '@cabmora/ui';
import {} from '@/shared/portal';
import { findJournalPost, formatJournalDate, readingTime } from '@/shared/journal';

export default function BlogPostPage() {
  const { id } = useParams();
  const [copied, setCopied] = useState(false);

  /* This page used to ignore `:id` entirely and render one hardcoded article,
     so every link in the journal opened the same post. */
  const post = findJournalPost(id);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Nothing is written under this id. Back to the index rather than inventing
  // a post or leaving a blank page.
  if (!post) return <Navigate to="/blog" replace />;

  const url = window.location.href;
  const share = `${post.title} — Cabmora Media`;

  /* The phone's own share sheet when there is one, the clipboard otherwise.
     These three were buttons with no handler at all. */
  async function shareThisPost() {
    try {
      if (navigator.share) {
        await navigator.share({ title: share, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Cancelled, or a browser that allows neither. Nothing to report.
    }
  }

  return (
    <div className="bg-canvas text-ink overflow-x-hidden min-h-screen">
      <Navigation theme="light" />

      <main className="pt-[100px] lg:pt-[120px]">
        {/* Article Header */}
        <div className="max-w-[1000px] mx-auto px-6 lg:px-14 pt-16 pb-12">
          <FadeIn>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-[11.5px] tracking-[0.15em] uppercase text-ink/50 hover:text-gold transition-colors duration-300 mb-12 font-medium"
            >
              <ArrowLeft size={14} />
              Back to Journal
            </Link>

            <div className="flex items-center gap-4 text-[11.5px] tracking-[0.15em] uppercase text-ink/60 mb-6 font-medium">
              <span className="text-gold">{post.tag}</span>
              <span className="w-1 h-1 rounded-full bg-ink/20" />
              <span>{formatJournalDate(post.published)}</span>
              <span className="w-1 h-1 rounded-full bg-ink/20" />
              <span>{readingTime(post.body)}</span>
            </div>

            <h1 className="font-serif text-[clamp(32px,4vw,56px)] text-ink font-normal leading-[1.1] mb-10">
              {post.title}
            </h1>

            <div className="flex items-center justify-between border-t border-ink/10 pt-6">
              {/* The studio writes these, not a named photographer, and there
                  is no portrait to put in the circle — so there is no circle.
                  The byline this replaced was a person who does not exist. */}
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-[14px] font-medium text-ink">Cabmora Media</div>
                  <div className="text-[11.5px] tracking-[0.05em] text-ink/50">
                    Photography &amp; Videography
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-ink/40">
                <button
                  type="button"
                  onClick={() => void shareThisPost()}
                  aria-label={copied ? 'Link copied' : 'Share this post'}
                  className="hover:text-gold transition-colors"
                >
                  {copied ? <Check size={18} className="text-gold" /> : <Share2 size={18} />}
                </button>
                {/* `noopener` on both: `target="_blank"` without it hands the
                    opened window a reference back to this one. */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share this post on Facebook"
                  className="hover:text-gold transition-colors"
                >
                  <Facebook size={18} />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(share)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share this post on X"
                  className="hover:text-gold transition-colors"
                >
                  <Twitter size={18} />
                </a>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Hero Image */}
        <FadeIn delay={150}>
          <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-14 mb-16">
            <div className="aspect-[16/9] lg:aspect-[2.5/1] w-full overflow-hidden">
              <img src={post.img} alt={post.title} className="w-full h-full object-cover" />
            </div>
          </div>
        </FadeIn>

        {/* Content */}
        <div className="max-w-[760px] mx-auto px-6 lg:px-14 pb-32">
          <FadeIn delay={300}>
            {/* Paragraphs, rendered as paragraphs. The fixture this replaced
                was an HTML string going through `dangerouslySetInnerHTML`. */}
            <div className="text-[17px] leading-[1.8] text-ink/70">
              {post.body.map((paragraph) => (
                <p key={paragraph} className="mb-8">
                  {paragraph}
                </p>
              ))}
            </div>
          </FadeIn>
        </div>
      </main>

      <Footer />
    </div>
  );
}
