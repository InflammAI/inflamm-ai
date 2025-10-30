/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
    };
    return config;
  },
  devIndicators: {
    buildActivityPort: 3001
  },
  // Disable Turbopack by using webpack
  experimental: {
    webpackBuildWorker: true
  }
}

module.exports = nextConfig;
