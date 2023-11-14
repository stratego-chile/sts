import { checkCaptchaToken } from '@/app/api/(captcha)/checker'
import { MFAMode } from '@/lib/enumerators'
import {
  createSealedCookieData,
  createSessionCookieString,
} from '@/lib/session'
import { UserCredentialsValidationResult, Users } from '@/models/users'
import {
  IconType,
  OTPStatus,
  RecoveryTokenStatus,
  UserCredentialsSchema,
  type TUserAccessAttempt,
} from '@/schemas/user'
import addSeconds from 'date-fns/addSeconds'
import getUnixTime from 'date-fns/getUnixTime'
import { StatusCodes } from 'http-status-codes'
import { getIronSession, type IronSessionOptions } from 'iron-session'
import { NextResponse, type NextRequest } from 'next/server'
import createSaltedSHA512 from 'salted-sha512'

export const HEAD = async (request: NextRequest) => {
  const captchaToken = request.headers.get('authorization')

  if (!captchaToken)
    return NextResponse.json(null, { status: StatusCodes.BAD_REQUEST })

  const isHumanEnough = await checkCaptchaToken(captchaToken)

  if (!isHumanEnough)
    return NextResponse.json(null, { status: StatusCodes.UNAUTHORIZED })

  try {
    const credentialsHeader = request.headers.get('credentials')

    if (!credentialsHeader) throw new Error()

    const credentials: Stratego.STS.Auth.Credentials =
      JSON.parse(credentialsHeader)

    if (UserCredentialsSchema.safeParse(credentials).errors.length > 0)
      throw new Error()

    credentials.password = await createSaltedSHA512(
      credentials.password as string,
      process.env.PASSWORD_SECURITY_SERVER_SALT,
      true,
    )

    const credentialsState = await Users.compareCredentials(credentials)

    return NextResponse.json(
      {},
      {
        headers: {
          valid: String(
            credentialsState === UserCredentialsValidationResult.SUCCESS,
          ),
        },
      },
    )
  } catch {
    return NextResponse.json(null, { status: StatusCodes.BAD_REQUEST })
  }
}

export const GET = async (request: NextRequest) => {
  const result = {
    mfa: false,
    alternatives: [] as Array<MFAMode>,
  }

  const captchaToken = request.headers.get('authorization')

  if (!captchaToken)
    return NextResponse.json(null, { status: StatusCodes.BAD_REQUEST })

  const isHumanEnough = await checkCaptchaToken(captchaToken)

  if (!isHumanEnough)
    return NextResponse.json(null, { status: StatusCodes.UNAUTHORIZED })

  const userRef = request.headers.get('user-ref')

  if (!userRef)
    return NextResponse.json(null, { status: StatusCodes.BAD_REQUEST })

  const user = await Users.getUserByEmail(userRef)

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
  const captchaToken = request.headers.get('authorization')

  let result: Stratego.STS.Auth.Response<boolean> = {
    authorized: false,
  }

  if (!captchaToken)
    return NextResponse.json(result, { status: StatusCodes.BAD_REQUEST })

  const isHumanEnough = await checkCaptchaToken(captchaToken)

  if (!isHumanEnough)
    return NextResponse.json(result, { status: StatusCodes.UNAUTHORIZED })

  const { remember, ...credentials } = ((await request.json()) ??
    {}) as Stratego.STS.Auth.Login

  if (
    !(credentials instanceof Object) ||
    !Object.keys<keyof Stratego.STS.Auth.Credentials>(credentials).every(
      (credentialsFragment) =>
        new Set<keyof Stratego.STS.Auth.Credentials>(['email', 'password']).has(
          credentialsFragment,
        ),
    )
  )
    return NextResponse.json(result, { status: StatusCodes.BAD_REQUEST })

  credentials.password = await createSaltedSHA512(
    credentials.password as string,
    process.env.PASSWORD_SECURITY_SERVER_SALT,
    true,
  )

  const credentialsValidationResult = await Users.compareCredentials(
    credentials satisfies Stratego.STS.Auth.Credentials,
  )

  const authorized =
    credentialsValidationResult === UserCredentialsValidationResult.SUCCESS

  if (
    credentialsValidationResult !== UserCredentialsValidationResult.INEXISTENT
  ) {
    const { id } = (await Users.getUserByEmail(credentials.email)) ?? {}

    const sessionCreationTimestamp = getUnixTime(new Date())

    const sessionAttempt: TUserAccessAttempt = {
      origin: {
        ip: request.ip ?? 'unknown',
        geolocation: request.headers.get('geolocation') || 'unknown',
      },
      fingerprint: request.headers.get('fingerprint') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      timestamp: sessionCreationTimestamp,
      success: authorized,
    }

    if (id) await Users.registerLoginAttempt(id, sessionAttempt)
  }

  if (!authorized)
    return NextResponse.json(result, { status: StatusCodes.UNAUTHORIZED })

  const user = await Users.getUserByEmail(credentials.email)

  if (!user) return NextResponse.json(result, { status: StatusCodes.NOT_FOUND })

  const cookieData: Stratego.STS.User.CookieData = {
    id: user.id,
    email: user.email,
    status: user.status,
    role: user.role,
  }

  result = {
    authorized,
    storeData: {
      icon: {
        type: user.settings.profile.icon?.prefer ?? IconType.None,
        value:
          (user.settings.profile.icon?.prefer === IconType.Color
            ? user.settings.profile.icon.color
            : user.settings.profile.icon?.url) ?? '',
      },
    },
  }

  const response = NextResponse.next()

  const cookieOptions: IronSessionOptions['cookieOptions'] = {
    expires: addSeconds(
      new Date(),
      parseInt(
        remember
          ? process.env.SESSION_EXTENDED_TTL
          : process.env.SESSION_DEFAULT_TTL,
      ),
    ),
    sameSite: 'strict',
    httpOnly:
      process.env.SECURE === 'true' || process.env.NODE_ENV === 'production',
    secure:
      process.env.SECURE === 'true' || process.env.NODE_ENV === 'production',
    path: '/',
  }

  const seal = await createSealedCookieData({
    ...cookieData,
    __cookieConfig: cookieOptions,
  })

  const ironSession = await getIronSession(request, response, {
    cookieName: process.env.SESSION_COOKIE_NAME,
    password: process.env.SESSION_COOKIE_PASSWORD,
    cookieOptions,
  })

  await ironSession.save() // For some reason, this is necessary to use the cookie on the server side

  await Users.update(user.id, {
    accessAttempts: user.accessAttempts,
  })

  return NextResponse.json(result, {
    ...response,
    headers: {
      ...response.headers,
      'Set-Cookie': createSessionCookieString(cookieOptions, seal),
    },
  })
}
