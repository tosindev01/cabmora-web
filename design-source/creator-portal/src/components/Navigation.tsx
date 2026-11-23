import { motion } from "motion/react";
import { Camera } from "lucide-react";

export function Navigation() {
  return (
    <nav id="main-nav" className="fixed w-full z-50 mix-blend-difference text-white p-6 flex justify-between items-center">
      <motion.div 
        id="logo-container"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex items-center gap-2 text-2xl font-medium tracking-tighter"
      >
        <Camera id="logo-icon" className="w-6 h-6" />
        <span id="logo-text">cabmora.</span>
      </motion.div>
      <motion.ul 
        id="nav-links"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", staggerChildren: 0.1 }}
        className="flex gap-8 text-sm uppercase tracking-widest hidden md:flex"
      >
        <li id="nav-work" className="cursor-pointer hover:opacity-70 transition-opacity flex items-center min-h-[44px]">Work</li>
        <li id="nav-services" className="cursor-pointer hover:opacity-70 transition-opacity flex items-center min-h-[44px]">Services</li>
        <li id="nav-contact" className="cursor-pointer hover:opacity-70 transition-opacity flex items-center min-h-[44px]">Contact</li>
      </motion.ul>
    </nav>
  );
}
