import 'server-only';

/**
 * URLs for the crypto market's public image assets.
 *
 * A third market, and a third folder: the logos sit in the same bucket the PH
 * and US ones do, under a path of their own, so a ticker that exists in more
 * than one market gets the right mark in each. The bucket belongs to another
 * application, and this app only ever links to it.
 *
 * Kept beside `ph-stocks-assets` and `us-stocks-assets` rather than folded into
 * one module taking a market, for the reason `crypto-db` sits beside the other
 * two pools: what they share is a shape, not a value, and a market argument
 * threaded through the data layer would let a feature ask for another market's
 * assets.
 *
 * Only a feature's data layer may import this: a URL reaches the render context
 * as a DTO field, the same way market data does.
 */

/** Where the crypto logos sit under the origin, one PNG per symbol. */
const LOGO_PATH = '/storage/v1/object/public/crypto/';

/**
 * The symbol whose logo stands in when a coin has none of its own.
 *
 * The bucket is filled in as logos are drawn and most of this board is still
 * waiting, so a missing file is the ordinary case rather than the broken one.
 * Unlike the US market's `US.png`, this is a real coin's mark rather than a
 * generic one — bitcoin is the mark crypto is read by, so a row wearing it is
 * legible as "a coin" in a way a blank square is not.
 */
const FALLBACK_LOGO_SYMBOL = 'BTC';

/**
 * The logo for one crypto symbol, named after the symbol `market_data` stores —
 * `BTC` is served as `BTC.png`, and so is `SHIB`.
 *
 * The origin is read per call rather than at module scope so a missing variable
 * fails the request that needed a logo, not `next build` — the same reason
 * `cryptoDb` checks its own variable where it does. It is the same variable the
 * PH and US assets are built from: one bucket, a folder per market.
 *
 * Whether the file is actually there is not knowable here: the bucket answers
 * `400` for a symbol it has no logo for, which only the request finds out. The
 * render context is handed `cryptoLogoUrl` and `cryptoFallbackLogoUrl` together
 * and picks between them when the first one fails to load.
 */
export function cryptoLogoUrl(symbol: string): string {
  const baseUrl = process.env.SUPABASE_STORAGE_BASE_URL;

  if (!baseUrl) {
    throw new Error('SUPABASE_STORAGE_BASE_URL is not set.');
  }

  return `${baseUrl}${LOGO_PATH}${symbol}.png`;
}

/** The stand-in logo, for a symbol the bucket has no file for. */
export function cryptoFallbackLogoUrl(): string {
  return cryptoLogoUrl(FALLBACK_LOGO_SYMBOL);
}
