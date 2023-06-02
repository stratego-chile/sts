import { checkSession } from '@/lib/session'
import { Users } from '@/models/users'
import { StatusCodes } from 'http-status-codes'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export const GET = async (
  _request: NextRequest,
  {
    params,
  }: {
    params: {
      uuid: Stratego.STS.Utils.UUID
    }
  }
) => {
  const user = await checkSession(cookies())

  if (!user)
    return NextResponse.json(null, { status: StatusCodes.UNAUTHORIZED })

  const userIcon = await Users.getUserIconById(params.uuid)

  if (!userIcon)
    return NextResponse.json(null, { status: StatusCodes.NOT_FOUND })

  return NextResponse.json(userIcon)
}
