/**
 * Streams while `page` waits on the day's movers.
 *
 * Re-exported rather than wrapped: the loading state is the same for every
 * market, and the file has to live here because the route segment is what
 * Next.js reads it from. `(private)/layout` resolves the user before this
 * renders, so the skeleton stands in for the query alone.
 */
export { default } from '@/components/daily-movers-loading';
