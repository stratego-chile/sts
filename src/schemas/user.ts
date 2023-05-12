import { AccountRole, AccountStatus } from '@stratego-sts/lib/enumerators'
import { createSchema, type Infer } from '@swind/schema'

const userProfileIconSchema = createSchema({
  /**
   * Base64 data url of an image
   */
  url: 'string?',
  color: 'string?',
})

export const userProfileSchema = createSchema({
  icon: {
    type: userProfileIconSchema,
    optional: true,
  },
  firstName: 'string',
  lastName: 'string',
  alias: 'string?',
})

export type TUserProfile = Infer<typeof userProfileSchema>

export const userNotificationsSchema = createSchema({
  email: 'boolean',
} as const)

export type TUserNotifications = Infer<typeof userNotificationsSchema>

export const userSecuritySchema = createSchema({
  accessKey: 'string',
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
  parentId: 'string?',
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

export type TUser = Infer<typeof userSchema>
