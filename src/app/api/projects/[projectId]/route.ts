import { maintainerRoles } from '@/helpers/roles'
import { checkSession } from '@/lib/session'
import { Projects } from '@/models/projects'
import { StatusCodes } from 'http-status-codes'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export const GET = async (
  _request: NextRequest,
  {
    params,
  }: {
    params: {
      projectId: Stratego.STS.Utils.UUID
    }
  },
) => {
  const user = await checkSession(cookies())

  if (!user)
    return NextResponse.json(null, { status: StatusCodes.UNAUTHORIZED })

  const searchForAllProjects = !!maintainerRoles.includes(user.role)

  let project: PossiblyDefined<
    | Awaited<ReturnType<(typeof Projects)['getProjectById']>>
    | Awaited<ReturnType<(typeof Projects)['getOwnedProjectById']>>
  >

  if (searchForAllProjects)
    project = await Projects.getProjectById(params.projectId)
  else
    project = await Projects.getOwnedProjectById(
      user.parentId ? user.parentId : user.id,
      params.projectId,
    )

  return NextResponse.json(project ?? null)
}
