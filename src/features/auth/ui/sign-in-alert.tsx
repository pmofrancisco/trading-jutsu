'use client';

import { Alert } from '@heroui/react';
import { useEffect, useRef } from 'react';

/**
 * The sign-in failure message, focused on arrival.
 *
 * The focus move is the only reason this is a client component. A failed
 * sign-in is a full page load, so the alert is already in the HTML by the time
 * the page is announced — `role="alert"` would announce nothing, because a live
 * region only reports what changes *after* it mounts. Moving focus is the
 * standard remedy: it puts the failure where the reader resumes, ahead of the
 * button they were about to press again.
 */
export default function SignInAlert({ message }: { message: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    // The wrapper is what takes focus, rather than the `Alert` itself, so the
    // component's own markup and styling stay untouched. `tabIndex={-1}` makes
    // it focusable without adding a stop to the tab order; `outline-none` drops
    // the ring, which would otherwise draw a box around a region the user never
    // chose to focus.
    <div ref={ref} tabIndex={-1} className="outline-none">
      <Alert status="danger">
        {/* Empty — the indicator falls back to the built-in danger icon. */}
        <Alert.Indicator />
        <Alert.Content>
          {/* `Alert.Title`, not `Description`: only the title slot takes the
           * status colour; descriptions render muted. */}
          <Alert.Title>{message}</Alert.Title>
        </Alert.Content>
      </Alert>
    </div>
  );
}
