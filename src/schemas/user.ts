import { AccountRole, AccountStatus, IconType } from '@/lib/enumerators'
import { createSchema, type Infer } from 'solarwind'

const userProfileIconSchema = createSchema({
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

export type TUserProfileIcon = Infer<typeof userProfileIconSchema>

export const userProfileSchema = createSchema({
  icon: {
    type: userProfileIconSchema,
    optional: true,
  },
  firstName: 'string',
  lastName: 'string',
  alias: 'string?',
} as const)

export type TUserProfile = Infer<typeof userProfileSchema>

export const userNotificationsSchema = createSchema({
  email: 'boolean?',
  inApp: 'boolean?',
} as const)

export type TUserNotifications = Infer<typeof userNotificationsSchema>

export const userSecuritySchema = createSchema({
  accessKey: 'string',
  accessTokens: {
    object: {
      label: 'string',
      value: 'string',
    },
    optional: true,
    list: true,
  },
} as const)

export type TUserSecurity = Infer<typeof userSecuritySchema>

export const userSettingsSchema = createSchema({
  profile: {
    type: userProfileSchema,
  },
  notifications: {
    type: userNotificationsSchema,
  },
  security: {
    type: userSecuritySchema,
  },
} as const)

export type TUserSettings = Infer<typeof userSettingsSchema>

export const userSchema = createSchema({
  id: 'ID',
  email: 'email',
  parentId: 'ID?',
  settings: {
    type: userSettingsSchema,
  },
  status: {
    enum: Object.values(AccountStatus),
  },
  role: {
    enum: Object.values(AccountRole),
  },
  /**
   * Unix timestamp
   */
  createdAt: 'int',
  /**
   * Unix timestamp
   */
  updatedAt: 'int',
} as const)

export type TUser = Extend<
  Omit<Infer<typeof userSchema>, 'id' | 'parentId'>,
  {
    id: Stratego.STS.Utils.UUID
    email: Stratego.STS.Auth.Email
    parentId?: Stratego.STS.Utils.UUID
  }
>
