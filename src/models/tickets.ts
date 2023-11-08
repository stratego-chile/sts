import { Connector } from '@/lib/db-connector'
import { COLLECTION, Projects } from '@/models/projects'
import type { TProject } from '@/schemas/project'
import type { TTicketComment, TicketStatus } from '@/schemas/ticket'
import getUnixTime from 'date-fns/getUnixTime'
import type { SerializedEditorState, SerializedLexicalNode } from 'lexical'
import { v4 as UUIDv4 } from 'uuid'

export class Tickets {
  static async getAllTickets() {
    const projects = await Projects.getAll()

    return projects.flatMap(({ tickets: $tickets, ...project }) =>
      $tickets.map((ticket) => ({
        projectId: project.id,
        projectName: project.name,
        ...ticket,
      })),
    )
  }

  static async getTicketsByOwner(ownerId: Stratego.STS.Utils.UUID) {
    const projects = await Projects.getProjectsByOwnerId(ownerId)

    return projects.flatMap(({ tickets: $tickets, ...project }) =>
      $tickets.map((ticket) => ({
        projectId: project.id,
        projectName: project.name,
        ...ticket,
      })),
    )
  }

  static async getProjectTickets(projectId: Stratego.STS.Utils.UUID) {
    const project = await Projects.getProjectById(projectId)
    return project?.tickets ?? []
  }

  static async getOwnedTicket(
    ownerId: Stratego.STS.Utils.UUID,
    ticketId: Stratego.STS.Utils.UUID,
  ) {
    const tickets = await Tickets.getTicketsByOwner(ownerId)

    return tickets.find(({ id }) => id === ticketId)
  }

  static async getTicket(ticketId: Stratego.STS.Utils.UUID) {
    const tickets = await Tickets.getAllTickets()

    return tickets.find(({ id }) => id === ticketId)
  }

  static async getTicketsByDateRange(
    ownerId: Stratego.STS.Utils.UUID,
    from: number,
    to: number,
  ) {
    const tickets = await Tickets.getTicketsByOwner(ownerId)

    return tickets.filter(({ versions }) => {
      const createdAt = versions[0].createdAt
      return createdAt >= from && createdAt <= to
    })
  }

  static async getTicketsByStatus(
    ownerId: Stratego.STS.Utils.UUID,
    status: TicketStatus,
  ) {
    const tickets = await Tickets.getTicketsByOwner(ownerId)

    return tickets.filter(({ versions }) => versions[0].status === status)
  }

  static async getAllTicketsByDateRange(from: number, to: number) {
    return (await Tickets.getAllTickets()).filter(({ versions }) => {
      const createdAt = versions.at(-1)?.createdAt
      return createdAt && createdAt >= from && createdAt <= to
    })
  }

  static async getAllTicketsByStatus(status: TicketStatus) {
    return (await Tickets.getAllTickets()).filter(
      ({ versions }) => versions.at(-1)?.status === status,
    )
  }

  static async addComment(
    projectId: Stratego.STS.Utils.UUID,
    ticketId: Stratego.STS.Utils.UUID,
    authorId: Stratego.STS.Utils.UUID,
    content: Stringified<SerializedEditorState<SerializedLexicalNode>>,
  ) {
    const commentToAdd: TTicketComment = {
      id: UUIDv4(),
      content: JSON.stringify(content),
      author: authorId,
      createdAt: getUnixTime(new Date()),
    }

    const connector = await Connector.connect()

    if (!connector) return false

    const result = await connector.collection<TProject>(COLLECTION).updateOne(
      {
        id: projectId,
        'tickets.id': ticketId,
      },
      {
        $push: {
          'tickets.$.comments': commentToAdd,
        },
      },
    )

    return result.modifiedCount > 0
  }
}
