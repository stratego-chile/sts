'use client'

import { getJaroWinkler } from '@/lib/similarity'
import { Combobox, Transition } from '@headlessui/react'
import CheckIcon from '@heroicons/react/20/solid/CheckIcon'
import ChevronUpDownIcon from '@heroicons/react/20/solid/ChevronUpDownIcon'
import XMarkIcon from '@heroicons/react/20/solid/XMarkIcon'
import classNames from 'classnames'
import { Fragment, useEffect, useMemo, useState } from 'react'
import type { Merge } from 'type-fest'

type Option = {
  label: string
  value: string
}

type FloatingLabelComboboxProps = Merge<
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >,
  {
    label?: string
    name: string
    options?: Array<Option>
    onChange?: (value: string) => void
    initialValue?: string
  }
>

const FloatingLabelCombobox = ({
  className,
  label,
  name,
  options,
  initialValue,
  onChange,
  ...inputProps
}: FloatingLabelComboboxProps) => {
  const [selectedValue, setSelectedValue] = useState(initialValue)
  const [searchedLabel, searchLabel] = useState('')

  const filteredOptions = useMemo(() => {
    if (!options) return []

    if (!searchedLabel) return options

    return options.filter((option) =>
      getJaroWinkler(option.label, searchedLabel?.toLowerCase() ?? '', {
        caseSensitive: false,
        syntheticPercentage: 0.5,
      }),
    )
  }, [options, searchedLabel])

  useEffect(() => {
    onChange?.(selectedValue ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedValue])

  useEffect(() => {
    if (inputProps?.value) {
      const option = options?.find(({ value }) => value === inputProps.value)

      if (option) setSelectedValue(option.value)
    } else setSelectedValue('')
  }, [inputProps.value, options])

  useEffect(() => {
    if (selectedValue) {
      const option = options?.find(({ value }) => value === selectedValue)

      if (option) searchLabel(option.label)
    } else searchLabel('')
  }, [options, selectedValue])

  useEffect(() => {
    if (initialValue) {
      const option = options?.find(({ value }) => value === initialValue)

      if (option) searchLabel(option.label)
    } else searchLabel('')
  }, [initialValue, options])

  return (
    <div className={classNames('relative', className)}>
      <Combobox
        value={selectedValue}
        onChange={setSelectedValue}
        disabled={inputProps.disabled}
      >
        <div className="relative w-full outline-none">
          <div className="relative w-full cursor-default text-left text-sm outline-none bg-white">
            <Combobox.Input
              className={classNames(
                'block w-full rounded py-2 pl-3 pr-10 text-sm leading-5 outline-none focus:ring-0 peer',
                'text-gray-900 border-gray-300 focus:border-blue-600',
              )}
              name={name}
              onChange={(event) => searchLabel(event.target.value)}
              displayValue={(optionLabel: string) => optionLabel}
              value={searchedLabel}
              placeholder=" "
              readOnly={inputProps.readOnly}
              aria-disabled={inputProps.disabled}
            />

            <Combobox.Label
              className={classNames(
                'absolute top-1 z-[1] left-1 px-2 rounded-lg text-sm',
                'duration-300 transform -translate-y-4 scale-75 origin-[0]',
                'peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4',
                'peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2',
                'text-gray-500 bg-white peer-focus:text-blue-600',
              )}
              aria-disabled={inputProps.disabled}
            >
              {label}
            </Combobox.Label>

            {!inputProps?.disabled &&
              !inputProps?.readOnly &&
              (selectedValue ? (
                <Combobox.Button
                  className="absolute inset-y-0 right-2 flex items-center"
                  onClick={() => setSelectedValue('')}
                >
                  <XMarkIcon
                    className="h-5 w-5 text-gray-400"
                    aria-label="Clear"
                  />
                </Combobox.Button>
              ) : (
                <Combobox.Button className="absolute inset-y-0 right-2 flex items-center">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-gray-400"
                    aria-label="Show options"
                  />
                </Combobox.Button>
              ))}
          </div>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => searchLabel('')}
          >
            <Combobox.Options
              className={classNames(
                'absolute mt-1 max-h-60 w-full overflow-auto rounded-md  py-1 text-base shadow-lg ring-1 ring-opacity-5',
                'bg-white ring-black',
              )}
            >
              {filteredOptions.length === 0 && searchedLabel ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  Nothing found.
                </div>
              ) : (
                filteredOptions.map((option, key) => (
                  <Combobox.Option
                    key={key}
                    className={({ active }) =>
                      classNames(
                        'relative cursor-default select-none py-2 pl-10 pr-4',
                        active ? 'bg-blue-600 text-white' : 'text-gray-900',
                      )
                    }
                    value={option.value}
                  >
                    {({ active }) => (
                      <Fragment>
                        <span
                          className={`block truncate ${
                            selectedValue ? 'font-medium' : 'font-normal'
                          }`}
                        >
                          {option.label}
                        </span>

                        {selectedValue && (
                          <span
                            className={classNames(
                              'absolute inset-y-0 left-0 flex items-center pl-3',
                              active ? 'text-white' : 'text-blue-600',
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        )}
                      </Fragment>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  )
}

export default FloatingLabelCombobox
