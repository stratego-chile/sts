//@ts-check
const path = require('path')

const withBundleAnalyzer = require('@next/bundle-analyzer')({
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
    PASSWORD_SECURITY_CLIENT_SALT: process.env.PASSWORD_SECURITY_CLIENT_SALT ?? '',
    SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME ?? '',
  },
  experimental: {
    appDir: true,
  },
  poweredByHeader: false,
  sassOptions: {
		includePaths: [path.join(__dirname, 'src', 'styles')]
	},
}

module.exports = withBundleAnalyzer(nextConfig)
