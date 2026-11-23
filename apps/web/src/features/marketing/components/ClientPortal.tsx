import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FadeIn, SectionHeading } from '@cabmora/ui';
import { PORTAL_FEATURES, PORTAL_PHOTOS } from '@/features/marketing/data';

const SIDEBAR_ITEMS = [
  { label: 'Gallery', glyph: '▣', active: true, count: '120' },
  { label: 'Favorites', glyph: '♡', active: false, count: '18' },
  { label: 'Approved', glyph: '✓', active: false, count: '45' },
  { label: 'Downloads', glyph: '↓', active: false, count: null },
];

export function ClientPortal() {
  return (
    <section className="py-28 lg:py-44 bg-ink overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Text column */}
          <FadeIn direction="left">
            <SectionHeading
              eyebrow="Client Platform"
              tone="dark"
              headingClassName="font-serif text-[clamp(40px,5.5vw,72px)] leading-[0.9] mb-8"
            >
              Your private
              <br />
              <em>gallery awaits</em>
            </SectionHeading>
            <p className="text-canvas/48 text-[17px] leading-[1.75] mb-10 max-w-[400px]">
              Every Cabmora client receives a beautifully designed digital space, built for
              collaboration, approval, and the joy of rediscovery.
            </p>
            <div className="space-y-4 mb-10">
              {PORTAL_FEATURES.map((f) => (
                <div key={f.label} className="flex items-center gap-4">
                  <div className="w-[30px] h-[30px] border border-gold/35 flex items-center justify-center flex-shrink-0">
                    <f.icon size={12} className="text-gold" />
                  </div>
                  <span className="text-canvas/55 text-[13.5px]">{f.label}</span>
                </div>
              ))}
            </div>
            {/* Sign-in, not the dashboard: whoever is reading the marketing
                page is not signed in, and the route guard would send them
                here anyway. */}
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 text-[11.5px] tracking-[0.22em] uppercase text-gold font-medium border-b border-gold/30 pb-1 hover:border-gold transition-colors duration-300"
            >
              Explore the portal
            </Link>
          </FadeIn>

          {/* Mockup column */}
          <FadeIn direction="right" delay={150} className="relative">
            <div className="rounded-2xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.7)] border border-canvas/8">
              {/* Browser chrome */}
              <div className="bg-[#1C1C1C] px-4 py-3.5 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#27C840]" />
                </div>
                <div className="flex-1 bg-[#2C2C2C] rounded-md px-3 py-1.5 flex items-center gap-2 mx-2">
                  <div className="w-2.5 h-2.5 rounded-full border border-canvas/20 flex-shrink-0" />
                  <span className="text-canvas/35 text-[10.5px] truncate">
                    portal.cabmora.com/gallery/elena-marco
                  </span>
                </div>
              </div>

              {/* App shell */}
              <div className="bg-panel-900 flex overflow-hidden" style={{ height: '440px' }}>
                {/* Sidebar */}
                <div className="w-[190px] bg-panel-950 border-r border-canvas/5 flex-shrink-0 flex flex-col p-5">
                  <div className="flex items-center gap-2.5 mb-8">
                    <div className="w-5 h-5 border border-gold/60 flex items-center justify-center">
                      <div className="w-[7px] h-[7px] bg-gold" />
                    </div>
                    <span className="text-canvas/70 text-[10.5px] tracking-[0.22em] uppercase font-medium">
                      Cabmora
                    </span>
                  </div>

                  <div className="text-canvas/22 text-[9px] tracking-[0.22em] uppercase mb-3 font-medium">
                    Elena &amp; Marco
                  </div>

                  {/* Divs, not buttons. This is a picture of the portal, and
                      as buttons these put five tab stops in the page that do
                      nothing when a keyboard user reaches them. */}
                  {SIDEBAR_ITEMS.map((item) => (
                    <div
                      key={item.label}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg mb-1 text-left ${
                        item.active ? 'bg-gold/14 text-gold' : 'text-canvas/28'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs">{item.glyph}</span>
                        <span className="text-[11px]">{item.label}</span>
                      </div>
                      {item.count && (
                        <span
                          className={`text-[9px] ${item.active ? 'text-gold/70' : 'text-canvas/20'}`}
                        >
                          {item.count}
                        </span>
                      )}
                    </div>
                  ))}

                  <div className="mt-auto">
                    <div className="bg-panel-800 rounded-xl p-3.5 border border-canvas/5">
                      <div className="text-[9px] tracking-[0.2em] uppercase text-canvas/28 mb-2.5 font-medium">
                        Review Progress
                      </div>
                      <div className="h-1 bg-canvas/8 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-gold rounded-full" style={{ width: '68%' }} />
                      </div>
                      <div className="text-[9px] text-canvas/25">82 of 120 reviewed</div>
                    </div>
                  </div>
                </div>

                {/* Main panel */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="border-b border-canvas/5 px-5 py-3 flex items-center gap-3 flex-shrink-0">
                    <span className="text-canvas/55 text-[11px] font-medium">All Photos</span>
                    <div className="flex-1" />
                    <span className="text-canvas/25 text-[10px]">120 photos</span>
                    <div className="w-6 h-6 bg-canvas/8 rounded flex items-center justify-center">
                      <div className="grid grid-cols-2 gap-[2px] w-2.5 h-2.5">
                        {[0, 1, 2, 3].map((x) => (
                          <div key={x} className="bg-canvas/45 rounded-[1px]" />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 p-4 overflow-hidden">
                    <div className="grid grid-cols-4 gap-2">
                      {PORTAL_PHOTOS.map((photo, i) => (
                        <div
                          key={photo.id}
                          className="relative overflow-hidden bg-panel-800 group cursor-pointer"
                          style={{ aspectRatio: '1' }}
                        >
                          <img
                            src={`https://images.unsplash.com/${photo.id}?w=160&h=160&fit=crop&auto=format`}
                            alt={`Gallery photo ${i + 1}`}
                            className="w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-opacity duration-200"
                          />
                          {photo.status === 'approved' && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] text-white font-bold">
                              ✓
                            </div>
                          )}
                          {photo.status === 'favorite' && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-gold flex items-center justify-center text-[8px]">
                              ♡
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating notification card */}
            <div className="absolute -bottom-4 -right-2 lg:-right-8 bg-canvas shadow-[0_12px_40px_rgba(0,0,0,0.2)] rounded-2xl p-4 w-[210px]">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0">
                  <Heart size={15} className="text-gold" />
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-ink mb-0.5">Gallery Ready</div>
                  <div className="text-[10.5px] text-ink/40 leading-[1.4]">
                    Your photos are ready to review and approve
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 pl-12">
                <div className="flex-1 h-1 bg-ink/6 rounded-full">
                  <div className="h-full w-[38%] bg-gold rounded-full" />
                </div>
                <span className="text-[9px] text-ink/35">38%</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
