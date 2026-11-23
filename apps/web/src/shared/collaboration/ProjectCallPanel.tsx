import { useState, type FormEvent } from 'react';
import {
  Video,
  Calendar,
  Clock,
  Check,
  X,
  PhoneCall,
  ExternalLink,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { Modal } from '@cabmora/ui';
import type { ProjectCallDto } from '@cabmora/api-client';

interface ProjectCallPanelProps {
  calls: ProjectCallDto[];
  currentUserId?: string;
  onRequestCall: (payload: {
    title: string;
    proposed_at: string;
    duration_minutes: number;
    notes: string;
  }) => Promise<void>;
  onRespondCall: (
    callId: string,
    action: 'accept' | 'decline' | 'cancel' | 'complete' | 'reschedule',
    proposedAt?: string,
  ) => Promise<void>;
  compact?: boolean;
}

const STATUS_BADGE: Record<ProjectCallDto['status'], string> = {
  pending: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  accepted: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  declined: 'bg-rose-500/15 text-rose-600 border-rose-500/30',
  cancelled: 'bg-ink/10 text-ink/60 border-ink/15',
  completed: 'bg-gold/20 text-gold-deep border-gold/40',
};

export function ProjectCallPanel({
  calls,
  currentUserId,
  onRequestCall,
  onRespondCall,
  compact = false,
}: ProjectCallPanelProps) {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [title, setTitle] = useState('Creative Review & Feedback Call');
  const [dateStr, setDateStr] = useState(() => {
    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  });
  const [timeStr, setTimeStr] = useState('14:00');
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [activeVideoCall, setActiveVideoCall] = useState<ProjectCallDto | null>(null);

  const handleSubmitRequest = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dateStr || !timeStr) return;
    setSubmitting(true);
    try {
      const iso = new Date(`${dateStr}T${timeStr}:00`).toISOString();
      await onRequestCall({
        title: title.trim(),
        proposed_at: iso,
        duration_minutes: duration,
        notes: notes.trim(),
      });
      setIsRequestModalOpen(false);
      setNotes('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-[19px] font-semibold flex items-center gap-2">
            <Video size={18} className="text-gold" />
            <span>Video Calls & Meeting History</span>
          </h3>
          {!compact && (
            <p className="text-[12.5px] text-ink/60">
              Request a call with a preferred date & time. Video rooms open once the recipient
              accepts.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsRequestModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gold text-ink text-[12.5px] font-semibold hover:bg-gold-dark transition-colors flex items-center gap-2 shadow-sm"
        >
          <PhoneCall size={15} />
          <span>Request a Call</span>
        </button>
      </div>

      {calls.length === 0 ? (
        <div className="p-8 rounded-2xl border border-ink/10 bg-white text-center text-[13px] text-ink/55">
          No call requests yet for this project. Click <strong>Request a Call</strong> to schedule a
          meeting.
        </div>
      ) : (
        <div className="space-y-3">
          {calls.map((c) => {
            const isRecipient = currentUserId ? c.recipient_id === currentUserId : false;
            const isRequester = currentUserId ? c.requester_id === currentUserId : false;

            return (
              <div
                key={c.id}
                className="p-4 rounded-2xl border border-ink/10 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-[14px]">{c.title}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10.5px] uppercase tracking-wider font-bold border ${STATUS_BADGE[c.status]}`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-[12px] text-ink/65">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-gold" />
                      {new Date(c.proposed_at).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} className="text-gold" />
                      {c.duration_minutes} mins
                    </span>
                    <span>
                      Requested by <strong>{c.requester_name}</strong> →{' '}
                      <strong>{c.recipient_name}</strong>
                    </span>
                  </div>

                  {c.notes && <p className="text-[12.5px] text-ink/75">{c.notes}</p>}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {c.status === 'pending' && isRecipient && (
                    <>
                      <button
                        type="button"
                        onClick={() => void onRespondCall(c.id, 'accept')}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-[12px] font-semibold hover:bg-emerald-700 flex items-center gap-1.5"
                      >
                        <Check size={14} /> Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => void onRespondCall(c.id, 'decline')}
                        className="px-3.5 py-2 rounded-xl border border-rose-500/30 text-rose-600 text-[12px] font-semibold hover:bg-rose-500/10 flex items-center gap-1.5"
                      >
                        <X size={14} /> Decline
                      </button>
                    </>
                  )}

                  {c.status === 'pending' && isRequester && (
                    <button
                      type="button"
                      onClick={() => void onRespondCall(c.id, 'cancel')}
                      className="px-3 py-1.5 rounded-xl border border-ink/15 text-ink/65 text-[12px] hover:text-ink"
                    >
                      Cancel Request
                    </button>
                  )}

                  {c.status === 'accepted' && c.meeting_url && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveVideoCall(c)}
                        className="px-4 py-2 rounded-xl bg-gold text-ink text-[12px] font-semibold hover:bg-gold-dark flex items-center gap-1.5 shadow-sm"
                      >
                        <Video size={14} /> Join Video Call
                      </button>
                      <button
                        type="button"
                        onClick={() => void onRespondCall(c.id, 'complete')}
                        className="px-3 py-2 rounded-xl border border-ink/15 text-ink/70 text-[12px] hover:border-gold flex items-center gap-1"
                        title="Mark call completed"
                      >
                        <CheckCircle2 size={14} /> Done
                      </button>
                    </>
                  )}

                  {c.status === 'declined' && (
                    <span className="text-[11.5px] text-rose-600 flex items-center gap-1">
                      <XCircle size={13} /> Declined
                    </span>
                  )}

                  {c.status === 'completed' && (
                    <span className="text-[11.5px] text-emerald-600 flex items-center gap-1 font-medium">
                      <RefreshCw size={12} /> Completed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Request a Call Modal */}
      {isRequestModalOpen && (
        <Modal
          open
          onOpenChange={(next) => {
            if (!next) setIsRequestModalOpen(false);
          }}
          size="md"
          title="Request a Video Call"
        >
          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <p className="text-[13px] text-ink/65">
              Select your preferred date and time. The other party will receive an instant
              notification to accept or decline before the call can start.
            </p>

            <div>
              <label className="block text-[12px] font-medium mb-1">Meeting Topic</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-ink/15 rounded-xl px-3.5 py-2.5 text-[13.5px] outline-none focus:border-gold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[12px] font-medium mb-1">Preferred Date</label>
                <input
                  type="date"
                  required
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-full border border-ink/15 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1">Preferred Time</label>
                <input
                  type="time"
                  required
                  value={timeStr}
                  onChange={(e) => setTimeStr(e.target.value)}
                  className="w-full border border-ink/15 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1">Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full border border-ink/15 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-gold"
                >
                  <option value={15}>15 mins</option>
                  <option value={30}>30 mins</option>
                  <option value={45}>45 mins</option>
                  <option value={60}>60 mins</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium mb-1">Agenda / Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What would you like to review on this call?"
                className="w-full border border-ink/15 rounded-xl p-3 text-[13px] outline-none focus:border-gold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-ink/15 text-[12.5px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-gold text-ink font-semibold text-[12.5px] hover:bg-gold-dark"
              >
                {submitting ? 'Sending Request…' : 'Send Call Request'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Embedded Live Video Call Room Modal */}
      {activeVideoCall && activeVideoCall.meeting_url && (
        <Modal
          open
          onOpenChange={(next) => {
            if (!next) setActiveVideoCall(null);
          }}
          layout="fullscreen"
          tone="dark"
          chrome="none"
          title={activeVideoCall.title}
        >
          <div className="w-full h-full flex flex-col bg-noir text-canvas">
            <div className="px-6 py-3.5 bg-panel-900 border-b border-canvas/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <div className="font-serif text-[16px] font-bold text-white">
                    {activeVideoCall.title}
                  </div>
                  <div className="text-[11px] text-canvas/60">
                    {activeVideoCall.project_title} • {activeVideoCall.duration_minutes} mins
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={activeVideoCall.meeting_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg border border-canvas/15 text-[12px] text-gold hover:bg-canvas/5 flex items-center gap-1.5"
                >
                  <span>Open in New Tab</span>
                  <ExternalLink size={13} />
                </a>
                <button
                  type="button"
                  onClick={() => setActiveVideoCall(null)}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 text-white text-[12px] font-semibold hover:bg-rose-700"
                >
                  Leave Call
                </button>
              </div>
            </div>

            <iframe
              src={`${activeVideoCall.meeting_url}#config.prejoinPageEnabled=false`}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              className="w-full flex-1 border-0 bg-noir"
              title={activeVideoCall.title}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
