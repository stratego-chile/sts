'use client'

import { StatFilterType } from '@/lib/enumerators'
import { Popover, RadioGroup, Transition } from '@headlessui/react'
import CheckIcon from '@heroicons/react/24/outline/CheckIcon'
import FunnelIcon from '@heroicons/react/24/outline/FunnelIcon'
import camelcase from '@stdlib/string/camelcase'
import capitalize from '@stdlib/string/capitalize'
import { ArcElement, Chart, Tooltip, type Color } from 'chart.js'
import classNames from 'classnames'
import getUnixTime from 'date-fns/getUnixTime'
import isDate from 'date-fns/isDate'
import parseISO from 'date-fns/parseISO'
import subHours from 'date-fns/subHours'
import { useFormik } from 'formik'
import { Fragment, useEffect, useId, useMemo, useState } from 'react'
import { Doughnut } from 'react-chartjs-2'
import * as Yup from 'yup'

Chart.register(ArcElement, Tooltip)

type StatsCardProps<T extends Record<string, number>> = {
  title: string
  labels: Array<keyof T> | Readonly<Array<keyof T>>
  stats: T
  colors: Record<keyof T, Color>
  onFilterByDate?: (from: number, to: number) => void
  onFilterReset?: () => void
  onStatClick?: (statName?: keyof T) => void
}

