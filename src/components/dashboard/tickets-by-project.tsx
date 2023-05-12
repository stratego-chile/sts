import type {
  LinkConfig,
  ProgressBarProps,
  RewriteMode,
} from '@stratego-sts/components/misc/progress-bar'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const Paginator = dynamic(
  () => import('@stratego-sts/components/misc/paginator')
)

const ProgressBar = dynamic(
  () => import('@stratego-sts/components/misc/progress-bar')
)

const TicketsDetails = dynamic(
  () => import('@stratego-sts/components/dashboard/tickets-details')
)

type HandleMode = 'link' | 'click'

type TicketsByProjectProps<H extends HandleMode, R extends RewriteMode> = {
  stats?: Stratego.STS.KPI.Full['ticketsByProject']
  colors?: Record<keyof Stratego.STS.KPI.Tickets, string>
} & (H extends 'link'
  ? {
      handleConfig: LinkConfig<R>
      onStatClick?: never
    }
  : {
      onStatClick?: (
        projectId: Stratego.STS.Utils.UUID,
        status: keyof Stratego.STS.KPI.Tickets
      ) => void
      handleConfig?: never
    })

const TicketsByProject = <H extends HandleMode, R extends RewriteMode>({
  stats = [],
  colors,
  handleConfig,
  onStatClick,
}: TicketsByProjectProps<H, R>) => {
  return (
    <div className="flex flex-col gap-2 bg-white rounded-xl shadow-md lg:shadow-xl py-3 px-6">
      <h2 className="flex justify-between text-xl font-bold tracking-tight text-gray-800">
        <span>Tickets by project</span>
      </h2>
      <Paginator
        wrapperClassName="relative grid gap-4"
        paginationControlPosition="top-right"
        items={stats.map(({ id, name, tickets }, key) => {
          const totalTickets = Object.values(tickets).reduce(
            (previous, current) => previous + current,
            0
          )

          const handlingConfig: Pick<
            ProgressBarProps<
              keyof typeof tickets,
              typeof tickets,
              H extends 'link' ? true : false,
              R
            >,
            'asLink' & ('linkConfig' | 'onStatClick')
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
                <Link href={`/account/projects/${id}`}>{name}</Link>
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
    </div>
  )
}

export default TicketsByProject
