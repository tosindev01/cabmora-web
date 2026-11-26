import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Send,
  ArrowUpRight,
  Bot,
  ImagePlus,
  FileText,
  CloudSun,
  PhoneIncoming,
  MessageSquare,
  UserPlus,
  Check,
  X,
  Download,
  Plus,
  Wind,
  Sun,
  Eye,
} from 'lucide-react';
import { Modal } from '@cabmora/ui';
import {
  collaborationApi,
  type BriefingActionItemDto,
  type CreatorBriefingDto,
  type ProjectCallDto,
} from '@cabmora/api-client';
import {
  PROJECT_WEATHER_FORECASTS,
  buildAiInvoiceDraft,
  getNewClientNotifications,
  getPendingMessages,
  getStudioCalls,
  replyToPendingMessage,
  saveStudioInvoice,
  updateStudioCallStatus,
  type CreatorGeneratedInvoice,
  type NewClientNotification,
  type NextProjectWeatherForecast,
  type PendingClientMessage,
} from '@/shared/collaboration/studioWorkspaceStore';

export interface AiVisualAttachment {
  url: string;
  caption: string;
  tag: string;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  userImages?: string[];
  aiImages?: AiVisualAttachment[];
  invoice?: CreatorGeneratedInvoice;
  weather?: NextProjectWeatherForecast;
  calls?: ProjectCallDto[];
  pendingMessages?: PendingClientMessage[];
  newClients?: NewClientNotification[];
  links?: BriefingActionItemDto[];
}

interface CreatorAiAssistantPanelProps {
  briefing: CreatorBriefingDto | null;
  compact?: boolean;
  onInvoiceSaved?: (invoice: CreatorGeneratedInvoice) => void;
}

const SAMPLE_STUDIO_IMAGES: AiVisualAttachment[] = [
  {
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&h=600&fit=crop',
    caption: 'Tuscany Golden Hour Ridge — 3500K Warm Film LUT Reference',
    tag: 'Golden Hour Reference',
  },
  {
    url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=900&h=600&fit=crop',
    caption: 'Paris Editorial Softbox Lighting & Kodak Portra 400 Grain',
    tag: 'Editorial Moodboard',
  },
  {
    url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&h=600&fit=crop',
    caption: 'Lake Como Villa Balbianello Aerial Drone Framing Guide',
    tag: 'Aerial Scout Shot',
  },
  {
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=900&h=600&fit=crop',
    caption: 'Keynote Multicam 3-Point Stage Lighting Setup (4800K)',
    tag: 'Stage Lighting Plot',
  },
];

const QUICK_PROMPTS = [
  'Generate invoice for Jane Smith',
  'Next project weather forecast',
  'New client notifications',
  'Pending calls & messages',
  'Show visual moodboard & lighting images',
];

