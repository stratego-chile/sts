import type { ActionMenuProps } from '@/components/misc/action-menu'
import { AccountRole } from '@/schemas/user'
import MagnifyingGlassIcon from '@heroicons/react/20/solid/MagnifyingGlassIcon'
import PencilIcon from '@heroicons/react/20/solid/PencilIcon'
import PlusIcon from '@heroicons/react/20/solid/PlusIcon'
import ViewfinderCircleIcon from '@heroicons/react/20/solid/ViewfinderCircleIcon'
import XMarkIcon from '@heroicons/react/20/solid/XMarkIcon'

export enum ActionMode {
  Create = 'create',
  View = 'view',
  Edit = 'edit',
}

type FactoryConfig = {
  id: Stratego.STS.Utils.UUID
  parentId?: Stratego.STS.Utils.UUID
  role: AccountRole
  onUserActionSelect: (id: Stratego.STS.Utils.UUID, mode: ActionMode) => void
}

export function optionsFactory({
  id,
  parentId,
  role,
  onUserActionSelect,
}: FactoryConfig) {
  const options = new Array<NonNullable<Flatten<ActionMenuProps['options']>>>()

  if (role === AccountRole.Client)
    options.push({
      content: (
        <section className="inline-flex gap-2 items-center">
          <PlusIcon className="h-4 w-4" aria-hidden="true" />

          <span>Add peer user</span>
        </section>
      ),
      action: () => onUserActionSelect(id, ActionMode.Create),
    })

  if (parentId)
    options.push({
      content: (
        <section className="inline-flex gap-2 items-center">
          <ViewfinderCircleIcon className="h-4 w-4 p-0.5" aria-hidden="true" />

          <span>View parent account details</span>
        </section>
      ),
      action: () => onUserActionSelect(parentId, ActionMode.View),
    })

  options.push(
    {
      content: (
        <section className="inline-flex gap-2 items-center">
          <MagnifyingGlassIcon className="h-4 w-4 p-0.5" aria-hidden="true" />

          <span>View details</span>
        </section>
      ),
      action: () => onUserActionSelect(id, ActionMode.View),
    },
    {
      content: (
        <section className="inline-flex gap-2 items-center">
          <PencilIcon className="h-4 w-4 p-0.5" aria-hidden="true" />

          <span>Edit user profile</span>
        </section>
      ),
      action: () => onUserActionSelect(id, ActionMode.Edit),
    },
    {
      content: (
        <section className="inline-flex gap-2 items-center">
          <XMarkIcon className="h-4 w-4" aria-hidden="true" />

          <span>Delete</span>
        </section>
      ),
      action: () => void 0,
    },
  )

  return options
}
