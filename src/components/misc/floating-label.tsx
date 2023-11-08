import classNames from 'classnames'
import { useId, useMemo } from 'react'
import type { Merge } from 'type-fest'

type FloatingLabelProps = Merge<
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >,
  {
    label?: string
    name: string
    placeholder?: never
  }
>

const FloatingLabel = ({
  className,
  label,
  ...inputProps
}: FloatingLabelProps) => {
  const $id = useId()

  const controlId = useMemo(() => inputProps.id ?? $id, [$id, inputProps.id])

  return (
    <div className={classNames('relative', className)}>
      <input
        {...inputProps}
        id={controlId}
        placeholder=" "
        className={classNames(
          'block w-full text-sm text-gray-900 bg-transparent rounded border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer',
        )}
      />

      <label
        htmlFor={controlId}
        className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-1 z-[1] origin-[0] bg-white px-2 rounded-lg peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
      >
        {label}
      </label>
    </div>
  )
}

export default FloatingLabel