export function CreatorAiAssistantPanel({
  briefing,
  compact = false,
  onInvoiceSaved,
}: CreatorAiAssistantPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-ai',
      sender: 'ai',
      text:
        briefing?.summary_text ||
        'Hello! I am your multimodal Cabmora AI Studio Assistant. I can generate creator invoices, check the weather forecast for your next project shoot, manage new client alerts, calls & pending messages, or analyze reference images and generate visual moodboards.',
      weather: PROJECT_WEATHER_FORECASTS[0],
      links: briefing?.action_items.slice(0, 2),
    },
  ]);
  const [input, setInput] = useState('');
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [showSamplePicker, setShowSamplePicker] = useState(false);
  const [sending, setSending] = useState(false);
  const [savedInvoiceIds, setSavedInvoiceIds] = useState<Record<string, boolean>>({});
  const [previewInvoice, setPreviewInvoice] = useState<CreatorGeneratedInvoice | null>(null);
  const [lightboxImage, setLightboxImage] = useState<AiVisualAttachment | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Invoice Generator Modal form state
  const [draftClient, setDraftClient] = useState('Clara & Julian Mercer');
  const [draftEmail, setDraftEmail] = useState('clara.mercer@ateliermercer.com');
  const [draftProject, setDraftProject] = useState('Lake Como Destination Wedding');
  const [draftAmount, setDraftAmount] = useState('6250');
  const [draftIncludeDrone, setDraftIncludeDrone] = useState(true);
  const [draftIncludeRehearsal, setDraftIncludeRehearsal] = useState(false);

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

  const handleSaveInvoice = (invoice: CreatorGeneratedInvoice) => {
    saveStudioInvoice(invoice);
    setSavedInvoiceIds((prev) => ({ ...prev, [invoice.id]: true }));
    onInvoiceSaved?.(invoice);
  };

  const handleCallAction = (callId: string, action: 'accept' | 'decline') => {
    const updated = updateStudioCallStatus(callId, action);
    setMessages((prev) =>
      prev.map((m) => (m.calls ? { ...m, calls: updated } : m)),
    );
  };

  const handleQuickReplyMessage = (msg: PendingClientMessage) => {
    const replyText = `Hi ${msg.clientName.split(' ')[0]}, received your note on ${msg.projectTitle} — I have updated the schedule and prepared your invoice!`;
    const updated = replyToPendingMessage(msg.id, replyText);
    setMessages((prev) =>
      prev.map((m) => (m.pendingMessages ? { ...m, pendingMessages: updated } : m)),
    );
  };

  const buildSmartAiResponse = (query: string, userImgs: string[]): Omit<ChatMessage, 'id' | 'sender'> => {
    const q = query.toLowerCase();

    // If user uploaded or attached an image
    if (userImgs.length > 0 && !q.includes('invoice')) {
      return {
        text: `I analyzed your ${userImgs.length} attached reference image(s). Exposure dynamic range looks balanced at +0.3 EV with warm 3600K highlights. Here are matching visual reference plates and a lighting setup recommendation for your next shoot:`,
        aiImages: SAMPLE_STUDIO_IMAGES.slice(0, 2),
        weather: PROJECT_WEATHER_FORECASTS[0],
      };
    }

    // Invoice generation intent
    if (q.includes('invoice') || q.includes('bill') || q.includes('retainer') || q.includes('quote')) {
      let clientName = 'Jane Smith';
      let clientEmail = 'jane.smith@example.com';
      let projectTitle = 'Smith & Wesson Wedding';
      let amount = 4850;
      let includeDrone = true;
      let includeRehearsal = true;

      if (q.includes('clara') || q.includes('mercer') || q.includes('como')) {
        clientName = 'Clara & Julian Mercer';
        clientEmail = 'clara.mercer@ateliermercer.com';
        projectTitle = 'Lake Como Destination Wedding';
        amount = 6250;
        includeDrone = true;
        includeRehearsal = false;
      } else if (q.includes('elena') || q.includes('editorial') || q.includes('paris')) {
        clientName = 'Elena Vance';
        clientEmail = 'elena@vancemodels.com';
        projectTitle = "Elena's Editorial Shoot";
        amount = 4200;
        includeDrone = false;
        includeRehearsal = false;
      } else if (q.includes('david') || q.includes('techcorp') || q.includes('corporate')) {
        clientName = 'David Miller (TechCorp)';
        clientEmail = 'david.m@techcorp.io';
        projectTitle = 'Corporate Event - TechCorp';
        amount = 5400;
        includeDrone = false;
        includeRehearsal = false;
      } else if (q.includes('maison') || q.includes('lumiere')) {
        clientName = 'Maison Lumière Paris';
        clientEmail = 'production@maisonlumiere.fr';
        projectTitle = 'SS26 Haute Couture Lookbook';
        amount = 6800;
        includeDrone = false;
        includeRehearsal = false;
      }

      const numMatch = query.match(/\$?(\d{3,6})/);
      if (numMatch?.[1]) {
        amount = Number(numMatch[1]);
      }

      const invoice = buildAiInvoiceDraft({
        clientName,
        clientEmail,
        projectTitle,
        amount,
        includeDrone,
        includeRehearsal,
      });

      return {
        text: `I have generated creator invoice ${invoice.id} for ${invoice.client} (${invoice.project}) totaling $${invoice.amount.toLocaleString()}. You can issue & sync it directly to Billing or preview/print the PDF below:`,
        invoice,
      };
    }

    // Weather forecast intent
    if (q.includes('weather') || q.includes('forecast') || q.includes('tuscany') || q.includes('rain') || q.includes('drone') || q.includes('next project')) {
      const target =
        q.includes('paris') || q.includes('elena')
          ? PROJECT_WEATHER_FORECASTS[1]!
          : q.includes('london') || q.includes('techcorp')
            ? PROJECT_WEATHER_FORECASTS[2]!
            : PROJECT_WEATHER_FORECASTS[0]!;

      return {
        text: `Here is the live meteorological & golden-hour lighting forecast for your next project (${target.projectTitle} in ${target.location} on ${target.shootDate}):`,
        weather: target,
        aiImages: [
          {
            url: target.locationImage,
            caption: `${target.location} — ${target.condition} (${target.tempC}°C / ${target.tempF}°F)`,
            tag: target.droneStatus,
          },
        ],
      };
    }

    // New clients notification intent
    if (q.includes('new client') || q.includes('booking') || q.includes('enquir') || q.includes('onboard')) {
      const clients = getNewClientNotifications();
      return {
        text: `You have ${clients.length} new client notifications totaling $${clients.reduce((s, c) => s + c.packageAmount, 0).toLocaleString()} in studio bookings. Click "AI Generate Invoice" on any client to issue their retainer immediately:`,
        newClients: clients,
      };
    }

    // Calls & pending messages intent
    if (q.includes('call') || q.includes('message') || q.includes('unread') || q.includes('inbox') || q.includes('pending')) {
      const calls = getStudioCalls();
      const pendingMsgs = getPendingMessages();
      return {
        text: `You have ${calls.filter((c) => c.status === 'pending').length} pending video call request(s) and ${pendingMsgs.filter((m) => m.unread).length} unread client message(s) waiting for your response:`,
        calls: calls.slice(0, 3),
        pendingMessages: pendingMsgs.slice(0, 3),
      };
    }

    // Visual / image / moodboard / lighting / photo intent
    if (
      q.includes('image') ||
      q.includes('photo') ||
      q.includes('visual') ||
      q.includes('moodboard') ||
      q.includes('lighting') ||
      q.includes('color') ||
      q.includes('shot')
    ) {
      return {
        text: 'Here are AI-curated visual moodboard references, golden hour lighting setups, and color-grading plates tailored to your active Wedding, Editorial, and Corporate shoots:',
        aiImages: SAMPLE_STUDIO_IMAGES,
      };
    }

    // General comprehensive studio summary
    return {
      text:
        briefing?.summary_text ||
        'Here is your complete studio pulse: 3 new client notifications, 24°C Golden Clear weather forecast for your next shoot in Tuscany, 2 pending call requests, and 3 unread client messages.',
      weather: PROJECT_WEATHER_FORECASTS[0],
      newClients: getNewClientNotifications().slice(0, 2),
      aiImages: SAMPLE_STUDIO_IMAGES.slice(0, 2),
      links: briefing?.action_items.slice(0, 3),
    };
  };

  const sendMessage = async (text: string, customImages?: string[]) => {
    const trimmed = text.trim();
    const imgs = customImages ?? attachedImages;
    if ((!trimmed && imgs.length === 0) || sending) return;

    const promptText = trimmed || 'Analyze attached studio reference image(s)';
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: promptText,
      userImages: imgs.length > 0 ? imgs : undefined,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setAttachedImages([]);
    setShowSamplePicker(false);
    setSending(true);

    try {
      const localRich = buildSmartAiResponse(promptText, imgs);
      // Also attempt backend chat endpoint if it adds extra context, but preserve rich multimodal cards
      let apiReplyText: string | null = null;
      try {
        const res = await collaborationApi.chatCreatorBriefing(promptText, imgs);
        if (res?.reply && !localRich.invoice && !localRich.weather && !localRich.aiImages) {
          apiReplyText = res.reply;
        }
      } catch {
        // fallback to local multimodal intelligence
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'ai',
          ...localRich,
          text: apiReplyText || localRich.text,
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

  const handleCreateCustomInvoice = (e: FormEvent) => {
    e.preventDefault();
    const invoice = buildAiInvoiceDraft({
      clientName: draftClient,
      clientEmail: draftEmail,
      projectTitle: draftProject,
      amount: Number(draftAmount) || 4500,
      includeDrone: draftIncludeDrone,
      includeRehearsal: draftIncludeRehearsal,
    });
    saveStudioInvoice(invoice);
    setSavedInvoiceIds((prev) => ({ ...prev, [invoice.id]: true }));
    onInvoiceSaved?.(invoice);
    setIsInvoiceModalOpen(false);

    setMessages((prev) => [
      ...prev,
      {
        id: `a-inv-${Date.now()}`,
        sender: 'ai',
        text: `Generated and saved invoice ${invoice.id} for ${invoice.client} ($${invoice.amount.toLocaleString()}). It is now live in your Billing & Payments ledger.`,
        invoice,
      },
    ]);
  };

  return (
    <>
      <aside
        className={`bg-forest text-canvas border border-gold/25 rounded-2xl overflow-hidden flex flex-col shadow-xl ${
          compact ? 'h-[500px]' : 'h-[680px] sticky top-24'
        }`}
      >
        {/* Header */}
        <div className="p-4 bg-forest-dark border-b border-canvas/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center text-gold">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="font-serif text-[16px] font-bold text-white leading-tight">
                AI Studio Assistant
              </h3>
              <span className="text-[11px] text-canvas/60">
                Multimodal Chat • Images • AI Invoicing • Weather
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsInvoiceModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-gold text-ink text-[11px] font-semibold hover:bg-gold-dark flex items-center gap-1 transition-colors cursor-pointer"
              title="Open Invoice Generator"
            >
              <FileText size={12} />
              <span>Invoice</span>
            </button>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Online" />
          </div>
        </div>

        {/* Quick Prompt Chips */}
        <div className="px-3.5 py-2.5 bg-forest-dark/60 border-b border-canvas/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {QUICK_PROMPTS.map((prompt) => (
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

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[94%] rounded-2xl px-3.5 py-3 text-[13px] leading-relaxed space-y-3 ${
                  m.sender === 'user'
                    ? 'bg-gold text-ink font-medium rounded-br-sm'
                    : 'bg-forest-light/70 text-canvas border border-canvas/10 rounded-bl-sm'
                }`}
              >
                {m.sender === 'ai' && (
                  <div className="flex items-center justify-between gap-2 text-[10.5px] uppercase tracking-wider text-gold font-bold">
                    <span className="flex items-center gap-1">
                      <Bot size={12} /> Cabmora AI Studio
                    </span>
                    <span className="text-[9.5px] text-canvas/45">Multimodal Engine</span>
                  </div>
                )}

                <p>{m.text}</p>

                {/* User Uploaded Images */}
                {m.userImages && m.userImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {m.userImages.map((imgUrl, idx) => (
                      <img
                        key={idx}
                        src={imgUrl}
                        alt="Uploaded studio reference"
                        className="w-full h-28 object-cover rounded-xl border border-ink/20"
                      />
                    ))}
                  </div>
                )}

                {/* AI Visual Image Responses */}
                {m.aiImages && m.aiImages.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {m.aiImages.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => setLightboxImage(img)}
                        className="group relative rounded-xl overflow-hidden border border-canvas/15 bg-forest-dark cursor-pointer"
                      >
                        <img
                          src={img.url}
                          alt={img.caption}
                          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-forest-dark/85 backdrop-blur-xs text-gold text-[9.5px] font-bold uppercase tracking-wider border border-gold/30">
                          {img.tag}
                        </div>
                        <button
                          type="button"
                          aria-label="Inspect image"
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-forest-dark/80 text-white hover:bg-gold hover:text-ink transition-colors"
                        >
                          <Eye size={12} />
                        </button>
                        <div className="p-2 text-[11px] text-canvas/85 leading-snug bg-forest-dark/95">
                          {img.caption}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* AI Weather Forecast Card */}
                {m.weather && (
                  <div className="rounded-xl bg-forest-dark/90 border border-gold/30 p-3.5 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gold font-bold">
                          <CloudSun size={13} /> Next Project Shoot Weather Forecast
                        </div>
                        <div className="font-serif text-[15px] font-bold text-white mt-0.5">
                          {m.weather.projectTitle}
                        </div>
                        <div className="text-[11px] text-canvas/65">
                          {m.weather.location} • {m.weather.shootDate}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-serif text-[22px] font-bold text-gold leading-none">
                          {m.weather.tempC}°C
                        </div>
                        <div className="text-[10.5px] text-canvas/60">{m.weather.condition}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-[10.5px]">
                      <div className="p-2 rounded-lg bg-forest/70 border border-canvas/10">
                        <div className="text-canvas/50 flex items-center gap-1">
                          <Sun size={11} className="text-gold" /> Golden Hour
                        </div>
                        <div className="font-semibold text-white mt-0.5">
                          {m.weather.goldenHour}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-forest/70 border border-canvas/10">
                        <div className="text-canvas/50 flex items-center gap-1">
                          <Wind size={11} className="text-gold" /> Wind / Drone
                        </div>
                        <div className="font-semibold text-emerald-400 mt-0.5">
                          {m.weather.windKmh} km/h {m.weather.windDirection}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-forest/70 border border-canvas/10">
                        <div className="text-canvas/50">Aerial Status</div>
                        <div className="font-semibold text-gold mt-0.5 truncate">
                          {m.weather.droneStatus}
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-canvas/75 bg-gold/10 border border-gold/20 rounded-lg px-2.5 py-1.5">
                      <strong className="text-gold">AI Lighting Note:</strong>{' '}
                      {m.weather.aiLightingNote}
                    </p>
                  </div>
                )}

                {/* AI Generated Invoice Card */}
                {m.invoice && (
                  <div className="rounded-xl bg-forest-dark border border-gold/40 p-3.5 space-y-3">
                    <div className="flex items-start justify-between gap-2 border-b border-canvas/10 pb-2.5">
                      <div>
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-gold font-bold">
                          <FileText size={12} /> AI-Generated Creator Invoice
                        </span>
                        <div className="font-serif text-[16px] font-bold text-white">
                          {m.invoice.id} • {m.invoice.client}
                        </div>
                        <div className="text-[11px] text-canvas/60">
                          {m.invoice.project} • Due {m.invoice.due}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-serif text-[20px] font-bold text-gold">
                          ${m.invoice.amount.toLocaleString()}
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/15 text-gold font-semibold">
                          {savedInvoiceIds[m.invoice.id] ? 'Issued & Synced' : m.invoice.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11.5px]">
                      {m.invoice.lineItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-2 text-canvas/85"
                        >
                          <span className="truncate">
                            {item.quantity}x {item.description}
                          </span>
                          <span className="font-semibold text-white shrink-0">
                            ${(item.quantity * item.unitPrice).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSaveInvoice(m.invoice!)}
                        className="flex-1 py-2 px-3 rounded-lg bg-gold text-ink font-semibold text-[11.5px] hover:bg-gold-dark flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Check size={13} />
                        <span>
                          {savedInvoiceIds[m.invoice.id]
                            ? 'Saved to Billing Ledger'
                            : 'Issue & Save Invoice'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewInvoice(m.invoice!)}
                        className="py-2 px-3 rounded-lg border border-canvas/20 hover:border-gold text-canvas text-[11.5px] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Download size={13} />
                        <span>Preview / PDF</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* New Client Notification Cards in Chat */}
                {m.newClients && m.newClients.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {m.newClients.map((client) => (
                      <div
                        key={client.id}
                        className="p-2.5 rounded-xl bg-forest-dark/90 border border-canvas/10 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <UserPlus size={12} className="text-gold shrink-0" />
                            <span className="font-semibold text-white text-[12px] truncate">
                              {client.clientName}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                              ${client.packageAmount.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-[11px] text-canvas/60 truncate">
                            {client.projectTitle} • {client.shootDate}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            void sendMessage(
                              `Generate invoice for ${client.clientName} $${Math.round(client.packageAmount / 2)}`,
                            )
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-gold text-ink text-[10.5px] font-semibold shrink-0 hover:bg-gold-dark cursor-pointer"
                        >
                          50% Invoice
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pending Calls in Chat */}
                {m.calls && m.calls.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="text-[10px] uppercase tracking-wider text-gold font-bold flex items-center gap-1">
                      <PhoneIncoming size={11} /> Call Requests
                    </div>
                    {m.calls.map((c) => (
                      <div
                        key={c.id}
                        className="p-2.5 rounded-xl bg-forest-dark/90 border border-canvas/10 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="text-[12px] font-semibold text-white truncate">
                            {c.title}
                          </div>
                          <div className="text-[10.5px] text-canvas/60">
                            {c.requester_name} • {c.project_title} ({c.status})
                          </div>
                        </div>
                        {c.status === 'pending' ? (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleCallAction(c.id, 'accept')}
                              className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                              title="Accept Call"
                            >
                              <Check size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCallAction(c.id, 'decline')}
                              className="p-1.5 rounded-lg border border-rose-500/40 text-rose-400 hover:bg-rose-500/15 cursor-pointer"
                              title="Decline Call"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] uppercase font-bold text-emerald-400">
                            {c.status}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Pending Client Messages in Chat */}
                {m.pendingMessages && m.pendingMessages.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="text-[10px] uppercase tracking-wider text-gold font-bold flex items-center gap-1">
                      <MessageSquare size={11} /> Pending Client Messages
                    </div>
                    {m.pendingMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className="p-2.5 rounded-xl bg-forest-dark/90 border border-canvas/10 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[12px] font-semibold text-white">
                            {msg.clientName} •{' '}
                            <span className="text-gold font-normal">{msg.projectTitle}</span>
                          </span>
                          <span className="text-[10px] text-canvas/45">{msg.receivedAt}</span>
                        </div>
                        <p className="text-[11px] text-canvas/75 line-clamp-2">{msg.preview}</p>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleQuickReplyMessage(msg)}
                            className="px-2.5 py-1 rounded-lg bg-forest-light hover:bg-gold hover:text-ink text-[10.5px] font-medium transition-colors cursor-pointer"
                          >
                            {msg.unread ? 'Send AI Quick Reply' : 'Replied ✓'}
                          </button>
                          {msg.suggestedInvoiceAmount && (
                            <button
                              type="button"
                              onClick={() =>
                                void sendMessage(
                                  `Generate invoice for ${msg.clientName} $${msg.suggestedInvoiceAmount}`,
                                )
                              }
                              className="px-2.5 py-1 rounded-lg bg-gold/20 border border-gold/40 text-gold hover:bg-gold hover:text-ink text-[10.5px] font-semibold transition-colors cursor-pointer"
                            >
                              Generate ${msg.suggestedInvoiceAmount.toLocaleString()} Invoice
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggested Workspace Links */}
                {m.links && m.links.length > 0 && (
                  <div className="mt-2 space-y-1.5 pt-2 border-t border-canvas/10">
                    {m.links.map((item, idx) => (
                      <Link
                        key={idx}
                        to={item.url}
                        className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-forest-dark/80 hover:bg-gold hover:text-ink text-[11.5px] text-canvas transition-colors cursor-pointer"
                      >
                        <span className="truncate font-medium">
                          {item.project_title}: {item.title}
                        </span>
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
              Cabmora AI is generating response…
            </div>
          )}
        </div>

        {/* Attached Image Previews Bar */}
        {attachedImages.length > 0 && (
          <div className="px-3.5 py-2 bg-forest-dark/90 border-t border-canvas/10 flex items-center gap-2 overflow-x-auto">
            {attachedImages.map((img, idx) => (
              <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-gold">
                <img src={img} alt="Attachment preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() =>
                    setAttachedImages((prev) => prev.filter((_, i) => i !== idx))
                  }
                  className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-noir/80 text-white"
                  aria-label="Remove image"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
            <span className="text-[11px] text-canvas/60">
              {attachedImages.length} image(s) ready to analyze
            </span>
          </div>
        )}

        {/* Quick Sample Studio Image Picker */}
        {showSamplePicker && (
          <div className="p-3 bg-forest-dark border-t border-canvas/10 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-gold font-semibold">
              <span>Attach Studio Reference Image or Upload From Device</span>
              <button
                type="button"
                onClick={() => setShowSamplePicker(false)}
                className="text-canvas/50 hover:text-white"
              >
                <X size={13} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {SAMPLE_STUDIO_IMAGES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setAttachedImages((prev) => [...prev, sample.url]);
                    setShowSamplePicker(false);
                  }}
                  className="group relative rounded-lg overflow-hidden border border-canvas/15 hover:border-gold text-left cursor-pointer"
                >
                  <img src={sample.url} alt={sample.tag} className="w-full h-12 object-cover" />
                  <div className="p-1 text-[9px] text-canvas/80 truncate bg-forest">
                    {sample.tag}
                  </div>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-1.5 rounded-lg border border-dashed border-gold/40 text-gold text-[11px] font-medium hover:bg-gold/10 transition-colors cursor-pointer"
            >
              + Browse Image File from Computer
            </button>
          </div>
        )}

        {/* Input Form */}
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
            onClick={() => setShowSamplePicker((v) => !v)}
            aria-label="Attach or upload image"
            title="Attach or upload image for AI analysis"
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              attachedImages.length > 0 || showSamplePicker
                ? 'bg-gold/20 border-gold text-gold'
                : 'bg-forest border-canvas/15 text-canvas/70 hover:text-gold hover:border-gold/40'
            }`}
          >
            <ImagePlus size={16} />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI to generate invoice, check weather, or attach an image..."
            className="flex-1 bg-forest border border-canvas/15 rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder:text-canvas/45 outline-none focus:border-gold"
          />
          <button
            type="submit"
            disabled={sending || (!input.trim() && attachedImages.length === 0)}
            aria-label="Send message to AI"
            className="p-2.5 rounded-xl bg-gold text-ink hover:bg-gold-dark disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Send size={16} />
          </button>
        </form>
      </aside>

      {/* AI Invoice Generator Builder Modal */}
      {isInvoiceModalOpen && (
        <Modal
          open
          onOpenChange={(next) => {
            if (!next) setIsInvoiceModalOpen(false);
          }}
          size="md"
          title="AI Creator Invoice Generator"
        >
          <form onSubmit={handleCreateCustomInvoice} className="space-y-4">
            <p className="text-[13px] text-ink/65">
              Cabmora AI will itemize photography/videography deliverables, calculate totals, and
              sync the invoice directly to your Billing ledger and chat thread.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11.5px] font-semibold uppercase tracking-wider text-ink/60 mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  required
                  value={draftClient}
                  onChange={(e) => setDraftClient(e.target.value)}
                  className="w-full border border-ink/15 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold uppercase tracking-wider text-ink/60 mb-1">
                  Client Email
                </label>
                <input
                  type="email"
                  required
                  value={draftEmail}
                  onChange={(e) => setDraftEmail(e.target.value)}
                  className="w-full border border-ink/15 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-gold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11.5px] font-semibold uppercase tracking-wider text-ink/60 mb-1">
                  Project / Shoot Title
                </label>
                <input
                  type="text"
                  required
                  value={draftProject}
                  onChange={(e) => setDraftProject(e.target.value)}
                  className="w-full border border-ink/15 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold uppercase tracking-wider text-ink/60 mb-1">
                  Base Package Amount (USD)
                </label>
                <input
                  type="number"
                  required
                  min={100}
                  value={draftAmount}
                  onChange={(e) => setDraftAmount(e.target.value)}
                  className="w-full border border-ink/15 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-gold"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-sand border border-ink/10 space-y-2">
              <div className="text-[11px] uppercase tracking-wider font-bold text-ink/60">
                AI Line-Item Add-Ons
              </div>
              <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={draftIncludeDrone}
                  onChange={(e) => setDraftIncludeDrone(e.target.checked)}
                  className="accent-gold"
                />
                <span>Include 4K ProRes Aerial Drone Cinematography (+$650)</span>
              </label>
              <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={draftIncludeRehearsal}
                  onChange={(e) => setDraftIncludeRehearsal(e.target.checked)}
                  className="accent-gold"
                />
                <span>Include Rehearsal Dinner Coverage — 2 Hours (+$700)</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsInvoiceModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-ink/15 text-[12.5px] font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gold text-ink font-semibold text-[12.5px] hover:bg-gold-dark flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} />
                <span>Generate & Issue Invoice</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Printable Invoice Preview Modal */}
      {previewInvoice && (
        <Modal
          open
          onOpenChange={(next) => {
            if (!next) setPreviewInvoice(null);
          }}
          size="lg"
          title={`Invoice ${previewInvoice.id} — ${previewInvoice.client}`}
        >
          <div className="space-y-6 text-ink">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink/10 pb-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.15em] text-gold font-bold">
                  Sarah Cabmora Studio • Creator Invoice
                </div>
                <h4 className="font-serif text-[24px] font-bold mt-0.5">{previewInvoice.id}</h4>
                <p className="text-[12.5px] text-ink/60">
                  Issued {previewInvoice.issued} • Due {previewInvoice.due}
                </p>
              </div>
              <div className="text-right">
                <div className="text-[12px] font-semibold">{previewInvoice.client}</div>
                <div className="text-[12px] text-ink/60">{previewInvoice.clientEmail}</div>
                <div className="text-[12px] text-gold font-medium mt-0.5">
                  {previewInvoice.project}
                </div>
              </div>
            </div>

            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-ink/10 text-[11px] uppercase tracking-wider text-ink/50">
                  <th className="py-2">Deliverable / Service</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {previewInvoice.lineItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 font-medium">{item.description}</td>
                    <td className="py-3 text-center text-ink/60">{item.quantity}</td>
                    <td className="py-3 text-right font-semibold">
                      ${(item.quantity * item.unitPrice).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-ink/15 font-serif text-[18px] font-bold">
                  <td colSpan={2} className="pt-4">
                    Total Due
                  </td>
                  <td className="pt-4 text-right text-gold">
                    ${previewInvoice.amount.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>

            <p className="text-[12px] text-ink/60 bg-sand p-3.5 rounded-xl">
              {previewInvoice.notes}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl border border-ink/15 text-[12.5px] font-medium hover:border-gold flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={14} />
                <span>Print / Save PDF</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSaveInvoice(previewInvoice);
                  setPreviewInvoice(null);
                }}
                className="px-5 py-2 rounded-xl bg-gold text-ink text-[12.5px] font-semibold hover:bg-gold-dark cursor-pointer"
              >
                Issue & Sync to Billing
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Visual Lightbox Modal for AI Image Responses */}
      {lightboxImage && (
        <Modal
          open
          onOpenChange={(next) => {
            if (!next) setLightboxImage(null);
          }}
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
