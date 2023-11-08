import { createCookieString } from '@/helpers/cookies'
import { CookiesConsenting } from '@/lib/enumerators'
import addDays from 'date-fns/addDays'
import getUnixTime from 'date-fns/getUnixTime'
import { StatusCodes } from 'http-status-codes'
import { NextResponse, type NextRequest } from 'next/server'

type CookiesConsentingConfig = Record<CookiesConsenting, boolean>

export const POST = async (request: NextRequest) => {
  const consenting = (await request.json()) as Unset<CookiesConsentingConfig>

  if (!consenting)
    return NextResponse.json(null, { status: StatusCodes.BAD_REQUEST })

  const accepted = Object.keys(consenting).some(
    (key) => consenting[key as keyof CookiesConsentingConfig],
  )

  if (!accepted)
    return NextResponse.json(null, {
      status: StatusCodes.UNAVAILABLE_FOR_LEGAL_REASONS,
    })

  const expiration = addDays(new Date(), 90)

  return NextResponse.json(
    {
      accepted,
      expiration: getUnixTime(expiration),
    },
    {
      headers: accepted
        ? {
            'Set-Cookie': createCookieString(
              process.env.COOKIES_CONSENTING,
              Object.entries(consenting)
                .map(([key, value]) => (value ? key : false))
                .filter(Boolean)
                .join(','),
              {
                expires: expiration,
                sameSite: 'strict',
                httpOnly:
                  process.env.SECURE === 'true' ||
                  process.env.NODE_ENV === 'production',
                secure:
                  process.env.SECURE === 'true' ||
                  process.env.NODE_ENV === 'production',
                path: '/',
              },
            ),
          }
        : undefined,
    },
  )
}
