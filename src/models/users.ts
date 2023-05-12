import { Connector } from '@stratego-sts/lib/db-connector'
import type { TUser, TUserProfile } from '@stratego-sts/schemas/user'

export class Users {
  static async getUserById(id: string): Promise<TUser | null> {
    const connection = await Connector.connect()

    if (!connection) return null

    const user = await connection.collection<TUser>('users').findOne({ id })

    return user
  }

  static async getUserIconById(
    id: string
  ): Promise<NullableUnset<TUserProfile['icon']>> {
    const user = await Users.getUserById(id)

    if (user) return user.settings.profile.icon

    return null
  }

  static async getUserByEmail(
    email: Stratego.STS.Auth.Email
  ): Promise<TUser | null> {
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
}
