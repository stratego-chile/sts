import { AccountRole } from '@/schemas/user'

export const maintainerRoles = Object.freeze([
  AccountRole.Admin,
  AccountRole.Auditor,
])

export const clientRoles = Object.freeze([
  AccountRole.Client,
  AccountRole.ClientPeer,
])
