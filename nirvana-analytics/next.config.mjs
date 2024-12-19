/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  webpack: (config) => {
    config.resolve.alias.canvas = false
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    }
    return config
  },
  experimental: {
  }
}

export default nextConfig
