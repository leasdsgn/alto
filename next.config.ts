import { withSentryConfig } from '@sentry/nextjs'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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

const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN

export default sentryAuthToken
  ? withSentryConfig(nextConfig, {
      org: 'omenstudio',
      project: 'alto',
      authToken: sentryAuthToken,
      silent: true,
      widenClientFileUpload: true,
    })
  : nextConfig
