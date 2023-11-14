import { createSchema, type Infer } from '@powership/schema'
import type { Merge } from 'type-fest'

export enum AccountRole {
  /**
   * STS platform admin role.
   */
  Admin = 'admin',
  /**
   * A read only user
   */
  Auditor = 'auditor',
  /**
   * A basic client account
   */
  Client = 'client',
  /**
   * A client sub-account role. LImited to a single parent (client) account
   */
  ClientPeer = 'clientPeer',
}

export enum AccountStatus {
  Active = 'active',
  Inactive = 'inactive',
}

export enum AccountSpecsVersion {
  Default = '1.0',
  '1.0' = '1.0',
}

export enum Permission {
  write = 'write',
  read = 'read',
}

export enum IconType {
  None = 'none',
  Color = 'color',
  Image = 'url',
}

export enum OTPStatus {
  Active = 'active',
  Inactive = 'inactive',
}

export enum RecoveryTokenStatus {
  Active = 'active',
  Used = 'used',
  Invalid = 'invalid',
}

export enum AccessTokenType {
  None = 'none',
  ReadOnly = 'readOnly',
  ReadWrite = 'readWrite',
  FullAccess = 'fullAccess',
}

export enum AccessTokenStatus {
  Active = 'active',
  Inactive = 'inactive',
}

export const UserProfileIconSchema = createSchema({
  /**
   * Base64 data url of an image
   */
  url: 'string?',
  color: 'string?',
  prefer: {
    enum: Object.values(IconType),
    optional: true,
  },
} as const)

export type TUserProfileIcon = Infer<typeof UserProfileIconSchema>

export const UserProfileSchema = createSchema({
  icon: {
    type: UserProfileIconSchema,
    optional: true,
  },
  firstName: {
    string: {
      min: 1,
      max: 50,
    },
  },
  lastName: {
    string: {
      min: 1,
      max: 50,
    },
  },
  alias: {
    string: {
      min: 1,
      max: 25,
    },
    optional: true,
  },
} as const)

export type TUserProfile = Infer<typeof UserProfileSchema>

export const UserNotificationsSchema = createSchema({
  email: 'boolean?',
  inApp: 'boolean?',
} as const)

export type TUserNotifications = Infer<typeof UserNotificationsSchema>

export const UserCredentialsSchema = createSchema({
  email: 'email',
  password: 'string',
})

export const UserTOTPSchema = createSchema({
  /**
   * Encrypted secret for the current user when setting up TOTP
   */
  ref: 'string',
  status: {
    enum: Object.values(OTPStatus),
  },
  requestedAt: 'int',
  activatedAt: 'int?',
  recoveryKeys: {
    object: {
      signature: 'string',
      status: {
        enum: Object.values(RecoveryTokenStatus),
      },
      createdAt: 'int',
      usedAt: 'int?',
    },
    list: true,
  },
} as const)

export type TUserTOTP = Infer<typeof UserTOTPSchema>

export const UserMFASchema = createSchema({
  totp: {
    type: UserTOTPSchema,
  },
} as const)

export type TUserMFA = Infer<typeof UserMFASchema>

export const UserAccessTokenSchema = createSchema({
  hash: 'string',
  status: {
    enum: Object.values(AccessTokenStatus),
  },
  type: {
    enum: Object.values(AccessTokenType),
  },
  createdAt: 'int',
  usedAt: 'int?',
} as const)

export type TUserAccessToken = Infer<typeof UserAccessTokenSchema>

export const UserSecuritySchema = createSchema({
  accessKey: 'string',
  mfa: {
    type: UserMFASchema,
    optional: true,
  },
  accessTokens: {
    type: UserAccessTokenSchema,
    list: true,
    optional: true,
  },
} as const)

export type TUserSecurity = Infer<typeof UserSecuritySchema>

export const UserSettingsSchema = createSchema({
  profile: {
    type: UserProfileSchema,
  },
  notifications: {
    type: UserNotificationsSchema,
  },
  security: {
    type: UserSecuritySchema,
  },
} as const)

export type TUserSettings = Infer<typeof UserSettingsSchema>

export const UserAccountSpecsSchema = createSchema({
  version: {
    enum: Object.values(AccountSpecsVersion),
    defaultValue: AccountSpecsVersion.Default,
  },
  allowedProjects: 'int?',
  allowedMembers: 'int?',
  allowedTickets: 'int?',
} as const)

export type TUserAccountSpecs = Infer<typeof UserAccountSpecsSchema>

export const UserAccessAttemptSchema = createSchema({
  origin: {
    type: 'object',
    def: {
      ip: 'string?',
      geolocation: 'string?',
    },
    optional: true,
  },
  userAgent: 'string?',
  fingerprint: 'string?',
  successful: 'boolean?',
  timestamp: 'int',
  success: 'boolean?',
} as const)

export type TUserAccessAttempt = Infer<typeof UserAccessAttemptSchema>

export const EditableUserSchema = createSchema({
  parentId: 'ID?',
  email: 'email',
  accountSpecs: {
    type: UserAccountSpecsSchema,
    optional: true,
  },
  status: {
    enum: Object.values(AccountStatus),
  },
  role: {
    enum: Object.values(AccountRole),
  },
})

export type TEditableUser = Merge<
  Infer<typeof EditableUserSchema>,
  {
    parentId?: Stratego.STS.Utils.UUID
    email: Stratego.STS.Auth.Email
  }
>

export const UserSchema = createSchema({
  ...EditableUserSchema.definition,
  id: 'ID',
  settings: {
    type: UserSettingsSchema,
  },
  accessAttempts: {
    type: UserAccessAttemptSchema,
    optional: true,
    list: true,
  },
  /**
   * Unix timestamp
   */
  createdAt: 'int',
  /**
   * Unix timestamp
   */
  updatedAt: 'int',
})

export type TUser = Merge<
  Merge<
    Infer<typeof UserSchema>,
    {
      id: Stratego.STS.Utils.UUID
    }
  >,
  TEditableUser
>
