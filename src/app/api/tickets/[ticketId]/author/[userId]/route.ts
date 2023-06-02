import { AccountStatus } from '@/lib/enumerators'
import { Users } from '@/models/users'
import { StatusCodes } from 'http-status-codes'
import { NextResponse } from 'next/server'

export const GET = async (
  _request: Request,
  {
    params,
  }: {
    params: {
      userId: string
    }
  }
) => {
  const user = await Users.getUserById(params.userId as Stratego.STS.Utils.UUID)

  if (!user)
    return NextResponse.json(null, {
      status: StatusCodes.NOT_FOUND,
    })

  if (user.status === AccountStatus.Inactive)
    return NextResponse.json(null, {
      status: StatusCodes.FORBIDDEN,
    })

  return NextResponse.json({
    ...user.settings.profile,
    role: user.role,
  })
}
