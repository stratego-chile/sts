'use client'

import capitalize from '@stdlib/string/capitalize'
import { settingsLinks } from '@stratego-sts/helpers/navigation-links'
import classNames from 'classnames'
import { usePathname, useRouter } from 'next/navigation'
import { createElement, useMemo, type PropsWithChildren } from 'react'

const SettingsLayout = ({ children }: PropsWithChildren<WithoutProps>) => {
  const router = useRouter()

  const pathname = usePathname()

  const currentSetting = useMemo(
    () => settingsLinks.find(({ href }) => href.includes(pathname))!,
    [pathname]
  )

  return (
    <div className="flex flex-col flex-grow w-full">
      <header className="bg-white border-b-[1px] border-b-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <span className="flex gap-2 items-center text-3xl font-bold tracking-tight text-gray-900">
            <span>Settings</span>
          </span>
        </div>
      </header>

      <main className="flex flex-grow w-full mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col w-full gap-4 bg-white rounded-xl shadow-md lg:shadow-lg lg:overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:h-full">
            <div className="flex w-full lg:w-fit lg:h-full bg-gray-50">
              <div className="flex flex-row w-full lg:w-fit justify-between lg:justify-normal lg:flex-col">
                {settingsLinks.map(({ name, href, ...item }, key) =>
                  createElement(
                    currentSetting.href === href ? 'span' : 'button',
                    {
                      key,
                      className: classNames(
                        'inline-flex items-center lg:text-left font-semibold gap-2 p-2 lg:pl-4 lg:pr-24 lg:py-6',
                        currentSetting.href === href
                          ? 'bg-gray-100'
                          : 'hover:bg-gray-200 transition ease-in-out duration-200'
                      ),
                      ...(currentSetting.href === href
                        ? {}
                        : {
                            onClick: () =>
                              router.replace(
                                `/account/settings/${name.toLowerCase()}`
                              ),
                          }),
                    },
                    [
                      <item.icon
                        key="0"
                        className="hidden lg:inline h-6 w-6"
                        aria-hidden="true"
                      />,
                      capitalize(name),
                    ]
                  )
                )}
              </div>
            </div>

            <div className="flex flex-col p-4 w-full">{children}</div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default SettingsLayout
