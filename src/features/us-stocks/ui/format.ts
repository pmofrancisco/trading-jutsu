/**
 * How this feature writes its figures, in one place so every table agrees on
 * what a price, a percentage and a session date look like.
 *
 * Its own copy rather than a shared one: this is a different market, and the
 * decisions differ with it — `en-US` and a New York session where PH Stocks
 * writes `en-PH` and a Manila one. Features do not import each other, and these
 * two would have to diverge even if they could.
 *
 * The formatters are module-level singletons because building an `Intl`
 * formatter is the expensive part and these run once per cell.
 */

/**
 * Share prices. The board goes down to four places, and rounding a stock at
 * 0.0111 to 0.01 would print a price that cannot be traded — the sub-penny
 * symbols are exactly the ones that reach the ends of these lists. Two places
 * minimum so the ordinary case still reads as money.
 */
const priceFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

/** `exceptZero` so a gain carries a `+` and a flat figure stays bare. */
const priceChangeFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
  signDisplay: 'exceptZero',
});

const percentFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'exceptZero',
});

/**
 * `timeZone: 'America/New_York'` because a US bar is dated at the closing bell
 * — 20:00Z in summer, 21:00Z in winter — and not at midnight the way the PH
 * bars this app also reads are. Formatted in a zone far enough east, an evening
 * close would roll over into the following day.
 */
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeZone: 'America/New_York',
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
