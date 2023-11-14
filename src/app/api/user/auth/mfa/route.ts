import { checkCaptchaToken } from '@/app/api/(captcha)/checker'
import { MFAMode } from '@/lib/enumerators'
import { Users } from '@/models/users'
import { StatusCodes } from 'http-status-codes'
import { NextResponse, type NextRequest } from 'next/server'

export const POST = async (request: NextRequest) => {
  const result = {
    authorized: false,
  }

  const captchaToken = request.headers.get('authorization')

  if (!captchaToken)
    return NextResponse.json(result, { status: StatusCodes.BAD_REQUEST })

  const isHumanEnough = await checkCaptchaToken(captchaToken)

  if (!isHumanEnough)
    return NextResponse.json(result, { status: StatusCodes.UNAUTHORIZED })

  const {
    ref,
    mode,
    token,
  }: {
    ref: string
    mode: MFAMode
    token: string
  } = await request.json()

  const decodedEmail = Buffer.from(ref, 'base64').toString()

  const user = await Users.getUserByEmail(
    decodedEmail satisfies Stratego.STS.Auth.Email,
  )

  if (!user) return NextResponse.json(result, { status: StatusCodes.NOT_FOUND })

  if (mode === MFAMode.TOTP) {
    const [valid, currentTOTPRef] = await Users.validateTOTPToken(
      user.id,
      token,
    )

    if (!valid || !currentTOTPRef)
      return NextResponse.json(result, { status: StatusCodes.UNAUTHORIZED })

    result.authorized = valid
  }

  if (mode === MFAMode.Recovery) {
    const valid = await Users.consumeRecoveryKey(user.id, token)

    if (!valid)
      return NextResponse.json(result, { status: StatusCodes.UNAUTHORIZED })

    result.authorized = valid
  }

  return NextResponse.json(result)
}
