import dynamic from 'next/dynamic'
import { getPageTitle } from '@stratego-sts/lib/format'
import { checkSession } from '@stratego-sts/lib/session'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import Loading from './loading'

const Header = dynamic(
  () => import('@stratego-sts/components/layout/account-header')
)

export const metadata = {
  title: getPageTitle('Account'),
}

const AccountLayout = async ({
  children,
}: React.PropsWithChildren<WithoutProps>) => {
  const user = await checkSession(cookies())

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex flex-col flex-grow h-full">
      <Suspense fallback={<Loading />}>
        <>
          <Header />
          {children}
        </>
      </Suspense>
    </div>
  )
}

export default AccountLayout
