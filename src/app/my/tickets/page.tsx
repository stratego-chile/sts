'use client'

import Loading from '@/app/my/loading'
import { fetcher } from '@/lib/fetcher'
import { TicketStatus, type TTicket } from '@/schemas/ticket'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import useSWR from 'swr'
import type { Merge } from 'type-fest'

const Paginator = dynamic(() => import('@/components/misc/paginator'))

const StatusListSelect = dynamic(
  () => import('@/components/misc/status-list-select'),
)

const NewTicketButton = dynamic(
  () => import('@/components/ticket/new-ticket-button'),
)

const TicketOverviewCard = dynamic(
  () => import('@/components/ticket/overview-card'),
)

type Ticket = Merge<
  TTicket,
  {
    projectId: Stratego.STS.Utils.UUID
    projectName?: string
  }
>

const ProjectsPage = () => {
  const router = useRouter()

  const searchParams = useSearchParams()

  const status = useMemo(() => searchParams.get('status'), [searchParams])

  const { data: rawTickets = [], isLoading } = useSWR<Array<Ticket>>(
    '/api/tickets',
    fetcher,
  )

  const tickets = useMemo(
    () =>
      rawTickets.filter(({ versions }) =>
        status ? versions.at(-1)?.status === status : true,
      ),
    [rawTickets, status],
  )

  return (
    <div>
      <header className="bg-white border-b border-b-gray-200">
        <div className="flex flex-col gap-4 mx-auto max-w-7xl p-6 lg:px-8">
          <span className="flex flex-col sm:flex-row justify-between gap-y-5">
            <span className="flex flex-col sm:flex-row gap-2 sm:items-center text-3xl font-bold tracking-tight text-gray-900">
              Tickets
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
            isLoading ? (
              <Loading />
            ) : (
              <span className="flex justify-center gap-1">
                No {status && <strong>{status}</strong>} projects found
              </span>
            )
          }
          items={tickets.map(({ projectId, projectName, ...ticket }, key) => (
            <TicketOverviewCard
              key={key}
              ticket={ticket}
              projectId={projectId}
              projectName={projectName}
              showProjectName
              showTicketId={false}
              onClick={($projectId, ticketId, section) =>
                router.push(
                  `/my/tickets/${$projectId}/${ticketId}`.concat(
                    section ? `#${section}` : '',
                  ),
                  {
                    scroll: true,
                  },
                )
              }
            />
          ))}
          itemsPerPage={5}
        />
      </main>
    </div>
  )
}

export default ProjectsPage