const StatsCard = <T extends Record<string, number>>({
  title,
  labels,
  colors,
  stats,
  onFilterByDate,
  onFilterReset,
  onStatClick,
}: StatsCardProps<T>) => {
  const dateInputId = useId()

  const [filter, setFilter] = useState<StatFilterType | 'none'>('none')

  const [dateRangeType, setDateRangeType] = useState<'preset' | 'custom'>(
    'preset',
  )

  const [predefinedDateRangeRef, setPredefinedDateRangeRef] = useState<number>()

  const total = useMemo(
    () =>
      labels
        .map((label) => stats[label])
        .reduce(
          (previous, current) =>
            typeof current === 'number' && current >= 0
              ? previous + current
              : previous,
          0,
        ),
    [labels, stats],
  )

  const {
    isValid: isDateRangeValid,
    values: dateFilterValues,
    handleChange: handleDateRangeChange,
    handleReset: handleDataRangeReset,
    submitForm: updateDateRange,
  } = useFormik({
    initialValues: {
      from: '',
      to: '',
    },
    validateOnMount: true,
    validateOnChange: true,
    validationSchema: Yup.object({
      from: Yup.date().required(),
      to: Yup.date().required(),
    }),
    onReset: () => {
      setFilter('none')
    },
    onSubmit: (values) => {
      if (
        Object.values(values).every((dateRangeFragment) =>
          isDate(parseISO(dateRangeFragment)),
        )
      ) {
        const { from, to } = values
        onFilterByDate?.(getUnixTime(parseISO(from)), getUnixTime(parseISO(to)))
      }
    },
  })

  useEffect(() => {
    if (isDateRangeValid) updateDateRange()
  }, [isDateRangeValid, updateDateRange])

  useEffect(() => {
    if (typeof predefinedDateRangeRef !== 'undefined') {
      const from = subHours(new Date(), predefinedDateRangeRef)

      const to = new Date()

      onFilterByDate?.(getUnixTime(from), getUnixTime(to))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [predefinedDateRangeRef])

  useEffect(() => {
    if (filter === 'none') {
      setPredefinedDateRangeRef(undefined)

      onFilterReset?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  return (
    <div className="flex flex-col gap-6 bg-white rounded-xl shadow-md lg:shadow-xl py-3 px-5">
      <div className="flex justify-between items-center text-gray-800">
        <span className="text-xl font-bold tracking-tight">{title}</span>

        <Popover className="relative">
          {({ close: closeFiltersMenu }) => (
            <Fragment>
              <Popover.Button
                className={classNames(
                  'flex items-center ring-transparent rounded py-0.5 font-semibold px-2 text-sm',
                  'transition text-gray-500 bg-gray-100 hover:text-gray-600',
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <span>Filter</span>

                  <FunnelIcon className="h-4 w-4" aria-hidden="true" />
                </span>

                {filter !== 'none' && (
                  <sup className="relative -ml-2 -mt-1 w-2 h-2 rounded-full bg-blue-600 bg-opacity-75" />
                )}
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
                    'absolute right-0 z-1 mt-2',
                    'flex flex-col rounded w-auto lg:max-w-4xl p-2 gap-4',
                    'bg-white ring-1 ring-gray-200 shadow-lg text-sm',
                  )}
                >
                  <RadioGroup
                    className="flex flex-col gap-2"
                    suppressContentEditableWarning
                    value={filter}
                    onChange={setFilter}
                  >
                    {[StatFilterType.Date].map((option, key) => (
                      <Fragment key={key}>
                        <RadioGroup.Option
                          value={option}
                          className={({ checked }) =>
                            classNames(
                              checked
                                ? 'bg-blue-600 bg-opacity-75 text-white rounded-t'
                                : 'bg-white rounded',
                              'relative flex cursor-pointer px-2 py-1 focus:outline-none',
                              !checked &&
                                'transition hover:bg-gray-400 hover:bg-opacity-25',
                            )
                          }
                        >
                          {({ checked }) => (
                            <div className="flex gap-4 w-full items-center justify-between">
                              <div className="flex items-center">
                                <div className="text-sm">
                                  <RadioGroup.Label
                                    as="p"
                                    className={classNames(
                                      checked ? 'text-white' : 'text-gray-900',
                                      'font-medium',
                                    )}
                                  >
                                    {capitalize(option)}
                                  </RadioGroup.Label>
                                </div>
                              </div>

                              <div
                                className={classNames(
                                  !checked && 'invisible',
                                  'shrink-0 text-white bg-gray-50 bg-opacity-25 p-0.5 rounded-full',
                                )}
                              >
                                <CheckIcon
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                              </div>
                            </div>
                          )}
                        </RadioGroup.Option>

                        <Transition
                          as={Fragment}
                          show={filter === StatFilterType.Date}
                          enter="transition ease-out duration-200"
                          enterFrom="opacity-0 translate-y-1"
                          enterTo="opacity-100 translate-y-0"
                          leave="transition ease-in duration-150"
                          leaveFrom="opacity-100 translate-y-0"
                          leaveTo="opacity-0 translate-y-1"
                        >
                          <form className="flex flex-col -mt-2 space-y-6 text-xs p-2 rounded-b border border-gray-200">
                            <div className="flex flex-wrap gap-y-4">
                              <section className="inline-flex w-full rounded overflow-hidden">
                                {Array.of<typeof dateRangeType>(
                                  'preset',
                                  'custom',
                                ).map(($dateRangeType, $dateRangeKey) => (
                                  <button
                                    key={$dateRangeKey}
                                    type="button"
                                    role="button"
                                    className={classNames(
                                      'inline-flex flex-grow py-1 px-1 bg-gray-100 cursor-pointer justify-center',
                                      dateRangeType === $dateRangeType
                                        ? 'bg-gray-700 text-gray-50'
                                        : 'hover:bg-gray-200',
                                    )}
                                    onClick={() =>
                                      setDateRangeType($dateRangeType)
                                    }
                                  >
                                    <span>{capitalize($dateRangeType)}</span>
                                  </button>
                                ))}
                              </section>

                              {dateRangeType === 'preset' && (
                                <section className="inline-flex flex-row">
                                  <span className="py-0.5 me-2">Last:</span>

                                  <span className="inline-flex w-full rounded overflow-hidden">
                                    {Array.of<[text: string, hours?: number]>(
                                      ['hour', 1],
                                      ['day', 24],
                                      ['week', 168],
                                      ['month', 731],
                                      ['year', 8766],
                                    ).map(([text, hours], rangeKey) => (
                                      <button
                                        key={rangeKey}
                                        type="button"
                                        role="button"
                                        className={classNames(
                                          'inline-flex flex-grow py-0.5 px-1 bg-gray-100 text-start whitespace-nowrap',
                                          hours === predefinedDateRangeRef
                                            ? 'bg-gray-700 text-gray-50'
                                            : 'hover:bg-gray-200',
                                        )}
                                        onClick={() =>
                                          setPredefinedDateRangeRef(hours)
                                        }
                                      >
                                        {capitalize(text)}
                                      </button>
                                    ))}
                                  </span>
                                </section>
                              )}
                            </div>

                            {dateRangeType === 'custom' && (
                              <Fragment>
                                <section className="relative inline-flex flex-col">
                                  <input
                                    id={dateInputId.concat('from')}
                                    name="from"
                                    type="date"
                                    autoComplete="off"
                                    autoFocus={false}
                                    value={dateFilterValues.from}
                                    onChange={handleDateRangeChange}
                                    placeholder=" "
                                    required
                                    className="relative block w-full rounded border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 !z-0 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                  />

                                  <label
                                    className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                                    htmlFor={dateInputId.concat('from')}
                                  >
                                    From
                                  </label>
                                </section>

                                <section className="relative inline-flex flex-col">
                                  <input
                                    id={dateInputId.concat('to')}
                                    name="to"
                                    type="date"
                                    autoComplete="off"
                                    autoFocus={false}
                                    value={dateFilterValues.to}
                                    onChange={handleDateRangeChange}
                                    placeholder=" "
                                    required
                                    className="relative block w-full rounded border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 !z-0 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                  />

                                  <label
                                    className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                                    htmlFor={dateInputId.concat('to')}
                                  >
                                    To
                                  </label>
                                </section>
                              </Fragment>
                            )}
                          </form>
                        </Transition>
                      </Fragment>
                    ))}
                  </RadioGroup>

                  <Transition
                    as={Fragment}
                    show={filter !== 'none'}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <div
                      className={classNames(
                        'flex flex-row gap-1',
                        '[&>button]:inline-flex [&>button]:w-full [&>button]:justify-center',
                        '[&>button]:p-1 [&>button]:rounded [&>button]:text-xs [&>button]:transition-colors',
                      )}
                    >
                      <button
                        type="button"
                        className="text-white bg-blue-600 [&:not(:disabled):hover]:bg-gray-500"
                        onClick={() => closeFiltersMenu()}
                      >
                        Confirm
                      </button>

                      <button
                        type="button"
                        className="text-white bg-gray-400 [&:not(:disabled):hover]:bg-gray-500"
                        onClick={handleDataRangeReset}
                      >
                        Clear filters
                      </button>
                    </div>
                  </Transition>
                </Popover.Panel>
              </Transition>
            </Fragment>
          )}
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
            const label = chart?.data?.labels?.[elements[0].index] as
              | string
              | undefined
            if (label) onStatClick?.(camelcase(label) as keyof T)
          },
        }}
      />

      <div className="flex flex-col gap-4 h-full">
        <section
          className="group inline-flex flex-col w-fit self-center items-center"
          onClick={() => onStatClick?.()}
        >
          <span className="text-3xl font-bold tracking-tight text-gray-500 group-hover:text-blue-600 cursor-pointer transition-colors duration-150 ease-in-out">
            {total}
          </span>

          <small className="font-light group-hover:text-blue-600 cursor-pointer transition-colors duration-150 ease-in-out">
            Total {title.toLowerCase()}
          </small>
        </section>

        <section className="divide-y divide-solid">
          {labels.map((label, key) => (
            <span
              key={key}
              onClick={() => onStatClick?.(camelcase(String(label)) as keyof T)}
              className={classNames(
                'flex justify-between font-normal text-gray-500 py-1',
                onStatClick &&
                  'cursor-pointer transition ease-in-out hover:text-blue-600',
              )}
            >
              <small className="capitalize">{String(label)}</small>

              <small>{stats[label]}</small>
            </span>
          ))}
        </section>
      </div>
    </div>
  )
}

export default StatsCard
