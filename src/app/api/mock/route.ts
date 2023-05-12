import { checkSession } from '@stratego-sts/lib/session'
import { StatusCodes } from 'http-status-codes'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const POST = async () => {
  const user = await checkSession(cookies())

  if (!user)
    return NextResponse.json(undefined, { status: StatusCodes.UNAUTHORIZED })

  return NextResponse.json({
    status: 'OK',
  })
}
