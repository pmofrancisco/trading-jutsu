/**
 * The shapes the Forex data layer is allowed to hand to the render context.
 * Keeping these separate from the Prisma models means a schema change stops at
 * the data layer instead of rippling into components.
 */

export interface CurrencyPairSummary {
  id: number;
  baseCurrency: string;
  quoteCurrency: string;
}

export interface QuoteSummary {
  id: number;
  quoteDate: Date;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface CurrencyPairDetail extends CurrencyPairSummary {
  quotes: QuoteSummary[];
}
