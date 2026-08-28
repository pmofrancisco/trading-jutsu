import type { NextConfig } from 'next';

/**
 * The origin the index logos are served from, and the only remote host
 * `next/image` will optimize an image from.
 *
 * Read from the same variable `phStocksIndexLogoUrl` builds its URLs with, so
 * the host is configured once; the path under it is repeated here because this
 * file is loaded outside the app and cannot import `@/lib/ph-stocks-assets`.
 * The pattern is narrowed to that path so only the PH bucket can be optimized —
 * an open host would let anyone put an arbitrary image through the optimizer.
 *
 * Missing, the app builds and runs with no remote image allowed, which is what
 * a request for a logo would already be failing on in
 * `phStocksIndexLogoUrl` — `next.config` is not the place to stop a build over
 * it.
 */
const phStocksAssetsBaseUrl = process.env.PH_STOCKS_ASSETS_BASE_URL;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: phStocksAssetsBaseUrl
      ? [new URL(`${phStocksAssetsBaseUrl}/storage/v1/object/public/ph/**`)]
      : [],
  },
};

export default nextConfig;
