import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Send,
  ArrowUpRight,
  Bot,
  ImagePlus,
  MapPin,
  Clock,
  AlertTriangle,
  CloudSun,
  X,
  Eye,
} from 'lucide-react';
import { Modal } from '@cabmora/ui';
import {
  collaborationApi,
  type BriefingActionItemDto,
  type ClientBriefingDto,
} from '@cabmora/api-client';
import {
  PROJECT_WEATHER_FORECASTS,
  type NextProjectWeatherForecast,
} from '@/shared/collaboration/studioWorkspaceStore';

interface ClientAiImage {
  url: string;
  caption: string;
  tag: string;
}

interface ClientChatMessage {
  id: string;
  sender: 'ai' | 'client';
  text: string;
  userImages?: string[];
  aiImages?: ClientAiImage[];
  weather?: NextProjectWeatherForecast;
  venueCard?: {
    projectTitle: string;
    venue: string;
    distanceKm: number;
    travelTime: string;
    deadlineWarning: string;
  };
  links?: BriefingActionItemDto[];
}

interface ClientAiAssistantPanelProps {
  briefing: ClientBriefingDto;
  compact?: boolean;
}

const CLIENT_GALLERY_PREVIEWS: ClientAiImage[] = [
  {
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&h=600&fit=crop',
    caption: 'Released Proof #14 — Golden Hour Ridge (Ready for Your Approval)',
    tag: 'Released Proof',
  },
  {
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&h=600&fit=crop',
    caption: 'Released Proof #22 — Editorial Portrait Select',
    tag: 'Album Select',
  },
];

const CLIENT_QUICK_PROMPTS = [
  'Show my project countdown & venue distance',
  'Preview my released gallery photos',
  'Any project deadline warnings?',
  'Weather forecast for my shoot',
];

