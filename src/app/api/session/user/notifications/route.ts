import { checkSession } from '@/lib/session'
import { Events } from '@/models/events'
import { type TEvent } from '@/schemas/event'
import { StatusCodes } from 'http-status-codes'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export const GET = async () => {
  const response = {
    notifications: [] as Array<TEvent>,
  }

  const user = await checkSession(cookies())

  if (!user)
    return NextResponse.json(response, {
      status: StatusCodes.UNAUTHORIZED,
    })

  const notifications = await Events.getUnreadByUserId(user.id)

  response.notifications = notifications

  return NextResponse.json(response)
}

export const POST = async (request: NextRequest) => {
  const response = {
    success: false,
  }

  const user = await checkSession(cookies())

  if (!user)
    return NextResponse.json(response, {
      status: StatusCodes.UNAUTHORIZED,
    })

  const { refs = [] }: { refs?: Array<Stratego.STS.Utils.UUID> } =
    await request.json()

  if (refs.length > 0) {
    let [updateCount, success] = await Events.setAsRead(user.id, ...refs)

    if (updateCount !== refs.length) success = false

    response.success = success
  } else response.success = true

  return NextResponse.json(response)
}
