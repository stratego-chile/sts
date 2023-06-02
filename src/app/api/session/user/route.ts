import { checkSession } from '@/lib/session'
import { Users } from '@/models/users'
import { StatusCodes } from 'http-status-codes'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const GET = async () => {
  const user = await checkSession(cookies())

  if (!user)
    return NextResponse.json(null, { status: StatusCodes.UNAUTHORIZED })

  const foundUser = await Users.getUserById(user.id)

  if (!foundUser)
    return NextResponse.json(null, { status: StatusCodes.NOT_FOUND })

  return NextResponse.json(foundUser)
}
