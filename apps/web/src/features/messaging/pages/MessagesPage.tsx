import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  FileText,
  Check,
  ImagePlus,
  Phone,
  Video,
  Mic,
  MicOff,
  PhoneOff,
  CheckCheck,
  Search,
  X,
} from 'lucide-react';
import { Modal } from '@cabmora/ui';
import { PortalAvatar, PortalBell, PortalShell, PortalTopbar } from '@/shared/portal';
import {
  STUDIO_WORKSPACE_EVENT,
  buildAiInvoiceDraft,
  getPendingMessages,
  markMessageRead,
  replyToPendingMessage,
  saveStudioInvoice,
  type PendingClientMessage,
} from '@/shared/collaboration/studioWorkspaceStore';

const SAMPLE_PROOF_IMAGE =
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=550&fit=crop';

export default function MessagesPage() {
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const [threads, setThreads] = useState<PendingClientMessage[]>(() => getPendingMessages());
  const [selectedId, setSelectedId] = useState<string>(() => getPendingMessages()[0]?.id ?? '');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [attachSampleProof, setAttachSampleProof] = useState(false);
  const [invoiceBanner, setInvoiceBanner] = useState<string | null>(null);

  // Live Call State inside Conversation
  const [activeCallMode, setActiveCallMode] = useState<'video' | 'audio' | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
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

  const filteredThreads = threads.filter(
    (t) =>
      t.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const activeThread =
    threads.find((t) => t.id === selectedId) ?? filteredThreads[0] ?? threads[0];

  const scrollChatToBottom = () => {
    window.setTimeout(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTo({
          top: chatScrollRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    }, 50);
  };

  const formatCallTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSelectThread = (id: string) => {
    setSelectedId(id);
    setThreads(markMessageRead(id));
    scrollChatToBottom();
  };

  const handleSendReply = (e: FormEvent) => {
    e.preventDefault();
    if (!activeThread || (!replyText.trim() && !attachSampleProof)) return;
    const text =
      replyText.trim() ||
      `Shared updated proof plate and studio schedule for ${activeThread.projectTitle}.`;
    const updated = replyToPendingMessage(
      activeThread.id,
      text,
      attachSampleProof ? SAMPLE_PROOF_IMAGE : undefined,
      'creator',
    );
    setThreads(updated);
    setReplyText('');
    setAttachSampleProof(false);
    scrollChatToBottom();
  };

  const handleEndCall = () => {
    if (!activeThread || !activeCallMode) return;
    const durationStr = formatCallTime(Math.max(12, callSeconds));
    const roomUrl = `https://meet.jit.si/cabmora-${activeThread.projectId}-${activeThread.id}`;
    const updated = replyToPendingMessage(
      activeThread.id,
      `${activeCallMode === 'video' ? 'Video' : 'Audio'} call with ${activeThread.clientName} (${durationStr})`,
      undefined,
      'creator',
      {
        mode: activeCallMode,
        status: 'completed',
        duration: durationStr,
        roomUrl,
      },
    );
    setThreads(updated);
    setActiveCallMode(null);
    scrollChatToBottom();
  };

  const handleGenerateInvoice = (thread: PendingClientMessage) => {
    const inv = buildAiInvoiceDraft({
      clientName: thread.clientName,
      clientEmail: thread.clientEmail,
      projectTitle: thread.projectTitle,
      amount: thread.suggestedInvoiceAmount || 4850,
      includeDrone: true,
    });
    saveStudioInvoice(inv);
    const updated = replyToPendingMessage(
      thread.id,
      `Issued Invoice ${inv.id} ($${inv.amount.toLocaleString()}) for ${thread.projectTitle}.`,
      undefined,
      'creator',
    );
    setThreads(updated);
    setInvoiceBanner(
      `Issued Invoice ${inv.id} ($${inv.amount.toLocaleString()}) to ${thread.clientName}`,
    );
    scrollChatToBottom();
  };

  return (
    <PortalShell>
      {({ toggleSidebar }) => (
        <div className="flex flex-col h-screen overflow-hidden">
          <PortalTopbar title="Messages" onToggleSidebar={toggleSidebar}>
            <PortalBell />
            <PortalAvatar src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" />
          </PortalTopbar>

          <main className="h-[calc(100vh-5rem)] p-4 sm:p-6 lg:p-8 overflow-hidden bg-canvas flex flex-col gap-4">
            {invoiceBanner && (
              <div className="px-5 py-2.5 rounded-xl bg-forest text-canvas border border-gold/40 flex items-center justify-between text-[12.5px] shrink-0">
                <span className="flex items-center gap-2 font-medium">
                  <Check size={14} className="text-gold" /> {invoiceBanner}
                </span>
                <div className="flex items-center gap-3">
                  <Link to="/billing" className="text-gold underline font-semibold">
                    View in Billing →
                  </Link>
                  <button
                    type="button"
                    onClick={() => setInvoiceBanner(null)}
                    className="text-canvas/60 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Clean Unified White Card Split Layout */}
            <div className="flex-1 min-h-0 bg-white border border-ink/10 rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
              {/* Left 4 Columns: Client Conversations List */}
              <aside className="lg:col-span-4 border-r border-ink/10 flex flex-col h-full overflow-hidden bg-white">
                <div className="p-4 border-b border-ink/10 shrink-0">
                  <div className="relative">
                    <Search
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40"
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search clients or projects..."
                      className="w-full bg-canvas border border-ink/10 rounded-xl pl-9 pr-3.5 py-2 text-[12.5px] text-ink placeholder:text-ink/40 outline-none focus:border-gold transition-colors"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-ink/5">
                  {filteredThreads.map((thread) => {
                    const isSelected = activeThread?.id === thread.id;
                    return (
                      <button
                        key={thread.id}
                        type="button"
                        onClick={() => handleSelectThread(thread.id)}
                        className={`w-full p-4 text-left transition-colors flex items-start gap-3.5 cursor-pointer ${
                          isSelected
                            ? 'bg-sand/80 border-l-4 border-gold'
                            : 'bg-white hover:bg-canvas'
                        }`}
                      >
                        <div className="relative shrink-0">
                          <img
                            src={thread.clientAvatar}
                            alt={thread.clientName}
                            className="w-11 h-11 rounded-full object-cover border border-ink/10"
                          />
                          <span
                            className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"
                            title="Online"
                          />
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-[13.5px] text-ink truncate">
                              {thread.clientName}
                            </span>
                            <span className="text-[11px] text-ink/45 shrink-0">
                              {thread.receivedAt}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11.5px] text-gold font-medium truncate">
                              {thread.projectTitle}
                            </span>
                            {thread.unread && (
                              <span className="w-2 h-2 rounded-full bg-gold shrink-0" />
                            )}
                          </div>

                          <p className="text-[12px] text-ink/55 line-clamp-1">{thread.preview}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </aside>

              {/* Right 8 Columns: Active Conversation Stream */}
              {activeThread ? (
                <section className="lg:col-span-8 flex flex-col h-full overflow-hidden bg-white">
                  {/* Clean Conversation Header */}
                  <header className="px-6 py-4 border-b border-ink/10 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={activeThread.clientAvatar}
                          alt={activeThread.clientName}
                          className="w-10 h-10 rounded-full object-cover border border-ink/10"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-serif text-[18px] font-semibold text-ink truncate">
                          {activeThread.clientName}
                        </h3>
                        <p className="text-[12px] text-ink/55 truncate">
                          {activeThread.projectTitle} •{' '}
                          <span className="text-emerald-600 font-medium">Online</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveCallMode('audio')}
                        className="px-3.5 py-2 rounded-xl border border-ink/15 bg-white text-ink hover:border-gold text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Start Audio Call"
                      >
                        <Phone size={14} className="text-gold" />
                        <span>Audio Call</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveCallMode('video')}
                        className="px-3.5 py-2 rounded-xl border border-ink/15 bg-white text-ink hover:border-gold text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Start Video Call"
                      >
                        <Video size={14} className="text-gold" />
                        <span>Video Call</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleGenerateInvoice(activeThread)}
                        className="px-3.5 py-2 rounded-xl bg-gold text-ink hover:bg-gold-dark text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FileText size={14} />
                        <span>Invoice</span>
                      </button>
                    </div>
                  </header>

                  {/* Active Call Strip (if an audio call is running inline) */}
                  {activeCallMode === 'audio' && (
                    <div className="px-6 py-3 bg-forest text-canvas border-b border-gold/30 flex items-center justify-between gap-4 shrink-0">
                      <div className="flex items-center gap-2.5 text-[12.5px]">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-semibold">
                          Audio Call with {activeThread.clientName}
                        </span>
                        <span className="font-mono text-gold">{formatCallTime(callSeconds)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsMicMuted((m) => !m)}
                          className="px-3 py-1 rounded-lg bg-forest-light text-canvas text-[11.5px] flex items-center gap-1 cursor-pointer"
                        >
                          {isMicMuted ? <MicOff size={13} /> : <Mic size={13} />}
                          <span>{isMicMuted ? 'Unmute' : 'Mute'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleEndCall}
                          className="px-3 py-1 rounded-lg bg-rose-600 text-white text-[11.5px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <PhoneOff size={13} />
                          <span>End</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Messages Feed — Clean, Airy Canvas Stream */}
                  <div
                    ref={chatScrollRef}
                    className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 bg-canvas/60"
                  >
                    {activeThread.replies.map((msg) => {
                      if (msg.callEvent) {
                        return (
                          <div key={msg.id} className="flex justify-center py-1">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sand border border-ink/10 text-[11.5px] text-ink/70">
                              {msg.callEvent.mode === 'video' ? (
                                <Video size={13} className="text-gold" />
                              ) : (
                                <Phone size={13} className="text-gold" />
                              )}
                              <span className="font-medium text-ink">{msg.text}</span>
                              <span className="text-ink/45">• {msg.time}</span>
                            </div>
                          </div>
                        );
                      }

                      const isCreator = msg.sender === 'creator';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isCreator ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed space-y-2 ${
                              isCreator
                                ? 'bg-ink text-white rounded-br-sm'
                                : 'bg-white text-ink border border-ink/10 rounded-bl-sm shadow-2xs'
                            }`}
                          >
                            <p>{msg.text}</p>
                            {msg.imageUrl && (
                              <img
                                src={msg.imageUrl}
                                alt="Shared attachment"
                                className="w-full max-h-52 object-cover rounded-xl border border-ink/10"
                              />
                            )}
                          </div>
                          <div className="mt-1 px-1 flex items-center gap-1 text-[10.5px] text-ink/45">
                            <span>{msg.time}</span>
                            {isCreator && <CheckCheck size={12} className="text-gold" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Clean Bottom Message Composer */}
                  <form
                    onSubmit={handleSendReply}
                    className="px-5 py-3.5 bg-white border-t border-ink/10 space-y-2 shrink-0"
                  >
                    {attachSampleProof && (
                      <div className="flex items-center justify-between text-[11.5px] text-ink bg-sand px-3 py-1.5 rounded-lg border border-ink/10">
                        <span className="flex items-center gap-1.5 font-medium">
                          <ImagePlus size={14} className="text-gold" />
                          Attached: High-Res Golden Hour Proof Plate
                        </span>
                        <button
                          type="button"
                          onClick={() => setAttachSampleProof(false)}
                          className="text-ink/50 hover:text-ink"
                        >
                          Remove
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setAttachSampleProof((v) => !v)}
                        className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                          attachSampleProof
                            ? 'bg-gold/15 border-gold text-ink'
                            : 'bg-canvas border-ink/10 text-ink/60 hover:border-gold hover:text-ink'
                        }`}
                        title="Attach image"
                      >
                        <ImagePlus size={17} />
                      </button>

                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Message ${activeThread.clientName}...`}
                        className="flex-1 bg-canvas border border-ink/10 rounded-xl px-4 py-2.5 text-[13.5px] text-ink placeholder:text-ink/40 outline-none focus:border-gold transition-colors"
                      />

                      <button
                        type="submit"
                        disabled={!replyText.trim() && !attachSampleProof}
                        className="px-5 py-2.5 rounded-xl bg-ink text-white hover:bg-gold hover:text-ink disabled:opacity-40 font-semibold text-[13px] flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Send size={14} />
                        <span>Send</span>
                      </button>
                    </div>
                  </form>
                </section>
              ) : (
                <div className="lg:col-span-8 flex items-center justify-center p-8">
                  <div className="text-center">
                    <MessageSquare size={40} className="mx-auto text-ink/20 mb-3" />
                    <h2 className="font-serif text-[20px] text-ink">Select a conversation</h2>
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* Video Call Modal */}
          {activeCallMode === 'video' && activeThread && (
            <Modal
              open
              onOpenChange={(next) => !next && handleEndCall()}
              size="lg"
              tone="dark"
              title={`Video Call with ${activeThread.clientName} (${formatCallTime(callSeconds)})`}
            >
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-noir border border-gold/30 h-80 flex items-center justify-center">
                  <img
                    src={activeThread.clientAvatar}
                    alt={activeThread.clientName}
                    className="w-24 h-24 rounded-full object-cover border-2 border-gold shadow-xl"
                  />
                  <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-xl bg-noir/80 text-canvas text-[12px] font-medium">
                    {activeThread.clientName} • {activeThread.projectTitle}
                  </div>
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono">
                    ● {formatCallTime(callSeconds)}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsMicMuted((m) => !m)}
                    className="px-4 py-2 rounded-xl bg-forest border border-canvas/15 text-canvas text-[12.5px] font-medium flex items-center gap-2 cursor-pointer"
                  >
                    {isMicMuted ? <MicOff size={15} /> : <Mic size={15} />}
                    <span>{isMicMuted ? 'Unmute' : 'Mute'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleEndCall}
                    className="px-5 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-[12.5px] font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <PhoneOff size={15} />
                    <span>End Call</span>
                  </button>
                </div>
              </div>
            </Modal>
          )}
        </div>
      )}
    </PortalShell>
  );
}
