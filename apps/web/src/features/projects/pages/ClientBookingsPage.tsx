import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  MapPin,
  Mail,
  Phone,
  MessageSquare,
  Check,
  Clock,
  Sparkles,
  Navigation,
} from 'lucide-react';
import { PortalAvatar, PortalBell, PortalShell, PortalTopbar } from '@/shared/portal';
import { useAuth } from '@/shared/auth';
import {
  creatorLandingApi,
  type CreatorBookingRequestDto,
} from '@cabmora/api-client';
import {
  STUDIO_WORKSPACE_EVENT,
  buildAiInvoiceDraft,
  getClientBookingsList,
  getProjectLogisticsMeta,
  saveStudioInvoice,
  updateClientBookingItemStatus,
} from '@/shared/collaboration/studioWorkspaceStore';

type BookingFilter = 'all' | CreatorBookingRequestDto['status'];

export default function ClientBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<CreatorBookingRequestDto[]>(() =>
    getClientBookingsList(),
  );
  const [filter, setFilter] = useState<BookingFilter>('all');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    let active = true;

    creatorLandingApi
      .listMyCreatorBookings()
      .then((rows) => {
        if (active && rows.length > 0) {
          setBookings(rows);
        }
      })
      .catch(() => undefined);

    const handleSync = () => setBookings(getClientBookingsList());
    window.addEventListener(STUDIO_WORKSPACE_EVENT, handleSync);
    return () => {
      active = false;
      window.removeEventListener(STUDIO_WORKSPACE_EVENT, handleSync);
    };
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 4000);
  };

  const handleStatusChange = (
    id: string,
    status: CreatorBookingRequestDto['status'],
    clientName: string,
  ) => {
    const updated = updateClientBookingItemStatus(id, status);
    setBookings(updated);
    showToast(`Updated booking status for ${clientName} to "${status.toUpperCase()}".`);
  };

  const handleGenerateRetainerInvoice = (b: CreatorBookingRequestDto) => {
    const numericBudget = Number(b.budget_range.replace(/[^0-9]/g, '')) || 6500;
    const invoice = buildAiInvoiceDraft({
      clientName: b.client_name,
      clientEmail: b.client_email,
      projectTitle: `${b.service_title} (${b.event_type})`,
      amount: Math.round(numericBudget / 2),
      includeDrone: true,
    });
    saveStudioInvoice(invoice);
    showToast(
      `AI generated 50% Retainer Invoice ${invoice.id} ($${invoice.amount.toLocaleString()}) for ${b.client_name}!`,
    );
  };

  const shown = bookings.filter((b) => filter === 'all' || b.status === filter);

  return (
    <PortalShell>
      {({ toggleSidebar }) => (
        <>
          {toast && (
            <div className="fixed top-6 right-6 z-50 bg-forest text-canvas border border-gold px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2 text-[13px] font-semibold">
              <Check size={16} className="text-gold" />
              <span>{toast}</span>
            </div>
          )}

          <PortalTopbar
            title="Client Bookings & Shoot Enquiries"
            subtitle="Manage incoming client booking requests, venue distances, contracts, and AI retainer invoices"
            icon={CalendarCheck}
            onToggleSidebar={toggleSidebar}
          >
            <PortalBell />
            <PortalAvatar
              src={
                user?.avatar_url ||
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'
              }
            />
          </PortalTopbar>

          <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
            <div className="max-w-[1220px] mx-auto space-y-6">
              {/* Summary Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Total Bookings',
                    value: bookings.length,
                    id: 'all' as BookingFilter,
                  },
                  {
                    label: 'New Requests',
                    value: bookings.filter((b) => b.status === 'new').length,
                    id: 'new' as BookingFilter,
                  },
                  {
                    label: 'Contacted',
                    value: bookings.filter((b) => b.status === 'contacted').length,
                    id: 'contacted' as BookingFilter,
                  },
                  {
                    label: 'Confirmed & Booked',
                    value: bookings.filter((b) => b.status === 'booked').length,
                    id: 'booked' as BookingFilter,
                  },
                ].map((stat) => (
                  <button
                    key={stat.label}
                    type="button"
                    onClick={() => setFilter(stat.id)}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${
                      filter === stat.id
                        ? 'bg-forest text-canvas border-gold'
                        : 'bg-white border-ink/10 text-ink hover:border-gold'
                    }`}
                  >
                    <div
                      className={`text-[11px] uppercase tracking-[0.14em] font-semibold ${
                        filter === stat.id ? 'text-gold' : 'text-ink/50'
                      }`}
                    >
                      {stat.label}
                    </div>
                    <div className="font-serif text-[30px] font-bold mt-1">{stat.value}</div>
                  </button>
                ))}
              </div>

              {/* Bookings List */}
              <div className="space-y-4">
                {shown.map((b) => {
                  const logistics = getProjectLogisticsMeta(b.location);
                  return (
                    <div
                      key={b.id}
                      className="bg-white border border-ink/10 hover:border-gold rounded-2xl p-6 shadow-sm transition-all space-y-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink/5 pb-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider ${
                                b.status === 'booked'
                                  ? 'bg-emerald-500/15 text-emerald-800'
                                  : b.status === 'new'
                                    ? 'bg-gold/25 text-ink'
                                    : 'bg-sand text-ink/70'
                              }`}
                            >
                              {b.status}
                            </span>
                            <span className="text-[11.5px] text-gold font-semibold uppercase tracking-wider">
                              {b.event_type} • {b.company_or_brand}
                            </span>
                          </div>
                          <h3 className="font-serif text-[22px] font-bold text-ink">
                            {b.client_name} — {b.service_title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-[12px] text-ink/60">
                            <span className="flex items-center gap-1">
                              <Mail size={13} className="text-gold" /> {b.client_email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone size={13} className="text-gold" /> {b.client_phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={13} className="text-gold" /> Preferred Date:{' '}
                              <strong className="text-ink">{b.preferred_date}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[10.5px] uppercase tracking-wider text-ink/45">
                            Proposed Package Budget
                          </div>
                          <div className="font-serif text-[26px] font-bold text-ink">
                            {b.budget_range}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                        <div className="lg:col-span-7 space-y-2">
                          <p className="text-[13px] text-ink/75 leading-relaxed">
                            {b.project_brief}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-[12px]">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sand text-ink font-medium">
                              <MapPin size={13} className="text-gold" /> Venue: {b.location}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-800 font-semibold">
                              <Navigation size={12} /> {logistics.venueDistanceKm} km to reach venue
                              ({logistics.venueTravelTime})
                            </span>
                          </div>
                        </div>

                        <div className="lg:col-span-5 flex flex-wrap lg:justify-end items-center gap-2">
                          {b.status !== 'booked' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(b.id, 'booked', b.client_name)}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer"
                            >
                              <Check size={14} />
                              <span>Confirm & Book</span>
                            </button>
                          )}
                          {b.status === 'new' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(b.id, 'contacted', b.client_name)}
                              className="px-3.5 py-2 rounded-xl border border-ink/15 hover:border-gold text-[12px] font-medium cursor-pointer"
                            >
                              Mark Contacted
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleGenerateRetainerInvoice(b)}
                            className="px-3.5 py-2 rounded-xl bg-gold text-ink hover:bg-gold-dark text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Sparkles size={13} />
                            <span>Invoice</span>
                          </button>
                          <Link
                            to="/messages"
                            className="px-3.5 py-2 rounded-xl bg-ink text-white hover:bg-gold hover:text-ink text-[12px] font-semibold flex items-center gap-1.5"
                          >
                            <MessageSquare size={13} />
                            <span>Message & Call</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </main>
        </>
      )}
    </PortalShell>
  );
}
