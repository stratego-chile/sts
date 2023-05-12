'use client'

import { ChevronRightIcon } from '@heroicons/react/24/outline'
import Spinner from '@stratego-sts/components/misc/spinner'
import { ProjectStatus, TicketStatus } from '@stratego-sts/lib/enumerators'
import { fetcher } from '@stratego-sts/lib/fetcher'
import type { TProject } from '@stratego-sts/schemas/project'
import type { TTicket } from '@stratego-sts/schemas/ticket'
import classNames from 'classnames'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import useSWR from 'swr'

const NewTicketButton = dynamic(
  () => import('@stratego-sts/components/tickets/new-ticket-button')
)

const Paginator = dynamic(
  () => import('@stratego-sts/components/misc/paginator')
)

const IdSelector = dynamic(
  () => import('@stratego-sts/components/misc/id-selector')
)

const StatusListSelect = dynamic(
  () => import('@stratego-sts/components/misc/status-list-select')
)

const TicketOverviewCard = dynamic(
  () => import('@stratego-sts/components/tickets/overview-card')
)

const ProjectPage = () => {
  const params = useParams()

  const searchParams = useSearchParams()

  const status = useMemo(() => searchParams.get('status'), [searchParams])

  const { data: project, isLoading: isFetchingProject } = useSWR<TProject>(
    `/api/projects/${params.projectId}`,
    fetcher
  )

  const tickets = useMemo(
    () =>
      (project?.tickets ?? []).filter(({ versions }) =>
        status ? versions.at(-1)?.status === status : true
      ) as Array<TTicket>,
    [project, status]
  )

  return (
    <div>
      {project && (
        <>
          <header className="bg-white border-b-[1px] border-b-gray-200">
            <div className="flex flex-col gap-4 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <span className="flex flex-col md:flex-row justify-between gap-y-5">
                <span className="flex flex-col lg:flex-row gap-2 lg:items-center text-3xl font-bold tracking-tight">
                  <Link
                    is="span"
                    href={'/account/projects'}
                    className="text-gray-900 hover:text-blue-600 transition duration-200 ease-in-out"
                  >
                    Projects
                  </Link>

                  <ChevronRightIcon
                    className="h-5 w-5 text-gray-400 hidden lg:inline-block"
                    aria-hidden="true"
                  />

                  <span className="text-gray-900">{project.name}</span>
                </span>

                <div className="inline-flex gap-4">
                  <StatusListSelect statusType={TicketStatus} />

                  {project?.status !== ProjectStatus.Closed && (
                    <NewTicketButton />
                  )}
                </div>
              </span>

              <IdSelector label="Project ID" id={project.id} />
            </div>
          </header>

          <main
            className={classNames(
              isFetchingProject ? 'flex flex-col flex-grow' : 'grid w-full',
              'mx-auto max-w-7xl gap-4 px-4 py-6 sm:px-6 lg:px-8'
            )}
          >
            {project?.status === ProjectStatus.Closed && (
              <div className="flex rounded p-4 bg-yellow-50 ring-1 ring-yellow-400">
                This project is closed. It will not receive updates neither new
                support tickets.
              </div>
            )}

            <Paginator
              wrapperClassName="flex flex-col flex-grow gap-y-5"
              paginationControlPosition="bottom-center"
              paginationClassName="mt-5"
              placeholder={
                <span className="flex flex-col flex-grow justify-items-center justify-center align-middle gap-1">
                  {isFetchingProject ? (
                    <Spinner />
                  ) : (
                    <span>
                      No {status && <strong>{status}</strong>} tickets found
                    </span>
                  )}
                </span>
              }
              items={tickets.map((ticket, key) => (
                <TicketOverviewCard
                  key={key}
                  projectId={params.projectId as Stratego.STS.Utils.UUID}
                  ticket={ticket}
                />
              ))}
              itemsPerPage={10}
            />
          </main>
        </>
      )}
    </div>
  )
}

export default ProjectPage
