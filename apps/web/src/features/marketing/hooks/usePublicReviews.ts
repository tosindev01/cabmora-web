import { useEffect, useState } from 'react';

import { listPublicReviews, type PublicReview } from '@/features/marketing/api';

/**
 * Real client reviews for the homepage.
 *
 * `null` while loading and on failure alike — both mean "we have nothing to
 * show", and the section hides itself rather than rendering an empty band or,
 * worse, falling back to invented quotes. A marketing page that cannot reach
 * the API should look like a page with no testimonials, not a broken one.
 */
export function usePublicReviews(limit = 3): PublicReview[] | null {
  const [reviews, setReviews] = useState<PublicReview[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    listPublicReviews(limit)
      .then((rows) => !cancelled && setReviews(rows))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return reviews;
}
