'use client';

import { signOut } from '@/features/auth/actions/sign-out';
import type { SessionUser } from '@/features/auth/data/session';
import { ArrowRightFromSquare, Person } from '@gravity-ui/icons';
import { Avatar, Button, Popover, Separator, Spinner } from '@heroui/react';
import { useFormStatus } from 'react-dom';

/**
 * The first letter of the first two words of a name — "Paul Michael Francisco"
 * becomes "PM". Empty when there is no name to read, which lets the caller fall
 * back to an icon rather than rendering an empty circle.
 */
function initials(name: string | null | undefined): string {
  if (!name) return '';

  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Split out for the same reason `SignInForm`'s submit button is: `useFormStatus`
 * only reports on a `<form>` above it in the tree. Signing out is a round trip
 * to the server followed by a redirect, so without this the button sits idle
 * the whole time and a second click posts the action twice — `isPending`
 * disables it as well as showing the spinner.
 */
function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    // `danger-soft` rather than `outline`: this is the one destructive action
    // in the app, and the tinted fill says so without shouting like `danger`.
    <Button
      className="w-full"
      isPending={pending}
      type="submit"
      variant="danger-soft"
    >
      {({ isPending }) => (
        <>
          {/*
           * The spinner takes the icon's place rather than sitting beside it,
           * as on `SignInForm`'s button: the row keeps its width and the label
           * does not shift when the state changes. `aria-hidden` because the
           * label already names the action.
           */}
          {isPending ? (
            <Spinner color="current" size="sm" />
          ) : (
            <ArrowRightFromSquare aria-hidden />
          )}
          {isPending ? 'Signing out...' : 'Sign out'}
        </>
      )}
    </Button>
  );
}

/**
 * The account control in the header: the avatar that opens it, the identity it
 * shows, and the only action attached to it. Auth UI, so it lives with the rest
 * of `features/auth` rather than in the header it happens to be rendered from.
 *
 * The popover is deliberately a dialog and not a `Dropdown` — with a single
 * action there is nothing to arrow between, and a form submit keeps signing out
 * working if the client bundle never arrives. React Aria gives the panel
 * `role="dialog"`, moves focus into it and restores focus on close by itself.
 */
export default function UserMenu({ user }: { user: SessionUser }) {
  const userInitials = initials(user.name);

  // The name is optional on a GitHub account, so the email is what is always
  // there. Whichever is missing, the panel shows one line instead of a blank
  // one above a filled one.
  const primary = user.name ?? user.email;
  const secondary = user.name ? user.email : null;

  return (
    <Popover>
      <Button
        variant="ghost"
        isIconOnly
        aria-label={`Account: ${user.name ?? user.email}`}
      >
        <Avatar className="size-8">
          {/*
           * HeroUI's Avatar is Radix-based: the image unmounts when `src`
           * is empty or fails to load, and the fallback takes its place.
           * Without a fallback a GitHub account with no picture rendered
           * an empty circle.
           */}
          <Avatar.Image src={user.image ?? ''} alt="" />
          <Avatar.Fallback>
            {userInitials || <Person aria-hidden />}
          </Avatar.Fallback>
        </Avatar>
      </Button>
      {/*
       * `placement`: the trigger sits at the right edge of the header, and the
       * default centres the panel under it — far enough over to be clipped on a
       * narrow viewport. Aligning the ends keeps it inside the screen.
       *
       * The width is pinned at both ends because the panel otherwise sizes to
       * its longest line: `min-w` stops "Sign out" alone from setting the
       * width, `max-w` stops a long email from stretching it off-screen.
       */}
      <Popover.Content className="p-4 min-w-56 max-w-72" placement="bottom end">
        <div className="flex items-center gap-3">
          <Avatar className="size-10 shrink-0">
            <Avatar.Image src={user.image ?? ''} alt="" />
            <Avatar.Fallback>
              {userInitials || <Person aria-hidden />}
            </Avatar.Fallback>
          </Avatar>
          {/*
           * `min-w-0`: a flex child's minimum size is its content, so without
           * this the text refuses to shrink and `truncate` never takes effect —
           * the email pushes the panel wider instead of ellipsing.
           */}
          <div className="min-w-0">
            {/* `title`: the full value, for whoever the ellipsis cuts off. */}
            <div className="font-bold truncate" title={primary}>
              {primary}
            </div>
            {secondary && (
              <div className="text-muted text-sm truncate" title={secondary}>
                {secondary}
              </div>
            )}
          </div>
        </div>
        <Separator className="my-3" />
        <form action={signOut} className="w-full">
          <SignOutButton />
        </form>
      </Popover.Content>
    </Popover>
  );
}
