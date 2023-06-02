'use client'

import { Dialog, Disclosure, Popover, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import capitalize from '@stdlib/string/capitalize'
import {
  clientNavigationLinks,
  adminNavigationLinks,
  settingsLinks,
  settingsQuickActions,
} from '@/helpers/navigation-links'
import { AccountRole, IconType } from '@/lib/enumerators'
import { fetcher } from '@/lib/fetcher'
import type { TUser, TUserProfile } from '@/schemas/user'
import classNames from 'classnames'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { Fragment, useState } from 'react'
import useSWR from 'swr'

const UserIcon = dynamic(() => import('@/components/user/icon'))

const Cog6ToothIcon = dynamic(() =>
  import('@heroicons/react/24/outline').then((mod) => mod.Cog6ToothIcon)
)

const SessionHeader: React.FC<WithoutProps> = () => {
  const { data: profile } = useSWR<TUserProfile>(
    '/api/session/user/profile',
    fetcher
  )

  const { data: user } = useSWR<TUser>('/api/session/user', fetcher)

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <header className="bg-white">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8 lg:gap-x-8"
          aria-label="Global"
        >
          <div className="flex">
            <Link
              href={
                user?.role &&
                [AccountRole.Admin, AccountRole.Auditor].includes(user.role)
                  ? '/admin'
                  : '/account'
              }
              className="-m-1.5 p-1.5"
            >
              <span className="sr-only">{process.env.BRAND_NAME}</span>
              <Image
                className="h-8 w-auto"
                src="/images/brand/logo.svg"
                height={48}
                width={48}
                alt={process.env.BRAND_NAME}
              />
            </Link>
          </div>

          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="hidden lg:flex lg:gap-x-10">
            {(user?.role
              ? [AccountRole.Admin, AccountRole.Auditor].includes(user.role)
                ? adminNavigationLinks
                : clientNavigationLinks
              : []
            ).map((item, key) => (
              <Link
                key={key}
                href={item.href}
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <Popover className="relative">
              <Popover.Button className="flex items-center text-sm outline-none font-semibold leading-6 text-gray-900">
                {profile?.icon?.prefer !== IconType.None && profile?.icon ? (
                  <UserIcon
                    icon={profile.icon}
                    size={38}
                    sizeUnit="px"
                    userInitialLetter={profile?.firstName}
                  />
                ) : (
                  <Cog6ToothIcon
                    className="h-6 w-6 text-gray-600 group-hover:text-indigo-600"
                    aria-hidden="true"
                  />
                )}

                <ChevronDownIcon
                  className="h-5 w-5 flex-none text-gray-400"
                  aria-hidden="true"
                />
              </Popover.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel className="absolute -right-0 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5">
                  <div className="p-4">
                    {settingsLinks.map((item, key) => (
                      <div
                        key={key}
                        className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-gray-50"
                      >
                        <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                          <item.icon
                            className="h-6 w-6 text-gray-600 group-hover:text-indigo-600"
                            aria-hidden="true"
                          />
                        </div>

                        <div className="flex-auto">
                          <a
                            href={item.href}
                            className="block font-semibold text-gray-900"
                          >
                            {capitalize(item.name)}
                            <span className="absolute inset-0" />
                          </a>

                          <p className="mt-1 text-gray-600">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 divide-x divide-gray-900/5 bg-gray-50">
                    {settingsQuickActions.map((item, key) =>
                      item.action ? (
                        <button
                          key={key}
                          onClick={item.action}
                          className="flex items-center justify-center gap-x-2.5 p-3 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-100"
                        >
                          <item.icon
                            className="h-5 w-5 flex-none text-gray-400"
                            aria-hidden="true"
                          />
                          {item.name}
                        </button>
                      ) : (
                        <Link
                          key={key}
                          href={item.href}
                          className="flex items-center justify-center gap-x-2.5 p-3 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-100"
                        >
                          <item.icon
                            className="h-5 w-5 flex-none text-gray-400"
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      )
                    )}
                  </div>
                </Popover.Panel>
              </Transition>
            </Popover>
          </div>
        </nav>
        <Dialog
          as="div"
          className="lg:hidden"
          open={mobileMenuOpen}
          onClose={setMobileMenuOpen}
        >
          <div className="fixed inset-0 z-10" />

          <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
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
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>

                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {clientNavigationLinks.map((item, key) => (
                    <Link
                      key={key}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    >
                      {capitalize(item.name)}
                    </Link>
                  ))}
                </div>

                <div className="py-6">
                  <Disclosure as="div" className="-mx-3">
                    {({ open }) => (
                      <>
                        <Disclosure.Button className="flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 hover:bg-gray-50">
                          Options
                          <ChevronDownIcon
                            className={classNames(
                              open ? 'rotate-180' : '',
                              'h-5 w-5 flex-none'
                            )}
                            aria-hidden="true"
                          />
                        </Disclosure.Button>
                        <Disclosure.Panel className="mt-2 space-y-2">
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
                            )
                          )}
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </Dialog>
      </header>
    </>
  )
}

export default SessionHeader
