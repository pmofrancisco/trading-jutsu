import 'server-only';

/**
 * URLs for the forex market's public image assets.
 *
 * A fourth market, and a fourth folder: the logos sit in the same bucket the PH,
 * US and crypto ones do, under a path of their own, so a ticker that exists in
 * more than one market gets the right mark in each. The bucket belongs to
 * another application, and this app only ever links to it.
 *
 * Kept beside the other three asset modules rather than folded into one module
 * taking a market, for the reason `forex-db` sits beside the other three pools:
 * what they share is a shape, not a value, and a market argument threaded
 * through the data layer would let a feature ask for another market's assets.
 *
 * Only a feature's data layer may import this: a URL reaches the render context
 * as a DTO field, the same way market data does.
 */

/**
 * Where the forex logos sit under the origin, one PNG per symbol.
 *
 * `forex/`, spelled out, where the market's own stand-in mark is `FX`: the
 * folder is the bucket's naming and the symbol is this app's, and they do not
 * have to agree. The route is `/forex` for the same reason the folder is —
 * neither is derived from the other.
 */
const LOGO_PATH = '/storage/v1/object/public/forex/';

/**
 * The symbol whose logo stands in when a pair has none of its own.
 *
 * The bucket is filled in as logos are drawn, and with better than twelve
 * hundred pairs on this board most of them are still waiting, so a missing file
 * is the ordinary case rather than the broken one. `FX.png` is a generic mark
 * kept for exactly this, the way the US market's `US.png` is, rather than any
 * particular pair's — no symbol collides with it.
 */
const FALLBACK_LOGO_SYMBOL = 'FX';

/**
 * The logo for one forex symbol, named after the symbol `market_data` stores —
 * `EURUSD` is served as `EURUSD.png`.
 *
 * The origin is read per call rather than at module scope so a missing variable
 * fails the request that needed a logo, not `next build` — the same reason
 * `forexDb` checks its own variable where it does. It is the same variable the
 * other three markets' assets are built from: one bucket, a folder per market.
 *
 * Whether the file is actually there is not knowable here: the bucket answers
 * `400` for a symbol it has no logo for, which only the request finds out. The
 * render context is handed `forexLogoUrl` and `forexFallbackLogoUrl` together
 * and picks between them when the first one fails to load.
 */
export function forexLogoUrl(symbol: string): string {
  const baseUrl = process.env.SUPABASE_STORAGE_BASE_URL;

  if (!baseUrl) {
    throw new Error('SUPABASE_STORAGE_BASE_URL is not set.');
  }

  return `${baseUrl}${LOGO_PATH}${symbol}.png`;
}

/** The stand-in logo, for a symbol the bucket has no file for. */
export function forexFallbackLogoUrl(): string {
  return forexLogoUrl(FALLBACK_LOGO_SYMBOL);
}
