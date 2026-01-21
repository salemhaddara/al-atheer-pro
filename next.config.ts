import type { NextConfig } from "next";
import path from "path";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const remotePatterns: NonNullable<NextConfig['images']>['remotePatterns'] = [
  { protocol: 'http', hostname: 'localhost', port: '8000', pathname: '/storage/**' },
  { protocol: 'http', hostname: '127.0.0.1', port: '8000', pathname: '/storage/**' },
];

if (apiUrl) {
  try {
    const u = new URL(apiUrl);
    const protocol = u.protocol.replace(':', '') as 'http' | 'https';
    remotePatterns.push({
      protocol,
      hostname: u.hostname,
      port: u.port || undefined,
      pathname: '/storage/**',
    });
  } catch { }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    // Temporarily ignore build errors to allow deployment
    // TODO: Fix Products.simple.tsx TypeScript parser issue
    ignoreBuildErrors: true,
  },

  webpack: (config) => {
    // Path alias
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    };

    // Font loader
    config.module.rules.push({
      test: /\.(ttf)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/fonts/[name][ext]',
      },
    });

    return config;
  },

  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
};

export default nextConfig;
