import { Connector } from '@/lib/db-connector'
import type { TUser, TUserProfile } from '@/schemas/user'
import type { WithId } from 'mongodb'

export class Users {
  static async getUserById(
    id: Stratego.STS.Utils.UUID
  ): Promise<Nullable<WithId<TUser>>> {
    const connection = await Connector.connect()

    if (!connection) return null

    const user = await connection.collection<TUser>('users').findOne({ id })

    return user
  }

  static async getUserIconById(
    id: Stratego.STS.Utils.UUID
  ): Promise<NullableUnset<TUserProfile['icon']>> {
    const user = await Users.getUserById(id)

    if (user) return user.settings.profile.icon

    return null
  }

  static async getUserByEmail(
    email: Stratego.STS.Auth.Email
  ): Promise<Nullable<TUser>> {
    const connection = await Connector.connect()

    if (!connection) return null

    const user = await connection.collection<TUser>('users').findOne({ email })

    return user
  }

  static async compareCredentials(
    credentials: Stratego.STS.Auth.Credentials
  ): Promise<boolean> {
    const user = await Users.getUserByEmail(credentials.email)

    if (user) return user.settings.security.accessKey === credentials.password

    return false
  }

  static async updateProfile(
    userId: Stratego.STS.Utils.UUID,
    profile: TUserProfile
  ): Promise<Unset<TUserProfile>> {
    let result: Awaited<ReturnType<typeof Users.updateProfile>> = undefined

    const user = await Users.getUserById(userId)

    if (!user) return result

    const connection = await Connector.connect()

    if (!connection) return result

    const { _id: userDocumentId } = user

    const updateResult = await connection.collection<TUser>('users').updateOne(
      {
        _id: userDocumentId,
      },
      {
        $set: {
          'settings.profile': profile,
          updatedAt: Date.now(),
        },
      }
    )

    result = updateResult.modifiedCount > 0 ? profile : undefined

    return result
  }
}
