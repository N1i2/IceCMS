import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const isProduction = process.env.NODE_ENV === "production";
    return [
      {
        source: "/api/:path*", 
        destination: isProduction
          ? "https://backend:3001/:path*" 
          : "http://localhost:3001/:path*", 
      },
      {
        source: "/p/:path*", 
        destination: isProduction
          ? "https://backend:3001/:path*" 
          : "http://localhost:3001/:path*", 
      },
    ];
  },
};

export default nextConfig;
