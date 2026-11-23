import { useCallback, useEffect, useState } from 'react';
import { Star, CheckCircle2, XCircle, Trash2, Search, ThumbsUp, ThumbsDown } from 'lucide-react';

import {
  deleteReview as removeReview,
  hideReview,
  listReviews,
  publishReview,
  type Review,
  type ReviewStatus,
} from '@/features/reviews/api';

/** The screen's words, and the API's. The queue was written against three
 *  labels before the slice existed; they map one to one, so the labels stay
 *  and the mapping lives here rather than being spread through the markup. */
const TO_API: Record<string, ReviewStatus | undefined> = {
  Pending: 'pending',
  Approved: 'published',
  Rejected: 'hidden',
  All: undefined,
};
const TO_LABEL: Record<ReviewStatus, string> = {
  pending: 'Pending',
  published: 'Approved',
  hidden: 'Rejected',
};

function onDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminReviewModerationPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('Pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Every review, filtered in the browser: the counts across the top need the
  // whole set, and fetching four times to show four numbers would be worse.
  const refresh = useCallback(async () => {
    try {
      setReviews((await listReviews({ limit: 200 })).items);
    } catch {
      setReviews([]);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function moderate(review: Review, action: 'publish' | 'hide' | 'delete') {
    setError(null);
    try {
      if (action === 'publish') await publishReview(review.id);
      else if (action === 'hide') await hideReview(review.id);
      else await removeReview(review.id);
      await refresh();
    } catch (err) {
      // Publishing is refused where the client never offered their words, and
      // that refusal is the one thing on this screen somebody must not be
      // left guessing about.
      setError(err instanceof Error ? err.message : 'Could not change that review.');
    }
  }

  const pendingCount = reviews.filter((r) => r.status === 'pending').length;
  const approvedCount = reviews.filter((r) => r.status === 'published').length;
  const rejectedCount = reviews.filter((r) => r.status === 'hidden').length;

  const filteredReviews = reviews.filter((r) => {
    const haystack = [r.client_name, r.project_title, r.words, r.client_email];
    const matchesSearch = haystack.some((field) =>
      (field ?? '').toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const matchesStatus = statusFilter === 'All' || r.status === TO_API[statusFilter];

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="max-w-[1320px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-ink/10 pb-6">
          <div>
            <h1 className="text-[30px] font-sans font-medium text-ink">Review Moderation</h1>
            <p className="text-ink/60 text-[15.5px]">
              Approve, reject, or remove customer reviews before they are published publicly across
              creator portfolios.
            </p>
          </div>
        </div>

        {/* Moderation Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-5 border border-ink/10 rounded-xl shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11.5px] uppercase font-bold tracking-[0.15em] text-ink/50">
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
              <span className="text-[11.5px] uppercase font-bold tracking-[0.15em] text-ink/50">
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
              <span className="text-[11.5px] uppercase font-bold tracking-[0.15em] text-ink/50">
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
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[13.5px] font-bold uppercase tracking-[0.05em] transition-colors ${
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
              className="w-full bg-canvas border border-ink/15 pl-10 pr-4 py-2.5 text-[14.5px] outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all rounded-lg"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-[14.5px] text-red-700">
            {error}
          </p>
        )}

        {/* Reviews List Cards */}
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="bg-white border border-ink/10 rounded-xl p-12 text-center text-ink/50 text-[15.5px]">
              No reviews found matching the selected moderation status filter.
            </div>
          ) : (
            filteredReviews.map((review) => (
              /* The quote leads. Everything else on this card — who, when,
                 which project, what to do about it — is there to let somebody
                 judge the words, so the words get the width and the size and
                 the rest sits around them. The actions were competing with
                 them for the middle of the row. */
              <div key={review.id} className="bg-white border border-ink/10 rounded-xl shadow-xs">
                <div className="p-6 pb-5">
                  <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-gold">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            className={
                              star <= review.stars
                                ? 'fill-gold text-gold'
                                : 'text-gray-300 fill-gray-200'
                            }
                          />
                        ))}
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11.5px] font-bold uppercase tracking-[0.05em] whitespace-nowrap ${
                          review.status === 'published'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : review.status === 'hidden'
                              ? 'bg-red-100 text-red-900 border border-red-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {TO_LABEL[review.status]}
                      </span>
                    </div>
                    <span className="text-[12.5px] font-bold text-ink/40 uppercase tracking-[0.08em] whitespace-nowrap">
                      {onDate(review.created_at)}
                    </span>
                  </div>

                  {review.words ? (
                    <blockquote className="font-serif text-[22px] lg:text-[25px] leading-[1.45] text-ink">
                      &ldquo;{review.words}&rdquo;
                    </blockquote>
                  ) : (
                    <p className="text-[15.5px] text-ink/45 italic">
                      Rated, with no words left — nothing to publish, and the stars still count.
                    </p>
                  )}

                  <div className="text-[13.5px] text-ink/60 mt-4">
                    By <strong className="text-ink">{review.client_name ?? 'A client'}</strong>
                    {review.client_email ? ` (${review.client_email})` : ''} — for{' '}
                    <span className="text-gold font-semibold">
                      {review.project_title ?? 'their project'}
                    </span>
                  </div>
                </div>

                {/* Their own strip along the bottom, so a long quote never
                    pushes them out of reach and a short one never leaves them
                    stranded beside white space. */}
                <div className="flex items-center gap-3 flex-wrap border-t border-ink/10 px-6 py-4 bg-canvas/50 rounded-b-xl">
                  {review.status !== 'published' &&
                    (review.may_publish && review.words ? (
                      <button
                        onClick={() => void moderate(review, 'publish')}
                        className="bg-emerald-700 text-white px-4 py-2 rounded-lg text-[12.5px] font-bold uppercase tracking-[0.08em] hover:bg-emerald-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <ThumbsUp size={14} /> Approve &amp; Publish
                      </button>
                    ) : (
                      /* Said rather than greyed out. A disabled button with no
                         reason reads as a fault; this is a decision the client
                         made, and it is not ours to undo. */
                      <span className="text-[13px] text-ink/50">
                        {review.words
                          ? 'This client did not agree to be quoted publicly.'
                          : 'Nothing to publish — they left no words.'}
                      </span>
                    ))}

                  {review.status !== 'hidden' && (
                    <button
                      onClick={() => void moderate(review, 'hide')}
                      className="bg-amber-100 text-amber-900 px-4 py-2 rounded-lg text-[12.5px] font-bold uppercase tracking-[0.08em] hover:bg-amber-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ThumbsDown size={14} /> Reject Review
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this review permanently?')) {
                        void moderate(review, 'delete');
                      }
                    }}
                    className="ml-auto p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
    </>
  );
}
