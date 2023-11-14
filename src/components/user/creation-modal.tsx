'use client'

import type { TUser } from '@/schemas/user'
import { Dialog, Transition } from '@headlessui/react'
import dynamic from 'next/dynamic'
import { Fragment, Suspense, useMemo, useRef } from 'react'

type UserCreationModalProps = {
  open?: boolean
  onClose?: () => void
  parentId?: Stratego.STS.Utils.UUID
  selectableParentUsers?: Array<TUser>
}

const UserCreationForm = dynamic(
  () => import('@/components/user/creation-form'),
)

const UserCreationModal = ({
  open,
  onClose,
  parentId,
  selectableParentUsers: $selectableParentUsers,
}: UserCreationModalProps) => {
  const closeButtonRef = useRef<HTMLElement>(null)

  const selectableParentUsers = useMemo(
    () =>
      parentId
        ? $selectableParentUsers?.filter(({ id }) => id === parentId)
        : $selectableParentUsers,
    [$selectableParentUsers, parentId],
  )

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={closeButtonRef}
        onClose={() => onClose?.()}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-full lg:max-w-2xl">
                <Suspense>
                  <UserCreationForm
                    parentId={parentId}
                    selectableParentUsers={selectableParentUsers?.map(
                      ({
                        id,
                        settings: {
                          profile: { firstName, lastName },
                        },
                      }) => ({
                        id,
                        name: `${firstName} ${lastName}`,
                      }),
                    )}
                    onCancel={() => onClose?.()}
                    onSubmit={() => onClose?.()}
                  />
                </Suspense>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default UserCreationModal
