'use client';

import { Moon, Sun } from '@gravity-ui/icons';
import { Switch, useIsHydrated, useTheme } from '@heroui/react';

/**
 * Light/dark toggle.
 *
 * `useTheme` persists the choice to `localStorage["heroui-theme"]` and stamps
 * `.dark` / `data-theme` onto `<html>` — the selectors `@heroui/styles` keys its
 * dark palette off. The pre-paint script in `app/layout.tsx` reads the same key
 * so the page renders in the stored theme before React hydrates, and seeds it
 * from the OS preference on a first visit.
 */
export default function ThemeSwitch() {
  // Seeded by the pre-paint script, so the "light" default is never reached.
  // Passing "light" rather than "system" keeps an explicit choice from being
  // overridden when the OS preference changes mid-session.
  const { theme, setTheme } = useTheme('light');

  // `useTheme` reads localStorage in its state initializer, so it cannot run on
  // the server. Hold the layout space until the client takes over.
  const isHydrated = useIsHydrated();
  if (!isHydrated) return <div className="w-10 h-5" />;

  const isDark = theme === 'dark';

  return (
    <Switch
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      isSelected={isDark}
      onChange={(selected) => setTheme(selected ? 'dark' : 'light')}
    >
      <Switch.Control>
        {/*
         * `pointer-events-none`: react-aria's press handling ignores clicks
         * whose target is the icon's SVG, so without this the thumb — the most
         * obvious place to click — is dead and only the bare track responds.
         * Clicks fall through to the control, which covers the same area.
         */}
        <Switch.Thumb className="items-center justify-center pointer-events-none">
          {isDark ? (
            <Moon width={11} height={11} />
          ) : (
            <Sun width={11} height={11} />
          )}
        </Switch.Thumb>
      </Switch.Control>
    </Switch>
  );
}
