import { maintainerRoles } from '@/helpers/roles'
import { checkSession } from '@/lib/session'
import { Tickets } from '@/models/tickets'
import { StatusCodes } from 'http-status-codes'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export const GET = async (
  request: NextRequest,
  {
    params,
  }: {
    params: { ticketId: Stratego.STS.Utils.UUID }
  },
) => {
  const user = await checkSession(cookies())

  if (!user)
    return NextResponse.json(null, { status: StatusCodes.UNAUTHORIZED })

  let searchForAllTickets = false

  if (
    request.nextUrl.searchParams.get('mode') === 'admin' &&
    maintainerRoles.includes(user.role)
  )
    searchForAllTickets = true

  let ticket: PossiblyDefined<
    | Awaited<ReturnType<(typeof Tickets)['getTicket']>>
    | Awaited<ReturnType<(typeof Tickets)['getOwnedTicket']>>
  >

  if (searchForAllTickets) {
    ticket = await Tickets.getTicket(params.ticketId)
  } else {
    ticket = await Tickets.getOwnedTicket(user.id, params.ticketId)
  }

  if (!ticket) return NextResponse.json(null, { status: StatusCodes.NOT_FOUND })

  return NextResponse.json(ticket ?? null)
}
