import { TicketSchema } from '@/schemas/ticket'
import { createSchema, type Infer } from '@powership/schema'
import type { Spread } from 'type-fest'

export enum ProjectStatus {
  Draft = 'draft',
  Active = 'active',
  Closed = 'closed',
}

const ProjectIconSchema = createSchema({
  url: 'string?',
  color: 'string?',
} as const)

export const ProjectSchema = createSchema({
  id: 'ID',
  ownerId: 'string',
  name: 'string',
  description: 'string?',
  icon: {
    type: ProjectIconSchema,
    optional: true,
  },
  status: {
    enum: Object.values(ProjectStatus),
  },
  tickets: {
    type: TicketSchema,
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

export type TProject = Spread<
  Infer<typeof ProjectSchema>,
  {
    id: Stratego.STS.Utils.UUID
    ownerId: Stratego.STS.Utils.UUID
  }
>
