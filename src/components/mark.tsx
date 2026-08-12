/**
 * The Trading Jutsu mark: a four-pointed shuriken with an open centre.
 *
 * The geometry lives here as data rather than as markup in two places, because
 * it has two consumers that cannot share a component — `<Mark />` in the header,
 * and the hand-assembled SVG string that `app/icon.tsx` serves as the favicon.
 * Editing the star means editing `markPath` alone.
 *
 * Straight edges rather than curved blades on purpose: the mark renders at 16px
 * in a browser tab, where curves turn to mush.
 */
export const markViewBox = '0 0 32 32';

/**
 * Two subpaths — the star, then the centre hole. The hole is punched by
 * `fill-rule="evenodd"`, so both consumers must set that or the star fills
 * solid.
 */
export const markPath =
  'M16 2 L20.6 11.4 L30 16 L20.6 20.6 L16 30 L11.4 20.6 L2 16 L11.4 11.4 Z ' +
  'M19.2 16 A3.2 3.2 0 1 1 12.8 16 A3.2 3.2 0 1 1 19.2 16 Z';

/**
 * `currentColor`, so the mark takes the colour of whatever it sits in and needs
 * no separate handling for the dark theme. Sized by the caller via `className`.
 */
export default function Mark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox={markViewBox}
      fill="currentColor"
      fillRule="evenodd"
      xmlns="http://www.w3.org/2000/svg"
      // Decorative: the wordmark beside it already names the app.
      aria-hidden
    >
      <path d={markPath} />
    </svg>
  );
}
