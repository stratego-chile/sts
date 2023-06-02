'use client'

import Loading from '@/app/admin/loading'
import { getMonoContrast, ticketStatusColors } from '@/lib/colors'
import { fetcher } from '@/lib/fetcher'
import { TProject } from '@/schemas/project'
import type { TTicket } from '@/schemas/ticket'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Fragment, Suspense, useMemo } from 'react'
import useSWR from 'swr'

const IdSelector = dynamic(() => import('@/components/misc/id-selector'))

const TicketDetails = dynamic(() => import('@/components/tickets/details'))

const TicketDetailsPage = () => {
  const params = useParams()

  const { data: project } = useSWR<TProject>(
    `/api/projects/${params.projectId}`,
    fetcher
  )

  const { data: ticket } = useSWR<TTicket>(
    `/api/tickets/${params.ticketId}`,
    fetcher
  )

  const lastVersion = useMemo(() => ticket?.versions.at(-1), [ticket])

  return (
    <div>
      {project && ticket && lastVersion && (
        <>
          <header className="lg:sticky lg:top-0 !z-[5] bg-white border-b border-b-gray-200">
            <div className="flex flex-col gap-4 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <span className="flex flex-col md:flex-row justify-between gap-y-5">
                <span className="flex flex-col lg:flex-row gap-2 lg:items-center text-3xl font-bold tracking-tight">
                  {Array.of(
                    <Link
                      is="span"
                      href={'/admin/projects'}
                      className="hidden lg:inline-flex text-gray-900 hover:text-blue-600 transition duration-200 ease-in-out"
                    >
                      Projects
                    </Link>,
                    <Link
                      is="span"
                      href={`/admin/projects/${params.projectId}/tickets`}
                      className="text-gray-900 hover:text-blue-600 transition duration-200 ease-in-out"
                    >
                      {project?.name}
                    </Link>,
                    <Link
                      is="span"
                      href={`/admin/projects/${params.projectId}/tickets`}
                      className="hidden lg:inline-flex text-gray-900 hover:text-blue-600 transition duration-200 ease-in-out"
                    >
                      Tickets
                    </Link>,
                    <span key="3" className="text-gray-900">
                      {lastVersion.title}
                    </span>
                  )
                    .flatMap((fragment, key, fragments) =>
                      Array.of(
                        fragment,
                        key < fragments.length - 1 ? (
                          <ChevronRightIcon
                            className="h-5 w-5 text-gray-400 hidden lg:inline-block"
                            aria-hidden="true"
                          />
                        ) : null
                      )
                    )
                    .map((fragment, key) => (
                      <Fragment key={key}>{fragment}</Fragment>
                    ))}
                </span>

                <span className="inline-flex gap-x-2 text-sm">
                  <span
                    className="p-2 rounded capitalize"
                    style={{
                      backgroundColor: ticketStatusColors[lastVersion.status],
                      color: getMonoContrast(
                        ticketStatusColors[lastVersion.status]
                      ),
                    }}
                  >
                    Status: {lastVersion.status}
                  </span>
                </span>
              </span>

              {ticket && <IdSelector label="Ticket ID" id={ticket.id} />}
            </div>
          </header>

          <Suspense fallback={<Loading />}>
            <TicketDetails
              owner={project.ownerId}
              ticket={ticket}
              lastVersion={lastVersion}
            />
          </Suspense>
        </>
      )}
    </div>
  )
}

export default TicketDetailsPage
