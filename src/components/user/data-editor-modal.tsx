'use client'

import Spinner from '@/components/misc/spinner'
import { Dialog, Transition } from '@headlessui/react'
import classNames from 'classnames'
import dynamic from 'next/dynamic'
import { Fragment, Suspense } from 'react'

const UserDataEditor = dynamic(() => import('@/components/user/data-editor'))

type UserDataEditorModalProps = {
  open?: boolean
  mode?: 'edit' | 'view'
  userId: Stratego.STS.Utils.UUID
  onExit?: (remove?: boolean) => void
}

const UserDataEditorModal = ({
  open,
  mode = 'view',
  userId,
  onExit,
}: UserDataEditorModalProps) => {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={() => void 0}
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
          <section className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className={classNames(
                  'relative sm:my-8 w-full lg:mx-16 rounded-lg text-left bg-white shadow-xl',
                  'transform overflow-hidden transition-all',
                )}
              >
                <div className="bg-white p-4 w-full">
                  <Suspense
                    fallback={
                      <span className="flex w-full justify-center">
                        <Spinner />
                      </span>
                    }
                  >
                    <UserDataEditor
                      userId={userId}
                      mode={mode}
                      onExit={onExit}
                    />
                  </Suspense>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </section>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default UserDataEditorModal
