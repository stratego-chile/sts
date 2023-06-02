import Loading from '@/app/account/loading'
import { getPageTitle } from '@/lib/format'
import { checkSession } from '@/lib/session'
import dynamic from 'next/dynamic'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

const Header = dynamic(() => import('@/components/layout/session-header'))

export const metadata = {
  title: getPageTitle('Account'),
}

const AccountLayout = async ({
  children,
}: React.PropsWithChildren<WithoutProps>) => {
  const headersList = headers()

  const user = await checkSession(cookies())

  if (!user) {
    let returnPath = headersList.get('x-invoke-path')

    if (returnPath) {
      const returnPathSearchParams = headersList.get('x-invoke-query')

      if (returnPathSearchParams) {
        const searchParams = JSON.parse(
          decodeURIComponent(returnPathSearchParams)
        ) as Record<string, string>

        const parsedSearchParams = new URLSearchParams(searchParams)

        returnPath = returnPath.concat('?', parsedSearchParams.toString())
      }

      redirect(`/login?returnUrl=${Buffer.from(returnPath).toString('base64')}`)
    } else redirect('/login')
  }

  return (
    <div className="flex flex-col flex-grow h-full">
      <Header />
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </div>
  )
}

export default AccountLayout
