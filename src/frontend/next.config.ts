import type { NextConfig } from "next";
import { localIp } from '@/helpModule/localIp';

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    const isProduction = process.env.NODE_ENV === "production";
    return [
      {
        source: "/api/:path*", 
        destination: isProduction
          ? "http://backend:3001/:path*" 
          : `http://${localIp}:3001/:path*`, 
      },
      {
        source: "/p/:path*", 
        destination: isProduction
          ? "http://backend:3001/:path*" 
          : `http://${localIp}:3001/:path*`, 
      },
    ];
  },
};

export default nextConfig;