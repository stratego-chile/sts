import { ProjectStatus } from '@stratego-sts/lib/enumerators'
import { ticketSchema } from '@stratego-sts/schemas/ticket'
import { createSchema, type Infer } from '@swind/schema'

const projectIconSchema = createSchema({
  url: 'string?',
  color: 'string?',
} as const)

export const projectSchema = createSchema({
  id: 'ID',
  ownerId: 'string',
  name: 'string',
  description: 'string?',
  icon: {
    type: projectIconSchema,
    optional: true,
  },
  status: {
    enum: Object.values(ProjectStatus),
  },
  tickets: {
    type: ticketSchema,
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
} as const)

export type TProject = Infer<typeof projectSchema>
