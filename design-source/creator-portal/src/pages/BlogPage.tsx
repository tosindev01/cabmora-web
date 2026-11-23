import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";
import { Navigation, Footer, FadeIn } from "../App";

const CATEGORIES = ["All", "Weddings", "Engagements", "Destination", "Editorials", "Tips"];

const FEATURED_POST = {
  id: "1",
  title: "The Art of Capturing Golden Hour: A Tuscany Wedding Story",
  excerpt: "Discover how we harness the magical light of the Italian countryside to create timeless, romantic wedding imagery that feels both cinematic and intimate.",
  category: "Destination",
  date: "October 12, 2025",
  readTime: "8 min read",
  image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&h=900&fit=crop"
};

const RECENT_POSTS = [
  {
    id: "2",
    title: "10 Essential Tips for a Flawless Engagement Session",
    excerpt: "Preparation is key. Here is everything you need to know to feel relaxed and look stunning in front of the lens.",
    category: "Tips",
    date: "September 28, 2025",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop"
  },
  {
    id: "3",
    title: "Editorial Elegance in the Heart of Paris",
    excerpt: "A look behind the scenes at our latest editorial shoot, blending high fashion with timeless romance.",
    category: "Editorials",
    date: "September 15, 2025",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&h=600&fit=crop"
  },
  {
    id: "4",
    title: "Why We Shoot Film & Digital Simultaneously",
    excerpt: "The perfect blend of nostalgia and precision. Why our dual approach guarantees the best of both worlds.",
    category: "Editorials",
    date: "August 30, 2025",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=600&fit=crop"
  },
  {
    id: "5",
    title: "A Minimalist Winter Wedding in Aspen",
    excerpt: "Embracing the snow and cold to create warm, intimate, and breathtakingly beautiful memories.",
    category: "Weddings",
    date: "August 12, 2025",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&h=600&fit=crop"
  },
  {
    id: "6",
    title: "Choosing the Right Color Palette for Your Big Day",
    excerpt: "How colors impact the mood of your photographs and why consistency is crucial for a cohesive album.",
    category: "Tips",
    date: "July 22, 2025",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1537274942065-eda9d00a6293?w=800&h=600&fit=crop"
  },
  {
    id: "7",
    title: "A Coastal Elopement on the Amalfi Coast",
    excerpt: "Just the two of them, the sea, and a vow to forever. The ultimate romantic escape.",
    category: "Destination",
    date: "July 05, 2025",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1532712938736-69c5e2154426?w=800&h=600&fit=crop"
  }
];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = RECENT_POSTS.filter(post => {
    const matchesCategory = activeCategory === "All" || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-[#FAF9F6] text-[#111] overflow-x-hidden min-h-screen">
      <Navigation theme="light" />
      
      <main className="pt-[140px] pb-32">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-14">
          
          {/* Header */}
          <FadeIn>
            <div className="mb-16">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-px bg-[#C9A86A]" />
                <span className="text-[11px] tracking-[0.32em] uppercase text-[#C9A86A] font-medium">
                  Journal
                </span>
              </div>
              <h1 className="font-serif text-[clamp(40px,5vw,72px)] text-[#111] font-normal leading-[1.1]">
                Stories & Insights
              </h1>
            </div>
          </FadeIn>

          {/* Featured Post */}
          <FadeIn delay={100}>
            <Link to={`/blog/${FEATURED_POST.id}`} className="block group mb-24">
              <div className="relative aspect-[16/9] lg:aspect-[2.35/1] overflow-hidden mb-8">
                <img 
                  src={FEATURED_POST.image} 
                  alt={FEATURED_POST.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute top-6 left-6 bg-[#FAF9F6] px-4 py-2 text-[10px] tracking-[0.2em] uppercase font-semibold">
                  Featured
                </div>
              </div>
              <div className="max-w-4xl">
                <div className="flex items-center gap-4 text-[11px] tracking-[0.15em] uppercase text-[#111]/50 mb-4 font-medium">
                  <span>{FEATURED_POST.category}</span>
                  <span className="w-1 h-1 rounded-full bg-[#C9A86A]" />
                  <span>{FEATURED_POST.date}</span>
                </div>
                <h2 className="font-serif text-3xl lg:text-5xl leading-[1.2] mb-6 group-hover:text-[#C9A86A] transition-colors duration-300">
                  {FEATURED_POST.title}
                </h2>
                <p className="text-[15px] leading-[1.8] text-[#111]/60 mb-8 max-w-2xl">
                  {FEATURED_POST.excerpt}
                </p>
                <div className="inline-flex items-center gap-3 text-[11px] tracking-[0.18em] uppercase font-semibold text-[#111] group-hover:text-[#C9A86A] transition-colors duration-300">
                  Read Article
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </FadeIn>

          {/* Filters & Search */}
          <FadeIn delay={200}>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16 border-y border-[#111]/10 py-6">
              {/* Categories */}
              <div className="flex flex-wrap gap-4 lg:gap-8">
                {CATEGORIES.map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`text-[11px] tracking-[0.15em] uppercase font-medium transition-colors duration-300 ${
                      activeCategory === category ? "text-[#C9A86A]" : "text-[#111]/50 hover:text-[#111]"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full lg:w-72">
                <Search size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-[#111]/30" />
                <input 
                  type="text" 
                  placeholder="SEARCH ARTICLES..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-b border-[#111]/20 pl-8 pr-4 py-2 text-[11px] tracking-[0.15em] uppercase outline-none focus:border-[#C9A86A] transition-colors duration-300 placeholder:text-[#111]/30"
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
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] tracking-[0.15em] uppercase text-[#111]/50 mb-3 font-medium">
                    <span className="text-[#C9A86A]">{post.category}</span>
                    <span className="w-1 h-1 rounded-full bg-[#111]/20" />
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="font-serif text-[22px] leading-[1.3] mb-4 group-hover:text-[#C9A86A] transition-colors duration-300">
                    {post.title}
                  </h3>
                  <p className="text-[14px] leading-[1.6] text-[#111]/60">
                    {post.excerpt}
                  </p>
                </Link>
              </FadeIn>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="py-20 text-center text-[#111]/50 text-[14px] tracking-[0.05em]">
              No articles found matching your criteria.
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
