import { useState } from 'react';
import {
  Search,
  UserCheck,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  MessageSquare,
  Trash2,
  Send,
} from 'lucide-react';
import { useAdmin, Enquiry, EnquiryStatus } from '@/context/AdminContext';
import AdminLayout from '@/components/AdminLayout';
import { Modal } from '@cabmora/ui';

export default function AdminEnquiryManagementPage() {
  const { enquiries, users, updateEnquiry, deleteEnquiry } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [noteText, setNoteText] = useState('');

  const creatorsList = users.filter((u) => u.role === 'Creator' || u.role === 'Admin');

  const filteredEnquiries = enquiries.filter((e) => {
    const matchesSearch =
      e.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.serviceRequested.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStaffAssign = (enquiryId: string, staffName: string) => {
    updateEnquiry(enquiryId, { assignedStaff: staffName });
  };

  const handleStatusChange = (enquiryId: string, newStatus: EnquiryStatus) => {
    updateEnquiry(enquiryId, { status: newStatus });
  };

  return (
    <AdminLayout>
      <div className="max-w-[1320px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-ink/10 pb-6">
          <div>
            <h1 className="text-[30px] font-sans font-medium text-ink">
              Enquiry & Lead Management
            </h1>
            <p className="text-ink/60 text-[14px]">
              Review incoming customer inquiries, assign creators or sales staff, and track
              follow-up conversion status.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white border border-ink/10 p-5 rounded-xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by customer name, email, or requested service..."
              className="w-full bg-canvas border border-ink/15 pl-10 pr-4 py-2.5 text-[13px] outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all rounded-lg"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/50">
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-canvas border border-ink/15 px-3 py-2 text-[12px] font-medium outline-none focus:border-gold rounded-lg"
            >
              <option value="All">All Enquiries ({enquiries.length})</option>
              <option value="New">
                New ({enquiries.filter((e) => e.status === 'New').length})
              </option>
              <option value="Contacted">Contacted</option>
              <option value="In Negotiation">In Negotiation</option>
              <option value="Converted">Converted</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Enquiries Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEnquiries.map((enquiry) => (
            <div
              key={enquiry.id}
              className="bg-white border border-ink/10 rounded-xl p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-[0.1em] text-gold block mb-1">
                      {enquiry.createdAt}
                    </span>
                    <h3 className="font-sans text-[18px] font-semibold text-ink">
                      {enquiry.customerName}
                    </h3>
                    <div className="text-[12px] text-ink/60 flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1">
                        <Mail size={13} className="text-gold" /> {enquiry.customerEmail}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone size={13} className="text-gold" /> {enquiry.phone}
                      </span>
                    </div>
                  </div>

                  <select
                    value={enquiry.status}
                    onChange={(e) =>
                      handleStatusChange(enquiry.id, e.target.value as EnquiryStatus)
                    }
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.05em] outline-none ${
                      enquiry.status === 'New'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : enquiry.status === 'Converted'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : enquiry.status === 'Closed'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-blue-100 text-blue-900 border border-blue-200'
                    }`}
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="In Negotiation">In Negotiation</option>
                    <option value="Converted">Converted</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div className="p-4 bg-canvas border border-ink/5 rounded-lg space-y-2">
                  <div className="text-[11px] font-bold text-ink uppercase tracking-[0.05em]">
                    Requested Service: {enquiry.serviceRequested}
                  </div>
                  <p className="text-[12.5px] text-ink/70 leading-relaxed font-light">
                    "{enquiry.message}"
                  </p>
                  <div className="flex flex-wrap gap-4 text-[11px] text-ink/60 pt-2 border-t border-ink/5">
                    <div className="flex items-center gap-1">
                      <Calendar size={13} className="text-gold" />
                      <span>
                        Event Date: <strong>{enquiry.eventDate}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign size={13} className="text-emerald-600" />
                      <span>
                        Budget: <strong>{enquiry.budget}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Staff Assignment Control */}
                <div className="flex items-center justify-between p-3 bg-white border border-ink/10 rounded-lg">
                  <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink/60 flex items-center gap-1.5">
                    <UserCheck size={14} className="text-gold" /> Assigned Handler:
                  </span>
                  <select
                    value={enquiry.assignedStaff}
                    onChange={(e) => handleStaffAssign(enquiry.id, e.target.value)}
                    className="bg-canvas border border-ink/15 px-3 py-1 text-[12px] font-semibold text-ink rounded outline-none focus:border-gold"
                  >
                    <option value="Unassigned">Unassigned</option>
                    {creatorsList.map((staff) => (
                      <option key={staff.id} value={staff.name}>
                        {staff.name} ({staff.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-ink/10 flex items-center justify-between">
                <button
                  onClick={() => setSelectedEnquiry(enquiry)}
                  className="text-[12px] font-semibold text-ink hover:text-gold flex items-center gap-1 cursor-pointer"
                >
                  <MessageSquare size={14} /> Review Full Details & Reply
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Delete enquiry from ${enquiry.customerName}?`)) {
                      deleteEnquiry(enquiry.id);
                    }
                  }}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  title="Delete Enquiry"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ENQUIRY DETAILS MODAL */}
      {selectedEnquiry && (
        <Modal
          open
          onOpenChange={(next) => {
            if (!next) (() => setSelectedEnquiry(null))();
          }}
          size="md"
          title={<>{selectedEnquiry.customerName}</>}
          description={<>ENQUIRY ID: {selectedEnquiry.id}</>}
        >
          <div className="space-y-4 text-[13px]">
            <div className="p-4 bg-canvas border border-ink/10 rounded-lg space-y-2">
              <div className="font-semibold text-ink">Customer Contact Info:</div>
              <div className="text-ink/70">Email: {selectedEnquiry.customerEmail}</div>
              <div className="text-ink/70">Phone: {selectedEnquiry.phone}</div>
              <div className="text-ink/70">Service: {selectedEnquiry.serviceRequested}</div>
              <div className="text-ink/70">Event Date: {selectedEnquiry.eventDate}</div>
              <div className="text-ink/70 font-semibold text-emerald-800">
                Budget Range: {selectedEnquiry.budget}
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                Full Customer Message
              </label>
              <div className="p-4 bg-white border border-ink/15 rounded-lg text-ink leading-relaxed font-light">
                "{selectedEnquiry.message}"
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink/60 block mb-1">
                Send Admin Follow-Up Response / Internal Note
              </label>
              <textarea
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Type an email response to client or leave internal follow-up note..."
                className="w-full bg-canvas border border-ink/15 px-3.5 py-2.5 text-[13px] outline-none focus:border-gold rounded-lg"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-ink/10">
              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="px-4 py-2 text-[12px] font-semibold text-ink/60 hover:text-ink"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  alert('Response sent to customer & status updated!');
                  updateEnquiry(selectedEnquiry.id, { status: 'Contacted' });
                  setSelectedEnquiry(null);
                }}
                className="bg-ink text-white px-5 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-[0.05em] hover:bg-gold hover:text-ink transition-colors flex items-center gap-2"
              >
                <Send size={14} /> Send Reply & Mark Contacted
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
