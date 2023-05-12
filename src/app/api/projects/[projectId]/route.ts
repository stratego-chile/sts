import { checkSession } from '@stratego-sts/lib/session'
import { Projects } from '@stratego-sts/models/projects'
import { StatusCodes } from 'http-status-codes'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const GET = async (
  _request: Request,
  {
    params,
  }: {
    params: {
      projectId: Stratego.STS.Utils.UUID
    }
  }
) => {
  const user = await checkSession(cookies())

  if (!user)
    return NextResponse.json(null, { status: StatusCodes.UNAUTHORIZED })

  return NextResponse.json(await Projects.getProjectById(params.projectId))
}
