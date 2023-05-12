import { Popover, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import classNames from 'classnames'
import { Fragment, useMemo } from 'react'

type TicketsDetailsProps = {
  tickets: Stratego.STS.KPI.Tickets
  colors?: Record<keyof Stratego.STS.KPI.Tickets, string>
}

const TicketsDetails: React.FC<TicketsDetailsProps> = ({ tickets, colors }) => {
  const total = useMemo(
    () =>
      Object.values(tickets).reduce(
        (previous, current) => previous + current,
        0
      ),
    [tickets]
  )

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button className="px-1 ring-transparent rounded">
            <ChevronDownIcon
              className={classNames(
                'h-4 w-4 text-gray-400',
                open && 'rotate-180 transform'
              )}
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
            <Popover.Panel className="absolute right-0 z-10 w-auto px-4 sm:px-0 lg:max-w-3xl">
              <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-10">
                <ul className="relative bg-white p-2">
                  {Object.entries(tickets).map(([ticket, value]) => (
                    <li
                      key={ticket}
                      className="flex gap-2 p-1 justify-between text-gray-500 text-[10px]"
                    >
                      <div className="inline-flex items-center gap-2">
                        {colors?.[ticket as keyof typeof tickets] && (
                          <span
                            className="inline-block w-3 h-3 rounded-full"
                            style={{
                              backgroundColor:
                                colors[ticket as keyof typeof tickets],
                            }}
                          />
                        )}
                        <span className="capitalize">{ticket}:</span>
                      </div>
                      <div className="inline-flex gap-1">
                        <span>
                          {(value > 0 ? (value / total) * 100 : 0).toFixed(2)}%
                        </span>
                        <span>{`(${value})`}</span>
                      </div>
                    </li>
                  ))}
                  <li className="flex items-center justify-between gap-2 p-1 whitespace-nowrap text-gray-500 text-[10px]">
                    <span>Total</span>
                    <span>{total}</span>
                  </li>
                </ul>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}

export default TicketsDetails
