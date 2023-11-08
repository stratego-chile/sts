'use client'

import capitalize from '@stdlib/string/capitalize'
import { settingsLinks } from '@/helpers/navigation-links'
import classNames from 'classnames'
import { usePathname, useRouter } from 'next/navigation'
import { createElement, useMemo, type PropsWithChildren } from 'react'

const SettingsLayout = ({ children }: PropsWithChildren<WithoutProps>) => {
  const router = useRouter()

  const pathname = usePathname()

  const currentSetting = useMemo(
    () => settingsLinks.find(({ href }) => href.includes(pathname))!,
    [pathname],
  )

  return (
    <div className="flex flex-col flex-grow w-full">
      <header className="bg-white border-b border-b-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <span className="flex gap-2 items-center text-3xl font-bold tracking-tight text-gray-900">
            <span>Settings</span>
          </span>
        </div>
      </header>

      <main className="flex flex-grow w-full mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col w-full gap-4 bg-white rounded-xl shadow-md lg:shadow-lg lg:overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:h-full">
            <div className="flex lg:w-fit lg:h-full bg-gray-50">
              <div
                className={classNames(
                  'grid grid-flow-col justify-stretch w-full',
                  'lg:!inline-flex lg:grid-flow-row lg:flex-col lg:justify-start lg:w-fit',
                )}
              >
                {settingsLinks.map(({ name, href, ...item }, key) =>
                  createElement(
                    currentSetting.href === href ? 'div' : 'button',
                    {
                      key,
                      className: classNames(
                        'inline-flex items-center font-semibold justify-center gap-2 p-2 h-fit',
                        'lg:pl-4 lg:pr-24 lg:py-6 lg:justify-start',
                        currentSetting.href === href
                          ? 'bg-gray-100'
                          : 'hover:bg-gray-200 transition ease-in-out duration-200',
                      ),
                      ...(currentSetting.href === href
                        ? {}
                        : {
                            onClick: () =>
                              router.replace(
                                `/account/settings/${name.toLowerCase()}`,
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
                    ],
                  ),
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
