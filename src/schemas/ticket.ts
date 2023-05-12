import { TicketStatus } from '@stratego-sts/lib/enumerators'
import { createSchema, type Infer } from '@swind/schema'
import type { SerializedEditorState, SerializedLexicalNode } from 'lexical'

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
  id: 'string',
  content: 'record?',
  author: 'string',
  /**
   * Unix timestamp
   */
  createdAt: 'int',
} as const)

export type TTicketComment = Infer<typeof ticketCommentSchema>

export const ticketSchema = createSchema({
  id: 'string',
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
> = Omit<T, 'versions' | 'comments'> & {
  versions: Array<
    Omit<TTicketDescriptor, 'description'> & {
      description?: SerializedEditorState<SerializedLexicalNode>
    }
  >
  comments: Array<
    Omit<TTicketComment, 'content'> & {
      content?: SerializedEditorState<SerializedLexicalNode>
    }
  >
}
