import IdSelector from '@/components/misc/id-selector'
import { ticketStatusColors } from '@/helpers/default-colors'
import { getFormattedDateDifference } from '@/lib/format'
import type { TTicket } from '@/schemas/ticket'
import ChatBubbleLeftEllipsisIcon from '@heroicons/react/24/outline/ChatBubbleLeftEllipsisIcon'
import classNames from 'classnames'
import format from 'date-fns/format'
import fromUnixTime from 'date-fns/fromUnixTime'
import dynamic from 'next/dynamic'
import { useMemo } from 'react'

const TagPill = dynamic(() => import('@/components/misc/tag-pill'))

const Editor = dynamic(() => import('@/components/misc/text-editor'))

type TicketOverviewProps = {
  projectId: Stratego.STS.Utils.UUID
  projectName?: string
  showProjectName?: boolean
  showTicketId?: boolean
  ticket: TTicket
  /**
   * @param section HTML element ID of the section to scroll to
   */
  onClick?: (
    projectId: Stratego.STS.Utils.UUID,
    ticketId: Stratego.STS.Utils.UUID,
    section?: string,
  ) => void
}

const TicketOverviewCard = ({
  projectId,
  projectName,
  showProjectName = true,
  showTicketId = true,
  ticket,
  onClick,
}: TicketOverviewProps) => {
  const firstVersion = useMemo(() => ticket.versions.at(0)!, [ticket.versions])

  const lastVersion = useMemo(() => ticket.versions.at(-1)!, [ticket.versions])

  return (
    <div
      className={classNames(
        'flex flex-col gap-4 rounded-lg shadow-md p-4 bg-white',
        'hover:shadow-xl transition-shadow duration-200 ease-in-out',
      )}
    >
      <div className="flex flex-col gap-2 justify-center">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <section className="inline-flex flex-col gap-2 lg:gap-1.5">
            <span className="text-2xl font-bold leading-5">
              {lastVersion.title}
            </span>

            {showProjectName && projectName && (
              <span className="text-sm text-gray-600 leading-3">
                Project: {projectName}
              </span>
            )}

            {showTicketId && (
              <IdSelector id={ticket.id} label="ID" className="-my-0.5" />
            )}

            <div className="inline-flex flex-col sm:flex-row text-xs text-gray-500 gap-y-4 gap-x-2">
              <span>
                Created at{' '}
                {format(fromUnixTime(firstVersion.createdAt), 'MMMM dd, yyyy')}
              </span>

              <span className="hidden sm:inline-flex">&middot;</span>

              <span>
                Last update:{' '}
                {getFormattedDateDifference(
                  new Date(),
                  fromUnixTime(lastVersion.createdAt),
                )}
              </span>
            </div>
          </section>

          <section className="inline-flex self-start gap-2 text-sm">
            <TagPill
              className="font-bold"
              label="Status"
              value={lastVersion.status}
              color={ticketStatusColors[lastVersion.status]}
            />

            <button
              onClick={() =>
                onClick?.(
                  projectId,
                  ticket.id as Stratego.STS.Utils.UUID,
                  'comments',
                )
              }
              className={classNames(
                'inline-flex items-center rounded p-2 gap-1 bg-gray-500 text-gray-50',
                'hover:shadow-md hover:bg-gray-700 transition duration-200 ease-in-out',
              )}
            >
              <ChatBubbleLeftEllipsisIcon
                className="h-5 w-5"
                aria-hidden="true"
              />

              <span>{ticket.comments.length}</span>
            </button>

            <button
              onClick={() =>
                onClick?.(projectId, ticket.id as Stratego.STS.Utils.UUID)
              }
              className={classNames(
                'inline-flex items-center align-middle rounded p-2 gap-1 bg-blue-600 text-gray-50',
                'hover:shadow-md hover:bg-blue-500 transition duration-200 ease-in-out',
              )}
            >
              See details
            </button>
          </section>
        </div>
      </div>

      <Editor
        namespace={ticket.id}
        editable={false}
        preset={
          lastVersion.description
            ? JSON.parse(lastVersion.description)
            : undefined
        }
      />
    </div>
  )
}

export default TicketOverviewCard
