import { maintainerRoles } from '@/helpers/roles'
import { StatFilter } from '@/lib/enumerators'
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
    by: request.nextUrl.searchParams.get(
      'by',
    ) as Nullable<Stratego.STS.KPI.Type>,

    id: request.nextUrl.searchParams.get('id'),

    listingMode: request.nextUrl.searchParams.get('list'),

    // Filters
    projectDate: request.nextUrl.searchParams.get(
      StatFilter.ProjectDate,
    ) as Nullable<`${number},${number}`>, // Timestamp

    ticketDate: request.nextUrl.searchParams.get(
      StatFilter.TicketDate,
    ) as Nullable<`${number},${number}`>, // Timestamp
  }

  const isAdmin = maintainerRoles.includes(user.role)

  if (config.listingMode === 'all' && !isAdmin)
    return NextResponse.json(null, { status: StatusCodes.UNAUTHORIZED })

  const filters: Stratego.STS.KPI.Filters = {}

  if (config.projectDate && config.projectDate.split(',').length >= 2) {
    const [from, to] = config.projectDate.split(',').map(Number)

    filters[StatFilter.ProjectDate] = [from, to]
  }

  if (config.ticketDate && config.ticketDate.split(',').length >= 2) {
    const [from, to] = config.ticketDate.split(',').map(Number)

    filters[StatFilter.TicketDate] = [from, to]
  }

  const stats: StrictOmittedRequired<
    Stratego.STS.KPI.Full,
    'ticketsByProject'
  > =
    config.listingMode === 'all'
      ? await Stats.getAdminStats(filters)
      : await Stats.getDashboardStats(
          user.parentId ? user.parentId : user.id,
          filters,
        )

  let result: Record<string, any> = stats

  if (config.by === 'project') result = stats.projects

  if (config.by === 'ticket') result = stats.tickets

  if ('ticketsByProject' in stats && config.by === 'ticketsByProject') {
    result = stats.ticketsByProject as Array<Stratego.STS.KPI.TicketsByProject>

    if (config.id) {
      const $result = (stats as Stratego.STS.KPI.Full).ticketsByProject.find(
        ({ id }) => id === config.id,
      )

      if ($result) result = $result
      else
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 },
        )
    }
  }

  return NextResponse.json(result)
}
