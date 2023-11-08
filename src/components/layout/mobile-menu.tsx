'use client'

import {
  settingsLinks,
  settingsQuickActions,
  type NavigationLinkConfig,
} from '@/helpers/navigation-links'
import { fetcher } from '@/lib/fetcher'
import type { TUser } from '@/schemas/user'
import { Dialog, Disclosure, Transition } from '@headlessui/react'
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon'
import ChevronDownIcon from '@heroicons/react/24/solid/ChevronDownIcon'
import capitalize from '@stdlib/string/capitalize'
import classNames from 'classnames'
import Image from 'next/image'
import Link from 'next/link'
import { Fragment } from 'react'
import useSWR from 'swr'

type MobileMenuProps = {
  links: Array<NavigationLinkConfig>
  open?: boolean
  onClose?: () => void
}

const MobileMenu = ({ links, open, onClose }: MobileMenuProps) => {
  const { data: user } = useSWR<TUser>('/api/session/user', fetcher)

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="lg:hidden" onClose={() => onClose?.()}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 z-10" />
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Dialog.Panel className="fixed inset-y-0 right-0 z-20 w-full overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link href="#" className="-m-1.5 p-1.5">
                <span className="sr-only">{process.env.BRAND_NAME}</span>

                <Image
                  className="h-8 w-auto"
                  src="/images/brand/logo.svg"
                  height={48}
                  width={48}
                  alt={process.env.BRAND_NAME}
                />
              </Link>

              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={() => onClose?.()}
              >
                <span className="sr-only">Close menu</span>

                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-6 flow-root">
              <div className="-my-6 pt-4">
                <div className="py-2">
                  <Disclosure as="div" className="-mx-3">
                    {({ open: $open }) => (
                      <Fragment>
                        <Disclosure.Button
                          className={classNames(
                            'flex w-full items-center justify-between py-2 pl-3 pr-3.5',
                            'text-base font-semibold leading-7',
                            'transition-colors duration-100 ease-in-out',
                            $open
                              ? 'rounded-t-lg bg-gray-200'
                              : 'rounded-lg bg-gray-100',
                          )}
                        >
                          {user && (
                            <div className="flex flex-col text-sm">
                              <section className="flex flex-col gap-1">
                                <span className="inline-flex gap-1">
                                  {[
                                    user.settings.profile.firstName,
                                    user.settings.profile.lastName,
                                  ].map((fragment, key) => (
                                    <span key={key}>{fragment}</span>
                                  ))}

                                  {user.settings.profile.alias && (
                                    <span className="text-gray-500">
                                      ({user.settings.profile.alias})
                                    </span>
                                  )}
                                </span>

                                <span className="inline-flex text-gray-600">
                                  {user.email as string}
                                </span>
                              </section>
                            </div>
                          )}

                          <ChevronDownIcon
                            className={classNames(
                              'flex-none h-5 w-5 transition-transform duration-150 ease-in-out',
                              $open ? 'rotate-180' : '',
                            )}
                            aria-hidden="true"
                          />
                        </Disclosure.Button>

                        <Disclosure.Panel className="space-y-2 rounded-b-lg bg-gray-100">
                          {[...settingsLinks, ...settingsQuickActions].map(
                            (item, key) => (
                              <Disclosure.Button
                                key={key}
                                as="a"
                                href={item.href}
                                className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                              >
                                {capitalize(item.name)}
                              </Disclosure.Button>
                            ),
                          )}
                        </Disclosure.Panel>
                      </Fragment>
                    )}
                  </Disclosure>
                </div>

                <div className="space-y-2">
                  {links.map((item, key) => (
                    <Link
                      key={key}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    >
                      {capitalize(item.name)}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  )
}

export default MobileMenu
