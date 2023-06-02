import { checkSession } from '@/lib/session'
import { StatusCodes } from 'http-status-codes'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * This is a mock route that returns a 200 OK response if the user is logged in.
 *
 * This is used to handle the user icon image upload action.
 *
 * @see https://ant.design/components/upload
 */
export const POST = async () => {
  const user = await checkSession(cookies())

  if (!user)
    return NextResponse.json(null, { status: StatusCodes.UNAUTHORIZED })

  return NextResponse.json({
    status: 'OK',
  })
}
