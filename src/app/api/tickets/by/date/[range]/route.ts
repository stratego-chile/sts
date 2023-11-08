import { checkAdminSession } from '@/lib/session'
import { Tickets } from '@/models/tickets'
import { StatusCodes } from 'http-status-codes'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

type GetParams = {
  params: {
    range: `${number}` | `${number},${number}`
  }
}

export const GET = async (
  _request: NextRequest,
  { params: { range } }: GetParams,
) => {
  const user = await checkAdminSession(cookies())

  if (!user)
    return NextResponse.json([], {
      status: StatusCodes.UNAUTHORIZED,
    })

  try {
    if (range.includes(',')) {
      const $range = range.split(',')

      const [from, to] = $range.map((_) => parseInt(_))

      const tickets = await Tickets.getAllTicketsByDateRange(from, to)

      return NextResponse.json(tickets ?? [])
    } else {
      return NextResponse.json([], {
        status: StatusCodes.NOT_IMPLEMENTED, // TODO
      })
    }
  } catch {
    return NextResponse.json([], {
      status: StatusCodes.BAD_REQUEST,
    })
  }
}
