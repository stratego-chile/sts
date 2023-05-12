import { Connector } from '@stratego-sts/lib/db-connector'
import type { TProject } from '@stratego-sts/schemas/project'

export class Projects {
  static async getProjectsByOwnerId(ownerId: string): Promise<TProject[]> {
    const connection = await Connector.connect()

    if (!connection) return []

    const projects = await connection
      .collection<TProject>('projects')
      .find({ ownerId })
      .toArray()

    return projects
  }

  static async getProjectById(id: string): Promise<TProject | null> {
    const connection = await Connector.connect()

    if (!connection) return null

    const project = await connection
      .collection<TProject>('projects')
      .findOne({ id })

    return project
  }

  static async getTickets(ownerId: string) {
    const projects = await Projects.getProjectsByOwnerId(ownerId)

    return projects.flatMap(({ tickets: $tickets, ...project }) =>
      $tickets.map((ticket) => ({
        projectId: project.id,
        projectName: project.name,
        ...ticket,
      }))
    )
  }

  static async getProjectTickets(projectId: string) {
    const connection = await Connector.connect()

    if (!connection) return []

    const project = await connection
      .collection<TProject>('projects')
      .findOne({ id: projectId })

    return project?.tickets ?? []
  }

  static async getTicket(ownerId: string, ticketId: string) {
    return (await Projects.getTickets(ownerId)).find(
      ({ id }) => id === ticketId
    )
  }
}
