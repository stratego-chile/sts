'use client'

import Spinner from '@/components/misc/spinner'
import {
  projectStatusColors,
  ticketStatusColors,
} from '@/helpers/default-colors'
import { fetcher } from '@/lib/fetcher'
import { ProjectStatus } from '@/schemas/project'
import { TicketStatus } from '@/schemas/ticket'
import { Menu, Transition } from '@headlessui/react'
import ChevronDownIcon from '@heroicons/react/20/solid/ChevronDownIcon'
import classNames from 'classnames'
import secondsToMilliseconds from 'date-fns/secondsToMilliseconds'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Fragment, Suspense, useMemo, useState } from 'react'
import useDefault from 'react-use/lib/useDefault'
import useSWR from 'swr'

const StatsCard = dynamic(() => import('@/components/dashboard/stats-card'))

const NewTickets = dynamic(() => import('@/components/dashboard/new-tickets'))

const NewProjectModal = dynamic(
  () => import('@/components/project/creation-modal'),
)

const NewTicketModal = dynamic(
  () => import('@/components/ticket/creation-modal'),
)

const AdminConsolePage = () => {
  const includeProjectStatuses = Object.freeze([
    ProjectStatus.Active,
    ProjectStatus.Closed,
  ])

  const includeTicketStatuses = Object.freeze([
    TicketStatus.Open,
    TicketStatus.Resolved,
    TicketStatus.Closed,
  ])

  const router = useRouter()

  const [creationRequest, setCreationRequest] = useState<'project' | 'ticket'>()

  const [projectStatsPath, setProjectStatsPath] = useDefault(
    ...(new Array(2).fill('/api/stats?list=all&by=project') as [
      string,
      string,
    ]),
  )

  const [ticketStatsPath, setTicketStatsPath] = useDefault(
    ...(new Array(2).fill('/api/stats?list=all&by=ticket') as [string, string]),
  )

  const { data: projectsStats, isLoading: fetchingProjectsStats } =
    useSWR<Stratego.STS.KPI.Projects>(projectStatsPath, fetcher, {
      refreshInterval: secondsToMilliseconds(30),
    })

  const { data: ticketsStats, isLoading: fetchingTicketsStats } =
    useSWR<Stratego.STS.KPI.Tickets>(ticketStatsPath, fetcher, {
      refreshInterval: secondsToMilliseconds(30),
    })

  const fetchingData = useMemo(
    () => [fetchingProjectsStats, fetchingTicketsStats].some(Boolean),
    [fetchingProjectsStats, fetchingTicketsStats],
  )

  return (
    <div>
      <header className="bg-white border-b border-b-gray-200">
        <div className="flex flex-col gap-4 mx-auto max-w-7xl p-6 lg:px-8">
          <span className="flex flex-col sm:flex-row justify-between gap-y-5">
            <span className="flex flex-col sm:flex-row gap-4 items-start md:items-center text-3xl font-bold tracking-tight text-gray-900">
              <span>Platform Console & Stats</span>

              {fetchingData && (
                <span className="inline-flex text-gray-400">
                  <Spinner size={1.2} sizeUnit="rem" />
                </span>
              )}
            </span>

            <span className="inline-flex gap-2">
              <Menu as="div" className="relative inline-block text-left">
                {({ open, close: closeOptionsPopover }) => (
                  <Fragment>
                    <Menu.Button
                      className={classNames(
                        'group inline-flex items-center rounded bg-gray-900 p-2 gap-1 text-sm text-white hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75',
                      )}
                    >
                      <span>Create</span>

                      <ChevronDownIcon
                        className={classNames(
                          'h-4 w-4 transition-transform',
                          open && 'transform rotate-180',
                        )}
                      />
                    </Menu.Button>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <Menu.Items
                        className={classNames(
                          'absolute z-10 right-0 mt-2 origin-top-right shadow border rounded',
                          'bg-white border-gray-200',
                        )}
                      >
                        <div className="flex flex-col p-1 gap-1">
                          {[
                            {
                              text: 'Project',
                              action: () => setCreationRequest('project'),
                            },
                            {
                              text: 'Ticket',
                              action: () => setCreationRequest('ticket'),
                            },
                          ].map(({ action, text }, key) => (
                            <Menu.Item key={key}>
                              <button
                                role="link"
                                onClick={() => {
                                  action()

                                  closeOptionsPopover()
                                }}
                                className="text-start text-base whitespace-nowrap hover:bg-gray-200 px-2 py-1 rounded"
                              >
                                {text}
                              </button>
                            </Menu.Item>
                          ))}
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Fragment>
                )}
              </Menu>
            </span>
          </span>
        </div>
      </header>

      <main
        className={classNames(
          'grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
          'mx-auto max-w-7xl px-4 py-6 lg:px-8',
        )}
      >
        <Suspense>
          <StatsCard
            title="Projects"
            stats={includeProjectStatuses.reduce(
              (schema, key) => {
                schema[key] = projectsStats?.[key] ?? 0
                return schema
              },
              {} as Record<ProjectStatus, number>,
            )}
            labels={includeProjectStatuses}
            colors={includeProjectStatuses.reduce(
              (schema, key) => {
                schema[key] = projectStatusColors[key]
                return schema
              },
              {} as Record<string, string>,
            )}
            onFilterByDate={(from, to) => {
              setProjectStatsPath(
                `/api/stats?list=all&by=project&projectDate=${from},${to}`,
              )
            }}
            onFilterReset={() => {
              setProjectStatsPath('/api/stats?list=all&by=project')
            }}
            onStatClick={(status) => {
              router.push(
                status ? `/admin/projects?status=${status}` : '/admin/projects',
              )
            }}
          />
        </Suspense>

        <Suspense>
          <StatsCard
            title="Tickets"
            stats={includeTicketStatuses.reduce(
              (schema, key) => {
                schema[key] = ticketsStats?.[key] ?? 0
                return schema
              },
              {} as Record<TicketStatus, number>,
            )}
            labels={includeTicketStatuses}
            colors={includeTicketStatuses.reduce(
              (schema, key) => {
                schema[key] = ticketStatusColors[key]
                return schema
              },
              {} as Record<string, string>,
            )}
            onFilterByDate={(from, to) => {
              setTicketStatsPath(
                `/api/stats?list=all&by=ticket&ticketDate=${from},${to}`,
              )
            }}
            onFilterReset={() => {
              setTicketStatsPath('/api/stats?list=all&by=ticket')
            }}
            onStatClick={(status) => {
              router.push(
                status ? `/admin/tickets?status=${status}` : '/admin/tickets',
              )
            }}
          />
        </Suspense>

        <Suspense>
          <NewTickets
            onClick={($projectId, ticketId) =>
              router.push(`/admin/tickets/${$projectId}/${ticketId}#comments`)
            }
          />
        </Suspense>
      </main>

      {creationRequest && (
        <Fragment>
          <Suspense>
            <NewProjectModal
              open={creationRequest === 'project'}
              onClose={() => setCreationRequest(undefined)}
            />
          </Suspense>

          <Suspense>
            <NewTicketModal
              open={creationRequest === 'ticket'}
              onClose={() => setCreationRequest(undefined)}
            />
          </Suspense>
        </Fragment>
      )}
    </div>
  )
}

export default AdminConsolePage
