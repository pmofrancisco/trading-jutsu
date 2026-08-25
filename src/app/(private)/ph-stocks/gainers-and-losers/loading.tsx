/**
 * Streams while `page` waits on the session's movers.
 *
 * Re-exported rather than wrapped: the loading state is the same for both
 * markets, and the file has to live here because the route segment is what
 * Next.js reads it from. `(private)/layout` resolves the user before this
 * renders, so the skeleton stands in for the query alone.
 */
export { default } from '@/components/daily-movers-loading';
