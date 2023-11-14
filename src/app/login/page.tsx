import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const CredentialsForm = dynamic(
  () => import('@/components/login/credentials-form'),
)

type LoginPageProps = {
  searchParams: {
    returnUrl?: string
  }
}

const Login = ({ searchParams: { returnUrl } }: LoginPageProps) => {
  return (
    <Suspense>
      <CredentialsForm returnUrl={returnUrl} />
    </Suspense>
  )
}

export default Login
