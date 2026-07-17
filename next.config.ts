import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/lyon',
        destination: '/appartements?city=lyon',
        permanent: true,
      },
    ]
  },
  images: {
    qualities: [75, 80, 85, 90],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.guesty.com',
      },
      {
        protocol: 'https',
        hostname: 'guesty-listing-images.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
        pathname: '/guesty-listing-images/**',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
        pathname: '/guesty-listing-images/**',
      },
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.storyblok.com',
      },
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
        pathname: '/a.storyblok.com/**',
      },
    ],
  },
}

export default nextConfig
