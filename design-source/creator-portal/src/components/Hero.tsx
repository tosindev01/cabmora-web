import { motion } from "motion/react";

export function Hero() {
  return (
    <section id="hero-section" className="relative h-screen flex items-center justify-center overflow-hidden">
      <div id="hero-background-container" className="absolute inset-0 z-0">
        <img 
          id="hero-background-image"
          src="https://images.unsplash.com/photo-1492633423870-43d1cd2a4c24?auto=format&fit=crop&q=80" 
          alt="Hero background" 
          className="w-full h-full object-cover"
        />
        <div id="hero-overlay" className="absolute inset-0 bg-black/40" />
      </div>
      
      <div id="hero-content" className="relative z-10 text-center text-white px-4">
        <motion.h1 
          id="hero-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="text-6xl md:text-8xl lg:text-9xl font-light tracking-tighter mb-6"
        >
          Capturing Emotion
        </motion.h1>
        <motion.p 
          id="hero-subtitle"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="text-lg md:text-xl font-light max-w-2xl mx-auto opacity-90"
        >
          An elegant digital platform enhancing client collaboration for premium photography and videography services.
        </motion.p>
      </div>
    </section>
  );
}
