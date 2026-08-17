/**
 * The messages behind the `?error=` codes Auth.js sends to the sign-in page.
 *
 * `pages.error` in `lib/auth.ts` points at `/sign-in`, so every failure Auth.js
 * would otherwise render on its own screen arrives here as a query parameter
 * instead. `@auth/core` types that parameter as `Configuration | AccessDenied |
 * Verification`; the two below are the ones this app can actually produce.
 * `Verification` belongs to the email provider, which this app does not use, so
 * it falls through to the catch-all rather than being given a message that
 * describes a flow that cannot happen here.
 *
 * `Configuration` means the server is set up wrong — a missing
 * `AUTH_GITHUB_SECRET`, say. The visitor is told the outcome and nothing about
 * the cause: they cannot fix it, and the detail belongs in the server log.
 */
const SIGN_IN_ERRORS: Record<string, string> = {
  // Worded to match the early-access note on the sign-in page itself. The
  // visitor most likely to see this is one who arrived from the landing page's
  // pricing, so "not on the list yet" tells them the truth — the account is
  // fine, the app is not open — where "does not have access" reads as a
  // judgement on their account.
  AccessDenied: 'That GitHub account is not on the early-access list yet.',
  Configuration: 'Sign-in is unavailable right now. Please try again later.',
};

/**
 * For a code no version of Auth.js in use when this was written can send. It
 * exists so a future one cannot leave the page looking untouched after a failed
 * attempt — an unexplained error is still better than a sign-in button that
 * appears to do nothing.
 */
const UNKNOWN_SIGN_IN_ERROR = 'Sign-in failed. Please try again.';

/**
 * Turns an untrusted `?error=` value into a message, or `null` when there is no
 * failure to report.
 *
 * The value reaches us through the query string, so it is attacker-controlled:
 * it is looked up, never echoed. Rendering it would let a crafted sign-in link
 * put arbitrary text inside the app's own alert, where it would read as the
 * app's words.
 */
export function toSignInErrorMessage(value: unknown): string | null {
  if (typeof value !== 'string' || value === '') {
    return null;
  }

  return SIGN_IN_ERRORS[value] ?? UNKNOWN_SIGN_IN_ERROR;
}
