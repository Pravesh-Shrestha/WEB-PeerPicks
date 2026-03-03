import type { NextConfig } from "next";

// Resolve API base robustly; fall back to localhost if env is missing or malformed
const resolveApiBase = () => {
  const candidate =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'http://localhost:3000';
  try {
    return new URL(candidate.trim().replace(/\/$/, ''));
  } catch {
    return new URL('http://localhost:3000');
  }
};

const apiUrl = resolveApiBase();
const imagePort = apiUrl.port || undefined;

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      }
    ],
  },
  async rewrites() {
    const destinationBase = apiUrl.toString().replace(/\/$/, '');
    return [
      {
        // Proxy frontend /api/* to backend API
        source: '/api/:path*',
        destination: `${destinationBase}/api/:path*`, 
      },
    ];
  },
};

export default nextConfig;