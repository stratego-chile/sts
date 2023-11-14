//@ts-check
import bundleAnalyzerLoader from '@next/bundle-analyzer'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)

const withBundleAnalyzer = bundleAnalyzerLoader({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add environment variables to the client side
  env: {
    BRAND_NAME: process.env.BRAND_NAME ?? '',
    BRAND_JURIDICAL_NAME: process.env.BRAND_JURIDICAL_NAME ?? '',
    BRAND_DESCRIPTION: process.env.BRAND_DESCRIPTION ?? '',
    CAPTCHA_KEY: process.env.CAPTCHA_KEY ?? '',
    DEFAULT_PAGE_TITLE: process.env.DEFAULT_PAGE_TITLE ?? '',
    DEFAULT_PAGE_DESCRIPTION: process.env.DEFAULT_PAGE_DESCRIPTION ?? '',
    PASSWORD_SECURITY_CLIENT_SALT:
      process.env.PASSWORD_SECURITY_CLIENT_SALT ?? '',
    SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME ?? '',
    SESSION_STORE_KEY: process.env.SESSION_STORE_KEY ?? '',
    SESSION_FINGERPRINT_KEY: process.env.SESSION_FINGERPRINT_KEY ?? '',
  },
  poweredByHeader: false,
  reactStrictMode: true,
  sassOptions: {
    includePaths: [path.join(__filename, 'src', 'styles')],
  },
}

export default withBundleAnalyzer(nextConfig)
