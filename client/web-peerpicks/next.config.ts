import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000', // The PORT where the backend serves images
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.0.105', // Your Network IP
        port: '3000',
        pathname: '/uploads/**',
      }
    ],
  },
  async rewrites() {
    return [
      {
        // Maps frontend:3004/api to backend:3000/api
        source: '/api/:path*',
        destination: 'http://192.168.0.105:3000/api/:path*', 
      },
      {
        // Maps frontend:3004/uploads to backend:3000/uploads
        source: '/uploads/:path*',
        destination: 'http://192.168.0.105:3000/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;