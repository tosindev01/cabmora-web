import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Share2, Facebook, Twitter, Linkedin } from "lucide-react";
import { Navigation, Footer, FadeIn } from "../App";

const ARTICLE_DATA = {
  category: "Destination",
  date: "October 12, 2025",
  readTime: "8 min read",
  title: "The Art of Capturing Golden Hour: A Tuscany Wedding Story",
  heroImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&h=1080&fit=crop",
  author: {
    name: "Elena Rossi",
    role: "Lead Cinematographer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
  },
  content: `
    <p>There is a specific quality to the light in Tuscany just before the sun dips below the rolling hills. It's not just golden; it's practically tactile. It wraps around everything, softening edges and turning ordinary moments into cinematic masterpieces. As a wedding photographer, this is the light we chase.</p>
    
    <p>When Sarah and James told us they were planning an intimate elopement at a historic villa outside of Florence, our immediate thought went to the timeline. A destination wedding is about the experience, the atmosphere, and the integration of the couple's love with the unique character of the location.</p>

    <h3>The Importance of the Timeline</h3>
    <p>To truly capture the essence of a location like Tuscany, scheduling is everything. We worked closely with their planner to ensure the portrait session fell exactly within that 45-minute window before sunset.</p>

    <blockquote>
      "The light is the invisible guest at every wedding. It dictates the mood, the romance, and the memory of the day."
    </blockquote>

    <p>During the shoot, we focused on movement. The slight breeze catching the veil, the slow walk through the olive groves. We didn't pose them; we simply placed them in the best light and let their natural connection take over.</p>

    <div class="image-grid">
      <img src="https://images.unsplash.com/photo-1532712938736-69c5e2154426?w=800&h=1000&fit=crop" alt="Couple walking" />
      <img src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&h=1000&fit=crop" alt="Details" />
    </div>

    <h3>Shooting Hybrid: Film and Digital</h3>
    <p>For this specific wedding, we utilized a hybrid approach. The digital cameras handled the fast-paced moments of the ceremony, ensuring sharpness and reliability. But for the portraits, we brought out the medium format film camera. Film handles the highlights of a sunset in a way digital sensors still struggle to replicate perfectly. The resulting scans possessed a creamy, nostalgic quality that matched the timelessness of the Italian setting.</p>

    <p>In the end, capturing the golden hour isn't just about technical settings. It's about anticipation. It's about feeling the rhythm of the day and knowing exactly when to step back and let the environment do the talking.</p>
  `
};

export default function BlogPostPage() {
  const { id } = useParams();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  return (
    <div className="bg-[#FAF9F6] text-[#111] overflow-x-hidden min-h-screen">
      <Navigation theme="light" />
      
      <main className="pt-[100px] lg:pt-[120px]">
        
        {/* Article Header */}
        <div className="max-w-[1000px] mx-auto px-6 lg:px-14 pt-16 pb-12">
          <FadeIn>
            <Link to="/blog" className="inline-flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-[#111]/50 hover:text-[#C9A86A] transition-colors duration-300 mb-12 font-medium">
              <ArrowLeft size={14} />
              Back to Journal
            </Link>
            
            <div className="flex items-center gap-4 text-[11px] tracking-[0.15em] uppercase text-[#111]/60 mb-6 font-medium">
              <span className="text-[#C9A86A]">{ARTICLE_DATA.category}</span>
              <span className="w-1 h-1 rounded-full bg-[#111]/20" />
              <span>{ARTICLE_DATA.date}</span>
              <span className="w-1 h-1 rounded-full bg-[#111]/20" />
              <span>{ARTICLE_DATA.readTime}</span>
            </div>
            
            <h1 className="font-serif text-[clamp(32px,4vw,56px)] text-[#111] font-normal leading-[1.1] mb-10">
              {ARTICLE_DATA.title}
            </h1>

            <div className="flex items-center justify-between border-t border-[#111]/10 pt-6">
              <div className="flex items-center gap-4">
                <img src={ARTICLE_DATA.author.avatar} alt={ARTICLE_DATA.author.name} className="w-10 h-10 rounded-full object-cover grayscale" />
                <div>
                  <div className="text-[13px] font-medium text-[#111]">{ARTICLE_DATA.author.name}</div>
                  <div className="text-[11px] tracking-[0.05em] text-[#111]/50">{ARTICLE_DATA.author.role}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[#111]/40">
                <button className="hover:text-[#C9A86A] transition-colors"><Share2 size={18} /></button>
                <button className="hover:text-[#C9A86A] transition-colors"><Facebook size={18} /></button>
                <button className="hover:text-[#C9A86A] transition-colors"><Twitter size={18} /></button>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Hero Image */}
        <FadeIn delay={150}>
          <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-14 mb-16">
            <div className="aspect-[16/9] lg:aspect-[2.5/1] w-full overflow-hidden">
              <img 
                src={ARTICLE_DATA.heroImage} 
                alt={ARTICLE_DATA.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </FadeIn>

        {/* Content */}
        <div className="max-w-[760px] mx-auto px-6 lg:px-14 pb-32">
          <FadeIn delay={300}>
            <div 
              className="text-[17px] leading-[1.8] text-[#111]/70 [&_p]:mb-8 [&_h3]:font-serif [&_h3]:font-normal [&_h3]:text-[#111] [&_h3]:text-3xl [&_h3]:mt-12 [&_h3]:mb-6 [&_blockquote]:border-l-[3px] [&_blockquote]:border-[#C9A86A] [&_blockquote]:text-[22px] [&_blockquote]:font-serif [&_blockquote]:italic [&_blockquote]:pl-6 [&_blockquote]:my-10 [&_blockquote]:text-[#111]/80 [&_.image-grid]:grid [&_.image-grid]:grid-cols-2 [&_.image-grid]:gap-6 [&_.image-grid]:my-12 [&_.image-grid_img]:w-full [&_.image-grid_img]:h-auto [&_.image-grid_img]:object-cover"
              dangerouslySetInnerHTML={{ __html: ARTICLE_DATA.content }}
            />
          </FadeIn>
        </div>

      </main>

      <Footer />
    </div>
  );
}
