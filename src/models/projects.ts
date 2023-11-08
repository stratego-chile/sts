import { Connector } from '@/lib/db-connector'
import type { TProject } from '@/schemas/project'
import type { Filter } from 'mongodb'

export const COLLECTION = 'projects'

export class Projects {
  static async getAllByCondition(filter?: Filter<TProject>) {
    const connection = await Connector.connect()

    if (!connection) return []

    const caller = connection.collection<TProject>(COLLECTION)

    const projects = await (filter
      ? caller.find(filter)
      : caller.find()
    ).toArray()

    return projects ?? []
  }

  static async getAll() {
    return await Projects.getAllByCondition()
  }

  static async getProjectsByOwnerId(ownerId: Stratego.STS.Utils.UUID) {
    return await Projects.getAllByCondition({ ownerId })
  }

  static async getProjectsByDateRange(from: number, to: number) {
    return await Projects.getAllByCondition({
      createdAt: {
        $gte: from,
        $lte: to,
      },
    })
  }

  static async getProjectsByOwnerIdWithDateRange(
    ownerId: Stratego.STS.Utils.UUID,
    from: number,
    to: number,
  ) {
    return await Projects.getAllByCondition({
      ownerId,
      createdAt: {
        $gte: from,
        $lte: to,
      },
    })
  }

  static async getOwnedProjectById(
    ownerId: Stratego.STS.Utils.UUID,
    id: Stratego.STS.Utils.UUID,
  ): Promise<Nullable<TProject>> {
    return (await Projects.getAllByCondition({ ownerId, id })).at(0) ?? null
  }

  static async getProjectById(
    id: Stratego.STS.Utils.UUID,
  ): Promise<Nullable<TProject>> {
    return (await Projects.getAllByCondition({ id })).at(0) ?? null
  }
}
