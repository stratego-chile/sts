import dynamic from 'next/dynamic'

const CredentialsForm = dynamic(
  () => import('@stratego-sts/components/login/credentials-form')
)

const Login = () => {
  return (
    <div className="grid min-h-full">
      <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col w-full max-w-md gap-y-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your Stratego STS account
          </h2>
          <CredentialsForm />
        </div>
      </div>
    </div>
  )
}

export default Login
