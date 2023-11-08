'use client'

import IdSelector from '@/components/misc/id-selector'
import { settingsLinks, settingsQuickActions } from '@/helpers/navigation-links'
import { fetcher } from '@/lib/fetcher'
import type { TUser } from '@/schemas/user'
import { Popover, Transition } from '@headlessui/react'
import capitalize from '@stdlib/string/capitalize'
import classNames from 'classnames'
import Link from 'next/link'
import { Fragment } from 'react'
import useSWR from 'swr'

const Menu = () => {
  const { data: user } = useSWR<TUser>('/api/session/user', fetcher)

  return (
    <Transition
      as={Fragment}
      enter="transition ease-out duration-200"
      enterFrom="opacity-0 translate-y-1"
      enterTo="opacity-100 translate-y-0"
      leave="transition ease-in duration-150"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 translate-y-1"
    >
      <Popover.Panel
        className={classNames(
          'absolute -right-0 top-full z-20 mt-3 w-screen max-w-md overflow-hidden rounded-lg',
          'bg-white shadow-lg ring-1 ring-gray-900/5',
        )}
      >
        {user && (
          <div className="flex flex-col px-8 py-4 gap-4 bg-gray-50 text-sm">
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

            <IdSelector id={user.id} label="User ID" labelTerminationChar="" />
          </div>
        )}

        <div className="p-4">
          {settingsLinks.map((item, key) => (
            <div
              key={key}
              className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-gray-50"
            >
              <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                <item.icon
                  className="h-6 w-6 text-gray-600 group-hover:text-blue-600"
                  aria-hidden="true"
                />
              </div>

              <div className="flex-auto">
                <Link
                  href={item.href}
                  className="block font-semibold text-gray-900"
                  onFocus={(e) => e.target.blur()}
                >
                  {capitalize(item.name)}
                  <span className="absolute inset-0" />
                </Link>

                <p className="mt-1 text-gray-600">{item.description}</p>
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
                target={item.newTab ? '_blank' : '_self'}
              >
                <item.icon
                  className="h-5 w-5 flex-none text-gray-400"
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ),
          )}
        </div>
      </Popover.Panel>
    </Transition>
  )
}

export default Menu
