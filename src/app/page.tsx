import { getPageTitle } from '@/lib/format'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const Header = dynamic(() => import('@/components/layout/default-header'))

export const metadata = {
  title: getPageTitle('Home'),
  description: 'Welcome to Stratego Support Ticket System',
}

const Home = () => {
  return (
    <>
      <Header />
      <div className="flex flex-grow items-center">
        <div className="max-w-7xl w-full mx-auto">
          <div className="p-6 space-y-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Welcome to Stratego Support Ticket System
            </h1>
            <p>
              Please{' '}
              <Link
                href="/login"
                className="items-center font-bold text-base text-blue-500 hover:text-blue-700"
              >
                log in
              </Link>{' '}
              to start using the system
            </p>
            <p>
              If you don&apos;t have access to this platform, just contact us
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home
