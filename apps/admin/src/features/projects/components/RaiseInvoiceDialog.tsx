import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

import { ApiError } from '@cabmora/api-client';
import { Modal, formatMinor } from '@cabmora/ui';
import type { Project } from '@cabmora/api-client';

import { createInvoice, issueInvoice } from '@/shared/billing/api';

interface Line {
  description: string;
  quantity: string;
  amount: string;
}

/** Thirty days is the default everywhere else in the product; it is a term,
 *  not a constant anybody should have to think about every time. */
const DEFAULT_TERM_DAYS = 30;

function inDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * Raising a bill from the project it is for.
 *
 * The invoice screens can already do this, but from a list of every project
 * in the business — which means finding the one you are already looking at,
 * and re-entering what it is worth. Here the project is the context, so the
 * price agreed on the Details tab becomes the first line and usually the only
 * one.
 *
 * Creating and issuing are kept as two acts even though this offers both in
 * one go. A draft burns no number; issuing does, and it emails the client. A
 * dialog that quietly did the second while saying the first would send a bill
 * somebody meant to check over first.
 */
export function RaiseInvoiceDialog({
  project,
  onRaised,
  onClose,
}: {
  project: Project;
  onRaised: () => void;
  onClose: () => void;
}) {
  const [lines, setLines] = useState<Line[]>([
    {
      description: `${project.event_type} — photography`,
      quantity: '1',
      // Pre-filled from the agreed price so the usual case is one click.
      amount: project.price_minor != null ? (project.price_minor / 100).toFixed(2) : '',
    },
  ]);
  const [dueAt, setDueAt] = useState(inDays(DEFAULT_TERM_DAYS));
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalMinor = lines.reduce((sum, line) => {
    const amount = Math.round(Number(line.amount) * 100);
    const quantity = Number(line.quantity);
    if (!Number.isFinite(amount) || !Number.isFinite(quantity)) return sum;
    return sum + amount * quantity;
  }, 0);

  function update(index: number, patch: Partial<Line>) {
    setLines((current) => current.map((line, at) => (at === index ? { ...line, ...patch } : line)));
  }

  async function submit(send: boolean) {
    const items = lines
      .filter((line) => line.description.trim())
      .map((line) => ({
        description: line.description.trim(),
        quantity: Number(line.quantity) || 1,
        // Pounds to pence at the edge. Nothing downstream sees a float.
        unit_amount_minor: Math.round(Number(line.amount) * 100),
      }));
    if (items.length === 0 || items.some((item) => !Number.isFinite(item.unit_amount_minor))) {
      setError('Give each line a description and an amount.');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const invoice = await createInvoice({
        project_id: project.id,
        customer_id: project.customer_id ?? undefined,
        due_at: new Date(dueAt).toISOString(),
        line_items: items,
        notes: notes.trim() || undefined,
      });
      if (send) await issueInvoice(invoice.id);
      onRaised();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Could not raise that invoice.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open onOpenChange={(next) => !next && onClose()} title="Raise an invoice" size="md">
      {project.customer_id === null ? (
        <p className="text-[13.5px] text-ink/70 leading-relaxed">
          This project has no client on it yet. Assign one under Details and you will be able to
          bill it.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            {lines.map((line, index) => (
              <div key={index} className="flex items-end gap-2">
                <label className="flex-1 min-w-0">
                  {index === 0 && (
                    <span className="block text-[11px] font-bold uppercase tracking-[0.08em] text-ink/50 mb-1.5">
                      What for
                    </span>
                  )}
                  <input
                    value={line.description}
                    onChange={(event) => update(index, { description: event.target.value })}
                    className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-[13.5px] outline-none focus:border-gold"
                  />
                </label>
                <label className="w-[70px] shrink-0">
                  {index === 0 && (
                    <span className="block text-[11px] font-bold uppercase tracking-[0.08em] text-ink/50 mb-1.5">
                      Qty
                    </span>
                  )}
                  <input
                    value={line.quantity}
                    onChange={(event) => update(index, { quantity: event.target.value })}
                    inputMode="numeric"
                    className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-[13.5px] outline-none focus:border-gold tabular-nums"
                  />
                </label>
                <label className="w-[110px] shrink-0">
                  {index === 0 && (
                    <span className="block text-[11px] font-bold uppercase tracking-[0.08em] text-ink/50 mb-1.5">
                      Each (£)
                    </span>
                  )}
                  <input
                    value={line.amount}
                    onChange={(event) => update(index, { amount: event.target.value })}
                    inputMode="decimal"
                    className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-[13.5px] outline-none focus:border-gold tabular-nums"
                  />
                </label>
                {lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setLines((current) => current.filter((_, at) => at !== index))}
                    aria-label={`Remove line ${index + 1}`}
                    className="shrink-0 p-2 rounded-lg text-ink/40 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setLines((current) => [...current, { description: '', quantity: '1', amount: '' }])
              }
              className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.08em] text-ink/50 hover:text-ink cursor-pointer"
            >
              <Plus size={13} />
              Add a line
            </button>
          </div>

          <div className="flex items-end gap-3">
            <label className="flex-1">
              <span className="block text-[11px] font-bold uppercase tracking-[0.08em] text-ink/50 mb-1.5">
                Due by
              </span>
              <input
                type="date"
                value={dueAt}
                onChange={(event) => setDueAt(event.target.value)}
                className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-[13.5px] outline-none focus:border-gold"
              />
            </label>
            <p className="text-[14px] font-medium tabular-nums pb-2">
              Total {formatMinor(totalMinor)}
            </p>
          </div>

          <label className="block">
            <span className="block text-[11px] font-bold uppercase tracking-[0.08em] text-ink/50 mb-1.5">
              Note on the invoice
            </span>
            <input
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional"
              className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-[13.5px] outline-none focus:border-gold"
            />
          </label>

          {/* Said before the buttons, because the difference between them is
              the whole point and one of them cannot be taken back. */}
          <p className="text-[12.5px] text-ink/50 leading-relaxed border-t border-ink/10 pt-3">
            Saving as a draft burns no invoice number and tells nobody. Sending it numbers the
            invoice permanently and emails {project.customer_name ?? 'the client'} with the PDF and
            how to pay.
          </p>

          {error && <p className="text-[13px] text-red-700">{error}</p>}

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void submit(true)}
              className="px-5 py-2.5 text-[12px] font-bold rounded-full uppercase tracking-[0.05em] bg-ink text-white hover:bg-gold hover:text-ink transition-colors cursor-pointer disabled:opacity-50"
            >
              {busy ? 'Working…' : 'Raise and send'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void submit(false)}
              className="px-5 py-2.5 text-[12px] font-bold rounded-full uppercase tracking-[0.05em] border border-ink/15 text-ink/70 hover:bg-canvas transition-colors cursor-pointer disabled:opacity-50"
            >
              Save as draft
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
