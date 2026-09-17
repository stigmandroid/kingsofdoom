import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api-assets.clashofclans.com",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/cocbot/config/:path*",
        destination: "http://127.0.0.1:3100/config/:path*",
      },
    ];
  },
};

export default withNextIntl(nextConfig);
