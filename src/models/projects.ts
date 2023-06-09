import { Connector } from '@/lib/db-connector'
import type { TProject } from '@/schemas/project'

export class Projects {
  static async getAll() {
    const connection = await Connector.connect()

    if (!connection) return []

    const projects = await connection
      .collection<TProject>('projects')
      .find()
      .toArray()

    return projects ?? []
  }

  static async getProjectsByOwnerId(
    ownerId: Stratego.STS.Utils.UUID
  ): Promise<TProject[]> {
    const connection = await Connector.connect()

    if (!connection) return []

    const projects = await connection
      .collection<TProject>('projects')
      .find({ ownerId })
      .toArray()

    return projects
  }

  static async getProjectById(
    id: Stratego.STS.Utils.UUID
  ): Promise<TProject | null> {
    const connection = await Connector.connect()

    if (!connection) return null

    const project = await connection
      .collection<TProject>('projects')
      .findOne({ id })

    return project
  }

  static async getAllTickets() {
    const projects = await Projects.getAll()

    return projects.flatMap(({ tickets: $tickets, ...project }) =>
      $tickets.map((ticket) => ({
        projectId: project.id,
        projectName: project.name,
        ...ticket,
      }))
    )
  }

  static async getTickets(ownerId: Stratego.STS.Utils.UUID) {
    const projects = await Projects.getProjectsByOwnerId(ownerId)

    return projects.flatMap(({ tickets: $tickets, ...project }) =>
      $tickets.map((ticket) => ({
        projectId: project.id,
        projectName: project.name,
        ...ticket,
      }))
    )
  }

  static async getProjectTickets(projectId: Stratego.STS.Utils.UUID) {
    const connection = await Connector.connect()

    if (!connection) return []

    const project = await connection
      .collection<TProject>('projects')
      .findOne({ id: projectId })

    return project?.tickets ?? []
  }

  static async getTicket(
    ownerId: Stratego.STS.Utils.UUID,
    ticketId: Stratego.STS.Utils.UUID
  ) {
    return (await Projects.getTickets(ownerId)).find(
      ({ id }) => id === ticketId
    )
  }
}
