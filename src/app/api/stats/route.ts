import { AccountRole } from '@/lib/enumerators'
import { checkSession } from '@/lib/session'
import { Stats } from '@/models/stats'
import { StatusCodes } from 'http-status-codes'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export const GET = async (request: NextRequest) => {
  const user = await checkSession(cookies())

  if (!user)
    return NextResponse.json(null, { status: StatusCodes.UNAUTHORIZED })

  const config = {
    by: request.nextUrl.searchParams.get('by') as
      | Stratego.STS.KPI.Type
      | 'ticketsByProject'
      | null,
    id: request.nextUrl.searchParams.get('id'),
  }

  const listingMode = request.nextUrl.searchParams.get('list')

  if (
    listingMode === 'all' &&
    ![AccountRole.Admin, AccountRole.Auditor].includes(user.role)
  ) {
    return NextResponse.json(null, { status: StatusCodes.UNAUTHORIZED })
  }

  const stats:
    | Stratego.STS.KPI.Full
    | Omit<Stratego.STS.KPI.Full, 'ticketsByProject'> =
    request.nextUrl.searchParams.get('list') !== 'all'
      ? await Stats.getDashboardStats(user.parentId ? user.parentId : user.id)
      : await Stats.getAdminStats()

  let result: Record<string, any> = stats

  if (config.by === 'project') result = stats.projects

  if (config.by === 'ticket') result = stats.tickets

  if ('ticketsByProject' in stats && config.by === 'ticketsByProject') {
    result = stats.ticketsByProject as Array<Stratego.STS.KPI.TicketsByProject>

    if (config.id) {
      const $result = (stats as Stratego.STS.KPI.Full).ticketsByProject.find(
        ({ id }) => id === config.id
      )

      if ($result) result = $result
      else
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
    }
  }

  return NextResponse.json(result)
}
