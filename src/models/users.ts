import { decryptRef, getHash } from '@/helpers/otp'
import { Connector } from '@/lib/db-connector'
import { createToken, hashToken } from '@/lib/token-generator'
import {
  UserTOTPSchema,
  type TUser,
  type TUserAccessAttempt,
  type TUserProfile,
  type TUserSecurity,
  type TUserTOTP,
  AccountStatus,
  OTPStatus,
  RecoveryTokenStatus,
  TUserAccessToken,
  AccessTokenStatus,
  AccessTokenType,
} from '@/schemas/user'
import { authenticator } from '@otplib/preset-default'
import getUnixTime from 'date-fns/getUnixTime'
import Base32 from 'hi-base32'
import type { Filter, WithId } from 'mongodb'

const COLLECTION = 'users'

export enum UserCredentialsValidationResult {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  LOCKED = 'LOCKED',
  INEXISTENT = 'INEXISTENT',
}

export class Users {
  static async getUserByCondition(filter: Filter<TUser>) {
    const connection = await Connector.connect()

    if (!connection) return null

    const user = await connection.collection<TUser>(COLLECTION).findOne(filter)

    return user
  }

  static async getAll() {
    const connection = await Connector.connect()

    if (!connection) return []

    const users = await connection
      .collection<TUser>(COLLECTION)
      .find()
      .toArray()

    return users
  }

  static async getUserById(
    id: Stratego.STS.Utils.UUID,
  ): Promise<Nullable<WithId<TUser>>> {
    return await Users.getUserByCondition({ id })
  }

  static async getUserIconById(
    id: Stratego.STS.Utils.UUID,
  ): Promise<NullableUnset<TUserProfile['icon']>> {
    const user = await Users.getUserById(id)

    if (user) return user.settings.profile.icon

    return null
  }

  static async getUserByEmail(
    email: Stratego.STS.Auth.Email,
  ): Promise<Nullable<WithId<TUser>>> {
    return await Users.getUserByCondition({ email })
  }

  static async compareCredentials(
    credentials: Stratego.STS.Auth.Credentials,
  ): Promise<UserCredentialsValidationResult> {
    const user = await Users.getUserByEmail(credentials.email)

    if (!user) return UserCredentialsValidationResult.INEXISTENT

    if (user.status === AccountStatus.Inactive)
      return UserCredentialsValidationResult.LOCKED

    if (user && user.settings.security.accessKey === credentials.password)
      return UserCredentialsValidationResult.SUCCESS

    return UserCredentialsValidationResult.FAILED
  }

  static async update(
    userId: Stratego.STS.Utils.UUID,
    data: Partial<TUser>,
  ): Promise<boolean> {
    const user = await Users.getUserById(userId)

    if (!user) return false

    const connection = await Connector.connect()

    if (!connection) return false

    const { _id: userDocumentId } = user

    const updateResult = await connection
      .collection<TUser>(COLLECTION)
      .updateOne(
        {
          _id: userDocumentId,
        },
        {
          $set: {
            ...data,
            updatedAt: getUnixTime(new Date()),
          },
        },
      )

    return updateResult.modifiedCount > 0
  }

  static async updateProfile(
    userId: Stratego.STS.Utils.UUID,
    profile: TUserProfile,
  ): Promise<Unset<TUserProfile>> {
    let result: Unset<TUserProfile>

    const user = await Users.getUserById(userId)

    if (!user) return result

    const connection = await Connector.connect()

    if (!connection) return result

    const { _id: userDocumentId } = user

    const updateResult = await connection
      .collection<TUser>(COLLECTION)
      .updateOne(
        {
          _id: userDocumentId,
        },
        {
          $set: {
            'settings.profile': profile,
            updatedAt: getUnixTime(new Date()),
          },
        },
      )

    result = updateResult.modifiedCount > 0 ? profile : undefined

    return result
  }

  static async updateSecurity(
    userId: Stratego.STS.Utils.UUID,
    security: TUserSecurity,
  ): Promise<Unset<TUserSecurity>> {
    let result: Unset<TUserSecurity>

    const user = await Users.getUserById(userId)

    if (!user) return result

    const connection = await Connector.connect()

    if (!connection) return result

    const { _id: userDocumentId } = user

    const updateResult = await connection
      .collection<TUser>(COLLECTION)
      .updateOne(
        {
          _id: userDocumentId,
        },
        {
          $set: {
            'settings.security': security,
            updatedAt: getUnixTime(new Date()),
          },
        },
      )

    result = updateResult.modifiedCount > 0 ? security : undefined

    return result
  }

  static async updatePassword(
    userId: Stratego.STS.Utils.UUID,
    password: Stratego.STS.Auth.HashedPassword,
  ): Promise<boolean> {
    let result = false

    const user = await Users.getUserById(userId)

    if (!user) return result

    const connection = await Connector.connect()

    if (!connection) return result

    const { _id: userDocumentId } = user

    const updateResult = await connection
      .collection<TUser>(COLLECTION)
      .updateOne(
        {
          _id: userDocumentId,
        },
        {
          $set: {
            'settings.security.accessKey': password,
            updatedAt: getUnixTime(new Date()),
          },
        },
      )

    result = updateResult.modifiedCount > 0

    return result
  }

  static async activateTOTP(userId: Stratego.STS.Utils.UUID) {
    const user = await Users.getUserById(userId)

    if (!user) return false

    const { _id: userDocumentId } = user

    const connection = await Connector.connect()

    if (!connection) return false

    const updateResult = await connection
      .collection<TUser>(COLLECTION)
      .updateOne(
        {
          _id: userDocumentId,
        },
        {
          $set: {
            'settings.security.mfa.totp.status': OTPStatus.Active,
            'settings.security.mfa.totp.activatedAt': getUnixTime(new Date()),
            updatedAt: getUnixTime(new Date()),
          },
        },
      )

    return updateResult.modifiedCount > 0
  }

