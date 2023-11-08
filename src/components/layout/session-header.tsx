'use client'

import {
  adminNavigationLinks,
  clientNavigationLinks,
} from '@/helpers/navigation-links'
import { maintainerRoles } from '@/helpers/roles'
import { fetcher } from '@/lib/fetcher'
import { IconType, type TUser, type TUserProfile } from '@/schemas/user'
import { Popover } from '@headlessui/react'
import Bars3Icon from '@heroicons/react/24/outline/Bars3Icon'
import BellIcon from '@heroicons/react/24/outline/BellIcon'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { Fragment, useMemo, useState } from 'react'
import useSWR from 'swr'

const UserIcon = dynamic(() => import('@/components/user/icon'))

const Menu = dynamic(() => import('@/components/layout/menu'))

const MobileMenu = dynamic(() => import('@/components/layout/mobile-menu'))

const NotificationsPanel = dynamic(
  () => import('@/components/layout/notifications-panel'),
)

const Cog6ToothIcon = dynamic(
  () => import('@heroicons/react/24/outline/Cog6ToothIcon'),
)

const SessionHeader = () => {
  const { data: profile } = useSWR<TUserProfile>(
    '/api/session/user/profile',
    fetcher,
  )

  const { data: user } = useSWR<TUser>('/api/session/user', fetcher)

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false)

  const [notificationsLength, setNotificationsLength] = useState(0)

  const isMaintainer = useMemo(
    () => user?.role && maintainerRoles.includes(user.role),
    [user],
  )

  const navigationLinks = useMemo(
    () =>
      typeof isMaintainer === 'undefined'
        ? []
        : isMaintainer
        ? adminNavigationLinks
        : clientNavigationLinks,
    [isMaintainer],
  )

  return (
    <Fragment>
      <header className="bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8 lg:gap-x-8">
          <section className="flex gap-x-8">
            <Link
              href={isMaintainer ? '/admin' : '/my'}
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

            <span className="hidden lg:inline-flex gap-x-10">
              {navigationLinks.map((item, key) => (
                <Link
                  key={key}
                  href={item.href}
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  {item.name}
                </Link>
              ))}
            </span>
          </section>

          <section className="flex items-center gap-x-6">
            <button
              className="inline-flex"
              onClick={() => setNotificationPanelOpen(($open) => !$open)}
            >
              <BellIcon className="h-6 w-6 text-gray-600" aria-hidden="true" />

              {notificationsLength > 0 && (
                <sup className="relative -ml-3 mt-1 w-3 h-3 rounded-full bg-red-600" />
              )}
            </button>

            <button
              type="button"
              className="-m-2.5 inline-flex lg:hidden items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>

              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>

            <span className="hidden lg:flex lg:flex-1 lg:justify-end">
              <Popover className="relative">
                <Popover.Button className="flex items-center text-sm outline-none font-semibold leading-6 text-gray-900">
                  {profile?.icon?.prefer !== IconType.None && profile?.icon ? (
                    <UserIcon
                      icon={profile.icon}
                      size={2.5}
                      sizeUnit="em"
                      userInitialLetter={profile?.firstName}
                    />
                  ) : (
                    <Cog6ToothIcon
                      className="h-6 w-6 text-gray-600 group-hover:text-blue-600"
                      aria-hidden="true"
                    />
                  )}
                </Popover.Button>

                <Menu />
              </Popover>
            </span>
          </section>
        </nav>

        <MobileMenu
          links={navigationLinks}
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        <NotificationsPanel
          open={notificationPanelOpen}
          onClose={() => setNotificationPanelOpen(false)}
          onNotificationsStateUpdate={(length) =>
            setNotificationsLength(length)
          }
        />
      </header>
    </Fragment>
  )
}

export default SessionHeader
