/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push('encoding');
    return config;
  },
}

module.exports = nextConfig 