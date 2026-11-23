import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, HelpCircle, ChevronRight, ArrowRight } from 'lucide-react';
import { Footer, Navigation } from '@/shared/site';
import { FadeIn } from '@cabmora/ui';
import {} from '@/shared/portal';
import {
  HELP_CATEGORIES,
  FAQS,
  ONBOARDING_GUIDES,
  POPULAR_ARTICLES,
} from '@/features/content/data';

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-canvas text-ink overflow-x-hidden min-h-screen">
      <Navigation theme="light" />

      <main className="pt-[140px] pb-32">
        {/* Header & Search */}
        <section className="max-w-[1440px] mx-auto px-6 lg:px-14 mb-20 text-center">
          <FadeIn>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-8 h-px bg-gold" />
              <span className="text-[12.5px] tracking-[0.26em] uppercase text-gold font-medium">
                Support
              </span>
              <div className="w-8 h-px bg-gold" />
            </div>
            <h1 className="font-serif text-[clamp(40px,5vw,72px)] text-ink font-normal leading-[1.1] mb-8">
              How can we help?
            </h1>

            <div className="relative max-w-2xl mx-auto">
              <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-ink/30" />
              <input
                type="text"
                placeholder="Search articles, guides, or FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-ink/5 border border-ink/10 rounded-full pl-14 pr-6 py-5 text-[16px] outline-none focus:border-gold focus:bg-canvas transition-all duration-300 placeholder:text-ink/40 shadow-sm"
              />
            </div>
          </FadeIn>
        </section>

        {/* Categories */}
        <section className="max-w-[1440px] mx-auto px-6 lg:px-14 mb-24">
          <FadeIn delay={100}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {HELP_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  className="group flex flex-col items-start p-8 bg-white border border-ink/5 hover:border-gold/50 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="w-12 h-12 rounded-full bg-ink/5 flex items-center justify-center text-ink/70 group-hover:bg-gold/10 group-hover:text-gold transition-colors duration-300 mb-6">
                    <category.icon size={22} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-serif text-[22px] mb-2">{category.label}</h3>
                  <div className="text-[12.5px] tracking-[0.1em] uppercase text-ink/40 group-hover:text-gold transition-colors duration-300 flex items-center gap-2 mt-auto">
                    View Articles{' '}
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </button>
              ))}
            </div>
          </FadeIn>
        </section>

        {/* Content Layout */}
        <section className="max-w-[1440px] mx-auto px-6 lg:px-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Left Column: Guides & FAQs */}
            <div className="lg:col-span-8">
              {/* Onboarding Guides */}
              <FadeIn delay={200}>
                <div className="mb-16">
                  <h2 className="font-serif text-[32px] mb-8 flex items-center gap-4">
                    Onboarding Guides
                  </h2>
                  <div className="space-y-6">
                    {ONBOARDING_GUIDES.map((guide) => (
                      <Link
                        key={guide.id}
                        to="/help"
                        className="group block bg-white border border-ink/5 p-8 hover:border-gold/30 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between gap-6">
                          <div>
                            <div className="text-[11.5px] tracking-[0.14em] uppercase text-gold mb-3 font-medium">
                              {guide.readTime}
                            </div>
                            <h3 className="font-serif text-[24px] mb-3 group-hover:text-gold transition-colors duration-300">
                              {guide.title}
                            </h3>
                            <p className="text-ink/60 leading-[1.6] text-[17px]">
                              {guide.description}
                            </p>
                          </div>
                          <div className="w-10 h-10 rounded-full border border-ink/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gold group-hover:border-gold group-hover:text-white transition-all duration-300">
                            <ChevronRight size={18} />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </FadeIn>

              {/* FAQs */}
              <FadeIn delay={300}>
                <div>
                  <h2 className="font-serif text-[32px] mb-8">Frequently Asked Questions</h2>
                  <div className="border-t border-ink/10">
                    {FAQS.map((faq, index) => (
                      <div key={index} className="border-b border-ink/10">
                        <button
                          onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                          className="w-full py-6 flex items-center justify-between text-left focus:outline-none"
                        >
                          <span className="font-serif text-[20px] pr-8">{faq.question}</span>
                          <span
                            className={`w-8 h-8 flex items-center justify-center rounded-full border border-ink/20 transition-transform duration-300 ${activeFaq === index ? 'rotate-45 bg-ink text-white border-ink' : 'text-ink/50'}`}
                          >
                            +
                          </span>
                        </button>
                        <div
                          className={`overflow-hidden transition-all duration-500 ease-in-out ${activeFaq === index ? 'max-h-64 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                          <p className="text-ink/60 leading-[1.7] text-[17px] pr-12">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Right Column: Popular Articles & Video Tutorials */}
            <div className="lg:col-span-4">
              <FadeIn delay={400}>
                {/* Popular Articles */}
                <div className="bg-white border border-ink/5 p-8 mb-10">
                  <h3 className="text-[12.5px] tracking-[0.18em] uppercase font-semibold mb-6 pb-4 border-b border-ink/10">
                    Popular Articles
                  </h3>
                  <div className="space-y-5">
                    {POPULAR_ARTICLES.map((article) => (
                      <Link key={article.id} to="/help" className="group block">
                        <div className="text-[11.5px] tracking-[0.1em] uppercase text-gold mb-1 font-medium">
                          {article.category}
                        </div>
                        <h4 className="text-[17px] font-medium leading-[1.4] text-ink/80 group-hover:text-ink transition-colors duration-200">
                          {article.title}
                        </h4>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Support Contact */}
                <div className="bg-ink text-canvas p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-canvas/10 flex items-center justify-center mx-auto mb-6 text-gold">
                    <HelpCircle size={22} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-serif text-[24px] mb-3">Still need help?</h3>
                  <p className="text-canvas/60 text-[15px] leading-[1.6] mb-8">
                    Can't find what you're looking for? Our support team is here to help.
                  </p>
                  <Link
                    to="/contact"
                    className="block w-full text-center bg-gold text-ink py-4 text-[12px] tracking-[0.14em] uppercase font-semibold hover:bg-canvas transition-colors duration-300"
                  >
                    Contact Support
                  </Link>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
