import { getPageTitle } from '@/lib/format'
import { Tickets } from '@/models/tickets'
import type { Metadata } from 'next'
import { Fragment } from 'react'

const getTicketDetails = async (ticketId: Stratego.STS.Utils.UUID) => {
  const { projectName, versions } = (await Tickets.getTicket(ticketId)) ?? {}

  const ticketName = versions?.at(-1)?.title

  return { projectName, ticketName }
}

export const generateMetadata = async ({
  params,
}: {
  params: {
    projectId: Stratego.STS.Utils.UUID
    ticketId: Stratego.STS.Utils.UUID
  }
}): Promise<Metadata> => {
  const details = await getTicketDetails(params.ticketId)

  return {
    title: getPageTitle(
      `Project "${details.projectName ?? params.projectId}"`,
      `Ticket "${details.ticketName ?? params.ticketId}"`,
    ),
  }
}

const TicketLayout = async ({
  children,
}: React.PropsWithChildren<WithoutProps>) => {
  return <Fragment>{children}</Fragment>
}

export default TicketLayout
