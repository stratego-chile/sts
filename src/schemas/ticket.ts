import { createSchema, type Infer } from '@powership/schema'
import type { SerializedEditorState, SerializedLexicalNode } from 'lexical'
import type { Merge } from 'type-fest'

export enum TicketResponsibleType {
  Creator = 'creator',
  Supporter = 'supporter',
  Auditor = 'auditor',
}

export enum TicketStatus {
  Draft = 'draft',
  Open = 'open',
  Closed = 'closed',
  Resolved = 'resolved',
}

export enum TicketPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical',
}

export const TicketVersionSchema = createSchema({
  title: 'string',
  description: 'record?',
  priority: {
    enum: Object.values(TicketPriority),
    optional: true,
  },
  status: {
    enum: Object.values(TicketStatus),
  },
  /**
   * Unix timestamp
   */
  createdAt: 'int',
} as const)

export type TTicketVersion = Merge<
  Infer<typeof TicketVersionSchema>,
  {
    description?: Stringified<SerializedEditorState<SerializedLexicalNode>>
  }
>

export const TicketCommentSchema = createSchema({
  id: 'ID',
  content: 'string',
  author: 'string',
  /**
   * Unix timestamp
   */
  createdAt: 'int',
} as const)

export type TTicketComment = Merge<
  Infer<typeof TicketCommentSchema>,
  {
    content?: Stringified<SerializedEditorState<SerializedLexicalNode>>
  }
>

export const TicketResponsibleSchema = createSchema({
  id: 'string',
  type: {
    enum: Object.values(TicketResponsibleType),
  },
} as const)

export type TTicketResponsible = Infer<typeof TicketResponsibleSchema>

export const TicketSchema = createSchema({
  id: 'ID',
  /**
   * Users logically responsible for the ticket.
   *
   * This array contains the creator, supporters and auditors of the ticket.
   */
  responsibles: {
    type: TicketResponsibleSchema,
    list: true,
  },
  versions: {
    type: TicketVersionSchema,
    list: true,
  },
  comments: {
    type: TicketCommentSchema,
    list: true,
  },
} as const)

export type TTicket<
  T extends Infer<typeof TicketSchema> = Infer<typeof TicketSchema>,
> = Merge<
  T,
  {
    versions: Array<
      Merge<
        TTicketVersion,
        {
          description?: Stringified<
            SerializedEditorState<SerializedLexicalNode>
          >
        }
      >
    >
    comments: Array<
      Merge<
        TTicketComment,
        {
          content?: Stringified<SerializedEditorState<SerializedLexicalNode>>
        }
      >
    >
  }
>
