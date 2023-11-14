'use client'

import capitalize from '@stdlib/string/capitalize'
import classNames from 'classnames'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

type StatusType = Record<string, string>

type StatusListSelectProps<T extends StatusType> = {
  className?: string
  pathLabel?: string
  statusType: T
  showControlLabel?: boolean
  customControlLabel?: string
}

const StatusListSelect = <T extends StatusType>({
  className,
  pathLabel = 'status',
  statusType,
  showControlLabel,
  customControlLabel,
}: StatusListSelectProps<T>) => {
  const router = useRouter()

  const searchParams = useSearchParams()

  const status = useMemo(
    () => searchParams.get(pathLabel),
    [pathLabel, searchParams],
  )

  return (
    <div className={classNames('relative', className)}>
      <select
        className={classNames(
          'text-sm',
          showControlLabel
            ? 'block w-full text-gray-900 bg-transparent rounded border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer'
            : 'inline-flex h-auto border-0 ring-1 ring-gray-200 rounded cursor-pointer',
        )}
        onChange={(event) => {
          const url = new URL(location.href)

          if (event.target.value)
            url.searchParams.set(pathLabel, event.target.value)
          else url.searchParams.delete(pathLabel)

          router.replace(url.toString(), {
            scroll: false,
          })
        }}
        defaultValue={status ?? undefined}
      >
        <option value="">All</option>

        {Object.values(statusType).map(($statusType, key) => (
          <option key={key} value={$statusType}>
            {capitalize($statusType.replace(/([A-Z])/g, ' $1').toLowerCase())}
          </option>
        ))}
      </select>

      {showControlLabel && (
        <label
          className={classNames(
            'absolute text-sm text-gray-500 bg-white top-1 z-10 origin-[0] px-2',
            'duration-300 transform -translate-y-4 scale-75',
            'peer-focus:px-2 peer-focus:text-blue-600 peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 left-1',
            'peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2',
          )}
        >
          {capitalize(
            customControlLabel ??
              pathLabel.replace(/([A-Z])/g, ' $1').toLowerCase(),
          )}
        </label>
      )}
    </div>
  )
}

export default StatusListSelect
