import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Only run ESLint on local development
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
