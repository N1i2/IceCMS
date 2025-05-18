import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
          : "http://localhost:3001/:path*", 
      },
      {
        source: "/p/:path*", 
        destination: isProduction
          ? "http://backend:3001/:path*" 
          : "http://localhost:3001/:path*", 
      },
    ];
  },
};

export default nextConfig;