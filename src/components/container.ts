/**
 * The horizontal frame the public pages share — one measure, one gutter, so the
 * header, the hero, the cards and the closing call to action all line up down
 * the left edge at every width.
 *
 * It lives in `components/` rather than beside the landing page's `Section`,
 * where it started, because `SiteHeader` is drawn from it too and nothing in
 * `components/` may import a feature. A measure written in two places is a
 * left edge that drifts the first time one of them is retuned.
 */
export const container = 'mx-auto w-full max-w-6xl px-4 sm:px-6';
