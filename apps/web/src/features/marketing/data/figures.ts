/**
 * The figures on the homepage band.
 *
 * Written down rather than counted, and that is a deliberate step backwards
 * from where this was. The band briefly read from the API, which was honest
 * and unusable: the platform is new, so it answered "1 Client Served" under a
 * headline about a decade of work. The count was true of the database and
 * badly false of the business, because everything Cabmora shot before any of
 * this existed is not in it.
 *
 * So these are **claims the business is making**, not measurements, and they
 * carry the obligation that goes with that — somebody has to be able to stand
 * behind each one. Clement owns these numbers; replace them with his and
 * nothing else needs touching.
 *
 * Deliberately absent: the star rating. It used to read "4.9 ★ Google Rating"
 * with no Google integration anywhere in the product — a figure nobody had
 * measured, attributed to a company that had not said it. The real average,
 * from published client ratings, is added alongside these once there are
 * enough of them to mean anything.
 */
export interface Figure {
  figure: string;
  label: string;
}

export const HOMEPAGE_FIGURES: Figure[] = [
  { figure: '278', label: 'Clients Served' },
  { figure: '8', label: 'Years of Excellence' },
  { figure: '200+', label: 'Events Covered' },
];
