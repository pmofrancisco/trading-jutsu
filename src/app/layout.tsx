import { absoluteUrl, origin, paths } from '@/paths';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const description =
  'A personal markets dashboard tracking Philippine Stock Exchange index performance, crypto and forex.';

export const metadata: Metadata = {
  // Lets every URL-based field below — and `alternates.canonical` in the
  // segments under this one — be written as a relative path.
  metadataBase: new URL(origin),
  title: {
    default: 'Trading Jutsu',
    template: '%s | Trading Jutsu',
  },
  description,
  // Only the sign-in page is reachable without a session, so it is the only
  // page this can apply to; `(private)/layout` opts its own subtree back out.
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: 'Trading Jutsu',
    title: 'Trading Jutsu',
    description,
    url: absoluteUrl(paths.home()),
  },
  // `summary`, not `summary_large_image`: there is no `opengraph-image` asset
  // to fill the wide card, and an empty one renders as a blank grey slab.
  twitter: { card: 'summary', title: 'Trading Jutsu', description },
  // To verify with Google Search Console via a meta tag instead of DNS, add:
  //   verification: { google: '<token from Search Console>' },
};

/**
 * Applies the stored theme before the browser paints, so a dark-mode user never
 * sees a flash of the light theme. `useTheme` (see `components/theme-switch`)
 * only applies it in an effect, which runs after first paint.
 *
 * Runs as a parser-blocking inline script — the Metadata API cannot express
 * this, and `next/script`'s `beforeInteractive` still resolves too late. On a
 * first visit it seeds the key from the OS preference so the switch has an
 * explicit value to read.
 */
const applyStoredTheme = `
(function () {
  try {
    var key = 'heroui-theme';
    var stored = localStorage.getItem(key);
    var theme =
      stored ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (!stored) localStorage.setItem(key, theme);
    document.documentElement.classList.add(theme);
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      // The script below adds the theme class before React hydrates.
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: applyStoredTheme }} />
        {children}
      </body>
    </html>
  );
}
