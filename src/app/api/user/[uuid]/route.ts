import { maintainerRoles } from '@/helpers/roles'
import { checkSession } from '@/lib/session'
import { Users } from '@/models/users'
import { AccountStatus } from '@/schemas/user'
import { StatusCodes } from 'http-status-codes'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const GET = async (
  _request: Request,
  {
    params,
  }: {
    params: { uuid: Stratego.STS.Utils.UUID }
  },
) => {
  const user = await checkSession(cookies())

  if (
    !user ||
    (params.uuid !== user.id && !maintainerRoles.includes(user.role)) ||
    [AccountStatus.Inactive].includes(user.status)
  )
    return NextResponse.json(null, { status: StatusCodes.UNAUTHORIZED })

  const foundUser = await Users.getUserById(params.uuid)

  if (!foundUser)
    return NextResponse.json(null, { status: StatusCodes.NOT_FOUND })

  return NextResponse.json(foundUser)
}
