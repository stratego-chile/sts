import { checkSession, createSessionCookieString } from '@/lib/session'
import { StatusCodes } from 'http-status-codes'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const HEAD = async () => {
  const session = await checkSession(cookies())

  const cookieOptions = session?.__cookieConfig

  if (!cookieOptions)
    return NextResponse.json(null, {
      status: StatusCodes.UNAUTHORIZED,
    })

  const response = NextResponse.next()

  return NextResponse.json(null, {
    ...response,
    headers: {
      ...response.headers,
      'Set-Cookie': createSessionCookieString({
        ...cookieOptions,
        expires: new Date(),
      }),
    },
  })
}
