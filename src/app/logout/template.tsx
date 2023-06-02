import Spinner from '@/components/misc/spinner'

const LoginTemplate = async ({
  children,
}: React.PropsWithChildren<WithoutProps>) => {
  return (
    <div className="flex flex-col flex-grow gap-4 mx-auto justify-center items-center w-full">
      {children}
      <span>
        <Spinner />
      </span>
    </div>
  )
}

export default LoginTemplate
