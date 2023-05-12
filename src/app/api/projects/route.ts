import { checkSession } from '@stratego-sts/lib/session'
import { Projects } from '@stratego-sts/models/projects'
import { StatusCodes } from 'http-status-codes'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const GET = async () => {
  const user = await checkSession(cookies())

  if (!user) return NextResponse.json([], { status: StatusCodes.UNAUTHORIZED })

  return NextResponse.json(await Projects.getProjectsByOwnerId(user.id))
}
