'use client'

import {
  projectStatusColors,
  ticketStatusColors,
} from '@stratego-sts/lib/colors'
import { fetcher } from '@stratego-sts/lib/fetcher'
import classNames from 'classnames'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'

const NewTicketButton = dynamic(
  () => import('@stratego-sts/components/tickets/new-ticket-button')
)

const StatsCard = dynamic(
  () => import('@stratego-sts/components/dashboard/stats-card')
)

const TicketsByProject = dynamic(
  () => import('@stratego-sts/components/dashboard/tickets-by-project')
)

const DashboardPage = () => {
  const router = useRouter()

  const { data: stats } = useSWR<Stratego.STS.KPI.Full>('/api/stats', fetcher)

  return (
    <div>
      <header className="bg-white border-b-[1px] border-b-gray-200">
        <div className="flex flex-col gap-4 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <span className="flex flex-col md:flex-row justify-between gap-y-5">
            <span className="flex flex-col lg:flex-row lg:items-center">
              <span className="text-3xl font-bold tracking-tight text-gray-900">
                Dashboard
              </span>
            </span>

            <span>
              <NewTicketButton />
            </span>
          </span>
        </div>
      </header>

      <main
        className={classNames(
          'grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3',
          'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6'
        )}
      >
        <StatsCard
          title="Projects"
          stats={stats ? stats.projects : { active: 0, closed: 0 }}
          labels={['active', 'closed']}
          colors={{
            active: projectStatusColors.active,
            closed: projectStatusColors.closed,
          }}
          onStatClick={(status) => {
            router.push(`/account/projects?status=${status}`)
          }}
        />

        <StatsCard
          title="Tickets"
          stats={stats ? stats.tickets : { open: 0, resolved: 0, closed: 0 }}
          labels={['open', 'resolved', 'closed']}
          colors={{
            open: ticketStatusColors.open,
            resolved: ticketStatusColors.resolved,
            closed: ticketStatusColors.closed,
          }}
          onStatClick={(status) => {
            router.push(`/account/tickets?status=${status}`)
          }}
        />

        <TicketsByProject
          stats={
            stats
              ? stats.ticketsByProject.flatMap((project) =>
                  new Array(1).fill(project)
                )
              : []
          }
          colors={{
            open: ticketStatusColors.open,
            resolved: ticketStatusColors.resolved,
            closed: ticketStatusColors.closed,
          }}
          onStatClick={(projectId, status) => {
            router.push(`/account/projects/${projectId}?status=${status}`)
          }}
        />
      </main>
    </div>
  )
}

export default DashboardPage
