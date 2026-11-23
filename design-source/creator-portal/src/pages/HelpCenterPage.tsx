import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Book, PlayCircle, HelpCircle, FileText, ChevronRight, ArrowRight } from "lucide-react";
import { Navigation, Footer, FadeIn } from "../App";

const CATEGORIES = [
  { id: "getting-started", label: "Getting Started", icon: Book },
  { id: "account", label: "Account & Billing", icon: FileText },
  { id: "troubleshooting", label: "Troubleshooting", icon: HelpCircle },
  { id: "video-guides", label: "Video Tutorials", icon: PlayCircle },
];

const POPULAR_ARTICLES = [
  { id: "1", title: "How to set up your creator profile", category: "Getting Started" },
  { id: "2", title: "Understanding your payout schedule", category: "Account & Billing" },
  { id: "3", title: "Best practices for video uploads", category: "Video Tutorials" },
  { id: "4", title: "Troubleshooting upload errors", category: "Troubleshooting" },
  { id: "5", title: "Connecting your social accounts", category: "Getting Started" },
  { id: "6", title: "How to edit your billing details", category: "Account & Billing" },
];

const ONBOARDING_GUIDES = [
  {
    id: "guide-1",
    title: "The Ultimate Guide to Cabmora",
    description: "Learn everything you need to know about setting up your account, managing your content, and getting paid.",
    readTime: "10 min read"
  },
  {
    id: "guide-2",
    title: "Mastering the Client Portal",
    description: "A step-by-step walkthrough of the client portal features to streamline your communication.",
    readTime: "8 min read"
  }
];

const FAQS = [
  {
    question: "How do I reset my password?",
    answer: "You can reset your password by clicking on the 'Forgot Password' link on the login page. We'll send you an email with instructions."
  },
  {
    question: "When do I get paid?",
    answer: "Payouts are processed automatically on the 1st and 15th of every month. You can view your upcoming payouts in the Billing section."
  },
  {
    question: "Can I change my subscription plan?",
    answer: "Yes, you can upgrade or downgrade your plan at any time from your Account Settings. Changes take effect on your next billing cycle."
  },
  {
    question: "What file formats do you support for videos?",
    answer: "We support MP4, MOV, and WEBM formats. For the best quality, we recommend 1080p or 4K resolution."
  }
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#FAF9F6] text-[#111] overflow-x-hidden min-h-screen">
      <Navigation theme="light" />

      <main className="pt-[140px] pb-32">
        {/* Header & Search */}
        <section className="max-w-[1440px] mx-auto px-6 lg:px-14 mb-20 text-center">
          <FadeIn>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-8 h-px bg-[#C9A86A]" />
              <span className="text-[11px] tracking-[0.32em] uppercase text-[#C9A86A] font-medium">
                Support
              </span>
              <div className="w-8 h-px bg-[#C9A86A]" />
            </div>
            <h1 className="font-serif text-[clamp(40px,5vw,72px)] text-[#111] font-normal leading-[1.1] mb-8">
              How can we help?
            </h1>
            
            <div className="relative max-w-2xl mx-auto">
              <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#111]/30" />
              <input 
                type="text" 
                placeholder="Search articles, guides, or FAQs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111]/5 border border-[#111]/10 rounded-full pl-14 pr-6 py-5 text-[14px] outline-none focus:border-[#C9A86A] focus:bg-[#FAF9F6] transition-all duration-300 placeholder:text-[#111]/40 shadow-sm"
              />
            </div>
          </FadeIn>
        </section>

        {/* Categories */}
        <section className="max-w-[1440px] mx-auto px-6 lg:px-14 mb-24">
          <FadeIn delay={100}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  className="group flex flex-col items-start p-8 bg-white border border-[#111]/5 hover:border-[#C9A86A]/50 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="w-12 h-12 rounded-full bg-[#111]/5 flex items-center justify-center text-[#111]/70 group-hover:bg-[#C9A86A]/10 group-hover:text-[#C9A86A] transition-colors duration-300 mb-6">
                    <category.icon size={22} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-serif text-[22px] mb-2">{category.label}</h3>
                  <div className="text-[12px] tracking-[0.1em] uppercase text-[#111]/40 group-hover:text-[#C9A86A] transition-colors duration-300 flex items-center gap-2 mt-auto">
                    View Articles <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
                    {ONBOARDING_GUIDES.map(guide => (
                      <Link key={guide.id} to="/help" className="group block bg-white border border-[#111]/5 p-8 hover:border-[#C9A86A]/30 transition-all duration-300">
                        <div className="flex items-start justify-between gap-6">
                          <div>
                            <div className="text-[10px] tracking-[0.15em] uppercase text-[#C9A86A] mb-3 font-medium">
                              {guide.readTime}
                            </div>
                            <h3 className="font-serif text-[24px] mb-3 group-hover:text-[#C9A86A] transition-colors duration-300">
                              {guide.title}
                            </h3>
                            <p className="text-[#111]/60 leading-[1.6] text-[15px]">
                              {guide.description}
                            </p>
                          </div>
                          <div className="w-10 h-10 rounded-full border border-[#111]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#C9A86A] group-hover:border-[#C9A86A] group-hover:text-white transition-all duration-300">
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
                  <div className="border-t border-[#111]/10">
                    {FAQS.map((faq, index) => (
                      <div key={index} className="border-b border-[#111]/10">
                        <button
                          onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                          className="w-full py-6 flex items-center justify-between text-left focus:outline-none"
                        >
                          <span className="font-serif text-[20px] pr-8">{faq.question}</span>
                          <span className={`w-8 h-8 flex items-center justify-center rounded-full border border-[#111]/20 transition-transform duration-300 ${activeFaq === index ? 'rotate-45 bg-[#111] text-white border-[#111]' : 'text-[#111]/50'}`}>
                            +
                          </span>
                        </button>
                        <div 
                          className={`overflow-hidden transition-all duration-500 ease-in-out ${activeFaq === index ? 'max-h-64 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                          <p className="text-[#111]/60 leading-[1.7] text-[15px] pr-12">
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
                <div className="bg-white border border-[#111]/5 p-8 mb-10">
                  <h3 className="text-[12px] tracking-[0.2em] uppercase font-semibold mb-6 pb-4 border-b border-[#111]/10">
                    Popular Articles
                  </h3>
                  <div className="space-y-5">
                    {POPULAR_ARTICLES.map((article) => (
                      <Link key={article.id} to="/help" className="group block">
                        <div className="text-[10px] tracking-[0.1em] uppercase text-[#C9A86A] mb-1 font-medium">
                          {article.category}
                        </div>
                        <h4 className="text-[15px] font-medium leading-[1.4] text-[#111]/80 group-hover:text-[#111] transition-colors duration-200">
                          {article.title}
                        </h4>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Support Contact */}
                <div className="bg-[#111] text-[#FAF9F6] p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#FAF9F6]/10 flex items-center justify-center mx-auto mb-6 text-[#C9A86A]">
                    <HelpCircle size={22} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-serif text-[24px] mb-3">Still need help?</h3>
                  <p className="text-[#FAF9F6]/60 text-[14px] leading-[1.6] mb-8">
                    Can't find what you're looking for? Our support team is here to help.
                  </p>
                  <button className="w-full bg-[#C9A86A] text-[#111] py-4 text-[11px] tracking-[0.15em] uppercase font-semibold hover:bg-[#FAF9F6] transition-colors duration-300">
                    Contact Support
                  </button>
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