export function ClientAiAssistantPanel({
  briefing,
  compact = false,
}: ClientAiAssistantPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [messages, setMessages] = useState<ClientChatMessage[]>(() => [
    {
      id: 'client-welcome-ai',
      sender: 'ai',
      text: briefing.summary_text,
      venueCard: {
        projectTitle: briefing.next_project_title,
        venue: briefing.next_project_venue,
        distanceKm: briefing.venue_distance_km,
        travelTime: briefing.venue_travel_time,
        deadlineWarning: briefing.deadline_warning,
      },
      links: briefing.action_items.slice(0, 2),
    },
  ]);
  const [input, setInput] = useState('');
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<ClientAiImage | null>(null);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAttachedImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const buildClientAiReply = (
    query: string,
    imgs: string[],
  ): Omit<ClientChatMessage, 'id' | 'sender'> => {
    const q = query.toLowerCase();

    if (imgs.length > 0) {
      return {
        text: `Thank you for sharing ${imgs.length} inspiration/reference image(s)! I have attached them to your project moodboard for your lead photographer Sarah Cabmora and matched them against your released gallery selects:`,
        aiImages: CLIENT_GALLERY_PREVIEWS,
      };
    }

    if (
      q.includes('distance') ||
      q.includes('venue') ||
      q.includes('countdown') ||
      q.includes('deadline') ||
      q.includes('warning')
    ) {
      return {
        text: `Your project venue (${briefing.next_project_venue}) is ${briefing.venue_distance_km} km away (${briefing.venue_travel_time}). Please note the active deadline warning below:`,
        venueCard: {
          projectTitle: briefing.next_project_title,
          venue: briefing.next_project_venue,
          distanceKm: briefing.venue_distance_km,
          travelTime: briefing.venue_travel_time,
          deadlineWarning: briefing.deadline_warning,
        },
        links: briefing.action_items.slice(0, 2),
      };
    }

    if (q.includes('photo') || q.includes('gallery') || q.includes('preview') || q.includes('image')) {
      return {
        text: `You have ${briefing.photos_ready_count} released photographs ready for review in your gallery. Here are two highlighted proof plates:`,
        aiImages: CLIENT_GALLERY_PREVIEWS,
        links: briefing.action_items.filter((i) => i.kind === 'revision'),
      };
    }

    if (q.includes('weather') || q.includes('forecast')) {
      return {
        text: `Here is the shoot-day weather & golden-hour lighting forecast for ${briefing.next_project_venue}:`,
        weather: PROJECT_WEATHER_FORECASTS[0],
      };
    }

    return {
      text: `${briefing.summary_text} You can review your ${briefing.photos_ready_count} released proofs, check your ${briefing.venue_distance_km} km venue route, or join a video call with your photographer.`,
      venueCard: {
        projectTitle: briefing.next_project_title,
        venue: briefing.next_project_venue,
        distanceKm: briefing.venue_distance_km,
        travelTime: briefing.venue_travel_time,
        deadlineWarning: briefing.deadline_warning,
      },
      aiImages: CLIENT_GALLERY_PREVIEWS,
      links: briefing.action_items,
    };
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if ((!trimmed && attachedImages.length === 0) || sending) return;

    const promptText = trimmed || 'Share reference image with my photographer';
    const currentImgs = [...attachedImages];
    setMessages((prev) => [
      ...prev,
      {
        id: `cu-${Date.now()}`,
        sender: 'client',
        text: promptText,
        userImages: currentImgs.length > 0 ? currentImgs : undefined,
      },
    ]);
    setInput('');
    setAttachedImages([]);
    setSending(true);

    try {
      const localReply = buildClientAiReply(promptText, currentImgs);
      try {
        const apiRes = await collaborationApi.chatClientBriefing(promptText, currentImgs);
        if (apiRes?.reply && !localReply.venueCard) {
          localReply.text = apiRes.reply;
        }
      } catch {
        // use localReply
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `ca-${Date.now()}`,
          sender: 'ai',
          ...localReply,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  return (
    <>
      <aside
        className={`bg-forest text-canvas border border-gold/25 rounded-2xl overflow-hidden flex flex-col shadow-xl ${
          compact ? 'h-[470px]' : 'h-[620px] sticky top-24'
        }`}
      >
        <div className="p-4 bg-forest-dark border-b border-canvas/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center text-gold">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="font-serif text-[16px] font-bold text-white leading-tight">
                Client AI Concierge
              </h3>
              <span className="text-[11px] text-canvas/60">
                Gallery Proofs • Shoot Countdown • Venue Distance
              </span>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Online" />
        </div>

        <div className="px-3.5 py-2.5 bg-forest-dark/60 border-b border-canvas/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {CLIENT_QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => void sendMessage(prompt)}
              className="px-2.5 py-1 rounded-full bg-forest-light/70 hover:bg-gold hover:text-ink text-[11px] text-canvas/85 border border-canvas/10 shrink-0 transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'client' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[94%] rounded-2xl px-3.5 py-3 text-[13px] leading-relaxed space-y-2.5 ${
                  m.sender === 'client'
                    ? 'bg-gold text-ink font-medium rounded-br-sm'
                    : 'bg-forest-light/70 text-canvas border border-canvas/10 rounded-bl-sm'
                }`}
              >
                {m.sender === 'ai' && (
                  <div className="flex items-center gap-1 text-[10.5px] uppercase tracking-wider text-gold font-bold">
                    <Bot size={12} /> Cabmora Client AI
                  </div>
                )}

                <p>{m.text}</p>

                {m.userImages && m.userImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {m.userImages.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt="Client reference"
                        className="w-full h-24 object-cover rounded-xl"
                      />
                    ))}
                  </div>
                )}

                {m.venueCard && (
                  <div className="p-3 rounded-xl bg-forest-dark/90 border border-gold/30 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-gold uppercase tracking-wider flex items-center gap-1">
                        <MapPin size={12} /> Venue Distance & Route
                      </span>
                      <span className="text-[11.5px] font-bold text-emerald-400">
                        {m.venueCard.distanceKm} km away
                      </span>
                    </div>
                    <div className="text-[12.5px] font-semibold text-white">
                      {m.venueCard.projectTitle} — {m.venueCard.venue}
                    </div>
                    <div className="text-[11px] text-canvas/65 flex items-center gap-1.5">
                      <Clock size={11} className="text-gold" /> {m.venueCard.travelTime}
                    </div>
                    <div className="p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] flex items-start gap-1.5">
                      <AlertTriangle size={13} className="shrink-0 mt-0.5 text-rose-400" />
                      <span>{m.venueCard.deadlineWarning}</span>
                    </div>
                  </div>
                )}

                {m.weather && (
                  <div className="p-3 rounded-xl bg-forest-dark/90 border border-gold/30 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10.5px] uppercase text-gold font-bold flex items-center gap-1">
                        <CloudSun size={12} /> Shoot Weather
                      </div>
                      <div className="text-[12.5px] font-semibold text-white">
                        {m.weather.location}
                      </div>
                      <div className="text-[11px] text-canvas/65">
                        Golden Hour: {m.weather.goldenHour}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-serif text-[20px] font-bold text-gold">
                        {m.weather.tempC}°C
                      </div>
                      <div className="text-[10.5px] text-canvas/60">{m.weather.condition}</div>
                    </div>
                  </div>
                )}

                {m.aiImages && m.aiImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {m.aiImages.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => setLightboxImage(img)}
                        className="group relative rounded-xl overflow-hidden border border-canvas/15 bg-forest-dark cursor-pointer"
                      >
                        <img
                          src={img.url}
                          alt={img.caption}
                          className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                        />
                        <button
                          type="button"
                          aria-label="Inspect proof"
                          className="absolute top-1.5 right-1.5 p-1 rounded-md bg-forest-dark/80 text-white"
                        >
                          <Eye size={11} />
                        </button>
                        <div className="p-1.5 text-[10px] text-canvas/85 truncate bg-forest-dark">
                          {img.caption}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {m.links && m.links.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-canvas/10">
                    {m.links.map((item, idx) => (
                      <Link
                        key={idx}
                        to={item.url}
                        className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-forest-dark/80 hover:bg-gold hover:text-ink text-[11.5px] text-canvas transition-colors cursor-pointer"
                      >
                        <span className="truncate font-medium">{item.title}</span>
                        <ArrowUpRight size={13} className="shrink-0" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {sending && (
            <div className="text-[11.5px] text-gold animate-pulse">
              Client AI Concierge is replying…
            </div>
          )}
        </div>

        {attachedImages.length > 0 && (
          <div className="px-3 py-2 bg-forest-dark border-t border-canvas/10 flex items-center gap-2">
            {attachedImages.map((img, i) => (
              <div key={i} className="relative w-10 h-10 rounded-lg overflow-hidden border border-gold">
                <img src={img} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setAttachedImages((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-0 right-0 bg-noir/80 text-white p-0.5"
                >
                  <X size={9} />
                </button>
              </div>
            ))}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="p-3 bg-forest-dark border-t border-canvas/10 flex items-center gap-2"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl bg-forest border border-canvas/15 text-canvas/70 hover:text-gold hover:border-gold transition-colors cursor-pointer"
            title="Attach inspiration image"
          >
            <ImagePlus size={16} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your gallery, venue distance, or countdown..."
            className="flex-1 bg-forest border border-canvas/15 rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder:text-canvas/45 outline-none focus:border-gold"
          />
          <button
            type="submit"
            disabled={sending || (!input.trim() && attachedImages.length === 0)}
            className="p-2.5 rounded-xl bg-gold text-ink hover:bg-gold-dark disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Send size={16} />
          </button>
        </form>
      </aside>

      {lightboxImage && (
        <Modal
          open
          onOpenChange={(next) => !next && setLightboxImage(null)}
          size="lg"
          title={lightboxImage.tag}
        >
          <div className="space-y-3">
            <img
              src={lightboxImage.url}
              alt={lightboxImage.caption}
              className="w-full max-h-[420px] object-cover rounded-xl"
            />
            <p className="text-[13.5px] text-ink/80 font-medium">{lightboxImage.caption}</p>
          </div>
        </Modal>
      )}
    </>
  );
}
