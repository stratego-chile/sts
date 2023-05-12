'use client'

import capitalize from '@stdlib/string/capitalize'
import type { ProjectStatus, TicketStatus } from '@stratego-sts/lib/enumerators'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

type StatusType = typeof ProjectStatus | typeof TicketStatus

type StatusListSelectProps<T extends StatusType> = {
  statusType: T
}

const StatusListSelect = <T extends StatusType>({
  statusType,
}: StatusListSelectProps<T>) => {
  const router = useRouter()

  const searchParams = useSearchParams()

  const status = useMemo(() => searchParams.get('status'), [searchParams])

  return (
    <select
      className="inline-flex h-auto border-0 ring-1 ring-gray-200 rounded cursor-pointer"
      onChange={(event) => {
        const url = new URL(location.href)

        if (event.target.value)
          url.searchParams.set('status', event.target.value)
        else url.searchParams.delete('status')

        router.replace(url.toString(), {
          forceOptimisticNavigation: true,
        })
      }}
      defaultValue={status ?? undefined}
    >
      <option value="">All</option>

      {Object.values(statusType).map(($statusType, key) => (
        <option key={key} value={$statusType as string}>
          {capitalize($statusType as string)}
        </option>
      ))}
    </select>
  )
}

export default StatusListSelect
