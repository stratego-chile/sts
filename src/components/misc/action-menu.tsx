'use client'

import { Float } from '@headlessui-float/react'
import { Menu, Transition } from '@headlessui/react'
import ChevronDownIcon from '@heroicons/react/20/solid/ChevronDownIcon'
import classNames from 'classnames'
import { Fragment } from 'react'

type Placement = Parameters<typeof Float>[0]['placement']

type ActionOption = {
  content: React.ReactNode
  action: () => void
}

export type ActionMenuProps = {
  className?: string
  content?: React.ReactNode
  options?: Array<ActionOption>
  showArrow?: boolean
  placement?: Placement
}

const ActionMenu = ({
  className,
  content,
  options,
  showArrow = true,
  placement = 'bottom-end',
}: ActionMenuProps) => {
  return (
    <Menu as="div" className="relative inline-block text-left overflow-visible">
      {({ open, close: closeOptionsPopover }) => (
        <Float portal show={open} placement={placement} offset={4}>
          <Menu.Button
            className={
              className ??
              classNames(
                'inline-flex items-center rounded bg-gray-700 p-2 gap-1 text-sm text-white hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75',
              )
            }
          >
            {content}

            {showArrow && (
              <ChevronDownIcon
                className={classNames(
                  'h-4 w-4 transition-transform',
                  open && 'transform rotate-180',
                )}
              />
            )}
          </Menu.Button>

          <Transition
            as={Fragment}
            show={open}
            appear
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Menu.Items
              as="div"
              className={classNames(
                'shadow border rounded',
                'bg-white border-gray-200',
              )}
            >
              <section className="flex flex-col p-1 gap-1">
                {options?.map(({ action, content: text }, key) => (
                  <Menu.Item key={key}>
                    <button
                      role="link"
                      onClick={() => {
                        action()

                        closeOptionsPopover()
                      }}
                      className={classNames(
                        'inline-flex text-start items-center text-xs whitespace-nowrap px-2 py-1 rounded',
                        'hover:bg-gray-200',
                      )}
                    >
                      {text}
                    </button>
                  </Menu.Item>
                ))}
              </section>
            </Menu.Items>
          </Transition>
        </Float>
      )}
    </Menu>
  )
}

export default ActionMenu
