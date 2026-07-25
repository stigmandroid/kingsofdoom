import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api-assets.clashofclans.com",
        port: "",
        pathname: "/badges/**",
      },
    ],
  },
};

export default nextConfig;