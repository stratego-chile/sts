import classNames from 'classnames'

type SpinnerProps = {
  size?: number | 'inline'
  sizeUnit?: 'px' | 'rem' | 'em'
}

const Spinner = ({ size, sizeUnit = 'px' }: SpinnerProps) => {
  return (
    <div
      className={classNames(
        'inline-flex rounded-full align-[-0.125em]',
        'border-4 border-solid border-current border-r-transparent',
        'animate-spin motion-reduce:animate-[spin_1.5s_linear_infinite]',
        size === 'inline' ? 'h-full w-auto' : !size && 'h-8 w-8'
      )}
      role="status"
      style={{
        height: typeof size === 'number' ? `${size}${sizeUnit}` : undefined,
        width: typeof size === 'number' ? `${size}${sizeUnit}` : undefined,
      }}
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  )
}

export default Spinner
