'use client';

import { useState } from 'react';

/**
 * How wide a logo is drawn in a table row, in pixels.
 *
 * The sources are 250px squares, so this is the display size, not the file's.
 * Twenty-four reads as part of the symbol beside it rather than as a thumbnail
 * the text hangs off. It is four pixels taller than the `text-sm` line box it
 * sits in, so it does set the row's height — which is why `MoversTableSkeleton`
 * draws a square of the same size rather than a bar alone.
 */
export const SYMBOL_LOGO_SIZE = 24;

/**
 * One symbol's mark, with the market's stand-in behind it.
 *
 * The only client component in either table, and it is one because a missing
 * logo is not knowable on the server: the bucket holds a file per symbol, is
 * still being filled in, and answers `400` rather than a placeholder for a
 * symbol it has not reached yet. Whether a URL resolves is something only the
 * browser that requested it finds out, so `onError` is the signal and there is
 * nowhere earlier to catch it.
 *
 * Only two strings cross the boundary, so the tables around this stay Server
 * Components and their formatters are still never serialised.
 *
 * A plain `<img>` rather than `next/image`, which is what the index performance
 * cards use. Those are seven marks that all exist; a movers table is a hundred
 * rows of which nearly all currently miss, and every miss through the optimizer
 * is a round-trip that fails before the fallback can even be requested. The
 * sources are already small enough that there is nothing to optimize.
 */
export default function SymbolLogo({
  fallbackUrl,
  src,
}: {
  /** The market's stand-in mark, shown when `src` will not load. */
  fallbackUrl: string;
  src: string;
}) {
  // Which URL failed, rather than a bare "it failed" flag. Two things fall out
  // of that. A new `src` is not the failed one, so the state resets itself and
  // the component does not depend on its caller keying rows by symbol to avoid
  // showing one stock's miss against another's logo. And a fallback that itself
  // fails to load re-sets the same `src`, which is not a change, so React stops
  // there rather than swapping the two forever.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const hasFailed = failedSrc === src;

  return (
    // `alt` is empty on purpose: the symbol is written beside it in the same
    // cell, and it is the cell's row header, so naming the company here would
    // have a screen reader announce the row twice. The logo is decoration.
    //
    // The optimizer is the wrong tool here rather than merely skipped: a
    // hundred rows of which nearly all miss would be a hundred failing
    // round-trips through it before the fallback could even be asked for.
    // The directive has to be the last line before the element, so the reason
    // is written above it rather than after it.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt=""
      className="shrink-0 rounded-full"
      height={SYMBOL_LOGO_SIZE}
      onError={() => setFailedSrc(src)}
      src={hasFailed ? fallbackUrl : src}
      width={SYMBOL_LOGO_SIZE}
    />
  );
}
