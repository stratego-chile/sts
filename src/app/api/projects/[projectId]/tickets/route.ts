import { checkSession } from '@/lib/session'
import { Projects } from '@/models/projects'
import { StatusCodes } from 'http-status-codes'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const GET = async (
  _request: Request,
  {
    params,
  }: {
    params: { projectId: Stratego.STS.Utils.UUID }
  }
) => {
  const user = await checkSession(cookies())

  if (!user) return NextResponse.json([], { status: StatusCodes.UNAUTHORIZED })

  return NextResponse.json(await Projects.getProjectTickets(params.projectId))
}
