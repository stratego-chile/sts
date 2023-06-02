import { ProjectStatus } from '@/lib/enumerators'
import { ticketSchema } from '@/schemas/ticket'
import { createSchema, type Infer } from 'solarwind'

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

export type TProject = Extend<
  Omit<Infer<typeof projectSchema>, 'id' | 'ownerId'>,
  {
    id: Stratego.STS.Utils.UUID
    ownerId: Stratego.STS.Utils.UUID
  }
>
