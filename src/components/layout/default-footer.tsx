import ArrowTopRightOnSquareIcon from '@heroicons/react/24/outline/ArrowTopRightOnSquareIcon'

const DefaultFooter = () => {
  return (
    <footer className="bg-gray-50">
      <nav
        className="mx-auto flex flex-col lg:flex-row max-w-7xl items-center lg:justify-between p-6 lg:px-8 gap-y-4 lg:gap-x-8 text-sm leading-6 font-semibold text-gray-900"
        aria-label="Global"
      >
        <section className="inline-flex flex-col lg:flex-row justify-center">
          <span className="text-center">
            {process.env.BRAND_JURIDICAL_NAME}
          </span>
        </section>

        <section className="flex items-center gap-1">
          <span>Go to</span>

          <a
            href="https://www.stratego.cl"
            target="_blank"
            className="inline-flex text-blue-500 hover:text-blue-800 items-center gap-1"
          >
            <span>Stratego Site</span>

            <ArrowTopRightOnSquareIcon
              className="inline-flex w-4 h-4"
              aria-hidden="true"
            />
          </a>
        </section>
      </nav>
    </footer>
  )
}

export default DefaultFooter
