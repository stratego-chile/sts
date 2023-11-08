'use client'

import { Fragment, useRef } from 'react'
import { Dialog, Transition } from '@headlessui/react'

type ImageRemovalModalProps = {
  open?: boolean
  onConfirmation?: (remove?: boolean) => void
}

const ImageRemovalModal = ({
  open,
  onConfirmation,
}: ImageRemovalModalProps) => {
  const closeButtonRef = useRef<HTMLElement>(null)

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={closeButtonRef}
        onClose={() => onConfirmation?.()}
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-gray-900"
                      >
                        Are you sure you want to remove this image?
                      </Dialog.Title>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row-reverse lg:flex-row lg:justify-end gap-2 lg:gap-0 px-6 py-3 lg:px-4 bg-gray-50">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                    onClick={() => onConfirmation?.(true)}
                  >
                    Proceed
                  </button>

                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-gray-300 px-3 py-2 text-sm font-semibold shadow-sm hover:bg-gray-400 sm:ml-3 sm:w-auto"
                    onClick={() => onConfirmation?.(false)}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default ImageRemovalModal
