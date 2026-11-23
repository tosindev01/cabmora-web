import { motion } from "motion/react";

const WORKS = [
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1604904612715-47bf9d9bc670?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1518115250426-1d1ce3fc11e8?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1588820465561-2675971ea944?auto=format&fit=crop&q=80"
];

export function Gallery() {
  return (
    <section id="gallery-section" className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
      <motion.div 
        id="gallery-header"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="mb-16"
      >
        <h2 id="gallery-title" className="text-4xl font-light tracking-tight mb-4">Selected Works</h2>
        <div id="gallery-divider" className="w-16 h-px bg-foreground" />
      </motion.div>

      <div id="gallery-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {WORKS.map((src, idx) => (
          <motion.div 
            id={`gallery-item-${idx}`}
            key={idx}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: (idx % 3) * 0.1 }}
            className={`group relative overflow-hidden bg-muted aspect-[4/5] rounded-[var(--radius)] ${idx === 3 || idx === 4 ? 'md:col-span-2 lg:col-span-1' : ''}`}
          >
            <img 
              id={`gallery-image-${idx}`}
              src={src} 
              alt={`Portfolio piece ${idx + 1}`} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div id={`gallery-overlay-${idx}`} className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
