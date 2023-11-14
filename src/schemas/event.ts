import { createSchema, type Infer } from '@powership/schema'
import type { Merge } from 'type-fest'

export enum AccountEventStatus {
  Read = 'read',
  Unread = 'unread',
}

export enum AccountEventType {
  Welcome = 'welcome',
  AccountCreation = 'accountCreation',
  AccountDeletion = 'accountDeletion',
  AccountPasswordChange = 'accountPasswordChange',
  AccountMFASetup = 'accountMFASetup',
  AccountMFAStatusChange = 'accountMFAStatusChange',
  ProjectCreation = 'projectCreation',
  ProjectStatusChange = 'projectStatusChange',
  TicketCreation = 'ticketCreation',
  TicketAssignment = 'ticketAssignment',
  TicketStatusChange = 'ticketStatusChange',
  TicketComment = 'ticketComment',
}

export enum ContentRefPrefix {
  Key = 'key',
  Raw = 'raw',
  Blob = 'blob',
}

export type ContentRef = `${ContentRefPrefix}::${string}`

export const EventLinkSchema = createSchema({
  url: 'string',
  label: 'string?',
} as const)

export type TEventLink = Infer<typeof EventLinkSchema>

export const EventSchema = createSchema({
  id: 'ID',
  owner: 'string',
  type: {
    enum: Object.values(AccountEventType),
  },
  status: {
    enum: Object.values(AccountEventStatus),
  },
  contentRef: 'string',
  links: {
    type: EventLinkSchema,
    list: true,
    optional: true,
  },
  createdAt: 'int',
  updatedAt: 'int',
} as const)

export type TEvent = Merge<
  Infer<typeof EventSchema>,
  {
    id: Stratego.STS.Utils.UUID
    contentRef: ContentRef
  }
>
