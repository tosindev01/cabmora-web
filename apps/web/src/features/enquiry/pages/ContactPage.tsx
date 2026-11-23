import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

import { MapPin, Phone, Mail, Instagram, Twitter, Linkedin, Facebook } from 'lucide-react';
import { ApiError } from '@cabmora/api-client';
import { useAuth } from '@/shared/auth';
import { Footer, Navigation } from '@/shared/site';
import { FadeIn } from '@cabmora/ui';

import { submitEnquiry } from '@/features/enquiry/api';
import { PhoneField } from '@/features/enquiry/components/PhoneField';
import { SlotPicker } from '@/features/enquiry/components/SlotPicker';
import { DEFAULT_DIAL_ISO, composePhone } from '@/features/enquiry/countries';

/**
 * The select stores a slug; the API stores `event_type` as the words an admin
 * reads in the pipeline. Mapping here keeps "Editorial / Commercial" out of the
 * markup's value attributes and out of the database as "editorial".
 */
const EVENT_TYPE_LABEL: Record<string, string> = {
  wedding: 'Wedding',
  corporate: 'Corporate Event',
  editorial: 'Editorial / Commercial',
  general: 'General Enquiry',
};

export default function ContactPage() {
  /* A returning client books through this same form — the portal's "Book a
     call" sends them here. Recognising them does two things: it saves them
     retyping what we already hold, and it means the address on the enquiry
     is the one their account uses, so the lead attaches to them rather than
     arriving as a stranger with a familiar name.

     The API makes the same decision independently from the session cookie,
     so this is a convenience rather than the mechanism. */
  const { user } = useAuth();
  const isClient = user?.role === 'customer';

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    whatsapp: '',
    subject: '',
    message: '',
  });
  // Kept apart from the typed digits so the field can show a code, a number,
  // and what the two make together.
  const [phoneIso, setPhoneIso] = useState(DEFAULT_DIAL_ISO);
  const [whatsappIso, setWhatsappIso] = useState(DEFAULT_DIAL_ISO);
  // Most people have one number, so the second field is hidden until somebody
  // says otherwise. Asking for the same digits twice is how a form loses the
  // WhatsApp number it was added to collect.
  const [whatsappSameAsPhone, setWhatsappSameAsPhone] = useState(true);
  //: The instant they asked for, or null for "you suggest one".
  const [preferredSlot, setPreferredSlot] = useState<string | null>(null);
  /* When their event is — distinct from the slot above, which is when they
     want to talk to us. The console's triage table orders open leads by
     this, so a wedding three weeks away outranks one next June. Optional:
     plenty of people enquire before they have fixed a date, and a required
     field would make them invent one. */
  const [eventDate, setEventDate] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /* In an effect, not as initial state: `useAuth` resolves the session after
     the first render, so initial state would be empty for everybody. Only
     fields they have not touched are filled — overwriting what somebody is
     part-way through typing because their session arrived late is worse than
     not helping at all. */
  useEffect(() => {
    if (!isClient || !user) return;
    setFormData((prev) => ({
      ...prev,
      first_name: prev.first_name || user.first_name,
      last_name: prev.last_name || user.last_name,
      email: prev.email || user.email,
    }));
  }, [isClient, user]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await submitEnquiry({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        // Omitted rather than sent empty: the API treats the field as absent
        // when nobody gave a number, and "" would show as a blank phone line
        // on the lead rather than no phone line at all.
        phone: composePhone(phoneIso, formData.phone),
        whatsapp: whatsappSameAsPhone
          ? composePhone(phoneIso, formData.phone)
          : composePhone(whatsappIso, formData.whatsapp),
        // `subject` is the select's slug; the pipeline shows the label.
        event_type: EVENT_TYPE_LABEL[formData.subject] ?? formData.subject,
        message: formData.message.trim(),
        // `undefined`, never ''. The API parses this as a datetime, and an
        // empty string is a 422 rather than "no date given".
        event_date: eventDate ? `${eventDate}T00:00:00Z` : undefined,
        preferred_slot: preferredSlot ?? undefined,
      });
      setIsSubmitted(true);
      setFormData({
        // Their own details survive the reset — a client sending a second
        // enquiry should not have to identify themselves again.
        first_name: isClient && user ? user.first_name : '',
        last_name: isClient && user ? user.last_name : '',
        email: isClient && user ? user.email : '',
        phone: '',
        whatsapp: '',
        subject: '',
        message: '',
      });
      setWhatsappSameAsPhone(true);
      setPreferredSlot(null);
      setEventDate('');
    } catch (err) {
      // Never claim success on failure. This form used to show a thank-you
      // after a 1.5s timeout and send nothing, so every enquiry made through
      // it was lost silently — including the ones real visitors sent.
      setError(
        err instanceof ApiError
          ? err.message
          : 'We could not send that just now. Please try again, or email us directly.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-canvas text-ink overflow-x-hidden min-h-screen">
      <Navigation theme="light" />

      <main className="pt-[140px] pb-32">
        <section className="max-w-[1440px] mx-auto px-6 lg:px-14">
          <FadeIn>
            <div className="text-center mb-16 lg:mb-24">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-8 h-px bg-gold" />
                <span className="text-[12.5px] tracking-[0.26em] uppercase text-gold font-medium">
                  Contact Us
                </span>
                <div className="w-8 h-px bg-gold" />
              </div>
              <h1 className="font-serif text-[clamp(40px,5vw,72px)] text-ink font-normal leading-[1.1] mb-8">
                Let's create something
                <br />
                beautiful together.
              </h1>
              <p className="text-ink/60 text-[16px] leading-[1.6] max-w-2xl mx-auto">
                Whether you're planning a wedding in Tuscany, an editorial in Paris, or a corporate
                event in London, we would love to hear from you.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            {/* Left Column: Form */}
            <div className="lg:col-span-7">
              <FadeIn delay={100}>
                {isSubmitted ? (
                  <div className="bg-white border border-ink/5 p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-16 h-16 rounded-full bg-gold/10 text-gold flex items-center justify-center mb-6">
                      <Mail size={28} strokeWidth={1.5} />
                    </div>
                    <h3 className="font-serif text-3xl mb-4">Message Received</h3>
                    <p className="text-ink/60 text-[17px] leading-[1.6] max-w-md mx-auto">
                      Thank you for reaching out. Our team will review your inquiry and get back to
                      you within 24-48 hours.
                    </p>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="mt-8 text-[12px] tracking-[0.16em] uppercase font-semibold text-ink border-b border-ink pb-1 hover:text-gold hover:border-gold transition-colors duration-300"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="bg-white border border-ink/5 p-8 lg:p-12 shadow-sm"
                  >
                    <h3 className="font-serif text-[28px] mb-2">Send an Inquiry</h3>
                    {/* Said out loud, because the alternative is a returning
                        client wondering whether they have just started again
                        as a stranger. This becomes a new enquiry of its own
                        and then its own project — their existing work is not
                        touched. */}
                    {isClient && user ? (
                      <p className="text-[13.5px] text-ink/60 mb-8 leading-relaxed">
                        Signed in as {user.first_name} {user.last_name} — this comes through as a
                        new booking on your account, alongside the work we are already doing for
                        you.
                      </p>
                    ) : (
                      <div className="mb-8" />
                    )}

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label
                            htmlFor="first_name"
                            className="block text-[12px] tracking-[0.14em] uppercase text-ink/60 font-medium mb-3"
                          >
                            First Name
                          </label>
                          <input
                            type="text"
                            id="first_name"
                            name="first_name"
                            required
                            autoComplete="given-name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className="w-full bg-canvas border border-ink/10 px-4 py-3 text-[16px] outline-none focus:border-gold transition-colors duration-300"
                            placeholder="Jane"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="last_name"
                            className="block text-[12px] tracking-[0.14em] uppercase text-ink/60 font-medium mb-3"
                          >
                            Last Name
                          </label>
                          <input
                            type="text"
                            id="last_name"
                            name="last_name"
                            required
                            autoComplete="family-name"
                            value={formData.last_name}
                            onChange={handleChange}
                            className="w-full bg-canvas border border-ink/10 px-4 py-3 text-[16px] outline-none focus:border-gold transition-colors duration-300"
                            placeholder="Doe"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="email"
                            className="block text-[12px] tracking-[0.14em] uppercase text-ink/60 font-medium mb-3"
                          >
                            Email Address
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-canvas border border-ink/10 px-4 py-3 text-[16px] outline-none focus:border-gold transition-colors duration-300"
                            placeholder="jane@example.com"
                          />
                        </div>
                      </div>

                      {/* Both optional, and said so. The studio wants a number
                          to ring people back on, but a required field at first
                          contact is the one people abandon. */}
                      <div className="space-y-4">
                        <PhoneField
                          id="phone"
                          label="Phone Number"
                          hint="(optional)"
                          autoComplete="tel"
                          placeholder="7700 900000"
                          dialIso={phoneIso}
                          onDialChange={setPhoneIso}
                          number={formData.phone}
                          onNumberChange={(value) =>
                            setFormData((prev) => ({ ...prev, phone: value }))
                          }
                        />

                        <label className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={whatsappSameAsPhone}
                            onChange={(e) => setWhatsappSameAsPhone(e.target.checked)}
                            className="mt-0.5 w-4 h-4 accent-gold cursor-pointer"
                          />
                          <span className="text-[14px] text-ink/60 leading-snug">
                            This is also my WhatsApp number
                          </span>
                        </label>

                        {/* Only when they say it is a different number. */}
                        {!whatsappSameAsPhone && (
                          <PhoneField
                            id="whatsapp"
                            label="WhatsApp Number"
                            hint="(optional)"
                            placeholder="7700 900000"
                            dialIso={whatsappIso}
                            onDialChange={setWhatsappIso}
                            number={formData.whatsapp}
                            onNumberChange={(value) =>
                              setFormData((prev) => ({ ...prev, whatsapp: value }))
                            }
                          />
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="subject"
                          className="block text-[12px] tracking-[0.14em] uppercase text-ink/60 font-medium mb-3"
                        >
                          Inquiry Type
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full bg-canvas border border-ink/10 px-4 py-3 text-[16px] outline-none focus:border-gold transition-colors duration-300 appearance-none rounded-none"
                        >
                          <option value="" disabled>
                            Select an option
                          </option>
                          <option value="wedding">Wedding Coverage</option>
                          <option value="corporate">Corporate Event</option>
                          <option value="editorial">Editorial / Commercial</option>
                          <option value="general">General Inquiry</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="event_date"
                          className="block text-[12px] tracking-[0.14em] uppercase text-ink/60 font-medium mb-3"
                        >
                          When is your event?{' '}
                          <span className="normal-case tracking-normal text-ink/40">
                            if you know
                          </span>
                        </label>
                        <input
                          id="event_date"
                          name="event_date"
                          type="date"
                          value={eventDate}
                          onChange={(event) => setEventDate(event.target.value)}
                          /* Today, not yesterday. A date in the past is almost
                             always a mistyped year, and the browser refusing it
                             is kinder than us filing the lead as overdue. */
                          min={new Date().toISOString().slice(0, 10)}
                          className="w-full bg-canvas border border-ink/10 px-4 py-3 text-[16px] outline-none focus:border-gold transition-colors duration-300 rounded-none"
                        />
                        <p className="text-[12px] text-ink/45 mt-2">
                          It helps us tell you straight away whether we are free.
                        </p>
                      </div>

                      <SlotPicker value={preferredSlot} onChange={setPreferredSlot} />

                      <div>
                        <label
                          htmlFor="message"
                          className="block text-[12px] tracking-[0.14em] uppercase text-ink/60 font-medium mb-3"
                        >
                          Project Details
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          required
                          value={formData.message}
                          onChange={handleChange}
                          rows={6}
                          className="w-full bg-canvas border border-ink/10 px-4 py-3 text-[16px] outline-none focus:border-gold transition-colors duration-300 resize-none"
                          placeholder="Please share details about your event, location, date, and any specific requests..."
                        />
                      </div>

                      {/* A failure has to be visible. Without this the form would
                          swallow the error and look like nothing happened — which is
                          how the mock behaved for weeks. */}
                      {error && (
                        <p
                          role="alert"
                          className="border border-danger/40 bg-danger/10 text-danger px-4 py-3 text-[13px]"
                        >
                          {error}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-ink text-canvas py-4 text-[12px] tracking-[0.16em] uppercase font-semibold hover:bg-gold transition-colors duration-300 disabled:opacity-70 flex items-center justify-center gap-3"
                      >
                        {isSubmitting ? 'Sending...' : 'Submit Inquiry'}
                      </button>
                    </div>
                  </form>
                )}
              </FadeIn>
            </div>

            {/* Right Column: Info & Map */}
            <div className="lg:col-span-5 flex flex-col">
              <FadeIn delay={200} className="h-full">
                <div className="bg-ink text-canvas p-8 lg:p-12 h-full flex flex-col">
                  <h3 className="font-serif text-[28px] mb-10">Our Office (Cabmora)</h3>

                  <div className="space-y-8 flex-grow">
                    <div className="flex items-start gap-4">
                      <MapPin size={20} className="text-gold flex-shrink-0 mt-1" />
                      <div>
                        <div className="text-[12px] tracking-[0.18em] uppercase text-gold font-semibold mb-2">
                          Visit Us
                        </div>
                        <p className="text-canvas/70 leading-[1.6] text-[17px]">
                          Bartle House, Oxford Court
                          <br />
                          Manchester, M2 3WQ
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <Mail size={20} className="text-gold flex-shrink-0 mt-1" />
                      <div>
                        <div className="text-[12px] tracking-[0.18em] uppercase text-gold font-semibold mb-2">
                          Email Us
                        </div>
                        <a
                          href="mailto:hello@cabmoramedia.com"
                          className="text-canvas/70 hover:text-canvas transition-colors duration-300 text-[17px]"
                        >
                          hello@cabmoramedia.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <Phone size={20} className="text-gold flex-shrink-0 mt-1" />
                      <div>
                        <div className="text-[12px] tracking-[0.18em] uppercase text-gold font-semibold mb-2">
                          Call Us
                        </div>
                        <a
                          href="tel:+447780105876"
                          className="text-canvas/70 hover:text-canvas transition-colors duration-300 text-[17px]"
                        >
                          +44 77 8010 5876
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="pt-10 mt-10 border-t border-canvas/10">
                    <div className="text-[12px] tracking-[0.18em] uppercase text-gold font-semibold mb-6">
                      Follow Our Work
                    </div>
                    <div className="flex items-center gap-5 text-canvas/60">
                      <a
                        href="/"
                        className="hover:text-gold transition-colors duration-300"
                        aria-label="Instagram"
                      >
                        <Instagram size={20} />
                      </a>
                      <a
                        href="/"
                        className="hover:text-gold transition-colors duration-300"
                        aria-label="Facebook"
                      >
                        <Facebook size={20} />
                      </a>
                      <a
                        href="/"
                        className="hover:text-gold transition-colors duration-300"
                        aria-label="Twitter"
                      >
                        <Twitter size={20} />
                      </a>
                      <a
                        href="/"
                        className="hover:text-gold transition-colors duration-300"
                        aria-label="LinkedIn"
                      >
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
            <div className="w-full aspect-[21/9] min-h-[400px] bg-mist relative overflow-hidden grayscale contrast-125 opacity-90">
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
