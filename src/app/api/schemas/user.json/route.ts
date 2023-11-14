import { checkAdminSession } from '@/lib/session'
import { EditableUserSchema, UserSchema } from '@/schemas/user'
import { objectToJSON } from '@powership/schema/out/objectToJSON'
import { StatusCodes } from 'http-status-codes'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export const GET = async (request: NextRequest) => {
  const user = await checkAdminSession(cookies())

  const { searchParams } = new URL(request.url)

  if (!user)
    return NextResponse.json(null, { status: StatusCodes.UNAUTHORIZED })

  let parsedSchema = objectToJSON('User', UserSchema)

  if (searchParams.get('variant') === 'editable')
    parsedSchema = objectToJSON('EditableUser', EditableUserSchema)

  return NextResponse.json(parsedSchema)
}
