import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Optimized Image Handling
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
        protocol: 'http',
        hostname: '192.168.0.105', 
        port: '3000',
        pathname: '/uploads/**',
      }
    ],
  },

  // 2. Network Proxies & SSE Support
  async rewrites() {
    return [
      {
        // Maps frontend/api to backend/api
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*', 
      },
      {
        // Maps frontend/uploads to backend/uploads
        source: '/uploads/:path*',
        destination: 'http://localhost:3000/uploads/:path*',
      },
    ];
  },

  // 3. Professional Polish: Prevent SSE Buffering
  // This ensures that your new Notification Stream doesn't get delayed by Next.js compression
  async headers() {
    return [
      {
        source: '/api/notifications/stream',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-transform' },
          { key: 'Connection', value: 'keep-alive' },
          { key: 'Content-Type', value: 'text/event-stream' },
          { key: 'X-Accel-Buffering', value: 'no' }, // Critical for Nginx/Vercel proxies
        ],
      },
    ];
  }
};

export default nextConfig;