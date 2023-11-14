'use client'

import ClipboardDocumentIcon from '@heroicons/react/24/outline/ClipboardDocumentIcon'
import classNames from 'classnames'

type IdSelectorProps = {
  label?: string
  id: string
  className?: string
  showButton?: boolean
  labelTerminationChar?: string
}

const IdSelector = ({
  label,
  id,
  className,
  showButton = true,
  labelTerminationChar = ':',
}: IdSelectorProps) => {
  return (
    <span className="flex flex-row flex-wrap lg:items-center gap-2 text-sm font-bold text-gray-500">
      {label && (
        <span>
          {label}
          {labelTerminationChar && labelTerminationChar}
        </span>
      )}

      <span
        className={classNames(
          'inline-flex py-1 w-fit lg:w-auto overflow-hidden rounded',
          'divide-x divide-gray-300 bg-gray-200 text-gray-500',
        )}
      >
        <span
          className={classNames(
            'inline-flex px-2 select-all text-xs items-center',
            className,
          )}
        >
          {id}
        </span>

        {showButton && (
          <button
            className={classNames(
              'inline-flex px-1.5 -my-1 items-center',
              'hover:bg-gray-600 hover:text-gray-50',
              'transition duration-200 ease-in-out',
            )}
            role="button"
            type="button"
            onClick={() => navigator?.clipboard?.writeText?.(id)}
          >
            <ClipboardDocumentIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </span>
    </span>
  )
}

export default IdSelector
