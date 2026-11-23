import { useState, FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, Clock, ShieldCheck } from 'lucide-react';
import LogoWhite from '@/assets/cabmora_white_logo.svg';
import { useCreatorApplication } from '@/features/flow/hooks/useCreatorApplication';
import { CrossEcosystemBanner } from '@/shared/site';

export default function FlowApplyPage() {
  const [searchParams] = useSearchParams();
  const initialPlan = searchParams.get('plan') || 'pro';

  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [studioName, setStudioName] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [email, setEmail] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [discipline, setDiscipline] = useState('wedding');
  const [annualVolume, setAnnualVolume] = useState('15-30');
  const [storageNeeds, setStorageNeeds] = useState('2.5TB');
  const [bottleneck, setBottleneck] = useState('storage_cost');
  const [agreedTerms, setAgreedTerms] = useState(true);

  const { receipt, submitting, error, submit } = useCreatorApplication();
  const isSubmitted = receipt !== null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await submit({
      studio_name: studioName,
      applicant_name: applicantName,
      email,
      portfolio_url: portfolioUrl || undefined,
      discipline,
      annual_volume: annualVolume,
      storage_needs: storageNeeds,
      bottleneck,
      plan: selectedPlan,
    });
    if (ok) window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-flow-900 text-canvas font-sans overflow-x-hidden selection:bg-gold selection:text-ink">
      {/* Top Bar */}
      <header className="border-b border-canvas/10 bg-flow-900/90 backdrop-blur-md sticky top-0 z-40">
        {/* Banner cross-linking to Cabmora Media / Studio */}
        <CrossEcosystemBanner target="media" />

        <div className="max-w-[1200px] mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/flow" className="flex items-center gap-2.5">
            <img src={LogoWhite} alt="Cabmora Logo" className="h-8 w-auto object-contain" />
            <div className="flex items-center gap-1.5 pl-2 border-l border-canvas/20">
              <span className="text-[13px] tracking-[0.25em] font-semibold text-gold uppercase font-mono">
                FLOW
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4 text-xs tracking-wider uppercase">
            <span className="hidden sm:inline text-white/40">Already an approved studio?</span>
            <Link to="/flow/login" className="text-gold font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main className="py-14 px-6 max-w-[900px] mx-auto">
        {!isSubmitted ? (
          <div>
            {/* Header copy */}
            <div className="text-center max-w-[680px] mx-auto mb-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-[12px] tracking-[0.25em] uppercase text-gold font-semibold mb-4">
                <ShieldCheck size={14} className="text-gold" />
                Curated Creator Onboarding
              </div>
              <h1 className="font-serif text-[clamp(32px,4vw,44px)] font-normal text-white leading-tight mb-3">
                Apply for Cabmora Flow Studio Access
              </h1>
              <p className="text-[15.5px] text-white/70 leading-relaxed">
                To guarantee zero 4K video transcoding slowdowns and unthrottled cloud bandwidth, we
                approve studios in weekly cohorts. Approved creators receive a 14-day full trial
                with password setup link.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-flow-900 border border-white/10 rounded-2xl p-8 sm:p-12 shadow-2xl space-y-8"
            >
              {/* Step 1: Select Starting Tier */}
              <div>
                <label className="block text-[13px] tracking-[0.2em] uppercase font-semibold text-gold mb-3">
                  Step 1: Choose Your Trial Tier (Includes 14-Day Free Access)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      id: 'starter',
                      name: 'Starter Creator',
                      price: '£19/mo',
                      cap: '500 GB RAW Vault',
                    },
                    {
                      id: 'pro',
                      name: 'Pro Studio',
                      price: '£49/mo',
                      cap: '2.5 TB Fast + 10 TB Cold',
                      popular: true,
                    },
                    {
                      id: 'agency',
                      name: 'Studio Agency',
                      price: '£99/mo',
                      cap: '10 TB Fast + 50 TB Cold',
                    },
                  ].map((tier) => (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedPlan(tier.id)}
                      className={`cursor-pointer p-4 rounded-xl border transition-all text-left relative ${
                        selectedPlan === tier.id
                          ? 'border-gold bg-gold/10 text-white shadow'
                          : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20'
                      }`}
                    >
                      {tier.popular && (
                        <span className="absolute -top-2.5 right-3 px-2 py-0.5 bg-gold text-flow-900 font-bold text-[11px] uppercase tracking-wider rounded">
                          Recommended
                        </span>
                      )}
                      <p className="font-serif text-[17px] text-white font-medium">{tier.name}</p>
                      <p className="text-[13.5px] text-gold font-mono mt-0.5">{tier.price}</p>
                      <p className="text-[12.5px] text-white/60 mt-2">{tier.cap}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2: Studio & Contact Info */}
              <div className="space-y-5 pt-4 border-t border-white/10">
                <label className="block text-[13px] tracking-[0.2em] uppercase font-semibold text-gold">
                  Step 2: Studio & Creative Portfolio Details
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[12.5px] uppercase tracking-wider text-white/70 mb-1.5 font-medium">
                      Studio or Brand Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={studioName}
                      onChange={(e) => setStudioName(e.target.value)}
                      placeholder="e.g. Luminary Wedding Films"
                      className="w-full px-4 py-3 bg-flow-950 border border-white/15 rounded-lg text-[15px] text-white focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-[12.5px] uppercase tracking-wider text-white/70 mb-1.5 font-medium">
                      Lead Creator / Applicant Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder="e.g. Oliver Sinclair"
                      className="w-full px-4 py-3 bg-flow-950 border border-white/15 rounded-lg text-[15px] text-white focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[12.5px] uppercase tracking-wider text-white/70 mb-1.5 font-medium">
                      Business Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="oliver@luminaryfilms.co.uk"
                      className="w-full px-4 py-3 bg-flow-950 border border-white/15 rounded-lg text-[15px] text-white focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-[12.5px] uppercase tracking-wider text-white/70 mb-1.5 font-medium">
                      Portfolio or Instagram URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://instagram.com/luminaryfilms"
                      className="w-full px-4 py-3 bg-flow-950 border border-white/15 rounded-lg text-[15px] text-white focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Creative Profile & Infrastructure Needs */}
              <div className="space-y-5 pt-4 border-t border-white/10">
                <label className="block text-[13px] tracking-[0.2em] uppercase font-semibold text-gold">
                  Step 3: Creative Discipline & Production Volume
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-[12.5px] uppercase tracking-wider text-white/70 mb-1.5 font-medium">
                      Primary Discipline
                    </label>
                    <select
                      value={discipline}
                      onChange={(e) => setDiscipline(e.target.value)}
                      className="w-full px-4 py-3 bg-flow-950 border border-white/15 rounded-lg text-[14.5px] text-white focus:outline-none focus:border-gold"
                    >
                      <option value="wedding">Wedding Cinematography</option>
                      <option value="photography">Editorial Photography</option>
                      <option value="commercial">Commercial Video & Brand</option>
                      <option value="drone">Aerial & Drone Specialist</option>
                      <option value="multicam">Multi-Cam & Event Studio</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12.5px] uppercase tracking-wider text-white/70 mb-1.5 font-medium">
                      Annual Client Shoots
                    </label>
                    <select
                      value={annualVolume}
                      onChange={(e) => setAnnualVolume(e.target.value)}
                      className="w-full px-4 py-3 bg-flow-950 border border-white/15 rounded-lg text-[14.5px] text-white focus:outline-none focus:border-gold"
                    >
                      <option value="1-10">1 – 10 shoots / year</option>
                      <option value="15-30">15 – 30 shoots / year</option>
                      <option value="30-60">30 – 60 shoots / year</option>
                      <option value="60+">60+ shoots (High Volume)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12.5px] uppercase tracking-wider text-white/70 mb-1.5 font-medium">
                      Est. Cloud Storage
                    </label>
                    <select
                      value={storageNeeds}
                      onChange={(e) => setStorageNeeds(e.target.value)}
                      className="w-full px-4 py-3 bg-flow-950 border border-white/15 rounded-lg text-[14.5px] text-white focus:outline-none focus:border-gold"
                    >
                      <option value="500GB">500 GB</option>
                      <option value="2.5TB">2.5 TB (Standard)</option>
                      <option value="10TB">10 TB (Archive)</option>
                      <option value="25TB+">25 TB+ (Enterprise)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[12.5px] uppercase tracking-wider text-white/70 mb-1.5 font-medium">
                    Biggest Current Operational Bottleneck
                  </label>
                  <select
                    value={bottleneck}
                    onChange={(e) => setBottleneck(e.target.value)}
                    className="w-full px-4 py-3 bg-flow-950 border border-white/15 rounded-lg text-[14.5px] text-white focus:outline-none focus:border-gold"
                  >
                    <option value="storage_cost">
                      Skyrocketing cloud storage & Dropbox prices
                    </option>
                    <option value="compression">
                      Vimeo/YouTube 4K compression ruining video deliverables
                    </option>
                    <option value="invoicing">
                      Chasing bank transfers & fragmented client invoicing
                    </option>
                    <option value="branding">
                      Lack of white-label luxury portal for high-end couples
                    </option>
                  </select>
                </div>
              </div>

              {/* Terms check */}
              <div className="pt-2 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  required
                  className="mt-1 accent-gold w-4 h-4"
                />
                <label
                  htmlFor="terms"
                  className="text-[13.5px] text-white/70 leading-relaxed cursor-pointer"
                >
                  I confirm I am an active visual artist/studio and agree to receive a secure
                  password setup link upon application approval. No credit card is required to
                  submit.
                </label>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                {error && (
                  <p
                    role="alert"
                    className="mb-4 text-center text-[13px] text-danger bg-danger/10 border border-danger/30 rounded-lg py-3 px-4"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  aria-busy={submitting}
                  className="w-full py-4 bg-gold text-flow-900 font-bold text-[13.5px] tracking-[0.2em] uppercase hover:bg-gold-dark transition-all duration-300 shadow-xl flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span>{submitting ? 'Sending…' : 'Submit application'}</span>
                  {!submitting && <ArrowRight size={17} />}
                </button>
                {/* Two working days, not 24 hours, and no "instant setup
                    link" — applications are read by a person, and promising
                    otherwise is a promise the review queue cannot keep. */}
                <p className="text-center text-[12.5px] text-white/50 mt-3">
                  Applications are reviewed by hand, usually within two working days.
                </p>
              </div>
            </form>
          </div>
        ) : (
          /* Application Submitted & Approval Simulation */
          <div className="bg-flow-900 border border-gold/40 rounded-2xl p-8 sm:p-12 text-center max-w-[720px] mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-gold/20 border border-gold/50 flex items-center justify-center mx-auto mb-6">
              <Check size={32} className="text-gold" />
            </div>

            <span className="text-[12.5px] tracking-[0.3em] uppercase text-gold font-semibold block mb-2 font-mono">
              APPLICATION RECEIVED & LOGGED
            </span>
            <h2 className="font-serif text-[34px] text-white font-normal mb-4">
              Welcome to the Cohort, {applicantName || 'Creator'}
            </h2>
            <p className="text-[16px] text-white/75 leading-relaxed mb-8 max-w-[540px] mx-auto">
              Your application for{' '}
              <span className="text-white font-semibold">{receipt?.studio_name}</span> on the{' '}
              <span className="text-gold font-semibold">{selectedPlan.toUpperCase()} Plan</span> has
              been recorded.
            </p>

            {/* What actually happens next.
                The designer's version generated an invite token in the
                browser, said it had been "dispatched to your registered
                email", and offered a button straight to password setup. None
                of that was real: applications are reviewed by a person, and a
                studio that had not been approved would have been told it had.
                This says the true thing instead. */}
            <div className="bg-flow-950 border border-gold/25 rounded-xl p-6 mb-8 text-left">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10 mb-4">
                <Clock size={15} className="text-gold" />
                <span className="text-[13px] uppercase tracking-wider text-gold font-semibold">
                  What happens next
                </span>
              </div>

              <ol className="space-y-3 text-[14px] text-white/75 leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-gold font-semibold shrink-0">1.</span>
                  <span>
                    We&rsquo;ve emailed <span className="text-gold">{email || 'your address'}</span>{' '}
                    to confirm we have your application.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gold font-semibold shrink-0">2.</span>
                  <span>
                    Someone reviews it by hand &mdash; usually within two working days. We look at
                    every studio properly rather than letting anyone sign up.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gold font-semibold shrink-0">3.</span>
                  <span>
                    If you&rsquo;re approved, you&rsquo;ll get a link to choose a password and your
                    studio workspace opens.
                  </span>
                </li>
              </ol>
            </div>

            <div className="flex items-center justify-center gap-6 text-[13px] text-white/50">
              <Link to="/flow" className="hover:text-white transition-colors">
                Back to Flow
              </Link>
              <span>•</span>
              <Link to="/media" className="hover:text-white transition-colors">
                Cabmora Media
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
