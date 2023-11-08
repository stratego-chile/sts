import { Connector } from '@/lib/db-connector'
import { AccountEventStatus, type TEvent } from '@/schemas/event'
import getUnixTime from 'date-fns/getUnixTime'
import type { Except } from 'type-fest'
import { v4 as UUIDv4 } from 'uuid'

const COLLECTION = 'events'

export class Events {
  static async getByUserId(ownerId: Stratego.STS.Utils.UUID) {
    const connection = await Connector.connect()

    if (!connection) return []

    const caller = connection.collection<TEvent>(COLLECTION)

    const notifications = await caller
      .find({
        owner: ownerId,
      })
      .toArray()

    return notifications ?? []
  }

  static async getUnreadByUserId(ownerId: Stratego.STS.Utils.UUID) {
    const connection = await Connector.connect()

    if (!connection) return []

    const caller = connection.collection<TEvent>(COLLECTION)

    const notifications = await caller
      .find({
        owner: ownerId,
        status: AccountEventStatus.Unread,
      })
      .toArray()

    return notifications ?? []
  }

  static async create(
    ownerId: Stratego.STS.Utils.UUID,
    data: Except<TEvent, 'id' | 'owner' | 'status' | 'createdAt' | 'updatedAt'>,
  ) {
    const connection = await Connector.connect()

    if (!connection) return false

    const caller = connection.collection<TEvent>(COLLECTION)

    const currentTimestamp = getUnixTime(new Date())

    const result = await caller.insertOne({
      ...data,
      owner: ownerId,
      id: UUIDv4() as Stratego.STS.Utils.UUID,
      status: AccountEventStatus.Unread,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
    })

    return result.insertedId
  }

  static async setAsRead(
    ownerId: Stratego.STS.Utils.UUID,
    ...eventIds: Array<Stratego.STS.Utils.UUID>
  ): Promise<[updateCount: number, updateSuccess: boolean]> {
    const connection = await Connector.connect()

    if (!connection) return [0, false]

    const caller = connection.collection<TEvent>(COLLECTION)

    const result = await caller.updateMany(
      {
        id: {
          $in: eventIds,
        },
        owner: ownerId,
      },
      {
        $set: {
          status: AccountEventStatus.Read,
        },
      },
    )

    return [result.modifiedCount, result.modifiedCount === eventIds.length]
  }
}
