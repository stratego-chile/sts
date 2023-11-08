import { maintainerRoles } from '@/helpers/roles'
import { checkSession } from '@/lib/session'
import { Users } from '@/models/users'
import { AccountStatus } from '@/schemas/user'
import { StatusCodes } from 'http-status-codes'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const GET = async () => {
  const user = await checkSession(cookies())

  if (user?.__cookieConfig) delete user.__cookieConfig

  if (
    !user ||
    !maintainerRoles.includes(user.role) ||
    [AccountStatus.Inactive].includes(user.status as AccountStatus)
  )
    return NextResponse.json([], { status: StatusCodes.UNAUTHORIZED })

  const users = await Users.getAll()

  return NextResponse.json(users)
}
