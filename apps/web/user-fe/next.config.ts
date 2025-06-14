import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'swarajdesk.adityahota.online',
        port: '',
        pathname: '/**',
      },
    ],
    // Add timeout and retry configurations
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Add experimental features for better image handling
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
  
};

module.exports = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://user-be-97618793412.europe-west1.run.app/api/:path*",
      },
    ];
  },
};

export default nextConfig;