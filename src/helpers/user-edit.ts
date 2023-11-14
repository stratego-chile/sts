import type { TEditableUser, TUser } from '@/schemas/user'
import type { OptionalId, WithId } from 'mongodb/mongodb' // mongodb.d.ts allows client-side usage

export function filteredUserParameters<
  K = keyof Omit<
    OptionalId<WithId<TUser>>,
    keyof OptionalId<WithId<TEditableUser>>
  >,
>() {
  return Object.freeze([
    '_id',
    'id',
    'createdAt',
    'updatedAt',
    'accessAttempts',
    'settings',
  ] as Array<K>)
}
