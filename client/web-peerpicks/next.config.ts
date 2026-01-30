import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },
  // ADD THIS REWRITES SECTION
  async rewrites() {
    return [
      {
        // When you use <img src="/uploads/image.jpg" />
        source: '/uploads/:path*',
        destination: 'http://localhost:3000/uploads/:path*',
      },
      {
        // When you fetch('/api/auth/update-profile')
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
    ];
  },
};

export default nextConfig;