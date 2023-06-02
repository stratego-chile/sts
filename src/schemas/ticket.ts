import { TicketStatus } from '@/lib/enumerators'
import type { SerializedEditorState, SerializedLexicalNode } from 'lexical'
import { createSchema, type Infer } from 'solarwind'

export const ticketDescriptorSchema = createSchema({
  title: 'string',
  description: 'record?',
  status: {
    enum: Object.values(TicketStatus),
  },
  /**
   * Unix timestamp
   */
  createdAt: 'int',
} as const)

export type TTicketDescriptor = Infer<typeof ticketDescriptorSchema>

export const ticketCommentSchema = createSchema({
  id: 'ID',
  content: 'record?',
  author: 'string',
  /**
   * Unix timestamp
   */
  createdAt: 'int',
} as const)

export type TTicketComment = Infer<typeof ticketCommentSchema>

export const ticketSchema = createSchema({
  id: 'ID',
  versions: {
    type: ticketDescriptorSchema,
    list: true,
  },
  comments: {
    type: ticketCommentSchema,
    list: true,
  },
} as const)

export type TTicket<
  T extends Infer<typeof ticketSchema> = Infer<typeof ticketSchema>
> = Extend<
  Omit<T, 'versions' | 'comments'>,
  {
    versions: Array<
      Extend<
        Omit<TTicketDescriptor, 'description'>,
        {
          description?: SerializedEditorState<SerializedLexicalNode>
        }
      >
    >
    comments: Array<
      Extend<
        Omit<TTicketComment, 'content'>,
        {
          content?: SerializedEditorState<SerializedLexicalNode>
        }
      >
    >
  }
>
