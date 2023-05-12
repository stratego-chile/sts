import { checkSession } from '@stratego-sts/lib/session'
import { Stats } from '@stratego-sts/models/stats'
import { StatusCodes } from 'http-status-codes'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export const GET = async (request: NextRequest) => {
  const user = await checkSession(cookies())

  if (!user)
    return NextResponse.json(undefined, { status: StatusCodes.UNAUTHORIZED })

  const config = {
    by: request.nextUrl.searchParams.get('by') as
      | Stratego.STS.KPI.Type
      | 'ticketsByProject'
      | null,
    id: request.nextUrl.searchParams.get('id'),
  }

  const stats = await Stats.getDashboardStats(user.id)

  let result: Record<string, any> = stats

  if (config.by === 'project') {
    result = stats.projects
  }

  if (config.by === 'ticket') {
    result = stats.tickets
  }

  if (config.by === 'ticketsByProject') {
    result = stats.ticketsByProject
    if (config.id) {
      const $result = stats.ticketsByProject.find(({ id }) => id === config.id)
      if ($result) {
        result = $result
      } else {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }
    }
  }

  return NextResponse.json(result)
}
