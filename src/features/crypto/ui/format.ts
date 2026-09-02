/**
 * How this feature writes its figures, in one place so every table agrees on
 * what a price, a percentage and a date look like.
 *
 * Its own copy rather than a shared one: this is a different market, and the
 * decisions differ with it — most of all in how many places a price needs, for
 * which see `priceFormatter`. Features do not import each other, and these
 * would have to diverge even if they could.
 *
 * The formatters are module-level singletons because building an `Intl`
 * formatter is the expensive part and these run once per cell.
 */

/**
 * Coin prices, which span a range neither stock market's formatter can write.
 *
 * A single board holds bitcoin near 77,000 and COQ near 0.000000092, and better
 * than a quarter of it closes below a cent. Fixed decimal places cannot serve
 * both ends: the four the stock markets round to would print every coin below
 * 0.0001 as `0.00`, a price that reads as worthless rather than as small, and
 * enough places to write the small ones would hang six dead zeros off bitcoin.
 *
 * So the significant figures are what is fixed, and the decimal places follow.
 * `roundingPriority: 'morePrecision'` runs both constraints and keeps whichever
 * writes more: above 1 the two decimal places win and a price reads as money —
 * 77,398.69 — while below it the four significant figures win and a small coin
 * keeps its resolution — 0.000005142. Four figures because that is what the
 * comparison this page exists for needs; a fifth is noise at every scale on the
 * board.
 */
const priceFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  maximumSignificantDigits: 4,
  roundingPriority: 'morePrecision',
});

/**
 * The same scale-following places as `priceFormatter`, because a change is a
 * price: rounded to two places, a coin that moved 0.000001 would show a `%
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
 * two places is as true of a coin up 2,443% as of one up 0.42%.
 */
const percentFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'exceptZero',
});

/**
 * `timeZone: 'UTC'` because crypto has no closing bell to date a bar by: the
 * loader writes one bar per coin per UTC day, stamped at midnight. Formatted in
 * any zone behind that, 1 Sep would render as 31 Aug.
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
