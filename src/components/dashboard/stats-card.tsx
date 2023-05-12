import capitalize from '@stdlib/string/capitalize'
import camelcase from '@stdlib/string/camelcase'
import { ArcElement, Chart, Tooltip, type Color } from 'chart.js'
import { Fragment, useMemo } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { FunnelIcon } from '@heroicons/react/24/outline'
import { Popover, Transition } from '@headlessui/react'
import classNames from 'classnames'

Chart.register(ArcElement, Tooltip)

type StatsCardProps<T extends Record<string, number>> = {
  title: string
  labels: Array<keyof T>
  stats: T
  colors: Record<keyof T, Color>
  onStatClick?: (statName: keyof T) => void
}

const StatsCard = <T extends Record<string, number>>({
  title,
  labels,
  colors,
  stats,
  onStatClick,
}: StatsCardProps<T>) => {
  const total = useMemo(
    () =>
      labels
        .map((label) => stats[label])
        .reduce(
          (previous, current) =>
            typeof current === 'number' && current >= 0
              ? previous + current
              : previous,
          0
        ),
    [labels, stats]
  )

  return (
    <div className="flex flex-col gap-6 bg-white rounded-xl shadow-md lg:shadow-xl py-3 px-6">
      <div className="flex justify-between text-gray-800">
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        <Popover className="relative">
          <Popover.Button
            className={classNames(
              'ring-transparent rounded',
              'transition ease-in-out duration-200 text-gray-400 hover:text-gray-600'
            )}
          >
            <FunnelIcon className="h-6 w-6" aria-hidden="true" />
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
            <Popover.Panel
              className={classNames(
                'absolute right-0 z-1',
                'flex flex-col w-auto rounded lg:max-w-3xl p-2 gap-4',
                'bg-white ring-1 ring-gray-200 shadow-lg text-sm'
              )}
            >
              <p className="font-bold whitespace-nowrap">Filter by:</p>
              <div className="flex flex-col gap-2">
                {['date', 'category'].map((option, key) => (
                  <button
                    key={key}
                    className={classNames(
                      'px-2 py-0.5 text-left capitalize rounded bg-gray-200 text-gray-800',
                      'transition ease-in-out duration-200 hover:bg-gray-800 hover:text-gray-50'
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </Popover.Panel>
          </Transition>
        </Popover>
      </div>
      <Doughnut
        className="w-full mx-8 p-6"
        data={{
          labels: labels.map((label) => capitalize(String(label))),
          datasets: [
            {
              data: labels.map((label) => stats[label]),
              backgroundColor: labels.map((label) => colors[label]),
              borderRadius: 6,
              hoverOffset: 4,
            },
          ],
        }}
        options={{
          plugins: {
            tooltip: {
              displayColors: false,
            },
            legend: {
              display: false,
            },
          },
          onHover: (event, elements) => {
            if (event.native?.target)
              if (elements.at(0) && onStatClick)
                (event.native.target as HTMLElement).style.cursor = 'pointer'
              else (event.native.target as HTMLElement).style.cursor = 'default'
          },
          onClick: (_, elements, chart) => {
            const label = chart.data.labels?.[elements[0].index] as
              | string
              | undefined
            if (label) onStatClick?.(camelcase(label) as keyof T)
          },
        }}
      />
      <div className="flex flex-col gap-4 h-full">
        <div className="flex flex-col text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-500">
            {total}
          </h1>
          <small className="font-light">Total {title.toLowerCase()}</small>
        </div>
        <div className="divide-y divide-solid">
          {labels.map((label, key) => (
            <div
              key={key}
              onClick={() => onStatClick?.(camelcase(String(label)) as keyof T)}
              className={classNames(
                'flex justify-between font-normal text-gray-500 py-1',
                onStatClick &&
                  'cursor-pointer transition ease-in-out hover:text-blue-600'
              )}
            >
              <small className="capitalize">{String(label)}</small>
              <small>{stats[label]}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StatsCard
