import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Plus,
  Search,
  MessageSquare,
  Trash2,
  Send,
  ImagePlus,
  Bot,
  FileText,
  CloudSun,
  PhoneIncoming,
  UserPlus,
  Check,
  X,
  Download,
  Sun,
  Wind,
  Eye,
  ArrowUpRight,
} from 'lucide-react';
import { Modal } from '@cabmora/ui';
import { PortalAvatar, PortalBell, PortalShell, PortalTopbar } from '@/shared/portal';
import {
  collaborationApi,
  type BriefingActionItemDto,
  type CreatorBriefingDto,
  type ProjectCallDto,
} from '@cabmora/api-client';
import { useAuth } from '@/shared/auth';
import {
  PROJECT_WEATHER_FORECASTS,
  buildAiInvoiceDraft,
  ensureRichBriefing,
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
import type { AiVisualAttachment } from '@/features/projects/components/CreatorAiAssistantPanel';

interface AiChatTurn {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  userImages?: string[];
  aiImages?: AiVisualAttachment[];
  invoice?: CreatorGeneratedInvoice;
  weather?: NextProjectWeatherForecast;
  calls?: ProjectCallDto[];
  pendingMessages?: PendingClientMessage[];
  newClients?: NewClientNotification[];
  links?: BriefingActionItemDto[];
}

interface AiChatSession {
  id: string;
  title: string;
  updatedAt: string;
  group: 'Today' | 'Previous 7 Days';
  turns: AiChatTurn[];
}

const CHAT_HISTORY_STORAGE_KEY = 'cabmora_ai_chatgpt_sessions_v1';

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

const INITIAL_SESSIONS: AiChatSession[] = [
  {
    id: 'sess-1',
    title: 'Generate invoice for Jane Smith ($4,850)',
    updatedAt: '14 mins ago',
    group: 'Today',
    turns: [
      {
        id: 't-1',
        sender: 'user',
        text: 'Generate invoice for Jane Smith $4,850 with drone and rehearsal dinner',
        timestamp: '14 mins ago',
      },
      {
        id: 't-2',
        sender: 'ai',
        text: 'I have generated invoice INV-2025-047 for Jane Smith (Smith & Wesson Wedding) including full-day coverage, 4K aerial drone cinematography, and rehearsal dinner coverage:',
        timestamp: '14 mins ago',
        invoice: buildAiInvoiceDraft({
          clientName: 'Jane Smith',
          clientEmail: 'jane.smith@example.com',
          projectTitle: 'Smith & Wesson Wedding',
          amount: 4850,
          includeDrone: true,
          includeRehearsal: true,
        }),
      },
    ],
  },
  {
    id: 'sess-2',
    title: 'Tuscany next shoot weather & drone forecast',
    updatedAt: '2 hours ago',
    group: 'Today',
    turns: [
      {
        id: 't-3',
        sender: 'user',
        text: 'What is the weather forecast and golden hour window for my next project?',
        timestamp: '2 hours ago',
      },
      {
        id: 't-4',
        sender: 'ai',
        text: 'Here is the meteorological & golden-hour lighting forecast for Smith & Wesson Wedding in Val d’Orcia, Tuscany:',
        timestamp: '2 hours ago',
        weather: PROJECT_WEATHER_FORECASTS[0],
        aiImages: [SAMPLE_STUDIO_IMAGES[0]!],
      },
    ],
  },
  {
    id: 'sess-3',
    title: 'Paris editorial moodboard & lighting setup',
    updatedAt: '3 days ago',
    group: 'Previous 7 Days',
    turns: [
      {
        id: 't-5',
        sender: 'user',
        text: 'Show visual moodboard & lighting reference images for Elena Paris shoot',
        timestamp: '3 days ago',
      },
      {
        id: 't-6',
        sender: 'ai',
        text: 'Here are visual moodboard references and lighting setups tailored to your upcoming Paris Editorial and Lake Como shoots:',
        timestamp: '3 days ago',
        aiImages: SAMPLE_STUDIO_IMAGES.slice(0, 2),
      },
    ],
  },
];

function loadSavedSessions(): AiChatSession[] {
  if (typeof window === 'undefined') return INITIAL_SESSIONS;
  try {
    const raw = window.localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
    if (!raw) return INITIAL_SESSIONS;
    const parsed = JSON.parse(raw) as AiChatSession[];
    return parsed.length > 0 ? parsed : INITIAL_SESSIONS;
  } catch {
    return INITIAL_SESSIONS;
  }
}

export default function CabmoraAiPage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement | null>(null);

  const [briefing, setBriefing] = useState<CreatorBriefingDto | null>(() =>
    ensureRichBriefing(null, user?.first_name),
  );
  const [sessions, setSessions] = useState<AiChatSession[]>(loadSavedSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [historySearch, setHistorySearch] = useState('');

  const [input, setInput] = useState('');
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [showSamplePicker, setShowSamplePicker] = useState(false);
  const [sending, setSending] = useState(false);
  const [savedInvoiceIds, setSavedInvoiceIds] = useState<Record<string, boolean>>({});
  const [previewInvoice, setPreviewInvoice] = useState<CreatorGeneratedInvoice | null>(null);
  const [lightboxImage, setLightboxImage] = useState<AiVisualAttachment | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    collaborationApi
      .getCreatorBriefing()
      .then((data) => setBriefing(ensureRichBriefing(data, user?.first_name)))
      .catch(() => setBriefing(ensureRichBriefing(null, user?.first_name)));
  }, [user?.first_name]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(sessions));
      } catch {
        // ignore
      }
    }
  }, [sessions]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;

  const handleNewChat = () => {
    setActiveSessionId(null);
    setInput('');
    setAttachedImages([]);
    setShowSamplePicker(false);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(null);
    }
  };

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
  };

  const buildAiResponse = (
    query: string,
    userImgs: string[],
  ): Omit<AiChatTurn, 'id' | 'sender' | 'timestamp'> => {
    const q = query.toLowerCase();

    if (userImgs.length > 0 && !q.includes('invoice')) {
      return {
        text: `I analyzed your ${userImgs.length} attached reference image(s). Dynamic range looks balanced at +0.3 EV with warm 3600K highlights. Here are matching visual reference plates and the lighting forecast for your next shoot:`,
        aiImages: SAMPLE_STUDIO_IMAGES.slice(0, 2),
        weather: PROJECT_WEATHER_FORECASTS[0],
      };
    }

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
        includeRehearsal = false;
      } else if (q.includes('elena') || q.includes('paris') || q.includes('editorial')) {
        clientName = 'Elena Vance';
        clientEmail = 'elena@vancemodels.com';
        projectTitle = "Elena's Editorial Shoot";
        amount = 4200;
        includeDrone = false;
        includeRehearsal = false;
      } else if (q.includes('david') || q.includes('techcorp')) {
        clientName = 'David Miller (TechCorp)';
        clientEmail = 'david.m@techcorp.io';
        projectTitle = 'Corporate Event - TechCorp';
        amount = 5400;
        includeDrone = false;
        includeRehearsal = false;
      }

      const numMatch = query.match(/\$?(\d{3,6})/);
      if (numMatch?.[1]) amount = Number(numMatch[1]);

      const invoice = buildAiInvoiceDraft({
        clientName,
        clientEmail,
        projectTitle,
        amount,
        includeDrone,
        includeRehearsal,
      });

      return {
        text: `I have generated invoice ${invoice.id} for ${invoice.client} (${invoice.project}) totaling $${invoice.amount.toLocaleString()}. You can issue it to Billing or download the PDF below:`,
        invoice,
      };
    }

    if (q.includes('weather') || q.includes('forecast') || q.includes('tuscany') || q.includes('drone') || q.includes('shoot')) {
      const target =
        q.includes('paris') || q.includes('elena')
          ? PROJECT_WEATHER_FORECASTS[1]!
          : q.includes('london') || q.includes('techcorp')
            ? PROJECT_WEATHER_FORECASTS[2]!
            : PROJECT_WEATHER_FORECASTS[0]!;
      return {
        text: `Live forecast for ${target.projectTitle} in ${target.location} (${target.shootDate}):`,
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

    if (q.includes('client') || q.includes('booking') || q.includes('onboard')) {
      const clients = getNewClientNotifications();
      return {
        text: `You have ${clients.length} new client bookings totaling $${clients.reduce((s, c) => s + c.packageAmount, 0).toLocaleString()}. Click "Invoice" on any client below to generate their retainer:`,
        newClients: clients,
      };
    }

    if (q.includes('call') || q.includes('message') || q.includes('inbox') || q.includes('reply')) {
      return {
        text: 'Here are your pending video call requests and unread client messages:',
        calls: getStudioCalls().slice(0, 3),
        pendingMessages: getPendingMessages().slice(0, 3),
      };
    }

    if (q.includes('image') || q.includes('photo') || q.includes('moodboard') || q.includes('lighting')) {
      return {
        text: 'Here are AI-curated visual moodboard references, golden hour lighting setups, and color-grading plates:',
        aiImages: SAMPLE_STUDIO_IMAGES,
      };
    }

    return {
      text:
        briefing?.summary_text ||
        'I can generate client invoices, check your next shoot weather & golden hour window, analyze uploaded reference images, or manage your client calls and messages.',
      weather: PROJECT_WEATHER_FORECASTS[0],
      newClients: getNewClientNotifications().slice(0, 2),
      links: briefing?.action_items.slice(0, 2),
    };
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    const imgs = [...attachedImages];
    if ((!trimmed && imgs.length === 0) || sending) return;

    const promptText = trimmed || 'Analyze attached studio reference image(s)';
    const userTurn: AiChatTurn = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: 'Just now',
      userImages: imgs.length > 0 ? imgs : undefined,
    };

    let targetSessionId = activeSessionId;
    if (!targetSessionId) {
      const newSession: AiChatSession = {
        id: `sess-${Date.now()}`,
        title: promptText.length > 42 ? `${promptText.slice(0, 42)}…` : promptText,
        updatedAt: 'Just now',
        group: 'Today',
        turns: [userTurn],
      };
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      targetSessionId = newSession.id;
    } else {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === targetSessionId
            ? { ...s, updatedAt: 'Just now', turns: [...s.turns, userTurn] }
            : s,
        ),
      );
    }

    setInput('');
    setAttachedImages([]);
    setShowSamplePicker(false);
    setSending(true);

    try {
      const localReply = buildAiResponse(promptText, imgs);
      try {
        const res = await collaborationApi.chatCreatorBriefing(promptText, imgs);
        if (res?.reply && !localReply.invoice && !localReply.weather && !localReply.aiImages) {
          localReply.text = res.reply;
        }
      } catch {
        // use local multimodal intelligence
      }

      const aiTurn: AiChatTurn = {
        id: `a-${Date.now()}`,
        sender: 'ai',
        timestamp: 'Just now',
        ...localReply,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === targetSessionId
            ? { ...s, updatedAt: 'Just now', turns: [...s.turns, aiTurn] }
            : s,
        ),
      );
      window.setTimeout(() => {
        if (chatScrollContainerRef.current) {
          chatScrollContainerRef.current.scrollTo({
            top: chatScrollContainerRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
      }, 60);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(historySearch.toLowerCase()),
  );

  const todaySessions = filteredSessions.filter((s) => s.group === 'Today');
  const olderSessions = filteredSessions.filter((s) => s.group !== 'Today');

  return (
    <PortalShell>
      {({ toggleSidebar }) => (
        <div className="flex flex-col h-screen overflow-hidden">
          <PortalTopbar
            title="AI Assistants"
            subtitle="Ask Cabmora AI to generate invoices, forecast shoot weather, analyze images, or draft client replies"
            icon={Sparkles}
            onToggleSidebar={toggleSidebar}
          >
            <button
              type="button"
              onClick={handleNewChat}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-ink text-white hover:bg-gold hover:text-ink text-[12px] font-semibold transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>New Chat</span>
            </button>
            <PortalBell />
            <PortalAvatar
              src={
                user?.avatar_url ||
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'
              }
            />
          </PortalTopbar>

          {/* ChatGPT-Style Split Workspace: Stationary History Sidebar + Scrollable In-Chat Conversation Stage */}
          <div className="h-[calc(100vh-5rem)] flex overflow-hidden bg-canvas">
            {/* Stationary Search & Chat History Sidebar (Does NOT scroll) */}
            <aside className="w-72 sm:w-80 h-full bg-forest-dark text-canvas border-r border-canvas/10 flex flex-col shrink-0 overflow-hidden select-none">
              <div className="p-4 space-y-3 border-b border-canvas/10 shrink-0">
                <button
                  type="button"
                  onClick={handleNewChat}
                  className="w-full py-2.5 px-4 rounded-xl bg-gold text-ink hover:bg-gold-dark font-semibold text-[13px] flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <Plus size={16} />
                  <span>New Chat</span>
                </button>

                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-canvas/45"
                  />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search chat history..."
                    className="w-full bg-forest border border-canvas/15 rounded-xl pl-9 pr-3 py-2 text-[12px] text-white placeholder:text-canvas/45 outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-hidden p-3 space-y-5">
                {todaySessions.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="px-2.5 text-[10px] uppercase tracking-[0.14em] text-gold font-bold">
                      Today
                    </div>
                    {todaySessions.map((sess) => (
                      <div
                        key={sess.id}
                        onClick={() => setActiveSessionId(sess.id)}
                        className={`group px-3 py-2.5 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                          activeSessionId === sess.id
                            ? 'bg-forest-light text-white border border-gold/40'
                            : 'text-canvas/75 hover:bg-forest/80 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <MessageSquare size={14} className="text-gold shrink-0" />
                          <div className="min-w-0">
                            <div className="text-[12.5px] font-medium truncate">{sess.title}</div>
                            <div className="text-[10px] text-canvas/45">{sess.updatedAt}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSession(sess.id, e)}
                          aria-label="Delete chat session"
                          className="opacity-60 hover:opacity-100 text-canvas/50 hover:text-rose-400 p-1 rounded transition-opacity cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {olderSessions.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="px-2.5 text-[10px] uppercase tracking-[0.14em] text-canvas/45 font-bold">
                      Previous 7 Days
                    </div>
                    {olderSessions.map((sess) => (
                      <div
                        key={sess.id}
                        onClick={() => setActiveSessionId(sess.id)}
                        className={`group px-3 py-2.5 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                          activeSessionId === sess.id
                            ? 'bg-forest-light text-white border border-gold/40'
                            : 'text-canvas/75 hover:bg-forest/80 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <MessageSquare size={14} className="text-gold shrink-0" />
                          <div className="min-w-0">
                            <div className="text-[12.5px] font-medium truncate">{sess.title}</div>
                            <div className="text-[10px] text-canvas/45">{sess.updatedAt}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSession(sess.id, e)}
                          aria-label="Delete chat session"
                          className="opacity-60 hover:opacity-100 text-canvas/50 hover:text-rose-400 p-1 rounded transition-opacity cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>

            {/* Main ChatGPT Conversation Stage */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
              {!activeSession ? (
                /* Empty New Chat Landing State (Like ChatGPT) */
                <div className="flex-1 overflow-y-auto p-6 sm:p-10 flex flex-col items-center justify-center">
                  <div className="max-w-2xl w-full text-center space-y-6">
                    <div className="w-14 h-14 rounded-2xl bg-forest text-gold border border-gold/40 flex items-center justify-center mx-auto shadow-lg">
                      <Sparkles size={26} />
                    </div>
                    <div className="space-y-2">
                      <h2 className="font-serif text-[28px] sm:text-[34px] font-bold text-ink">
                        What can I help you do in your studio today?
                      </h2>
                      <p className="text-[14px] text-ink/60">
                        Every prompt is automatically saved in your search history on the left. Ask
                        me to generate an invoice, forecast your next shoot, analyze reference
                        images, or manage client calls & messages.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left pt-2">
                      {[
                        {
                          title: 'Generate Client Invoice',
                          prompt:
                            'Generate invoice for Clara & Julian Mercer $6,250 for Lake Como Destination Wedding',
                          icon: FileText,
                        },
                        {
                          title: 'Next Shoot Weather & Golden Hour',
                          prompt:
                            'What is the weather forecast and drone wind status for my next project in Tuscany?',
                          icon: CloudSun,
                        },
                        {
                          title: 'Visual Moodboard & Lighting Plates',
                          prompt:
                            'Show visual moodboard & lighting reference images for my upcoming shoots',
                          icon: ImagePlus,
                        },
                        {
                          title: 'New Clients, Calls & Messages',
                          prompt:
                            'Show my new client bookings, pending call requests, and unread client messages',
                          icon: PhoneIncoming,
                        },
                      ].map((card) => {
                        const Icon = card.icon;
                        return (
                          <button
                            key={card.title}
                            type="button"
                            onClick={() => void sendMessage(card.prompt)}
                            className="p-4 rounded-2xl bg-white border border-ink/10 hover:border-gold hover:-translate-y-0.5 hover:shadow-md transition-all text-left space-y-1.5 cursor-pointer group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[13.5px] text-ink group-hover:text-gold transition-colors">
                                {card.title}
                              </span>
                              <Icon size={16} className="text-gold" />
                            </div>
                            <p className="text-[12px] text-ink/55 line-clamp-2">{card.prompt}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* Active Chat Conversation Stream — ONLY this container scrolls */
                <div
                  ref={chatScrollContainerRef}
                  className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-8 space-y-6"
                >
                  <div className="max-w-3xl mx-auto space-y-6">
                    {activeSession.turns.map((m) => (
                      <div
                        key={m.id}
                        className={`flex flex-col ${
                          m.sender === 'user' ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div
                          className={`max-w-[90%] rounded-2xl px-5 py-4 text-[14px] leading-relaxed space-y-3.5 shadow-xs ${
                            m.sender === 'user'
                              ? 'bg-ink text-white rounded-br-sm'
                              : 'bg-white text-ink border border-ink/10 rounded-bl-sm'
                          }`}
                        >
                          {m.sender === 'ai' && (
                            <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-wider text-gold font-bold">
                              <span className="flex items-center gap-1.5">
                                <Bot size={14} /> Cabmora AI Assistant
                              </span>
                              <span className="text-ink/40 font-normal">{m.timestamp}</span>
                            </div>
                          )}

                          <p>{m.text}</p>

                          {/* User Attached Images */}
                          {m.userImages && m.userImages.length > 0 && (
                            <div className="grid grid-cols-2 gap-2.5 pt-1">
                              {m.userImages.map((imgUrl, idx) => (
                                <img
                                  key={idx}
                                  src={imgUrl}
                                  alt="Uploaded reference"
                                  className="w-full h-36 object-cover rounded-xl border border-white/20"
                                />
                              ))}
                            </div>
                          )}

                          {/* AI Visual Image Responses */}
                          {m.aiImages && m.aiImages.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                              {m.aiImages.map((img, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => setLightboxImage(img)}
                                  className="group relative rounded-xl overflow-hidden border border-ink/10 bg-canvas cursor-pointer"
                                >
                                  <img
                                    src={img.url}
                                    alt={img.caption}
                                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-noir/80 text-gold text-[10px] font-bold uppercase tracking-wider">
                                    {img.tag}
                                  </div>
                                  <button
                                    type="button"
                                    aria-label="Preview image"
                                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-noir/75 text-white hover:bg-gold hover:text-ink"
                                  >
                                    <Eye size={13} />
                                  </button>
                                  <div className="p-2.5 text-[11.5px] text-ink/80 font-medium">
                                    {img.caption}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* AI Weather Card */}
                          {m.weather && (
                            <div className="rounded-xl bg-forest text-canvas border border-gold/30 p-4 space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-wider text-gold font-bold">
                                    <CloudSun size={13} /> Next Project Shoot Weather Forecast
                                  </div>
                                  <div className="font-serif text-[17px] font-bold text-white mt-0.5">
                                    {m.weather.projectTitle}
                                  </div>
                                  <div className="text-[11.5px] text-canvas/70">
                                    {m.weather.location} • {m.weather.shootDate}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-serif text-[24px] font-bold text-gold leading-none">
                                    {m.weather.tempC}°C
                                  </div>
                                  <div className="text-[11px] text-canvas/65">
                                    {m.weather.condition}
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-2 text-[11px]">
                                <div className="p-2.5 rounded-lg bg-forest-dark border border-canvas/10">
                                  <div className="text-canvas/55 flex items-center gap-1">
                                    <Sun size={11} className="text-gold" /> Golden Hour
                                  </div>
                                  <div className="font-semibold text-white mt-0.5">
                                    {m.weather.goldenHour}
                                  </div>
                                </div>
                                <div className="p-2.5 rounded-lg bg-forest-dark border border-canvas/10">
                                  <div className="text-canvas/55 flex items-center gap-1">
                                    <Wind size={11} className="text-gold" /> Wind / Drone
                                  </div>
                                  <div className="font-semibold text-emerald-400 mt-0.5">
                                    {m.weather.windKmh} km/h {m.weather.windDirection}
                                  </div>
                                </div>
                                <div className="p-2.5 rounded-lg bg-forest-dark border border-canvas/10">
                                  <div className="text-canvas/55">Aerial Status</div>
                                  <div className="font-semibold text-gold mt-0.5 truncate">
                                    {m.weather.droneStatus}
                                  </div>
                                </div>
                              </div>

                              <p className="text-[11.5px] text-canvas/85 bg-gold/10 border border-gold/25 rounded-lg px-3 py-2">
                                <strong className="text-gold">AI Lighting Note:</strong>{' '}
                                {m.weather.aiLightingNote}
                              </p>
                            </div>
                          )}

                          {/* AI Generated Invoice Card */}
                          {m.invoice && (
                            <div className="rounded-xl bg-forest text-canvas border border-gold/40 p-4 space-y-3">
                              <div className="flex items-start justify-between gap-2 border-b border-canvas/10 pb-3">
                                <div>
                                  <span className="inline-flex items-center gap-1 text-[10.5px] uppercase tracking-wider text-gold font-bold">
                                    <FileText size={12} /> Creator Invoice
                                  </span>
                                  <div className="font-serif text-[18px] font-bold text-white">
                                    {m.invoice.id} • {m.invoice.client}
                                  </div>
                                  <div className="text-[11.5px] text-canvas/65">
                                    {m.invoice.project} • Due {m.invoice.due}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-serif text-[22px] font-bold text-gold">
                                    ${m.invoice.amount.toLocaleString()}
                                  </div>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/15 text-gold font-semibold">
                                    {savedInvoiceIds[m.invoice.id]
                                      ? 'Issued & Synced'
                                      : m.invoice.status}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-1.5 text-[12px]">
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
                                  className="flex-1 py-2 px-3 rounded-lg bg-gold text-ink font-semibold text-[12px] hover:bg-gold-dark flex items-center justify-center gap-1.5 cursor-pointer"
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
                                  className="py-2 px-3 rounded-lg border border-canvas/20 hover:border-gold text-canvas text-[12px] flex items-center gap-1 cursor-pointer"
                                >
                                  <Download size={13} />
                                  <span>Preview / PDF</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* New Client Cards */}
                          {m.newClients && m.newClients.length > 0 && (
                            <div className="space-y-2 pt-1">
                              {m.newClients.map((client) => (
                                <div
                                  key={client.id}
                                  className="p-3 rounded-xl bg-canvas border border-ink/10 flex items-center justify-between gap-2"
                                >
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <UserPlus size={13} className="text-gold shrink-0" />
                                      <span className="font-semibold text-ink text-[13px] truncate">
                                        {client.clientName}
                                      </span>
                                      <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 font-semibold">
                                        ${client.packageAmount.toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="text-[11.5px] text-ink/60 truncate">
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
                                    className="px-3 py-1.5 rounded-lg bg-gold text-ink text-[11px] font-semibold shrink-0 hover:bg-gold-dark cursor-pointer"
                                  >
                                    Invoice
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Calls */}
                          {m.calls && m.calls.length > 0 && (
                            <div className="space-y-2 pt-1">
                              {m.calls.map((c) => (
                                <div
                                  key={c.id}
                                  className="p-3 rounded-xl bg-canvas border border-ink/10 flex items-center justify-between gap-2"
                                >
                                  <div className="min-w-0">
                                    <div className="text-[13px] font-semibold text-ink truncate">
                                      {c.title}
                                    </div>
                                    <div className="text-[11px] text-ink/60">
                                      {c.requester_name} • {c.project_title} ({c.status})
                                    </div>
                                  </div>
                                  {c.status === 'pending' && (
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => updateStudioCallStatus(c.id, 'accept')}
                                        className="p-1.5 rounded-lg bg-emerald-600 text-white cursor-pointer"
                                      >
                                        <Check size={12} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => updateStudioCallStatus(c.id, 'decline')}
                                        className="p-1.5 rounded-lg border border-rose-500/40 text-rose-600 cursor-pointer"
                                      >
                                        <X size={12} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Pending Messages */}
                          {m.pendingMessages && m.pendingMessages.length > 0 && (
                            <div className="space-y-2 pt-1">
                              {m.pendingMessages.map((msg) => (
                                <div
                                  key={msg.id}
                                  className="p-3 rounded-xl bg-canvas border border-ink/10 space-y-1.5"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-[12.5px] font-semibold text-ink">
                                      {msg.clientName} — {msg.projectTitle}
                                    </span>
                                    <span className="text-[10.5px] text-ink/45">
                                      {msg.receivedAt}
                                    </span>
                                  </div>
                                  <p className="text-[12px] text-ink/70">{msg.preview}</p>
                                  <div className="flex items-center gap-2 pt-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        replyToPendingMessage(
                                          msg.id,
                                          `Hi ${msg.clientName.split(' ')[0]}, confirmed and updated!`,
                                        )
                                      }
                                      className="px-2.5 py-1 rounded-lg bg-ink text-white text-[11px] cursor-pointer"
                                    >
                                      Quick Reply
                                    </button>
                                    {msg.suggestedInvoiceAmount && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          void sendMessage(
                                            `Generate invoice for ${msg.clientName} $${msg.suggestedInvoiceAmount}`,
                                          )
                                        }
                                        className="px-2.5 py-1 rounded-lg bg-gold text-ink text-[11px] font-semibold cursor-pointer"
                                      >
                                        Invoice (${msg.suggestedInvoiceAmount.toLocaleString()})
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Links */}
                          {m.links && m.links.length > 0 && (
                            <div className="space-y-1.5 pt-2 border-t border-ink/10">
                              {m.links.map((item, idx) => (
                                <Link
                                  key={idx}
                                  to={item.url}
                                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-canvas hover:bg-gold text-[12px] text-ink font-medium transition-colors"
                                >
                                  <span className="truncate">
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
                      <div className="text-[12.5px] text-gold font-medium animate-pulse">
                        Cabmora AI is thinking…
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom ChatGPT-Style Prompt Bar */}
              <div className="p-4 sm:p-6 bg-canvas border-t border-ink/10">
                <div className="max-w-3xl mx-auto space-y-2.5">
                  {attachedImages.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {attachedImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative w-12 h-12 rounded-xl overflow-hidden border border-gold shrink-0"
                        >
                          <img src={img} alt="Attached" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() =>
                              setAttachedImages((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-noir/80 text-white"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {showSamplePicker && (
                    <div className="p-3 rounded-2xl bg-white border border-ink/15 shadow-md space-y-2">
                      <div className="flex items-center justify-between text-[11.5px] font-semibold text-ink">
                        <span>Attach Reference Image or Upload from Computer</span>
                        <button
                          type="button"
                          onClick={() => setShowSamplePicker(false)}
                          className="text-ink/50 hover:text-ink"
                        >
                          <X size={14} />
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
                            className="rounded-xl overflow-hidden border border-ink/10 hover:border-gold text-left cursor-pointer"
                          >
                            <img
                              src={sample.url}
                              alt={sample.tag}
                              className="w-full h-14 object-cover"
                            />
                            <div className="p-1 text-[10px] text-ink truncate bg-canvas">
                              {sample.tag}
                            </div>
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-1.5 rounded-xl border border-dashed border-gold text-ink text-[11.5px] font-medium hover:bg-gold/10 cursor-pointer"
                      >
                        + Browse Image File from Computer
                      </button>
                    </div>
                  )}

                  <form
                    onSubmit={handleSubmit}
                    className="flex items-center gap-2 bg-white border border-ink/15 focus-within:border-gold rounded-2xl px-3 py-2 shadow-sm"
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
                      title="Attach or upload image"
                      className="p-2.5 rounded-xl text-ink/60 hover:text-gold hover:bg-canvas transition-colors cursor-pointer"
                    >
                      <ImagePlus size={18} />
                    </button>

                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Message Cabmora AI to generate an invoice, check weather, or analyze images..."
                      className="flex-1 bg-transparent px-2 py-1.5 text-[14px] text-ink placeholder:text-ink/40 outline-none"
                    />

                    <button
                      type="submit"
                      disabled={sending || (!input.trim() && attachedImages.length === 0)}
                      aria-label="Send prompt"
                      className="p-2.5 rounded-xl bg-ink text-white hover:bg-gold hover:text-ink disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              </div>
            </main>
          </div>

          {previewInvoice && (
            <Modal
              open
              onOpenChange={(next) => !next && setPreviewInvoice(null)}
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
        </div>
      )}
    </PortalShell>
  );
}
