import { Modal } from '@cabmora/ui';
import { AlertTriangle, Check } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '@cabmora/api-client';

import {
  listUnmatchedFunds,
  markFundsHandled,
  type UnmatchedFunds,
} from '@/features/billing/api';
import { formatDate, formatMinor } from '@/features/billing/display';

/**
 * Money the gateway is holding that belongs to no invoice.
 *
 * It exists because every other part of this working correctly still produces
 * silence. A client transfers before the invoice is raised, or sends short;
 * the gateway attributes it to their customer record and settles nothing; the
 * invoice goes on reading unpaid. The client believes they have paid, and
 * until this panel the only place that disagreement was visible was Stripe's
 * own dashboard.
 *
 * Sits on the payments screen rather than in its own nav entry, because the
 * person who reconciles the account is already here and a row of money nobody
 * can place is not a destination anyone would think to visit.
 *
 * Renders nothing when there is nothing outstanding. A permanently empty
 * panel on a money screen trains people to scroll past the spot where this
 * will one day appear.
 */
export function UnmatchedFundsPanel() {
  const [rows, setRows] = useState<UnmatchedFunds[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<UnmatchedFunds | null>(null);

  const load = useCallback(async () => {
    try {
      const page = await listUnmatchedFunds({ handled: false, limit: 20 });
      setRows(page.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load unplaced funds.');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) {
    return (
      <div
        role="alert"
        className="bg-red-50 border border-red-200 text-red-800 px-5 py-3 rounded-xl text-[14.5px]"
      >
        {error}
      </div>
    );
  }

  if (!rows || rows.length === 0) return null;

  return (
    <>
      <section className="bg-white border border-amber-300 rounded-xl shadow-xs overflow-hidden">
        <header className="flex items-start gap-3 px-5 py-4 bg-amber-50 border-b border-amber-200">
          <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-[16px] font-medium text-ink">
              {rows.length === 1
                ? 'A payment arrived that matches no invoice'
                : `${rows.length} payments arrived that match no invoice`}
            </h2>
            <p className="text-[13.5px] text-ink/65 mt-0.5">
              The gateway is holding this money against the customer. It settles nothing, and
              their invoice still reads unpaid — most often because they paid before the invoice
              was raised, or paid short.
            </p>
          </div>
        </header>

        <table className="w-full text-left">
          <thead className="bg-canvas border-b border-ink/10">
            <tr className="text-[11.5px] uppercase tracking-[0.12em] font-bold text-ink/50">
              <th className="px-5 py-3">Received</th>
              <th className="px-5 py-3">From</th>
              <th className="px-5 py-3 text-right">Amount</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/8">
            {rows.map((row) => (
              <tr key={row.id} className="text-[14.5px]">
                <td className="px-5 py-3.5 text-ink/70 whitespace-nowrap">
                  {formatDate(row.received_at)}
                </td>
                <td className="px-5 py-3.5">
                  {row.customer_name ? (
                    <>
                      <span className="text-ink">{row.customer_name}</span>
                      {row.customer_email && (
                        <span className="block text-[12.5px] text-ink/50">
                          {row.customer_email}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Not a failed lookup. A customer created by hand in
                          the gateway's dashboard has no account here, and the
                          money is no less real for it. */}
                      <span className="text-ink/60 italic">Not a Cabmora account</span>
                      <span className="block text-[12.5px] text-ink/45 font-mono">
                        {row.gateway_customer_reference}
                      </span>
                    </>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right font-medium tabular-nums text-ink whitespace-nowrap">
                  {formatMinor(row.amount_minor, row.currency)}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => setSelected(row)}
                    className="text-[12.5px] font-bold uppercase tracking-[0.05em] text-ink/70 border border-ink/15 rounded-full px-3.5 py-1.5 hover:border-gold hover:bg-canvas transition-colors"
                  >
                    Note what happened
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {selected && (
        <HandledForm
          funds={selected}
          onClose={() => setSelected(null)}
          onDone={() => {
            setSelected(null);
            void load();
          }}
        />
      )}
    </>
  );
}

function HandledForm({
  funds,
  onClose,
  onDone,
}: {
  funds: UnmatchedFunds;
  onClose: () => void;
  onDone: () => void;
}) {
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await markFundsHandled(funds.id, note);
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save that note.');
      setBusy(false);
    }
  };

  return (
    <Modal open onOpenChange={(next) => !next && onClose()} size="md" title="Note what happened">
      <div className="space-y-4">
        <p className="text-[14.5px] text-ink/70">
          {formatMinor(funds.amount_minor, funds.currency)} from{' '}
          <strong className="font-medium text-ink">
            {funds.customer_name ?? funds.gateway_customer_reference}
          </strong>
          .
        </p>
        {/* Said plainly, because the button is one click from being read as
            having moved the money. Nothing in this console can. */}
        <p className="text-[13.5px] text-ink/65 bg-canvas rounded-lg px-3.5 py-3">
          This records that somebody looked into it. It does not move the money — raise an
          invoice for the right amount and the gateway applies the funds to it by itself, which
          settles it the normal way.
        </p>
        <label className="block">
          <span className="text-[12.5px] uppercase tracking-[0.1em] font-bold text-ink/50">
            What happened
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            autoFocus
            placeholder="Rang them — invoice raised for the balance."
            className="mt-1.5 w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[14.5px] outline-none rounded-lg focus:border-gold"
          />
        </label>
        {error && <p className="text-[13.5px] text-red-700">{error}</p>}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-[12.5px] font-bold uppercase tracking-[0.05em] text-ink/60 px-4 py-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={busy || !note.trim()}
            className="flex items-center gap-2 bg-ink text-white px-4 py-2 rounded-full text-[12.5px] font-bold uppercase tracking-[0.05em] hover:bg-noir transition-colors disabled:opacity-50"
          >
            <Check size={14} className="text-gold" />
            {busy ? 'Saving…' : 'Save note'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
