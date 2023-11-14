'use client'

import TagPill from '@/components/misc/tag-pill'
import { ticketStatusColors } from '@/helpers/default-colors'
import { fetcher } from '@/lib/fetcher'
import { getFormattedDateDifference } from '@/lib/format'
import type { TTicket } from '@/schemas/ticket'
import ChatBubbleLeftEllipsisIcon from '@heroicons/react/24/outline/ChatBubbleLeftEllipsisIcon'
import classNames from 'classnames'
import format from 'date-fns/format'
import fromUnixTime from 'date-fns/fromUnixTime'
import getUnixTime from 'date-fns/getUnixTime'
import subDays from 'date-fns/subDays'
import dynamic from 'next/dynamic'
import { Suspense, useMemo } from 'react'
import useSWR from 'swr'
import type { Merge } from 'type-fest'

const Paginator = dynamic(() => import('@/components/misc/paginator'))

type NewTicketsProps = {
  onClick?: (
    projectId: Stratego.STS.Utils.UUID,
    ticketId: Stratego.STS.Utils.UUID,
  ) => void
}

const NewTickets = ({ onClick }: NewTicketsProps) => {
  const dateRange = useMemo(
    () =>
      `/api/tickets/by/date/${getUnixTime(
        subDays(new Date(), 60),
      )},${getUnixTime(new Date())}`,
    [],
  )

  const {
    data: tickets = [],
    isLoading,
    isValidating,
  } = useSWR<
    Array<
      Merge<
        TTicket,
        {
          projectId: Stratego.STS.Utils.UUID
          projectName: string
        }
      >
    >
  >(dateRange, fetcher)

  return (
    <div className="flex flex-col gap-2 bg-white rounded-xl shadow-md lg:shadow-xl py-3 px-5">
      <span className="flex justify-between text-xl font-bold tracking-tight text-gray-800">
        Last tickets
      </span>

      <Suspense>
        <Paginator
          wrapperClassName="relative grid gap-4"
          paginationControlPosition="top-right"
          placeholder={
            !(isLoading || isValidating) && (
              <span className="inline-flex text-gray-400">
                No recent tickets
              </span>
            )
          }
          itemsPerPage={3}
          items={tickets.map((ticket, key) => (
            <div key={key}>
              <div
                className={classNames(
                  'flex flex-col gap-4 rounded-lg shadow-md p-4 cursor-pointer bg-white',
                  'hover:shadow-xl transition-shadow duration-200 ease-in-out',
                )}
                onClick={() => {
                  onClick?.(
                    ticket.projectId,
                    ticket.id as Stratego.STS.Utils.UUID,
                  )
                }}
              >
                <div className="flex flex-col gap-2 justify-center">
                  <div className="flex flex-col gap-y-2 justify-center lg:justify-between">
                    <span className="flex flex-wrap justify-between gap-2">
                      <span className="text-base font-bold leading-4">
                        {ticket.versions.at(-1)!.title}
                      </span>

                      <span className="inline-flex gap-2">
                        <TagPill
                          color={
                            ticketStatusColors[ticket.versions.at(-1)!.status]
                          }
                          label="status"
                          value={ticket.versions.at(-1)!.status}
                          size="sm"
                        />

                        <button
                          onClick={() =>
                            onClick?.(
                              ticket.projectId,
                              ticket.id as Stratego.STS.Utils.UUID,
                            )
                          }
                          className={classNames(
                            'inline-flex items-center rounded p-1 gap-1 text-xs bg-gray-500 text-gray-50',
                            'hover:shadow-md hover:bg-gray-700 transition duration-200 ease-in-out',
                          )}
                        >
                          <ChatBubbleLeftEllipsisIcon
                            className="h-4 w-4"
                            aria-hidden="true"
                          />

                          <span>{ticket.comments.length}</span>
                        </button>
                      </span>
                    </span>

                    <span className="flex flex-wrap justify-between items-center gap-2">
                      <span className="inline-flex w-full text-xs text-gray-600 leading-3">
                        Project: {ticket.projectName}
                      </span>

                      <div className="inline-flex flex-wrap gap-2 text-xs text-gray-500">
                        <span>
                          Created at{' '}
                          {format(
                            fromUnixTime(ticket.versions.at(0)!.createdAt),
                            'MMMM dd, yyyy',
                          )}
                        </span>

                        <span>
                          Last update:{' '}
                          {getFormattedDateDifference(
                            new Date(),
                            fromUnixTime(ticket.versions.at(-1)!.createdAt),
                          )}
                        </span>
                      </div>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        />
      </Suspense>
    </div>
  )
}

export default NewTickets
