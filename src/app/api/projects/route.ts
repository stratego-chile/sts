import { maintainerRoles } from '@/helpers/roles'
import { checkSession } from '@/lib/session'
import { Projects } from '@/models/projects'
import { StatusCodes } from 'http-status-codes'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const GET = async () => {
  const user = await checkSession(cookies())

  if (!user) return NextResponse.json([], { status: StatusCodes.UNAUTHORIZED })

  const isAdmin = maintainerRoles.includes(user.role)

  return NextResponse.json(
    isAdmin
      ? await Projects.getAll()
      : await Projects.getProjectsByOwnerId(user.id),
  )
}
