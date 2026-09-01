import 'server-only';

/**
 * URLs for the US market's public image assets.
 *
 * A second market, and a second folder: the logos sit in the same bucket the PH
 * ones do, under a path of their own, so a symbol that exists in both markets
 * gets the right mark in each. The bucket belongs to another application, and
 * this app only ever links to it.
 *
 * Kept beside `ph-stocks-assets` rather than folded into one module taking a
 * market, for the reason `us-stocks-db` sits beside `ph-stocks-db`: what the two
 * share is a shape, not a value, and a market argument threaded through the data
 * layer would let a feature ask for the other market's assets.
 *
 * Only a feature's data layer may import this: a URL reaches the render context
 * as a DTO field, the same way market data does.
 */

/** Where the US logos sit under the origin, one PNG per symbol. */
const LOGO_PATH = '/storage/v1/object/public/us/';

/**
 * The symbol whose logo stands in when a stock has none of its own.
 *
 * The bucket is filled in as logos are drawn, and with better than twelve
 * thousand symbols on this board most of them are still waiting, so a missing
 * file is the ordinary case rather than the broken one. `US.png` is a generic
 * mark kept for exactly this, not a stock — no symbol collides with it.
 */
const FALLBACK_LOGO_SYMBOL = 'US';

/**
 * The logo for one US symbol, named after the symbol `market_data` stores —
 * `GPRO` is served as `GPRO.png`.
 *
 * The origin is read per call rather than at module scope so a missing variable
 * fails the request that needed a logo, not `next build` — the same reason
 * `usStocksDb` checks its own variable where it does. It is the same variable
 * the PH assets are built from: one bucket, two folders.
 *
 * Whether the file is actually there is not knowable here: the bucket answers
 * `400` for a symbol it has no logo for, which only the request finds out. The
 * render context is handed `usStocksLogoUrl` and `usStocksFallbackLogoUrl`
 * together and picks between them when the first one fails to load.
 */
export function usStocksLogoUrl(symbol: string): string {
  const baseUrl = process.env.SUPABASE_STORAGE_BASE_URL;

  if (!baseUrl) {
    throw new Error('SUPABASE_STORAGE_BASE_URL is not set.');
  }

  return `${baseUrl}${LOGO_PATH}${symbol}.png`;
}

/** The stand-in logo, for a symbol the bucket has no file for. */
export function usStocksFallbackLogoUrl(): string {
  return usStocksLogoUrl(FALLBACK_LOGO_SYMBOL);
}
