'use client'

import Disclaimer from '@/components/misc/disclaimer'
import Spinner from '@/components/misc/spinner'
import { fetcher } from '@/lib/fetcher'
import { getFormattedDateDifference } from '@/lib/format'
import {
  TicketResponsibleType,
  TicketStatus,
  type TTicket,
} from '@/schemas/ticket'
import {
  AccountRole,
  type TEditableUser,
  type TUserProfile,
} from '@/schemas/user'
import PencilSquareIcon from '@heroicons/react/20/solid/PencilSquareIcon'
import classNames from 'classnames'
import fromUnixTime from 'date-fns/fromUnixTime'
import dynamic from 'next/dynamic'
import {
  Fragment,
  Suspense,
  useDeferredValue,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'
import useSWR from 'swr'
import type { Merge } from 'type-fest'

const Editor = dynamic(() => import('@/components/misc/text-editor'))

const Paginator = dynamic(() => import('@/components/misc/paginator'))

const TicketComment = dynamic(() => import('@/components/ticket/comment'))

const FloatingLabelSelect = dynamic(
  () => import('@/components/misc/floating-label-select'),
)

const statusMessages: Record<TicketStatus, string> = {
  [TicketStatus.Open]: 'This ticket is open and is accepting new comments',
  [TicketStatus.Draft]: 'This ticket is a draft and is not accepting comments',
  [TicketStatus.Resolved]:
    'This ticket is resolved and is not accepting new comments',
  [TicketStatus.Closed]:
    'This ticket is closed and is not accepting new comments',
}

type TicketDetailsProps = {
  projectId: Stratego.STS.Utils.UUID
  owner?: Stratego.STS.Utils.UUID
  ticket: TTicket
  lastVersion: Flatten<TTicket['versions']>
}

const TicketDetails = ({
  owner,
  projectId,
  ticket,
  lastVersion,
}: TicketDetailsProps) => {
  const descriptionBoxId = useId()

  const [canEditTicketDesc, allowTicketDescEdit] = useState(false)

  const [isEditing, setEditing] = useState(false)

  const [commentsOrder, setCommentsOrders] = useState<'oldest' | 'newest'>(
    'oldest',
  )

  const ticketCreatorId = useDeferredValue(
    ticket.responsibles.find(
      ({ type }) => type === TicketResponsibleType.Creator,
    )!.id,
  )

  const { data: user } = useSWR<
    Merge<
      TEditableUser,
      {
        id: Stratego.STS.Utils.UUID
      }
    >
  >('/api/session/user', fetcher)

  const isCurrentUserCreator = useMemo(
    () => ticketCreatorId === user?.id,
    [ticketCreatorId, user?.id],
  )

  const { data: creator } = useSWR<
    Readonly<
      Extend<
        TUserProfile,
        {
          role: AccountRole
        }
      >
    >
  >(`/api/tickets/${ticket.id}/author/${ticketCreatorId}`, fetcher)

  useLayoutEffect(
    () => owner && allowTicketDescEdit(user?.id === owner),
    [user, owner],
  )

  return (
    <main className="grid gap-8 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div
        id="details"
        className={classNames(
          'flex flex-col gap-4 rounded-lg shadow-md p-4 bg-white',
          'hover:shadow-lg transition-shadow duration-200 ease-in-out',
        )}
      >
        <div className="flex flex-col gap-2 justify-center">
          <span className="text-2xl font-bold tracking-tight text-gray-900">
            {lastVersion.title}
          </span>

          <div className="flex justify-between lg:items-center py-1">
            <span className="inline-flex flex-wrap gap-1 text-xs lg:text-sm text-gray-400">
              {ticketCreatorId && creator && (
                <Fragment>
                  {!isCurrentUserCreator ? (
                    <span className="inline-flex gap-1">
                      <span>By</span>

                      <span>{creator.firstName}</span>

                      <span>{creator.lastName}</span>

                      {creator.alias && (
                        <span className="hidden lg:inline">{`(${creator.alias})`}</span>
                      )}
                    </span>
                  ) : (
                    <span>By you</span>
                  )}

                  <span className="hidden lg:inline-flex">&middot;</span>
                </Fragment>
              )}

              <span className="inline-flex gap-1">
                <span>
                  {ticket?.versions && ticket.versions.length > 1
                    ? 'Edited'
                    : 'Created'}
                </span>

                <span>
                  {getFormattedDateDifference(
                    new Date(),
                    fromUnixTime(lastVersion.createdAt),
                  )}
                </span>
              </span>
            </span>

            <span className="inline-flex gap-x-2 text-sm">
              {[TicketStatus.Open, TicketStatus.Draft].includes(
                lastVersion.status,
              ) &&
                canEditTicketDesc &&
                !isEditing && (
                  <button
                    className={classNames(
                      'inline-flex px-2 py-1 justify-between items-center rounded bg-gray-900 text-gray-50',
                      'hover:bg-gray-800 transition-colors duration-200 ease-in-out',
                    )}
                    onClick={() => setEditing(true)}
                  >
                    <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
            </span>
          </div>

          <div className="flex flex-col mt-4">
            <Editor
              namespace={descriptionBoxId}
              preset={
                lastVersion.description
                  ? JSON.parse(lastVersion.description)
                  : undefined
              }
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
              <FloatingLabelSelect
                className="bg-gray-50"
                label="Order by"
                options={[
                  {
                    label: 'Oldest',
                    value: 'oldest',
                  },
                  {
                    label: 'Newest',
                    value: 'newest',
                  },
                ]}
                value={commentsOrder}
                onChange={(event) =>
                  setCommentsOrders(event.target.value as typeof commentsOrder)
                }
              />
            </span>
          </div>

          <div className="flex gap-4">
            <div className="hidden lg:flex border-l-2 border-dashed border-gray-300 w-4" />

            <Paginator
              wrapperClassName="inline-flex flex-col w-full py-4 gap-6"
              paginationControlPosition="bottom-right"
              defaultPage="last"
              itemsPerPage={15}
              items={ticket!.comments
                .sort((a, b) =>
                  commentsOrder === 'newest'
                    ? b.createdAt - a.createdAt
                    : a.createdAt - b.createdAt,
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

      {[
        TicketStatus.Resolved,
        TicketStatus.Closed,
        TicketStatus.Draft,
      ].includes(lastVersion.status) && (
        <Disclaimer>{statusMessages[lastVersion.status]}</Disclaimer>
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
              'hover:shadow-lg transition-shadow duration-200 ease-in-out',
            )}
          >
            <div className="flex border-l-1 border-b-1 border-solid border-gray-900 w-6" />

            <Editor
              namespace="newComment"
              theme={{
                root: '!outline-0 !ring-1 !ring-gray-300',
              }}
              editable
              showCancelButton={false}
              cleanAfterSubmit
              onContentSubmit={(content) => {
                if (content)
                  fetch('/api/session/ticket/comment', {
                    method: 'POST',
                    body: JSON.stringify({
                      projectId,
                      ticketId: ticket.id,
                      content: JSON.stringify(content),
                    }),
                  })
              }}
            />
          </div>
        </div>
      )}
    </main>
  )
}

export default TicketDetails
