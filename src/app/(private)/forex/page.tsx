import { Typography } from '@heroui/react';

/**
 * The section's landing page. It names the section and nothing else, the way
 * every other market's does: the section's pages sit beside each other in the
 * navigation rather than one of them being the section itself.
 */
export default function Forex() {
  return (
    /*
     * `Typography.Heading` rather than a bare `<h1>` so the page title picks up
     * the same scale as the rest of the app. `level` is a number, so it
     * survives the server/client boundary — see the note in `sign-in/page`.
     */
    <Typography.Heading className="text-2xl" level={1} weight="bold">
      Forex
    </Typography.Heading>
  );
}
