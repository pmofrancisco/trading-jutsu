/**
 * How this feature writes its figures, in one place so every card and table
 * agrees on what a level, a price, a percentage and a session date look like.
 *
 * The formatters are module-level singletons because building an `Intl`
 * formatter is the expensive part and these run once per cell.
 */

/** Index levels, which the PSE always quotes to two places. */
const levelFormatter = new Intl.NumberFormat('en-PH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Share prices, which are not levels: the board goes down to four places, and
 * rounding a stock at 0.0041 to 0.00 would print a price that cannot be traded.
 * Two places minimum so the ordinary case still reads as money.
 */
const priceFormatter = new Intl.NumberFormat('en-PH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

/** `exceptZero` so a gain carries a `+` and a flat figure stays bare. */
const priceChangeFormatter = new Intl.NumberFormat('en-PH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
  signDisplay: 'exceptZero',
});

const percentFormatter = new Intl.NumberFormat('en-PH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'exceptZero',
});

/**
 * `timeZone: 'UTC'` because every bar is dated at midnight UTC — formatted in
 * any zone behind it, 11 Aug would render as 10 Aug.
 */
const dateFormatter = new Intl.DateTimeFormat('en-PH', {
  dateStyle: 'medium',
  timeZone: 'UTC',
});

export function formatLevel(level: number): string {
  return levelFormatter.format(level);
}

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
