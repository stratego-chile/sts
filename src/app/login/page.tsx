'use client'

import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

const CredentialsForm = dynamic(
  () => import('@/components/login/credentials-form')
)

const Login = () => {
  const searchParams = useSearchParams()

  const returnUrl = useMemo(
    () => searchParams.get('returnUrl') ?? undefined,
    [searchParams]
  )

  return (
    <div className="grid min-h-full">
      <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col w-full max-w-md gap-y-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your Stratego STS account
          </h2>

          <CredentialsForm returnUrl={returnUrl} />
        </div>
      </div>
    </div>
  )
}

export default Login
