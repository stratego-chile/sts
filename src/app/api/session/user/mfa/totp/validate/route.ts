import { MFAMode } from '@/lib/enumerators'
import { checkSession } from '@/lib/session'
import { Users } from '@/models/users'
import { OTPStatus, RecoveryTokenStatus } from '@/schemas/user'
import { StatusCodes } from 'http-status-codes'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export const GET = async () => {
  const $user = await checkSession(cookies())

  if (!$user)
    return NextResponse.json(null, { status: StatusCodes.UNAUTHORIZED })

  const result = {
    mfa: false,
    alternatives: [] as Array<MFAMode>,
  }

  const user = await Users.getUserById($user.id)

  if (!user) return NextResponse.json(null, { status: StatusCodes.NOT_FOUND })

  const MFAOptions: Record<MFAMode, boolean> = {
    [MFAMode.TOTP]:
      user.settings?.security?.mfa?.totp?.status === OTPStatus.Active,
    [MFAMode.Recovery]:
      !!user.settings?.security?.mfa?.totp?.recoveryKeys?.find(
        ({ status }) => status === RecoveryTokenStatus.Active,
      ),
  }

  result.mfa = Object.values(MFAOptions).some((option) => option)

  if (result.mfa) result.alternatives.push(...Object.keys<MFAMode>(MFAOptions))

  return NextResponse.json(result)
}

export const POST = async (request: NextRequest) => {
  const result = {
    authorized: false,
  }

  const user = await checkSession(cookies())

  if (!user)
    return NextResponse.json(result, { status: StatusCodes.UNAUTHORIZED })

  const { mode, token }: { mode?: MFAMode; token?: string } =
    await request.json()

  if (!mode)
    return NextResponse.json(result, { status: StatusCodes.BAD_REQUEST })

  if (!token)
    return NextResponse.json(result, { status: StatusCodes.BAD_REQUEST })

  const validator: Record<MFAMode, (token: string) => Promise<boolean>> = {
    [MFAMode.TOTP]: async (OTPToken: string) =>
      (await Users.validateTOTPToken(user.id, OTPToken))?.[0] ?? false,
    [MFAMode.Recovery]: async (recoveryKey: string) =>
      await Users.consumeRecoveryKey(user.id, recoveryKey),
  }

  const isValid = await validator[mode](token)

  result.authorized = isValid

  return NextResponse.json(result)
}
