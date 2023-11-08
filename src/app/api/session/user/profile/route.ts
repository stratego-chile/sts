import { checkSession } from '@/lib/session'
import { Users } from '@/models/users'
import { UserProfileSchema, type TUserProfile } from '@/schemas/user'
import { StatusCodes } from 'http-status-codes'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export const GET = async () => {
  const user = await checkSession(cookies())

  if (!user)
    return NextResponse.json(null, { status: StatusCodes.UNAUTHORIZED })

  const foundUser = await Users.getUserById(user.id)

  if (!foundUser)
    return NextResponse.json(null, { status: StatusCodes.NOT_FOUND })

  const {
    settings: { profile },
  } = foundUser

  return NextResponse.json({
    ...profile,
    email: foundUser.email,
  })
}

export const PATCH = async (request: NextRequest) => {
  const user = await checkSession(cookies())

  if (!user)
    return NextResponse.json(null, { status: StatusCodes.UNAUTHORIZED })

  const profileData: Assume<TUserProfile> = await request.json()

  const isDataValid = !!UserProfileSchema.safeParse(profileData).parsed

  if (isDataValid) {
    const result = await Users.updateProfile(user.id, profileData)

    if (result) return NextResponse.json(result)
  }

  return NextResponse.json(null, { status: StatusCodes.BAD_REQUEST })
}
