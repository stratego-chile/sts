'use client'

import Spinner from '@/components/misc/spinner'
import { TicketStatus } from '@/lib/enumerators'
import { fetcher } from '@/lib/fetcher'
import { getFormattedDateDifference } from '@/lib/format'
import { TTicket } from '@/schemas/ticket'
import { TUser } from '@/schemas/user'
import { PencilSquareIcon } from '@heroicons/react/20/solid'
import classNames from 'classnames'
import fromUnixTime from 'date-fns/fromUnixTime'
import dynamic from 'next/dynamic'
import { Suspense, useEffect, useId, useState } from 'react'
import useSWR from 'swr'

const Editor = dynamic(() => import('@/components/misc/text-editor'))

const Paginator = dynamic(() => import('@/components/misc/paginator'))

const TicketComment = dynamic(
  () => import('@/components/tickets/ticket-comment')
)

type TicketDetailsProps = {
  owner?: Stratego.STS.Utils.UUID
  ticket: TTicket
  lastVersion: Flatten<TTicket['versions']>
}

const TicketDetails = ({ owner, ticket, lastVersion }: TicketDetailsProps) => {
  const descriptionBoxId = useId()

  const [canEditTicketDesc, allowTicketDescEdit] = useState(false)

  const [isEditing, setEditing] = useState(false)

  const [commentsOrder, setCommentsOrders] = useState<'oldest' | 'newest'>(
    'newest'
  )

  const { data: user } = useSWR<TUser>('/api/session/user', fetcher)

  useEffect(
    () => owner && allowTicketDescEdit(user?.id === owner),
    [user, owner]
  )

  return (
    <main className="grid gap-8 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div
        id="details"
        className={classNames(
          'flex flex-col gap-4 rounded-lg shadow-md p-4 bg-white',
          'hover:shadow-lg transition-shadow duration-200 ease-in-out'
        )}
      >
        <div className="flex flex-col gap-2 justify-center">
          <span className="text-2xl font-bold tracking-tight text-gray-900">
            {lastVersion.title}
          </span>

          <div className="flex justify-between lg:items-center">
            <span className="inline-flex gap-1 text-xs lg:text-sm text-gray-400">
              <span>
                {ticket?.versions && ticket.versions.length > 1
                  ? 'Edited'
                  : 'Created'}
              </span>

              <span>
                {getFormattedDateDifference(
                  Date.now(),
                  fromUnixTime(lastVersion.createdAt)
                )}
              </span>
            </span>

            <span className="inline-flex gap-x-2 text-sm">
              {[TicketStatus.Open, TicketStatus.Draft].includes(
                lastVersion.status
              ) &&
                canEditTicketDesc &&
                !isEditing && (
                  <button
                    className={classNames(
                      'inline-flex p-2 justify-between items-center rounded',
                      'hover:bg-gray-200 hover:bg-opacity-60 transition-colors duration-200 ease-in-out'
                    )}
                    onClick={() => setEditing(true)}
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                  </button>
                )}
            </span>
          </div>

          <div className="flex flex-col mt-4">
            <Editor
              namespace={descriptionBoxId}
              preset={lastVersion.description}
              onCancel={() => setEditing(false)}
              editable={isEditing}
              forceCancellation
            />
          </div>
        </div>
      </div>

      {ticket?.comments && ticket.comments.length > 0 && (
        <div id="comments" className="flex flex-col gap-4">
          <div className="flex gap-4 flex-row justify-between">
            <span className="text-lg font-bold tracking-tight text-gray-900">
              Comments
            </span>

            <span className="inline-flex gap-4 items-center">
              <select
                className="inline-block text-sm py-1 rounded border-gray-200"
                value={commentsOrder}
                onChange={(event) => {
                  setCommentsOrders(event.target.value as typeof commentsOrder)
                }}
              >
                <option value="oldest">Oldest first</option>

                <option value="newest">Newest first</option>
              </select>
            </span>
          </div>

          <div className="flex gap-4">
            <div className="hidden lg:flex border-l-2 border-dashed border-gray-300 w-4" />

            <Paginator
              wrapperClassName="inline-flex flex-col w-full py-4 gap-6"
              paginationControlPosition="bottom-right"
              defaultPage="last"
              itemsPerPage={5}
              items={ticket!.comments
                .sort((a, b) =>
                  commentsOrder === 'newest'
                    ? b.createdAt - a.createdAt
                    : a.createdAt - b.createdAt
                )
                .map((comment, key) => (
                  <Suspense
                    key={key}
                    fallback={
                      <div className="flex justify-center items-center py-5">
                        <Spinner />
                      </div>
                    }
                  >
                    <TicketComment ticketId={ticket.id} comment={comment} />
                  </Suspense>
                ))}
            />
          </div>
        </div>
      )}

      {lastVersion.status === TicketStatus.Open && (
        <div id="newComment" className="flex flex-col gap-4">
          <div className="flex">
            <span className="text-lg font-bold tracking-tight text-gray-900">
              New comment
            </span>
          </div>

          <div
            className={classNames(
              'flex flex-col gap-4 rounded-lg shadow-md p-4 bg-white',
              'hover:shadow-lg transition-shadow duration-200 ease-in-out'
            )}
          >
            <div className="flex border-l-1 border-b-1 border-solid border-gray-900 w-6" />

            <Editor
              namespace="newComment"
              theme={{
                root: '!outline-0 !ring-2 !ring-gray-300',
              }}
              editable
            />
          </div>
        </div>
      )}
    </main>
  )
}

export default TicketDetails
