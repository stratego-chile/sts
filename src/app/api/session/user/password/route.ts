import { checkSession } from '@/lib/session'
import { UserCredentialsValidationResult, Users } from '@/models/users'
import { StatusCodes } from 'http-status-codes'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import createSaltedSHA512 from 'salted-sha512'

type PasswordConfig = {
  currentPassword: Stratego.STS.Auth.HashedPassword
  newPassword: Stratego.STS.Auth.HashedPassword
  confirmNewPassword?: Stratego.STS.Auth.HashedPassword
}

export const PATCH = async (request: NextRequest) => {
  const user = await checkSession(cookies())

  if (!user)
    return NextResponse.json(null, { status: StatusCodes.UNAUTHORIZED })

  try {
    const passwordConfig: PasswordConfig = await request.json()

    if (passwordConfig.newPassword !== passwordConfig.confirmNewPassword)
      return NextResponse.json(null, { status: StatusCodes.BAD_REQUEST })

    delete passwordConfig.confirmNewPassword

    for (const key in passwordConfig)
      passwordConfig[key as keyof typeof passwordConfig] =
        await createSaltedSHA512(
          passwordConfig[key as keyof typeof passwordConfig] as string,
          process.env.PASSWORD_SECURITY_SERVER_SALT,
          true,
        )

    const { currentPassword, newPassword } = passwordConfig

    const doesUser = await Users.compareCredentials({
      email: user.email,
      password: currentPassword,
    })

    if (doesUser !== UserCredentialsValidationResult.SUCCESS)
      return NextResponse.json(null, { status: StatusCodes.UNAUTHORIZED })

    const result = await Users.updatePassword(user.id, newPassword)

    return NextResponse.json({
      success: result,
    })
  } catch {
    return NextResponse.json(null, { status: StatusCodes.BAD_REQUEST })
  }
}
