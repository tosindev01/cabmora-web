import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Instagram, Twitter, Linkedin, Facebook } from "lucide-react";
import { Navigation, Footer, FadeIn } from "../App";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1500);
  };

  return (
    <div className="bg-[#FAF9F6] text-[#111] overflow-x-hidden min-h-screen">
      <Navigation theme="light" />

      <main className="pt-[140px] pb-32">
        <section className="max-w-[1440px] mx-auto px-6 lg:px-14">
          
          <FadeIn>
            <div className="text-center mb-16 lg:mb-24">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-8 h-px bg-[#C9A86A]" />
                <span className="text-[11px] tracking-[0.32em] uppercase text-[#C9A86A] font-medium">
                  Contact Us
                </span>
                <div className="w-8 h-px bg-[#C9A86A]" />
              </div>
              <h1 className="font-serif text-[clamp(40px,5vw,72px)] text-[#111] font-normal leading-[1.1] mb-8">
                Let's create something<br />beautiful together.
              </h1>
              <p className="text-[#111]/60 text-[16px] leading-[1.6] max-w-2xl mx-auto">
                Whether you're planning a wedding in Tuscany, an editorial in Paris, or a corporate event in London, we would love to hear from you.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            
            {/* Left Column: Form */}
            <div className="lg:col-span-7">
              <FadeIn delay={100}>
                {isSubmitted ? (
                  <div className="bg-white border border-[#111]/5 p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-16 h-16 rounded-full bg-[#C9A86A]/10 text-[#C9A86A] flex items-center justify-center mb-6">
                      <Mail size={28} strokeWidth={1.5} />
                    </div>
                    <h3 className="font-serif text-3xl mb-4">Message Received</h3>
                    <p className="text-[#111]/60 text-[15px] leading-[1.6] max-w-md mx-auto">
                      Thank you for reaching out. Our team will review your inquiry and get back to you within 24-48 hours.
                    </p>
                    <button 
                      onClick={() => setIsSubmitted(false)}
                      className="mt-8 text-[11px] tracking-[0.18em] uppercase font-semibold text-[#111] border-b border-[#111] pb-1 hover:text-[#C9A86A] hover:border-[#C9A86A] transition-colors duration-300"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="bg-white border border-[#111]/5 p-8 lg:p-12 shadow-sm">
                    <h3 className="font-serif text-[28px] mb-8">Send an Inquiry</h3>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-[11px] tracking-[0.15em] uppercase text-[#111]/60 font-medium mb-3">
                            Full Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-[#FAF9F6] border border-[#111]/10 px-4 py-3 text-[14px] outline-none focus:border-[#C9A86A] transition-colors duration-300"
                            placeholder="Jane Doe"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-[11px] tracking-[0.15em] uppercase text-[#111]/60 font-medium mb-3">
                            Email Address
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-[#FAF9F6] border border-[#111]/10 px-4 py-3 text-[14px] outline-none focus:border-[#C9A86A] transition-colors duration-300"
                            placeholder="jane@example.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-[11px] tracking-[0.15em] uppercase text-[#111]/60 font-medium mb-3">
                          Inquiry Type
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full bg-[#FAF9F6] border border-[#111]/10 px-4 py-3 text-[14px] outline-none focus:border-[#C9A86A] transition-colors duration-300 appearance-none rounded-none"
                        >
                          <option value="" disabled>Select an option</option>
                          <option value="wedding">Wedding Coverage</option>
                          <option value="corporate">Corporate Event</option>
                          <option value="editorial">Editorial / Commercial</option>
                          <option value="general">General Inquiry</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-[11px] tracking-[0.15em] uppercase text-[#111]/60 font-medium mb-3">
                          Project Details
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          required
                          value={formData.message}
                          onChange={handleChange}
                          rows={6}
                          className="w-full bg-[#FAF9F6] border border-[#111]/10 px-4 py-3 text-[14px] outline-none focus:border-[#C9A86A] transition-colors duration-300 resize-none"
                          placeholder="Please share details about your event, location, date, and any specific requests..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#111] text-[#FAF9F6] py-4 text-[11px] tracking-[0.18em] uppercase font-semibold hover:bg-[#C9A86A] transition-colors duration-300 disabled:opacity-70 flex items-center justify-center gap-3"
                      >
                        {isSubmitting ? "Sending..." : "Submit Inquiry"}
                      </button>
                    </div>
                  </form>
                )}
              </FadeIn>
            </div>

            {/* Right Column: Info & Map */}
            <div className="lg:col-span-5 flex flex-col">
              <FadeIn delay={200} className="h-full">
                <div className="bg-[#111] text-[#FAF9F6] p-8 lg:p-12 h-full flex flex-col">
                  <h3 className="font-serif text-[28px] mb-10">Our Office</h3>

                  <div className="space-y-8 flex-grow">
                    <div className="flex items-start gap-4">
                      <MapPin size={20} className="text-[#C9A86A] flex-shrink-0 mt-1" />
                      <div>
                        <div className="text-[10px] tracking-[0.2em] uppercase text-[#C9A86A] font-semibold mb-2">Visit Us</div>
                        <p className="text-[#FAF9F6]/70 leading-[1.6] text-[15px]">
                          124 Baker Street<br />
                          Marylebone, London<br />
                          W1U 6TY, United Kingdom
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <Mail size={20} className="text-[#C9A86A] flex-shrink-0 mt-1" />
                      <div>
                        <div className="text-[10px] tracking-[0.2em] uppercase text-[#C9A86A] font-semibold mb-2">Email Us</div>
                        <a href="mailto:hello@cabmora.com" className="text-[#FAF9F6]/70 hover:text-[#FAF9F6] transition-colors duration-300 text-[15px]">
                          hello@cabmora.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <Phone size={20} className="text-[#C9A86A] flex-shrink-0 mt-1" />
                      <div>
                        <div className="text-[10px] tracking-[0.2em] uppercase text-[#C9A86A] font-semibold mb-2">Call Us</div>
                        <a href="tel:+442079460958" className="text-[#FAF9F6]/70 hover:text-[#FAF9F6] transition-colors duration-300 text-[15px]">
                          +44 20 7946 0958
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="pt-10 mt-10 border-t border-[#FAF9F6]/10">
                    <div className="text-[10px] tracking-[0.2em] uppercase text-[#C9A86A] font-semibold mb-6">Follow Our Work</div>
                    <div className="flex items-center gap-5 text-[#FAF9F6]/60">
                      <a href="/" className="hover:text-[#C9A86A] transition-colors duration-300" aria-label="Instagram">
                        <Instagram size={20} />
                      </a>
                      <a href="/" className="hover:text-[#C9A86A] transition-colors duration-300" aria-label="Facebook">
                        <Facebook size={20} />
                      </a>
                      <a href="/" className="hover:text-[#C9A86A] transition-colors duration-300" aria-label="Twitter">
                        <Twitter size={20} />
                      </a>
                      <a href="/" className="hover:text-[#C9A86A] transition-colors duration-300" aria-label="LinkedIn">
                        <Linkedin size={20} />
                      </a>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
            
          </div>
        </section>

        {/* Map Section */}
        <section className="mt-24 max-w-[1440px] mx-auto px-6 lg:px-14">
          <FadeIn delay={300}>
            <div className="w-full aspect-[21/9] min-h-[400px] bg-[#EAEAEA] relative overflow-hidden grayscale contrast-125 opacity-90">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2482.6820689977054!2d-0.15934662300062778!3d51.51897287181657!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48761ace198f3ef3%3A0x633e2dd75a96fec0!2sBaker%20St%2C%20London%2C%20UK!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              />
            </div>
          </FadeIn>
        </section>

      </main>

      <Footer />
    </div>
  );
}
