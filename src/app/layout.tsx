import '@/styles/global.sass'

import Analytics from '@/app/analytics'
import { parseConsentingConfig } from '@/helpers/cookies'
import { CookiesConsenting } from '@/lib/enumerators'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const CookiesConsentingModal = dynamic(
  () => import('@/components/layout/cookies-consent-modal'),
)

const DefaultFooter = dynamic(
  () => import('@/components/layout/default-footer'),
)

const Advisory = dynamic(() => import('@/app/advisory'))

export const metadata = {
  title: process.env.BRAND_NAME,
  description: process.env.BRAND_DESCRIPTION,
}

const RootLayout = async ({
  children,
}: React.PropsWithChildren<WithoutProps>) => {
  const cookieConsentingConfig = parseConsentingConfig()

  return (
    <html lang="en" className="h-full bg-gray-50" suppressHydrationWarning>
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />

        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />

        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />

        <link rel="manifest" href="/manifest.json" />

        <meta name="msapplication-TileColor" content="#212529" />

        <meta name="theme-color" content="#212529" />
      </head>

      <body className="h-full flex flex-col">
        <Suspense>
          <Advisory />
        </Suspense>

        <main className="flex flex-col flex-grow">
          {children}

          {!cookieConsentingConfig.has(CookiesConsenting.Necessary) && (
            <Suspense>
              <CookiesConsentingModal open={true} />
            </Suspense>
          )}
        </main>

        <Suspense>
          <DefaultFooter />
        </Suspense>

        {cookieConsentingConfig.has(CookiesConsenting.Analytics) && (
          <Analytics />
        )}
      </body>
    </html>
  )
}

export default RootLayout
