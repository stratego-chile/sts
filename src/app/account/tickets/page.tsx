'use client'

import { TicketStatus } from '@stratego-sts/lib/enumerators'
import { fetcher } from '@stratego-sts/lib/fetcher'
import type { TTicket as PureTicketType } from '@stratego-sts/schemas/ticket'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import useSWR from 'swr'

const Paginator = dynamic(
  () => import('@stratego-sts/components/misc/paginator')
)

const StatusListSelect = dynamic(
  () => import('@stratego-sts/components/misc/status-list-select')
)

const NewTicketButton = dynamic(
  () => import('@stratego-sts/components/tickets/new-ticket-button')
)

const TicketOverviewCard = dynamic(
  () => import('@stratego-sts/components/tickets/overview-card')
)

type TicketType = PureTicketType & {
  projectId: Stratego.STS.Utils.UUID
  projectName?: string
}

const ProjectsPage = () => {
  const searchParams = useSearchParams()

  const status = useMemo(() => searchParams.get('status'), [searchParams])

  const { data: rawTickets = [] } = useSWR<Array<TicketType>>(
    '/api/tickets',
    fetcher
  )

  const tickets = useMemo(
    () =>
      rawTickets.filter(({ versions }) =>
        status ? versions.at(-1)?.status === status : true
      ),
    [rawTickets, status]
  )

  return (
    <div>
      <header className="bg-white border-b-[1px] border-b-gray-200">
        <div className="flex flex-col gap-4 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <span className="flex flex-col md:flex-row justify-between gap-y-5">
            <span className="flex flex-col lg:flex-row gap-2 lg:items-center text-3xl font-bold tracking-tight text-gray-900">
              <span>Tickets</span>
            </span>
            <div className="inline-flex gap-4">
              <StatusListSelect statusType={TicketStatus} />

              <NewTicketButton />
            </div>
          </span>
        </div>
      </header>
      <main className="grid mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Paginator
          wrapperClassName="flex flex-col gap-y-5"
          paginationControlPosition="bottom-center"
          paginationClassName="mt-5"
          placeholder={
            <span className="flex justify-center gap-1">
              No {status && <strong>{status}</strong>} projects found
            </span>
          }
          items={tickets.map(({ projectId, projectName, ...ticket }, key) => (
            <TicketOverviewCard
              key={key}
              ticket={ticket}
              projectId={projectId}
              projectName={projectName}
              showProjectName
            />
          ))}
          itemsPerPage={5}
        />
      </main>
    </div>
  )
}

export default ProjectsPage
