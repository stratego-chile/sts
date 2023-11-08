import type { ProjectStatus } from '@/schemas/project'
import type { TicketPriority, TicketStatus } from '@/schemas/ticket'
import type { AccountRole, AccountStatus } from '@/schemas/user'
import chroma from 'chroma-js'

export const projectStatusColors: Record<ProjectStatus, string> = {
  active: chroma('royalblue').hex(),
  closed: chroma('lightgray').hex(),
  draft: chroma('brown').hex(),
}

export const ticketStatusColors: Record<TicketStatus, string> = {
  closed: chroma('indianred').hex(),
  draft: chroma('lightgray').hex(),
  open: chroma('royalblue').hex(),
  resolved: chroma('mediumseagreen').desaturate(0.4).hex(),
}

export const ticketPriorityColors: Record<TicketPriority, string> = {
  critical: chroma('firebrick').hex(),
  high: chroma('indianred').hex(),
  medium: chroma('goldenrod').hex(),
  low: chroma('lightblue').hex(),
}

export const userStatusColors: Record<AccountStatus, string> = {
  active: chroma('royalblue').hex(),
  inactive: chroma('lightgray').hex(),
}

export const userRoleColors: Record<AccountRole, string> = {
  admin: chroma('lightblue').hex(),
  auditor: chroma('lightgray').hex(),
  client: chroma('green').hex(),
  clientPeer: chroma('lime').hex(),
}
