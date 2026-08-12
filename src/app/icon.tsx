import { markPath, markViewBox } from '@/components/mark';

/**
 * The favicon, drawn from the same geometry as the header's `<Mark />`.
 *
 * SVG rather than a committed `.ico` or an `ImageResponse` PNG: one path scales
 * to every size a browser asks for, so there is no binary in the tree and
 * nothing to regenerate when the mark changes. Next emits `sizes="any"` for it.
 *
 * This replaces the `favicon.ico` that shipped with `create-next-app` — the
 * Next.js logo, which was what Google and every browser tab had been showing
 * for the app.
 */
export const size = { width: 32, height: 32 };
export const contentType = 'image/svg+xml';

/**
 * A fixed hex, not `currentColor` or the `--accent` token: a favicon renders
 * outside the document, with no stylesheet and no theme class to inherit from.
 * This is the accent blue, which holds up against both a light and a dark tab
 * strip.
 */
const markColor = '#3b82f6';

export default function Icon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${markViewBox}" width="${size.width}" height="${size.height}"><path d="${markPath}" fill="${markColor}" fill-rule="evenodd"/></svg>`;

  return new Response(svg, { headers: { 'Content-Type': contentType } });
}
