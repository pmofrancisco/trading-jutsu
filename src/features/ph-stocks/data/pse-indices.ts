import 'server-only';

/**
 * The PSE composite index followed by the six sector indices, in the order they
 * are displayed. `symbol` is what `market_data` stores; `name` is what the PSE
 * calls it.
 *
 * Shared rather than owned by one query because the indices sit in
 * `market_data` alongside the stocks themselves: one page lists them, and the
 * one that ranks stocks has to leave them out — an index would otherwise turn
 * up among the day's movers.
 */
export const PSE_INDICES = [
  { symbol: 'PSEI', name: 'PSE Composite Index' },
  { symbol: 'FINA', name: 'Financials' },
  { symbol: 'INDU', name: 'Industrial' },
  { symbol: 'HOLD', name: 'Holding Firms' },
  { symbol: 'PROP', name: 'Property' },
  { symbol: 'SERV', name: 'Services' },
  { symbol: 'MINI', name: 'Mining & Oil' },
] as const;

/** The same symbols alone, as the `text[]` the queries bind. */
export const PSE_INDEX_SYMBOLS: string[] = PSE_INDICES.map(
  (index) => index.symbol,
);
