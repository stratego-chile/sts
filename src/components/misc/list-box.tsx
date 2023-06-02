'use client'

import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline'
import classNames from 'classnames'
import { Fragment, useMemo } from 'react'

type ListBoxOption<Value extends Primitive> = {
  label?: React.ReactNode
  value: Value
}

type ListBoxProps<PossibleValue extends Primitive> = {
  value?: PossibleValue
  options: Array<ListBoxOption<PossibleValue>>
  onChange?: (option: PossibleValue) => void
}

const ListBox = <T extends Primitive>({
  value: selectedOption,
  options,
  onChange,
}: ListBoxProps<T>) => {
  const currentOption = useMemo(
    () => options.find((option) => option.value === selectedOption),
    [options, selectedOption]
  )

  return (
    <Listbox
      value={currentOption?.value}
      onChange={
        (option) => option && onChange?.(option)
        // setSelectedOption(options.find(($option) => $option.value === option))
      }
    >
      <div className="relative inline-flex">
        <Listbox.Button
          className={classNames(
            'relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left sm:text-sm',
            'hover:bg-gray-200 hover:bg-opacity-60 transition-colors duration-200 ease-in-out'
          )}
        >
          <span className="block truncate">
            {currentOption?.label ?? String(currentOption?.value)}
          </span>

          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute mt-1 z-30 max-h-60 w-auto overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {options.map((option, optionIndex) => (
              <Listbox.Option
                key={optionIndex}
                className={({ active, selected }) =>
                  classNames(
                    'relative cursor-default select-none p-2',
                    active ? 'bg-blue-100 text-blue-900' : 'text-gray-900',
                    selected && 'bg-blue-600 text-white'
                  )
                }
                value={option.value}
              >
                {({ selected }) => (
                  <span className="flex justify-start items-center gap-2 mr-4">
                    {selected && (
                      <span className="flex items-center p-0.5 rounded-full text-white bg-blue-400">
                        <CheckIcon className="h-4 w-4" aria-hidden="true" />
                      </span>
                    )}

                    <span
                      className={classNames(
                        'block truncate',
                        !selected && 'pl-7'
                      )}
                    >
                      {option.label ?? String(option.value)}
                    </span>
                  </span>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}

export default ListBox
