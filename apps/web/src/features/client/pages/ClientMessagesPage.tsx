import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Send,
  Phone,
  Video,
  Mic,
  MicOff,
  PhoneOff,
  CheckCheck,
  Navigation,
  Clock,
  ImagePlus,
} from 'lucide-react';
import { Modal } from '@cabmora/ui';
import { ClientPortalShell } from '@/features/client/components/ClientPortalShell';
import {
  STUDIO_WORKSPACE_EVENT,
  getPendingMessages,
  getProjectLogisticsMeta,
  replyToPendingMessage,
  type PendingClientMessage,
} from '@/shared/collaboration/studioWorkspaceStore';

const SAMPLE_CLIENT_INSPIRATION =
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=550&fit=crop';

export default function ClientMessagesPage() {
  const [threads, setThreads] = useState<PendingClientMessage[]>(() => getPendingMessages());
  const [selectedId, setSelectedId] = useState<string>(() => getPendingMessages()[0]?.id ?? '');
  const [draft, setDraft] = useState('');
  const [attachPhoto, setAttachPhoto] = useState(false);

  // Live Audio / Video Call with Creator
  const [activeCallMode, setActiveCallMode] = useState<'video' | 'audio' | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);

  useEffect(() => {
    const handleSync = () => setThreads(getPendingMessages());
    window.addEventListener(STUDIO_WORKSPACE_EVENT, handleSync);
    return () => window.removeEventListener(STUDIO_WORKSPACE_EVENT, handleSync);
  }, []);

  useEffect(() => {
    if (!activeCallMode) {
      setCallSeconds(0);
      return;
    }
    const timer = window.setInterval(() => setCallSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, [activeCallMode]);

  const activeThread = threads.find((t) => t.id === selectedId) ?? threads[0]!;
  const logistics = getProjectLogisticsMeta(activeThread.projectId);

  const formatCallTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim() && !attachPhoto) return;
    const text =
      draft.trim() || `Shared a reference photo for ${activeThread.projectTitle}.`;
    const updated = replyToPendingMessage(
      activeThread.id,
      text,
      attachPhoto ? SAMPLE_CLIENT_INSPIRATION : undefined,
      'client',
    );
    setThreads(updated);
    setDraft('');
    setAttachPhoto(false);
  };

  const handleEndCall = () => {
    if (!activeCallMode) return;
    const duration = formatCallTime(Math.max(15, callSeconds));
    const updated = replyToPendingMessage(
      activeThread.id,
      `Client ${activeCallMode === 'video' ? 'Video' : 'Audio'} Call with Lead Creator Sarah Cabmora (${duration})`,
      undefined,
      'client',
      {
        mode: activeCallMode,
        status: 'completed',
        duration,
      },
    );
    setThreads(updated);
    setActiveCallMode(null);
  };

  return (
    <ClientPortalShell
      title="Messages & Live Studio Calls"
      subtitle="Direct conversation and audio/video calls with your photographer & videographer"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Project Thread Selector */}
        <div className="lg:col-span-4 space-y-2.5">
          {threads.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedId(t.id)}
              className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                t.id === activeThread.id
                  ? 'border-gold bg-gold/10 shadow-sm'
                  : 'border-ink/10 bg-white hover:border-gold/50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-serif text-[16px] font-semibold text-ink truncate">
                  {t.projectTitle}
                </span>
                <span className="text-[11px] text-ink/45 shrink-0">{t.receivedAt}</span>
              </div>
              <div className="text-[11.5px] text-gold font-medium mt-0.5">
                Lead Creator: Sarah Cabmora • ● Online
              </div>
              <p className="text-[12px] text-ink/60 truncate mt-1">{t.preview}</p>
            </button>
          ))}
        </div>

        {/* Active Conversation & Call Box */}
        <section className="lg:col-span-8 bg-white border border-ink/10 rounded-2xl overflow-hidden shadow-sm flex flex-col min-h-[540px]">
          <header className="p-4 sm:p-5 bg-forest text-canvas border-b border-gold/30 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
                alt="Sarah Cabmora"
                className="w-10 h-10 rounded-full object-cover border border-gold"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-[17px] font-bold text-white">
                    Sarah Cabmora (Lead Creator)
                  </h3>
                  <span className="text-[10.5px] text-emerald-400">● Online</span>
                </div>
                <div className="text-[11.5px] text-canvas/70 flex flex-wrap items-center gap-2">
                  <span>{activeThread.projectTitle}</span>
                  <span>•</span>
                  <span className="text-gold flex items-center gap-1">
                    <Navigation size={11} /> {logistics.venueDistanceKm} km to venue
                  </span>
                  <span>•</span>
                  <span className="text-rose-300 flex items-center gap-1">
                    <Clock size={11} /> {logistics.targetOffsetHours}h left
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveCallMode('audio')}
                className="px-3 py-2 rounded-xl bg-forest-light hover:bg-gold hover:text-ink text-canvas text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Phone size={14} />
                <span>Audio Call</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveCallMode('video')}
                className="px-3.5 py-2 rounded-xl bg-gold text-ink hover:bg-gold-dark text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Video size={14} />
                <span>Video Call</span>
              </button>
              <Link
                to={`/client/projects/${activeThread.projectId}`}
                className="px-3 py-2 rounded-xl border border-canvas/20 text-[12px] text-canvas hover:border-gold"
              >
                Gallery
              </Link>
            </div>
          </header>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[380px] bg-canvas/50">
            {activeThread.replies.map((msg) => {
              const mine = msg.sender === 'client';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-[13.5px] space-y-2 ${
                      msg.callEvent
                        ? 'bg-forest text-canvas border border-gold/40'
                        : mine
                          ? 'bg-ink text-canvas rounded-br-sm'
                          : 'bg-white text-ink border border-ink/10 rounded-bl-sm shadow-xs'
                    }`}
                  >
                    {msg.callEvent ? (
                      <div className="flex items-center gap-2.5">
                        {msg.callEvent.mode === 'video' ? (
                          <Video size={16} className="text-gold" />
                        ) : (
                          <Phone size={16} className="text-gold" />
                        )}
                        <div>
                          <div className="font-semibold text-[13px]">{msg.text}</div>
                          <div className="text-[11px] text-gold">
                            Call Duration: {msg.callEvent.duration}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p>{msg.text}</p>
                    )}

                    {msg.imageUrl && (
                      <img
                        src={msg.imageUrl}
                        alt="Shared reference"
                        className="w-full max-h-48 object-cover rounded-xl"
                      />
                    )}

                    <div
                      className={`text-[10.5px] flex items-center gap-1 ${
                        mine ? 'text-canvas/60 justify-end' : 'text-ink/45'
                      }`}
                    >
                      <span>{mine ? 'You' : 'Sarah Cabmora'} • {msg.time}</span>
                      {mine && <CheckCheck size={12} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-ink/10 space-y-2">
            {attachPhoto && (
              <div className="text-[11.5px] text-gold bg-sand px-3 py-1.5 rounded-lg flex items-center justify-between">
                <span>Attached: Reference Portrait Select</span>
                <button
                  type="button"
                  onClick={() => setAttachPhoto(false)}
                  className="text-ink/60 hover:text-ink"
                >
                  Remove
                </button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAttachPhoto((v) => !v)}
                className="p-2.5 rounded-xl border border-ink/15 text-ink/65 hover:border-gold hover:text-gold transition-colors cursor-pointer"
                title="Attach reference photo"
              >
                <ImagePlus size={16} />
              </button>
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write a message to your photographer Sarah Cabmora..."
                className="flex-1 rounded-xl border border-ink/15 bg-canvas px-4 py-2.5 text-[13.5px] outline-none focus:border-gold"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-ink text-white hover:bg-gold hover:text-ink font-semibold text-[13px] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send size={15} />
                <span>Send</span>
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* Live Call Modal for Client */}
      {activeCallMode && (
        <Modal
          open
          onOpenChange={(next) => !next && handleEndCall()}
          size="lg"
          tone="dark"
          title={`Live ${activeCallMode === 'video' ? 'Video' : 'Audio'} Call with Sarah Cabmora (${formatCallTime(callSeconds)})`}
        >
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-noir border border-gold/30 h-72 flex flex-col items-center justify-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
                alt="Sarah Cabmora"
                className="w-24 h-24 rounded-full object-cover border-2 border-gold"
              />
              <div className="text-center">
                <div className="font-serif text-[18px] font-bold text-white">Sarah Cabmora</div>
                <div className="text-[12px] text-gold">
                  {activeThread.projectTitle} • {formatCallTime(callSeconds)}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsMicMuted((m) => !m)}
                className="px-4 py-2 rounded-xl bg-forest border border-canvas/15 text-canvas text-[12.5px] font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                {isMicMuted ? <MicOff size={15} /> : <Mic size={15} />}
                <span>{isMicMuted ? 'Unmute' : 'Mute'}</span>
              </button>
              <button
                type="button"
                onClick={handleEndCall}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-[12.5px] font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <PhoneOff size={15} />
                <span>End Call</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </ClientPortalShell>
  );
}
