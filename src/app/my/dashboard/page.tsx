'use client'

import Spinner from '@/components/misc/spinner'
import {
  projectStatusColors,
  ticketStatusColors,
} from '@/helpers/default-colors'
import { fetcher } from '@/lib/fetcher'
import { ProjectStatus } from '@/schemas/project'
import { TicketStatus } from '@/schemas/ticket'
import classNames from 'classnames'
import secondsToMilliseconds from 'date-fns/secondsToMilliseconds'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import useDefault from 'react-use/lib/useDefault'
import useSWR from 'swr'

const NewTicketButton = dynamic(
  () => import('@/components/ticket/new-ticket-button'),
)

const StatsCard = dynamic(() => import('@/components/dashboard/stats-card'))

const TicketsByProject = dynamic(
  () => import('@/components/dashboard/tickets-by-project'),
)

const DashboardPage = () => {
  const includeProjectStatuses = [ProjectStatus.Active, ProjectStatus.Closed]

  const includeTicketStatuses = Object.freeze([
    TicketStatus.Open,
    TicketStatus.Resolved,
    TicketStatus.Closed,
  ])

  const router = useRouter()

  const [projectStatsPath, setProjectStatsPath] = useDefault(
    ...(new Array(2).fill('/api/stats?by=project') as [string, string]),
  )

  const [ticketStatsPath, setTicketStatsPath] = useDefault(
    ...(new Array(2).fill('/api/stats?by=ticket') as [string, string]),
  )

  const { data: projectsStats, isLoading: fetchingProjectsStats } =
    useSWR<Stratego.STS.KPI.Projects>(projectStatsPath, fetcher, {
      refreshInterval: secondsToMilliseconds(15),
    })

  const { data: ticketsStats, isLoading: fetchingTicketsStats } =
    useSWR<Stratego.STS.KPI.Tickets>(ticketStatsPath, fetcher, {
      refreshInterval: secondsToMilliseconds(15),
    })

  const { data: ticketsByProjectStats, isLoading: fetchingTicketByProjects } =
    useSWR<Array<Stratego.STS.KPI.TicketsByProject>>(
      '/api/stats?by=ticketsByProject',
      fetcher,
      {
        refreshInterval: secondsToMilliseconds(15),
      },
    )

  return (
    <div>
      <header className="bg-white border-b border-b-gray-200">
        <div className="flex flex-col gap-4 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <span className="flex flex-col md:flex-row justify-between gap-y-5">
            <span className="flex flex-row gap-4 items-center">
              <span className="text-3xl font-bold tracking-tight text-gray-900">
                Dashboard
              </span>

              {[
                fetchingProjectsStats,
                fetchingTicketsStats,
                fetchingTicketByProjects,
              ].some(Boolean) && (
                <span className="text-gray-400">
                  <Spinner size={1.2} sizeUnit="rem" />
                </span>
              )}
            </span>

            <span>
              <NewTicketButton />
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
              `/api/stats?by=project&projectDate=${from},${to}`,
            )
          }}
          onFilterReset={() => {
            setProjectStatsPath('/api/stats?by=project')
          }}
          onStatClick={(status) => {
            router.push(
              status ? `/my/projects?status=${status}` : '/my/projects',
            )
          }}
        />

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
            setTicketStatsPath(`/api/stats?by=ticket&ticketDate=${from},${to}`)
          }}
          onFilterReset={() => {
            setTicketStatsPath('/api/stats?by=ticket')
          }}
          onStatClick={(status) => {
            router.push(status ? `/my/tickets?status=${status}` : '/my/tickets')
          }}
        />

        <TicketsByProject
          stats={ticketsByProjectStats ? ticketsByProjectStats : []}
          colors={Object.values(TicketStatus).reduce(
            (schema, key) => {
              schema[key] = ticketStatusColors[key]
              return schema
            },
            {} as Record<TicketStatus, string>,
          )}
          onStatClick={(projectId, status) => {
            router.push(`/my/projects/${projectId}/tickets?status=${status}`)
          }}
        />
      </main>
    </div>
  )
}

export default DashboardPage
