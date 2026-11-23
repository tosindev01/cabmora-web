import { useState } from 'react';
import { Star, CheckCircle2, XCircle, Trash2, Search, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import AdminLayout from '@/components/AdminLayout';

export default function AdminReviewModerationPage() {
  const { reviews, updateReviewStatus, deleteReview } = useAdmin();

  const [statusFilter, setStatusFilter] = useState<string>('Pending');
  const [searchTerm, setSearchTerm] = useState('');

  const pendingCount = reviews.filter((r) => r.status === 'Pending').length;
  const approvedCount = reviews.filter((r) => r.status === 'Approved').length;
  const rejectedCount = reviews.filter((r) => r.status === 'Rejected').length;

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.reviewerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.targetCreatorOrProject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="max-w-[1320px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-ink/10 pb-6">
          <div>
            <h1 className="text-[30px] font-sans font-medium text-ink">Review Moderation</h1>
            <p className="text-ink/60 text-[14px]">
              Approve, reject, or remove customer reviews before they are published publicly across
              creator portfolios.
            </p>
          </div>
        </div>

        {/* Moderation Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-5 border border-ink/10 rounded-xl shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-ink/50">
                Pending Moderation
              </span>
              <div className="font-sans text-[30px] font-medium text-amber-600">{pendingCount}</div>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Star size={24} />
            </div>
          </div>

          <div className="bg-white p-5 border border-ink/10 rounded-xl shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-ink/50">
                Approved & Live
              </span>
              <div className="font-sans text-[30px] font-medium text-emerald-600">
                {approvedCount}
              </div>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 size={24} />
            </div>
          </div>

          <div className="bg-white p-5 border border-ink/10 rounded-xl shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-ink/50">
                Rejected / Flagged
              </span>
              <div className="font-sans text-[30px] font-medium text-red-600">{rejectedCount}</div>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <XCircle size={24} />
            </div>
          </div>
        </div>

        {/* Search & Tabs */}
        <div className="bg-white border border-ink/10 p-5 rounded-xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 bg-canvas p-1.5 rounded-xl border border-ink/10 w-full md:w-auto">
            {['Pending', 'Approved', 'Rejected', 'All'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[12px] font-bold uppercase tracking-[0.05em] transition-colors ${
                  statusFilter === tab
                    ? 'bg-ink text-white shadow-xs'
                    : 'text-ink/60 hover:text-ink'
                }`}
              >
                {tab} {tab === 'Pending' && pendingCount > 0 && `(${pendingCount})`}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md w-full">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by reviewer, target creator, or comment text..."
              className="w-full bg-canvas border border-ink/15 pl-10 pr-4 py-2.5 text-[13px] outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all rounded-lg"
            />
          </div>
        </div>

        {/* Reviews List Cards */}
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="bg-white border border-ink/10 rounded-xl p-12 text-center text-ink/50 text-[14px]">
              No reviews found matching the selected moderation status filter.
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white border border-ink/10 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-3 max-w-3xl">
                  <div className="flex items-center gap-3">
                    {/* Star Rating Render */}
                    <div className="flex items-center gap-1 text-gold">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={
                            star <= review.rating
                              ? 'fill-gold text-gold'
                              : 'text-gray-300 fill-gray-200'
                          }
                        />
                      ))}
                    </div>

                    <span className="text-[11px] font-bold text-ink/40 uppercase tracking-[0.08em]">
                      Submitted on {review.date}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.05em] ${
                        review.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : review.status === 'Rejected'
                            ? 'bg-red-100 text-red-900 border border-red-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {review.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-sans text-[17px] font-semibold text-ink">
                      "{review.comment}"
                    </h3>
                    <div className="text-[12px] text-ink/60 mt-1">
                      By <strong className="text-ink">{review.reviewerName}</strong> (
                      {review.reviewerEmail}) — for{' '}
                      <span className="text-gold font-semibold">
                        {review.targetCreatorOrProject}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Moderation Controls */}
                <div className="flex items-center gap-3 flex-shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-ink/10">
                  {review.status !== 'Approved' && (
                    <button
                      onClick={() => updateReviewStatus(review.id, 'Approved')}
                      className="bg-emerald-700 text-white px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-[0.08em] hover:bg-emerald-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <ThumbsUp size={14} /> Approve & Publish
                    </button>
                  )}

                  {review.status !== 'Rejected' && (
                    <button
                      onClick={() => updateReviewStatus(review.id, 'Rejected')}
                      className="bg-amber-100 text-amber-900 px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-[0.08em] hover:bg-amber-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ThumbsDown size={14} /> Reject Review
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this review permanently?')) {
                        deleteReview(review.id);
                      }
                    }}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove Review"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
