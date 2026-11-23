import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Send, ArrowUpRight, Bot } from 'lucide-react';
import {
  collaborationApi,
  type BriefingActionItemDto,
  type CreatorBriefingDto,
} from '@cabmora/api-client';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  links?: BriefingActionItemDto[];
}

interface CreatorAiAssistantPanelProps {
  briefing: CreatorBriefingDto | null;
}

const QUICK_PROMPTS = [
  'What needs my attention today?',
  'Any pending call requests?',
  'Client revisions?',
  'Upcoming deadlines?',
];

export function CreatorAiAssistantPanel({ briefing }: CreatorAiAssistantPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-ai',
      sender: 'ai',
      text:
        briefing?.summary_text ||
        'Hello! I can summarize your active projects, pending tasks, client revisions, deadlines, and call requests.',
      links: briefing?.action_items.slice(0, 2),
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, sender: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await collaborationApi.chatCreatorBriefing(trimmed);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'ai',
          text: res.reply,
          links: res.suggested_links,
        },
      ]);
    } catch {
      const q = trimmed.toLowerCase();
      let reply =
        briefing?.summary_text ||
        'You are all caught up across your assigned projects and tasks.';
      let links = briefing?.action_items.slice(0, 3) ?? [];

      if (q.includes('call')) {
        reply = briefing?.pending_calls_count
          ? `You have ${briefing.pending_calls_count} pending call request(s).`
          : 'You have no pending call requests right now.';
        links = (briefing?.action_items ?? []).filter((i) => i.kind === 'call');
      } else if (q.includes('revision') || q.includes('feedback')) {
        reply = `There are ${briefing?.revision_requests_count ?? 0} open revision request(s) and ${briefing?.unread_comments_count ?? 0} design comment(s).`;
        links = (briefing?.action_items ?? []).filter(
          (i) => i.kind === 'revision' || i.kind === 'comment',
        );
      } else if (q.includes('deadline')) {
        reply = `You have ${briefing?.upcoming_deadlines_count ?? 0} upcoming project deadline(s) in the next 14 days.`;
        links = (briefing?.action_items ?? []).filter((i) => i.kind === 'deadline');
      }

      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, sender: 'ai', text: reply, links },
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
    <aside className="bg-forest text-canvas border border-gold/25 rounded-2xl overflow-hidden flex flex-col h-[580px] sticky top-24 shadow-xl">
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
            <span className="text-[11px] text-canvas/60">Live workspace intelligence</span>
          </div>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Online" />
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
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-gold text-ink font-medium rounded-br-sm'
                  : 'bg-forest-light/70 text-canvas border border-canvas/10 rounded-bl-sm'
              }`}
            >
              {m.sender === 'ai' && (
                <div className="flex items-center gap-1 text-[10.5px] uppercase tracking-wider text-gold font-bold mb-1">
                  <Bot size={12} /> Cabmora AI
                </div>
              )}
              <p>{m.text}</p>

              {m.links && m.links.length > 0 && (
                <div className="mt-2.5 space-y-1.5 pt-2 border-t border-canvas/10">
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
          <div className="text-[11.5px] text-gold animate-pulse">Analyzing workspace…</div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-forest-dark border-t border-canvas/10 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI about tasks, calls, or revisions..."
          className="flex-1 bg-forest border border-canvas/15 rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder:text-canvas/45 outline-none focus:border-gold"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          aria-label="Send message to AI"
          className="p-2.5 rounded-xl bg-gold text-ink hover:bg-gold-dark disabled:opacity-50 transition-colors cursor-pointer"
        >
          <Send size={16} />
        </button>
      </form>
    </aside>
  );
}
