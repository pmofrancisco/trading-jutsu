/**
 * How this feature writes its figures, in one place so every table agrees on
 * what a rate, a percentage and a date look like.
 *
 * Its own copy rather than a shared one: this is a different market, and the
 * decisions differ with it — most of all in how many places a rate needs, for
 * which see `priceFormatter`. Features do not import each other, and these
 * would have to diverge even if they could.
 *
 * The formatters are module-level singletons because building an `Intl`
 * formatter is the expensive part and these run once per cell.
 */

/**
 * Exchange rates, which span a range neither stock market's formatter can
 * write.
 *
 * A rate is one currency counted in another, and the two ends of this board are
 * far apart: gold in Argentine pesos closes near 6,623,660 while the Lebanese
 * pound against the dollar sits at 0.000011, and 138 of the 1,205 pairs in the
 * latest bar close below a cent. Fixed decimal places cannot serve both ends:
 * the four the stock markets round to would print every pair under 0.0001 as
 * `0.0000` — a rate that reads as worthless rather than as small, and there are
 * fourteen of them — while enough places to write those would hang six dead
 * zeros off gold.
 *
 * So the significant figures are what is fixed, and the decimal places follow,
 * the way `features/crypto` handles the same problem. `roundingPriority:
 * 'morePrecision'` runs both constraints and keeps whichever writes more: above
 * 1 the two decimal places win and a rate reads as money — 6,623,660.30 — while
 * below it the four significant figures win and a weak currency keeps its
 * resolution — 0.00001100. Four figures because that is what the comparison
 * this page exists for needs; a fifth is noise at every scale on the board.
 */
const priceFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  maximumSignificantDigits: 4,
  roundingPriority: 'morePrecision',
});

/**
 * The same scale-following places as `priceFormatter`, because a change is a
 * rate: rounded to two places, a pair that moved 0.000001 would show a `%
 * Change` of 13% beside a `Change` of 0.00. `exceptZero` so a gain carries a
 * `+` and a flat figure stays bare.
 */
const priceChangeFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  maximumSignificantDigits: 4,
  roundingPriority: 'morePrecision',
  signDisplay: 'exceptZero',
});

/**
 * Percentages need no such treatment: a percentage is already scale-free, and
 * two places is as true of a pair up 340% as of one up 0.42%.
 */
const percentFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'exceptZero',
});

/**
 * `timeZone: 'UTC'` because the spot market has no closing bell to date a bar
 * by: it runs from Sunday evening to Friday, and the loader writes one bar per
 * pair per UTC day, stamped at midnight. Formatted in any zone behind that,
 * 2 Sep would render as 1 Sep.
 */
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeZone: 'UTC',
});

export function formatPrice(price: number): string {
  return priceFormatter.format(price);
}

export function formatPriceChange(change: number): string {
  return priceChangeFormatter.format(change);
}

export function formatPercent(percent: number): string {
  return `${percentFormatter.format(percent)}%`;
}

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

/**
 * The colour a signed figure is written in — the same decision as the ones
 * above, made about the tone rather than the digits.
 *
 * The `-soft-foreground` tokens rather than plain `text-success` /
 * `text-danger`: HeroUI mixes those toward the foreground, so the figure keeps
 * its contrast in both themes. A flat figure is deliberately uncoloured —
 * neither result.
 */
export function toneClassName(change: number): string {
  if (change > 0) {
    return 'text-success-soft-foreground';
  }

  if (change < 0) {
    return 'text-danger-soft-foreground';
  }

  return 'text-foreground';
}
