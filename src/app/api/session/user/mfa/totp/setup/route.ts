import { createEncryptedRef, createRecoveryKeys } from '@/helpers/otp'
import { checkSession } from '@/lib/session'
import { Users } from '@/models/users'
import { OTPStatus } from '@/schemas/user'
import { authenticator } from '@otplib/preset-default'
import getUnixTime from 'date-fns/getUnixTime'
import Base32 from 'hi-base32'
import { StatusCodes } from 'http-status-codes'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * @description This route is used to get the current user TOTP configuration state
 */
export const GET = async () => {
  const user = await checkSession(cookies())

  if (!user)
    return NextResponse.json(null, { status: StatusCodes.UNAUTHORIZED })

  const { encryptedRef, rawRef } = createEncryptedRef(user.id)

  const key = Base32.encode(rawRef, true)

  const url = authenticator.keyuri(
    user.email as string,
    process.env.MFA_TOTP_APP_LABEL,
    key,
  )

  const isConfigStored = await Users.registerTOTP(user.id, {
    ref: encryptedRef,
    status: OTPStatus.Inactive,
    recoveryKeys: [],
    requestedAt: getUnixTime(new Date()),
  })

  if (!isConfigStored)
    return NextResponse.json(null, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    })

  return NextResponse.json({
    url,
    key,
  })
}

/**
 * @description This route is used to activate the TOTP configuration once the TOTP setup is confirmed
 */
export const PATCH = async () => {
  const user = await checkSession(cookies())

  if (!user)
    return NextResponse.json(null, { status: StatusCodes.UNAUTHORIZED })

  const success = await Users.activateTOTP(user.id)

  return NextResponse.json({
    success,
  })
}

/**
 * @description This route is used to register the TOTP configuration and generate the recovery codes
 */
export const POST = async (request: NextRequest) => {
  const user = await checkSession(cookies())

  if (!user)
    return NextResponse.json(null, { status: StatusCodes.UNAUTHORIZED })

  const { token }: { token: PossiblyDefined<string> } = await request.json()

  if (!token)
    return NextResponse.json(null, { status: StatusCodes.BAD_REQUEST })

  const [isValid, ref] = await Users.validateTOTPToken(user.id, token)

  if (!isValid)
    return NextResponse.json(null, { status: StatusCodes.FORBIDDEN })

  const recoveryKeys = createRecoveryKeys(user.id)

  const registerTOTPConfigResult = await Users.registerTOTP(user.id, {
    ref: ref!,
    status: OTPStatus.Inactive,
    recoveryKeys: recoveryKeys.secured,
    requestedAt: getUnixTime(new Date()),
  })

  if (!registerTOTPConfigResult)
    return NextResponse.json(null, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    })

  return NextResponse.json({
    success: true,
    recoveryCodes: recoveryKeys.raw,
  })
}
