'use client'

const RootErrorPage = () => {
  return (
    <div className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Oops, an error occurred!
        </h1>
        <p className="mt-6 text-base leading-7 text-gray-600">
          An unexpected error has ocurred on your browser. Please reload this
          page or contact us if the problem persists.
        </p>
      </div>
    </div>
  )
}

export default RootErrorPage
