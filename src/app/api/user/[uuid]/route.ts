import { AccountRole, AccountStatus } from '@stratego-sts/lib/enumerators'
import { checkSession } from '@stratego-sts/lib/session'
import { Users } from '@stratego-sts/models/users'
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
    return NextResponse.json(undefined, { status: StatusCodes.UNAUTHORIZED })

  const foundUser = await Users.getUserById(params.uuid)

  if (!foundUser)
    return NextResponse.json(undefined, { status: StatusCodes.NOT_FOUND })

  return NextResponse.json(foundUser)
}