  static async getTOTP(userId: Stratego.STS.Utils.UUID) {
    const user = await Users.getUserById(userId)

    if (!user) return undefined

    return user?.settings?.security?.mfa?.totp
  }

  static async validateTOTPToken(
    userId: Stratego.STS.Utils.UUID,
    token: string,
  ): Promise<[isValid: boolean, currentRef: Unset<string>]> {
    const currentPartialConfig = await Users.getTOTP(userId)

    if (!currentPartialConfig) return [false, undefined]

    const secret = decryptRef(currentPartialConfig.ref)

    const isValid = authenticator.verify({
      secret,
      token,
    })

    return [isValid, currentPartialConfig.ref]
  }

  static async consumeRecoveryKey(
    userId: Stratego.STS.Utils.UUID,
    rawKey: string,
  ) {
    const currentPartialConfig = await Users.getTOTP(userId)

    if (currentPartialConfig) {
      const savedRecoveryKeys = [...currentPartialConfig.recoveryKeys]

      for (const [index, recoveryKey] of savedRecoveryKeys.map(
        ($recoveryKey, $index) =>
          [$index, $recoveryKey] as [
            index: number,
            recoveryKey: Flatten<TUserTOTP['recoveryKeys']>,
          ],
      )) {
        if (recoveryKey.status === RecoveryTokenStatus.Used) continue

        const hash = getHash(rawKey)

        const decryptedSignature = Base32.decode(
          decryptRef(recoveryKey.signature),
        )

        if (decryptedSignature === hash) {
          savedRecoveryKeys.splice(index, 1, {
            ...recoveryKey,
            status: RecoveryTokenStatus.Used,
            usedAt: getUnixTime(new Date()),
          })

          const user = await Users.getUserById(userId)

          if (!user) return false

          const connection = await Connector.connect()

          if (!connection) return false

          const { _id: userDocumentId } = user

          const updateResult = await connection
            .collection<TUser>(COLLECTION)
            .updateOne(
              {
                _id: userDocumentId,
              },
              {
                $set: {
                  'settings.security.mfa.totp.recoveryKeys': savedRecoveryKeys,
                  updatedAt: getUnixTime(new Date()),
                },
              },
            )

          return updateResult.modifiedCount > 0
        } else continue
      }
    }

    return false
  }

  static async registerTOTP(
    userId: Stratego.STS.Utils.UUID,
    config: TUserTOTP,
  ) {
    const user = await Users.getUserById(userId)

    if (!user) return false

    const { _id: userDocumentId } = user

    if (!UserTOTPSchema.validate(config)) return false

    const connection = await Connector.connect()

    if (!connection) return false

    const updateResult = await connection
      .collection<TUser>(COLLECTION)
      .updateOne(
        {
          _id: userDocumentId,
        },
        {
          $set: {
            'settings.security.mfa.totp': config,
            updatedAt: getUnixTime(new Date()),
          },
        },
      )

    return updateResult.modifiedCount > 0
  }

  static async registerLoginAttempt(
    userId: Stratego.STS.Utils.UUID,
    attempt: TUserAccessAttempt,
  ) {
    const user = await Users.getUserById(userId)

    if (!user) return false

    const connection = await Connector.connect()

    if (!connection) return false

    const { _id: userDocumentId } = user

    const updateResult = await connection
      .collection<TUser>(COLLECTION)
      .updateOne(
        {
          _id: userDocumentId,
        },
        {
          $push: {
            accessAttempts: attempt,
          },
        },
      )

    return updateResult.modifiedCount > 0
  }

  static async createAccessToken(
    userId: Stratego.STS.Utils.UUID,
    config?: {
      salt?: string
    },
  ) {
    const user = await Users.getUserById(userId)

    if (!user) return null

    const [rawToken, hashedToken] = createToken({
      salt: config?.salt,
    })

    const connection = await Connector.connect()

    if (!connection) return null

    const { _id: userDocumentId } = user

    const updateResult = await connection
      .collection<TUser>(COLLECTION)
      .updateOne(
        {
          _id: userDocumentId,
        },
        {
          $push: {
            accessTokens: {
              hash: hashedToken,
              status: AccessTokenStatus.Active,
              type: AccessTokenType.None,
              createdAt: getUnixTime(new Date()),
            } as TUserAccessToken,
          },
        },
      )

    return updateResult.modifiedCount > 0 ? rawToken : null
  }

  static async updateAccessToken(
    userId: Stratego.STS.Utils.UUID,
    rawToken: string,
    config?: {
      status?: AccessTokenStatus
      type?: AccessTokenType
    },
  ) {
    const user = await Users.getUserById(userId)

    if (!user) return false

    const connection = await Connector.connect()

    if (!connection) return false

    const { _id: userDocumentId } = user

    const hash = hashToken(rawToken)

    const updateResult = await connection
      .collection<TUser>(COLLECTION)
      .updateOne(
        {
          _id: userDocumentId,
          'accessTokens.hash': hash,
        },
        {
          $set: {
            'settings.security.accessTokens.$.status': config?.status,
            'settings.security.accessTokens.$.type': config?.type,
            'settings.security.accessTokens.$.updatedAt': getUnixTime(
              new Date(),
            ),
          },
        },
        {
          ignoreUndefined: true,
        },
      )

    return updateResult.modifiedCount > 0
  }
}
