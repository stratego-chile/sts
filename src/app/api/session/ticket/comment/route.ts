import { checkSession } from '@/lib/session'
import { Tickets } from '@/models/tickets'
import { Infer, createSchema } from '@powership/schema'
import { StatusCodes } from 'http-status-codes'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export const POST = async (request: NextRequest) => {
  const response = {
    success: false,
  }

  const user = await checkSession(cookies())

  if (!user)
    return NextResponse.json(response, {
      status: StatusCodes.UNAUTHORIZED,
    })

  const incomingCommentSchema = createSchema({
    projectId: 'ID',
    ticketId: 'ID',
    content: 'string',
  } as const)

  const commentData = (await request.json()) as Infer<
    typeof incomingCommentSchema
  >

  const validation = createSchema({
    projectId: 'ID',
    ticketId: 'ID',
    content: 'string',
  }).safeParse(commentData)

  if (!commentData || validation.errors.length > 0)
    return NextResponse.json(response, {
      status: StatusCodes.BAD_REQUEST,
    })

  const { projectId, ticketId, content } = validation.parsed as Infer<
    typeof incomingCommentSchema
  >

  if (!content)
    return NextResponse.json(response, {
      status: StatusCodes.BAD_REQUEST,
    })

  response.success = await Tickets.addComment(
    projectId as Stratego.STS.Utils.UUID,
    ticketId as Stratego.STS.Utils.UUID,
    user.id,
    content,
  )

  return NextResponse.json(response)
}
