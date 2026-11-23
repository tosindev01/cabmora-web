import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Image as ImageIcon, MessageSquare, Send } from 'lucide-react';

import { ApiError } from '@cabmora/api-client';
import { sentenceCase } from '@cabmora/ui';

import { ClientPortalShell } from '@/features/client/components/ClientPortalShell';
import {
  STAGE_LABEL,
  addMyProjectComment,
  listMyConversations,
  type Conversation,
} from '@/features/client/api';
import { useAuth } from '@/shared/auth';

function when(iso: string): string {
  const at = new Date(iso);
  const today = new Date().toDateString() === at.toDateString();
  return today
    ? at.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : at.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/**
 * Everything said between a client and us, grouped by the work it is about.
 *
 * The gallery already carries what was said about one photograph. What it
 * could not answer is "when will the rest be ready?" — a question about the
 * project rather than any frame in it. With nowhere to ask that, a client
 * asks by email, which is the thing this portal exists to replace.
 *
 * Replaces a placeholder that said messaging had not been built. It mostly
 * had: comments, amendments and authorship were all real, and nothing
 * gathered them into a conversation.
 */
export default function ClientMessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const found = await listMyConversations();
      setConversations(found);
      // Open the most recent on arrival. A list of one that you still have to
      // click is a list of one you wonder about.
      setOpenId((current) => current ?? found[0]?.project_id ?? null);
    } catch (err) {
      setConversations([]);
      setError(err instanceof ApiError ? err.message : 'Could not load your messages.');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const open = conversations?.find((c) => c.project_id === openId) ?? null;

  async function send() {
    if (!draft.trim() || !open) return;
    setSending(true);
    setError(null);
    try {
      await addMyProjectComment(open.project_id, { body: draft.trim() });
      setDraft('');
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send that.');
    } finally {
      setSending(false);
    }
  }

  return (
    <ClientPortalShell title="Messages" subtitle="Everything said about your work, in one place">
      {conversations === null ? (
        <p className="text-ink/50 text-[14px] py-12">Loading…</p>
      ) : conversations.length === 0 ? (
        <div className="border border-ink/10 bg-white rounded-xl p-12 text-center">
          <MessageSquare size={28} className="mx-auto mb-4 text-gold" strokeWidth={1.5} />
          <p className="text-[14px] text-ink/55 max-w-[420px] mx-auto">
            Once we have booked a shoot for you, this is where you and your photographer talk about
            it.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 items-start">
          {/* Which conversation. Hidden on a phone once one is open, because
              two panels at 375px is two cramped panels. */}
          <ul className={`space-y-2 ${open ? 'hidden lg:block' : ''}`}>
            {conversations.map((conversation) => {
              const last = conversation.messages[conversation.messages.length - 1];
              return (
                <li key={conversation.project_id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(conversation.project_id)}
                    className={`w-full text-left border rounded-xl px-4 py-3 transition-colors cursor-pointer ${
                      conversation.project_id === openId
                        ? 'border-gold bg-gold/8'
                        : 'border-ink/10 bg-white hover:border-gold/40'
                    }`}
                  >
                    <p className="font-medium text-[14.5px] truncate">
                      {sentenceCase(conversation.project_title)}
                    </p>
                    <p className="text-[12.5px] text-ink/50 truncate">
                      {last ? last.body : 'No messages yet'}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>

          {open && (
            <section className="border border-ink/10 bg-white rounded-xl flex flex-col min-h-[420px]">
              <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-ink/10">
                <div className="min-w-0">
                  <p className="font-medium truncate">{sentenceCase(open.project_title)}</p>
                  <p className="text-[12.5px] text-ink/50">{STAGE_LABEL[open.stage]}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setOpenId(null)}
                    className="lg:hidden text-[12px] uppercase tracking-[0.1em] font-semibold text-ink/50"
                  >
                    All
                  </button>
                  <Link
                    to={`/client/projects/${open.project_id}`}
                    className="text-[11px] tracking-[0.15em] uppercase text-gold hover:text-ink font-semibold whitespace-nowrap"
                  >
                    Open gallery
                  </Link>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 max-h-[52vh]">
                {open.messages.length === 0 ? (
                  <p className="text-[13.5px] text-ink/45 py-6 text-center">
                    Nothing said yet. Ask us anything about this shoot.
                  </p>
                ) : (
                  open.messages.map((message) => {
                    const mine = message.author_id === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-xl px-4 py-2.5 ${
                            mine ? 'bg-ink text-canvas' : 'bg-canvas text-ink'
                          }`}
                        >
                          {/* Said where it was said. A remark about one
                              photograph reads as a non-sequitur in a project
                              thread without this. */}
                          {message.asset_id && (
                            <span
                              className={`flex items-center gap-1.5 text-[11px] mb-1 ${
                                mine ? 'text-canvas/55' : 'text-ink/45'
                              }`}
                            >
                              <ImageIcon size={11} />
                              About one photograph
                            </span>
                          )}
                          <p className="text-[14px] leading-relaxed whitespace-pre-line">
                            {message.body}
                          </p>
                        </div>
                        <span className="text-[11.5px] text-ink/40 mt-1 px-1">
                          {mine ? 'You' : message.author_name} · {when(message.created_at)}
                          {message.needs_action && ' · awaiting us'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {error && (
                <p role="alert" className="text-[13px] text-red-700 px-5 pb-2">
                  {error}
                </p>
              )}

              <div className="border-t border-ink/10 p-4 flex items-end gap-2">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    // Enter sends, shift+enter breaks the line — the habit
                    // from every other message box they use.
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      void send();
                    }
                  }}
                  rows={2}
                  maxLength={2000}
                  placeholder="Ask us anything about this shoot…"
                  className="flex-1 rounded-lg border border-ink/15 bg-canvas px-3.5 py-2.5 text-[14px] leading-relaxed outline-none focus:border-gold resize-none"
                />
                <button
                  type="button"
                  onClick={() => void send()}
                  disabled={sending || !draft.trim()}
                  aria-label="Send message"
                  className="shrink-0 w-11 h-11 rounded-full bg-ink text-white flex items-center justify-center hover:bg-gold hover:text-ink transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <Send size={16} />
                </button>
              </div>
            </section>
          )}
        </div>
      )}
    </ClientPortalShell>
  );
}
