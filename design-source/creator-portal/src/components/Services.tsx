import { motion } from "motion/react";
import { Camera, Image as ImageIcon, Video } from "lucide-react";

const SERVICES_DATA = [
  { icon: Camera, title: "Photography", desc: "Editorial, portrait, and event photography crafted with an eye for raw emotion and natural beauty." },
  { icon: Video, title: "Videography", desc: "Cinematic storytelling that brings your most cherished moments to life in motion." },
  { icon: ImageIcon, title: "Art Direction", desc: "Collaborative creative direction to ensure your vision is executed flawlessly from concept to final edit." }
];

export function Services() {
  return (
    <section id="services-section" className="py-32 bg-primary text-primary-foreground">
      <div id="services-container" className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div 
          id="services-header"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20 text-center"
        >
          <h2 id="services-title" className="text-4xl md:text-5xl font-light tracking-tight mb-6 text-white">Our Expertise</h2>
          <p id="services-subtitle" className="text-muted-foreground max-w-2xl mx-auto text-lg">Delivering seamless, emotionally engaging experiences through lens and light.</p>
        </motion.div>

        <div id="services-grid" className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {SERVICES_DATA.map((service, idx) => (
            <motion.div 
              id={`service-card-${idx}`}
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.2 }}
              className="flex flex-col items-center text-center space-y-6"
            >
              <div id={`service-icon-wrapper-${idx}`} className="w-16 h-16 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                <service.icon id={`service-icon-${idx}`} className="w-6 h-6" />
              </div>
              <h3 id={`service-title-${idx}`} className="text-2xl font-medium text-white">{service.title}</h3>
              <p id={`service-desc-${idx}`} className="text-muted-foreground leading-relaxed">
                {service.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
