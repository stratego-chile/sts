'use client'

import { PencilSquareIcon } from '@heroicons/react/20/solid'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { getMonoContrast, ticketStatusColors } from '@stratego-sts/lib/colors'
import { getFormattedDateDifference } from '@stratego-sts/lib/format'
import { fetcher } from '@stratego-sts/lib/fetcher'
import { TProject } from '@stratego-sts/schemas/project'
import type { TTicket } from '@stratego-sts/schemas/ticket'
import classNames from 'classnames'
import fromUnixTime from 'date-fns/fromUnixTime'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { useParams } from 'next/navigation'

const IdSelector = dynamic(
  () => import('@stratego-sts/components/misc/id-selector')
)

const Paginator = dynamic(
  () => import('@stratego-sts/components/misc/paginator')
)

const Editor = dynamic(
  () => import('@stratego-sts/components/misc/text-editor')
)

const TicketDetailsPage = () => {
  const params = useParams()

  const [isEditing, setEditing] = useState(false)

  const [commentsOrder, setCommentsOrders] = useState<'oldest' | 'newest'>(
    'newest'
  )

  const { data: project } = useSWR<TProject>(
    `/api/projects/${params.projectId}`,
    fetcher
  )

  const { data: ticket } = useSWR<TTicket>(
    `/api/tickets/${params.ticketId}`,
    fetcher
  )

  const lastVersion = useMemo(() => ticket?.versions.at(-1), [ticket])

  return (
    <div>
      {lastVersion && (
        <>
          <header className="lg:sticky lg:top-0 bg-white border-b-[1px] border-b-gray-200">
            <div className="flex flex-col gap-4 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <span className="flex flex-col md:flex-row justify-between gap-y-5">
                <span className="flex flex-col lg:flex-row gap-2 lg:items-center text-3xl font-bold tracking-tight">
                  <Link
                    is="span"
                    href={'/account/projects'}
                    className="hidden lg:inline-flex text-gray-900 hover:text-blue-600 transition duration-200 ease-in-out"
                  >
                    Projects
                  </Link>

                  <ChevronRightIcon
                    className="h-5 w-5 text-gray-400 hidden lg:inline-block"
                    aria-hidden="true"
                  />

                  <Link
                    is="span"
                    href={`/account/projects/${params.projectId}`}
                    className="text-gray-900 hover:text-blue-600 transition duration-200 ease-in-out"
                  >
                    {project?.name}
                  </Link>

                  <ChevronRightIcon
                    className="h-5 w-5 text-gray-400 hidden lg:inline-block"
                    aria-hidden="true"
                  />

                  <Link
                    is="span"
                    href={`/account/tickets/${params.projectId}`}
                    className="hidden lg:inline-flex text-gray-900 hover:text-blue-600 transition duration-200 ease-in-out"
                  >
                    Tickets
                  </Link>

                  <ChevronRightIcon
                    className="h-5 w-5 text-gray-400 hidden lg:inline-block"
                    aria-hidden="true"
                  />

                  <span className="text-gray-900">{lastVersion.title}</span>
                </span>
                <span className="inline-flex gap-x-2 text-sm">
                  <span
                    className="p-2 rounded capitalize"
                    style={{
                      backgroundColor: ticketStatusColors[lastVersion.status],
                      color: getMonoContrast(
                        ticketStatusColors[lastVersion.status]
                      ),
                    }}
                  >
                    Status: {lastVersion.status}
                  </span>
                </span>
              </span>
              <IdSelector label="Ticket ID" id={ticket!.id} />
            </div>
          </header>
          <main className="grid gap-8 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div
              id="details"
              className={classNames(
                'flex flex-col gap-4 rounded-lg shadow-md bg-gray-50 p-4',
                'hover:bg-white hover:shadow-lg transition duration-200 ease-in-out'
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
                    {!isEditing && (
                      <button
                        className="p-2 rounded capitalize text-gray-50 bg-gray-900 hover:bg-gray-600"
                        onClick={() => setEditing(true)}
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                    )}
                  </span>
                </div>

                <div className="flex flex-col">
                  {isEditing ? (
                    <Editor
                      namespace={ticket!.id}
                      preset={lastVersion.description}
                    />
                  ) : (
                    <Editor
                      namespace={ticket!.id}
                      preset={lastVersion.description}
                      readOnly
                    />
                  )}
                </div>
              </div>
            </div>
            <div id="comments" className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 items-center lg:flex-row lg:justify-between">
                <span className="text-lg font-bold tracking-tight text-gray-900">
                  Comments
                </span>
                <span className="inline-flex gap-4 items-center">
                  <label className="text-sm">Order by</label>
                  <select
                    className="inline-block text-sm py-1 rounded"
                    value={commentsOrder}
                    onChange={(event) => {
                      setCommentsOrders(
                        event.target.value as typeof commentsOrder
                      )
                    }}
                  >
                    <option value="oldest">Oldest</option>
                    <option value="newest">Newest</option>
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
                  items={ticket?.comments
                    .sort((a, b) =>
                      commentsOrder === 'newest'
                        ? b.createdAt - a.createdAt
                        : a.createdAt - b.createdAt
                    )
                    .map((comment, key) => (
                      <div
                        key={key}
                        className={classNames(
                          'flex flex-col rounded-lg shadow-md bg-gray-50 gap-4 p-4',
                          'hover:bg-white hover:shadow-lg transition duration-200 ease-in-out'
                        )}
                      >
                        <span className="flex flex-col lg:flex-row gap-2 text-xs lg:text-sm text-gray-400">
                          <span>Commented by {comment.author}</span>
                          <span className="hidden lg:inline-flex">
                            &middot;
                          </span>
                          <span>
                            {getFormattedDateDifference(
                              Date.now(),
                              fromUnixTime(comment.createdAt)
                            )}
                          </span>
                        </span>
                        <Editor
                          namespace={comment.id}
                          preset={comment.content}
                          readOnly
                          theme={{
                            root: 'flex w-full !p-0 !shadow-none',
                          }}
                        />
                      </div>
                    ))}
                />
              </div>
            </div>
            <div id="newComment" className="flex flex-col gap-4">
              <div className="flex">
                <span className="text-lg font-bold tracking-tight text-gray-900">
                  New comment
                </span>
              </div>
              <div
                className={classNames(
                  'flex flex-col gap-4 rounded-lg shadow-md bg-gray-50 p-4',
                  'hover:bg-white hover:shadow-lg transition duration-200 ease-in-out'
                )}
              >
                <div className="flex border-l-1 border-b-1 border-solid border-gray-900 w-6" />
                <div className="flex flex-col w-full mb-48">
                  <Editor
                    namespace="newComment"
                    theme={{
                      root: '!outline-0 !ring-2 !ring-gray-300',
                    }}
                  />
                </div>
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  )
}

export default TicketDetailsPage
