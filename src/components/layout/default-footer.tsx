const DefaultFooter: React.FC<WithoutProps> = () => {
  return (
    <footer>
      <div className="bg-gray-50">
        <nav
          className="mx-auto flex flex-col lg:flex-row max-w-7xl items-center lg:justify-between p-6 lg:px-8 gap-y-4 lg:gap-x-8 text-sm leading-6 font-semibold text-gray-900"
          aria-label="Global"
        >
          <div className="inline-flex flex-col lg:flex-row justify-center gap-x-4 lg:divide-x lg:divide-slate-900/45">
            <span className="text-center">{`2021 - ${new Date().getFullYear()}`}</span>
            <span className="text-center lg:pl-4">
              {process.env.BRAND_JURIDICAL_NAME}
            </span>
          </div>
          <div className="inline-flex">
            Go to&nbsp;
            <a
              href="https://www.stratego.cl"
              className="text-blue-500 hover:text-blue-800"
            >
              Stratego site
            </a>
          </div>
        </nav>
      </div>
    </footer>
  )
}

export default DefaultFooter
