import 'server-only';

/**
 * URLs for the PH market's public image assets.
 *
 * The images live in another application's storage bucket, reached over plain
 * HTTP with no client or credentials — this app only ever links to them. The
 * origin is configuration because it moves between environments; the path under
 * it is the bucket's own layout, so it is written here rather than repeated at
 * every call site.
 *
 * Only a feature's data layer may import this: a URL reaches the render context
 * as a DTO field, the same way market data does.
 */

/**
 * Where the PH logos sit under the origin, one PNG per symbol.
 *
 * Indices and stocks share the one folder — `PSEI.png` and `ICT.png` are
 * siblings — so there is no per-kind path to pick between and no lookup to do:
 * the symbol is the file name.
 */
const LOGO_PATH = '/storage/v1/object/public/ph/';

/**
 * The symbol whose logo stands in when a stock has none of its own.
 *
 * The bucket is filled in as logos are drawn, and most of the board is still
 * waiting, so a missing file is the ordinary case rather than the broken one.
 * The index mark is what a row falls back to — it says "PSE" without claiming
 * to be any particular company's.
 */
const FALLBACK_LOGO_SYMBOL = 'PSEI';

/**
 * The logo for one PH symbol, named after the symbol `market_data` stores —
 * `PSEI` is served as `PSEI.png`, and so is `ICT`.
 *
 * The origin is read per call rather than at module scope so a missing variable
 * fails the request that needed a logo, not `next build` — the same reason
 * `phStocksDb` checks its own variable where it does.
 *
 * Whether the file is actually there is not knowable here: the bucket answers
 * `400` for a symbol it has no logo for, which only the request finds out. The
 * render context is handed `phStocksLogoUrl` and `phStocksFallbackLogoUrl`
 * together and picks between them when the first one fails to load.
 */
export function phStocksLogoUrl(symbol: string): string {
  const baseUrl = process.env.SUPABASE_STORAGE_BASE_URL;

  if (!baseUrl) {
    throw new Error('SUPABASE_STORAGE_BASE_URL is not set.');
  }

  return `${baseUrl}${LOGO_PATH}${symbol}.png`;
}

/** The stand-in logo, for a symbol the bucket has no file for. */
export function phStocksFallbackLogoUrl(): string {
  return phStocksLogoUrl(FALLBACK_LOGO_SYMBOL);
}
