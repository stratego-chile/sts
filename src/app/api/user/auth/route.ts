import { checkCaptchaToken } from '@/app/api/user/auth/(captcha)/checker'
import { IconType } from '@/lib/enumerators'
import { createSealedCookieData } from '@/lib/session'
import { Users } from '@/models/users'
import addSeconds from 'date-fns/addSeconds'
import { StatusCodes } from 'http-status-codes'
import { IronSessionOptions, getIronSession } from 'iron-session'
import { NextResponse, type NextRequest } from 'next/server'
import createSaltedSHA512 from 'salted-sha512'

export const POST = async (request: NextRequest) => {
  const captchaToken = request.headers.get('authorization')

  let result: Stratego.STS.Auth.Response<boolean> = {
    authorized: false,
  }

  if (!captchaToken)
    return NextResponse.json(result, { status: StatusCodes.BAD_REQUEST })

  const isAuthorizedToLogin = await checkCaptchaToken(captchaToken)

  if (!isAuthorizedToLogin)
    return NextResponse.json(result, { status: StatusCodes.UNAUTHORIZED })

  const { rememberMe, ...credentials } = (await request.json()) as Extend<
    Unset<Stratego.STS.Auth.Credentials>,
    {
      rememberMe?: boolean
    }
  >

  if (
    !(credentials instanceof Object) &&
    !Object.keys(credentials).every((credentialsFragment) =>
      ['email', 'password'].includes(credentialsFragment)
    )
  )
    return NextResponse.json(result, { status: StatusCodes.BAD_REQUEST })

  credentials.password = createSaltedSHA512(
    credentials.password as string,
    process.env.PASSWORD_SECURITY_SERVER_SALT
  )

  const authorized = await Users.compareCredentials(
    credentials satisfies Stratego.STS.Auth.Credentials
  )

  if (!authorized)
    return NextResponse.json(result, { status: StatusCodes.UNAUTHORIZED })

  const user = await Users.getUserByEmail(credentials.email)

  if (!user) return NextResponse.json(result, { status: StatusCodes.NOT_FOUND })

  const cookieData: Stratego.STS.User.CookieData = {
    id: user.id,
    email: user.email,
    status: user.status,
    role: user.role,
    iconType: user.settings.profile.icon
      ? user.settings.profile.icon?.url
        ? IconType.Image
        : IconType.Color
      : IconType.None,
    alias: user.settings.profile.alias,
  }

  result = {
    authorized,
    storeData: {
      icon:
        user.settings.profile.icon?.url ?? user.settings.profile.icon?.color,
    },
  }

  const response = NextResponse.next()

  const cookieOptions: IronSessionOptions['cookieOptions'] = {
    expires: addSeconds(
      Date.now(),
      parseInt(
        rememberMe
          ? process.env.SESSION_EXTENDED_TTL
          : process.env.SESSION_DEFAULT_TTL
      )
    ),
    sameSite: 'strict',
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

  await ironSession.save()

  return NextResponse.json(result, {
    ...response,
    headers: {
      ...response.headers,
      'Set-Cookie': [
        `${process.env.SESSION_COOKIE_NAME}=${seal}`,
        `Path=${cookieOptions.path}`,
        'SameSite=Strict',
        `Expires=${cookieOptions.expires!.toUTCString()}`,
        cookieOptions.secure ? 'Secure' : undefined,
      ]
        .filter(Boolean)
        .join('; '),
    },
  })
}
