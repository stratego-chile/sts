import capitalize from '@stdlib/string/capitalize'
import classNames from 'classnames'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { Merge } from 'type-fest'

type OptionValue = React.OptionHTMLAttributes<HTMLOptionElement>['value']

type Option<T extends OptionValue> = {
  value: T
  label: string
}

type FloatingLabelSelectProps<O extends OptionValue> = Merge<
  React.DetailedHTMLProps<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    HTMLSelectElement
  >,
  {
    label?: string
    options?: Array<Option<O>>
    wrap?: 'auto' | 'preserve'
  }
>

const FloatingLabelSelect = <T extends OptionValue>({
  label = ' ',
  className,
  options = [],
  wrap = 'auto',
  ...selectProps
}: FloatingLabelSelectProps<T>) => {
  const $id = useId()

  const labelRef = useRef<HTMLLabelElement>(null)

  const inputRef = useRef<HTMLSelectElement>(null)

  const controlId = useMemo(() => selectProps.id ?? $id, [$id, selectProps.id])

  const [minimumWidth, setMinimumWidth] = useState(0)

  useEffect(() => {
    if (wrap === 'preserve') {
      const $label = labelRef.current
      const $input = inputRef.current

      if ($label && $input) {
        const $labelWidth = $label.getBoundingClientRect().width
        const $inputWidth = $input.getBoundingClientRect().width

        setMinimumWidth($labelWidth > $inputWidth ? $labelWidth : $inputWidth)
      }
    }
  }, [labelRef, inputRef, wrap])

  return (
    <div className={classNames('relative', className)}>
      <select
        {...selectProps}
        id={controlId}
        ref={inputRef}
        className={classNames(
          'block w-full text-gray-900 bg-transparent rounded text-sm border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer',
        )}
        style={{
          minWidth: wrap === 'preserve' ? minimumWidth * 1.3 : undefined,
        }}
      >
        {options.map(({ label: $label, value }, key) => (
          <option key={key} value={String(value)}>
            {capitalize($label)}
          </option>
        ))}
      </select>

      <label
        ref={labelRef}
        className={classNames(
          'absolute text-sm text-gray-500 bg-inherit top-1 z-[1] origin-[0] px-2',
          'duration-300 transform -translate-y-4 scale-75',
          'peer-focus:px-2 peer-focus:text-blue-600 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 left-1',
          'peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2',
        )}
        style={{
          minWidth: wrap === 'preserve' ? minimumWidth : undefined,
        }}
      >
        {capitalize(String(label))}
      </label>
    </div>
  )
}

export default FloatingLabelSelect
