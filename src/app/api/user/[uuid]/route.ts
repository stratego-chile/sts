import { AccountRole, AccountStatus } from '@/lib/enumerators'
import { checkSession } from '@/lib/session'
import { Users } from '@/models/users'
import { StatusCodes } from 'http-status-codes'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const GET = async (
  _request: Request,
  {
    params,
  }: {
    params: { uuid: Stratego.STS.Utils.UUID }
  }
) => {
  const user = await checkSession(cookies())

  if (
    !user ||
    params.uuid !== user.id ||
    ![AccountRole.Admin, AccountRole.Auditor].includes(
      user.role as AccountRole
    ) ||
    ![AccountStatus.Inactive].includes(user.status as AccountStatus)
  )
    return NextResponse.json(null, { status: StatusCodes.UNAUTHORIZED })

  const foundUser = await Users.getUserById(params.uuid)

  if (!foundUser)
    return NextResponse.json(null, { status: StatusCodes.NOT_FOUND })

  return NextResponse.json(foundUser)
}
