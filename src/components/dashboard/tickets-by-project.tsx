import type {
  LinkConfig,
  ProgressBarProps,
  RewriteMode,
} from '@/components/misc/progress-bar'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Suspense } from 'react'

const Paginator = dynamic(() => import('@/components/misc/paginator'))

const ProgressBar = dynamic(() => import('@/components/misc/progress-bar'))

const TicketsDetails = dynamic(
  () => import('@/components/dashboard/tickets-details'),
)

type HandleMode = 'link' | 'click'

type TicketsByProjectProps<
  H extends HandleMode,
  R extends RewriteMode,
> = Extend<
  {
    stats?: Stratego.STS.KPI.Full['ticketsByProject']
    colors?: Record<keyof Stratego.STS.KPI.Tickets, string>
  },
  H extends 'link'
    ? {
        handleConfig: LinkConfig<R>
        onStatClick?: never
      }
    : {
        onStatClick?: (
          projectId: Stratego.STS.Utils.UUID,
          status: keyof Stratego.STS.KPI.Tickets,
        ) => void
        handleConfig?: never
      }
>

const TicketsByProject = <H extends HandleMode, R extends RewriteMode>({
  stats = [],
  colors,
  handleConfig,
  onStatClick,
}: TicketsByProjectProps<H, R>) => {
  return (
    <div className="flex flex-col gap-2 bg-white rounded-xl shadow-md lg:shadow-xl py-3 px-5">
      <span className="flex justify-between text-xl font-bold tracking-tight text-gray-800">
        Tickets by project
      </span>

      <Suspense>
        <Paginator
          wrapperClassName="relative grid gap-4"
          paginationControlPosition="top-right"
          placeholder={
            <div className="inline-flex text-gray-400">
              No active projects found
            </div>
          }
          items={stats
            .sort((first, second) => {
              // Now we sort the projects by the total number of tickets
              // In descending order

              const firstReduction = Object.values(first.tickets).reduce(
                (previous, current) => previous + current,
                0,
              )

              const secondReduction = Object.values(second.tickets).reduce(
                (previous, current) => previous + current,
                0,
              )

              return secondReduction - firstReduction
            })
            .map(({ id, name, tickets }, key) => {
              const totalTickets = Object.values(tickets).reduce(
                (previous, current) => previous + current,
                0,
              )

              const handlingConfig: Pick<
                ProgressBarProps<
                  keyof typeof tickets,
                  typeof tickets,
                  H extends 'link' ? true : false,
                  R
                >,
                Extend<'asLink', 'linkConfig' | 'onStatClick'>
              > = handleConfig
                ? {
                    asLink: true,
                    linkConfig: handleConfig,
                  }
                : {
                    asLink: false,
                    onStatClick: (status: keyof typeof tickets) => {
                      onStatClick?.(id as Stratego.STS.Utils.UUID, status)
                    },
                  }

              return (
                <div key={key} className="flex flex-col gap-[0.4rem]">
                  <span className="text-gray-600 hover:!text-gray-400 transition duration-200 ease-in-out">
                    <Link href={`/my/projects/${id}`}>{name}</Link>
                  </span>

                  <div className="flex items-center">
                    <ProgressBar
                      stats={tickets}
                      colors={colors}
                      customTotal={totalTickets}
                      {...handlingConfig}
                    />

                    <TicketsDetails tickets={tickets} colors={colors} />
                  </div>

                  <small className="flex flex-col lg:flex-row lg:justify-between text-gray-400 text-[10px]">
                    <span className="leading-3 hidden lg:inline-flex">
                      Project ID
                    </span>

                    <span className="leading-3 font-mono whitespace-nowrap select-all">
                      {id}
                    </span>
                  </small>
                </div>
              )
            })}
        />
      </Suspense>
    </div>
  )
}

export default TicketsByProject
