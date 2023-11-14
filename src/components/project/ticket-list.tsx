'use client'

import Loading from '@/app/admin/loading'
import { ProjectStatus, type TProject } from '@/schemas/project'
import { TicketStatus, type TTicket } from '@/schemas/ticket'
import ChevronRightIcon from '@heroicons/react/24/outline/ChevronRightIcon'
import InformationCircleIcon from '@heroicons/react/24/outline/InformationCircleIcon'
import classNames from 'classnames'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Fragment, useMemo } from 'react'

const Paginator = dynamic(() => import('@/components/misc/paginator'))

const IdSelector = dynamic(() => import('@/components/misc/id-selector'))

const StatusListSelect = dynamic(
  () => import('@/components/misc/status-list-select'),
)

const TicketOverviewCard = dynamic(
  () => import('@/components/ticket/overview-card'),
)

type ProjectTicketsListProps = {
  adminMode?: boolean
  fetchingData?: boolean
  project?: TProject
}

const ProjectTicketsList = ({
  adminMode = false,
  fetchingData: isLoading = false,
  project,
}: ProjectTicketsListProps) => {
  const router = useRouter()

  const params = useParams()

  const searchParams = useSearchParams()

  const status = useMemo(() => searchParams.get('status'), [searchParams])

  const tickets = useMemo(
    () =>
      (project?.tickets.filter(({ versions }) =>
        status ? versions.at(-1)?.status === status : true,
      ) as Array<TTicket>) ?? [],
    [project, status],
  )

  return (
    <div>
      {project && (
        <Fragment>
          <header className="bg-white border-b border-b-gray-200">
            <div className="flex flex-col gap-4 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <span className="flex flex-col md:flex-row justify-between gap-y-5">
                <span className="flex flex-col lg:flex-row gap-2 lg:items-center text-3xl font-bold tracking-tight">
                  <Link
                    is="span"
                    href={'/admin/projects'}
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

                <div className="inline-flex gap-2">
                  <StatusListSelect statusType={TicketStatus} />

                  <button className="rounded p-2 bg-gray-900 text-gray-50 text-sm">
                    New ticket
                  </button>
                </div>
              </span>

              <IdSelector label="Project ID" id={project.id} />
            </div>
          </header>

          <main
            className={classNames(
              isLoading ? 'flex flex-col flex-grow' : 'grid w-full',
              'mx-auto max-w-7xl gap-4 px-4 py-6 sm:px-6 lg:px-8',
            )}
          >
            {project.status === ProjectStatus.Closed && (
              <div className="flex flex-wrap items-center gap-2 rounded p-4 bg-yellow-50 ring-1 ring-yellow-400">
                <InformationCircleIcon className="h-8 w-8 text-gray-400" />

                <span>
                  This project is closed. It will not receive updates neither
                  new support tickets.
                </span>
              </div>
            )}

            <Paginator
              wrapperClassName="flex flex-col flex-grow gap-y-5"
              paginationControlPosition="bottom-center"
              paginationClassName="mt-5"
              placeholder={
                <span className="flex flex-col flex-grow justify-items-center justify-center align-middle gap-1">
                  {isLoading ? (
                    <Loading />
                  ) : (
                    <div className="flex flex-wrap items-center gap-2 rounded p-4 bg-blue-50 ring-1 ring-blue-400">
                      <InformationCircleIcon className="h-8 w-8 text-gray-400" />

                      <span>
                        No {status && <strong>{status}</strong>} tickets found
                      </span>
                    </div>
                  )}
                </span>
              }
              items={tickets.map((ticket, key) => (
                <TicketOverviewCard
                  key={key}
                  projectId={params.projectId as Stratego.STS.Utils.UUID}
                  ticket={ticket}
                  onClick={($projectId, ticketId, section) => {
                    router.push(
                      (adminMode
                        ? `/admin/tickets/${$projectId}/${ticketId}`
                        : `/my/tickets/${$projectId}/${ticketId}`
                      ).concat(section ? `#${section}` : ''),
                      {
                        scroll: true,
                      },
                    )
                  }}
                />
              ))}
              itemsPerPage={10}
            />
          </main>
        </Fragment>
      )}
    </div>
  )
}

export default ProjectTicketsList
