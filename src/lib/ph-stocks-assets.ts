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

/** Where the index logos sit under the origin, one PNG per symbol. */
const INDEX_LOGO_PATH = '/storage/v1/object/public/ph/';

/**
 * The logo for one PSE index, named after the symbol `market_data` stores —
 * `PSEI` is served as `PSEI.png`.
 *
 * The origin is read per call rather than at module scope so a missing variable
 * fails the request that needed a logo, not `next build` — the same reason
 * `phStocksDb` checks its own variable where it does.
 */
export function phStocksIndexLogoUrl(symbol: string): string {
  const baseUrl = process.env.SUPABASE_STORAGE_BASE_URL;

  if (!baseUrl) {
    throw new Error('SUPABASE_STORAGE_BASE_URL is not set.');
  }

  return `${baseUrl}${INDEX_LOGO_PATH}${symbol}.png`;
}
