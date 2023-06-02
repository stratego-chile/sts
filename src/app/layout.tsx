import '@/styles/global.sass'

import Analytics from '@/app/analytics'
import dynamic from 'next/dynamic'

const DefaultFooter = dynamic(
  () => import('@/components/layout/default-footer')
)

export const generateMetadata = () => {
  return {
    title: process.env.BRAND_NAME,
    description: process.env.BRAND_DESCRIPTION,
  }
}

const RootLayout = ({ children }: React.PropsWithChildren<WithoutProps>) => {
  return (
    <html lang="en" className="h-full bg-gray-50">
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
        <main className="flex flex-col flex-grow">{children}</main>
        <DefaultFooter />
        <Analytics />
      </body>
    </html>
  )
}

export default RootLayout
