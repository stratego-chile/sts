import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline'
import { getMonoContrast, ticketStatusColors } from '@stratego-sts/lib/colors'
import { getFormattedDateDifference } from '@stratego-sts/lib/format'
import type { TTicket } from '@stratego-sts/schemas/ticket'
import classNames from 'classnames'
import format from 'date-fns/format'
import fromUnixTime from 'date-fns/fromUnixTime'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import Editor from '../misc/text-editor'

type TicketOverviewProps = {
  projectId: Stratego.STS.Utils.UUID
  projectName?: string
  showProjectName?: boolean
  ticket: TTicket
}

const TicketOverviewCard: React.FC<TicketOverviewProps> = ({
  projectId,
  projectName,
  showProjectName = true,
  ticket,
}) => {
  const router = useRouter()

  const firstVersion = useMemo(() => ticket.versions.at(0)!, [ticket.versions])

  const lastVersion = useMemo(() => ticket.versions.at(-1)!, [ticket.versions])

  return (
    <div
      className={classNames(
        'flex flex-col gap-4 rounded-lg shadow-md bg-gray-50 p-4 cursor-pointer',
        'hover:bg-white hover:shadow-lg transition duration-200 ease-in-out'
      )}
      onClick={() => {
        router.push(`/account/tickets/${projectId}/${ticket.id}`)
      }}
    >
      <div className="flex flex-col gap-2 justify-center">
        <div className="flex flex-col xl:flex-row gap-y-4 justify-center lg:justify-between">
          <span className="flex flex-col gap-4">
            <span className="text-2xl font-bold leading-4">
              {lastVersion.title}
            </span>
            {showProjectName && projectName && (
              <span className="text-sm text-gray-600 leading-3">
                Project: {projectName}
              </span>
            )}
            <div className="inline-flex flex-col lg:flex-row text-xs text-gray-500 gap-y-4 gap-x-2">
              <span>
                Created at{' '}
                {format(fromUnixTime(firstVersion.createdAt), 'MMMM dd, yyyy')}
              </span>
              <span className="hidden lg:inline-flex">&middot;</span>
              <span>
                Last update:{' '}
                {getFormattedDateDifference(
                  Date.now(),
                  fromUnixTime(lastVersion.createdAt)
                )}
              </span>
            </div>
          </span>
          <span className="inline-flex self-start gap-2 text-sm">
            <span
              className="inline-flex items-center p-2 gap-1 rounded capitalize"
              style={{
                backgroundColor: ticketStatusColors[lastVersion.status],
                color: getMonoContrast(ticketStatusColors[lastVersion.status]),
              }}
            >
              <span>Status:</span>
              <span>{lastVersion.status}</span>
            </span>
            <Link
              href={`/account/tickets/${projectId}/${ticket.id}#comments`}
              className={classNames(
                'inline-flex items-center rounded p-2 gap-1 bg-gray-500 text-gray-50',
                'hover:shadow-md hover:bg-gray-700 transition duration-200 ease-in-out'
              )}
            >
              <ChatBubbleLeftEllipsisIcon className="h-5 w-5" />
              <span>{ticket.comments.length}</span>
            </Link>
          </span>
        </div>
      </div>
      <Editor namespace={ticket.id} readOnly preset={lastVersion.description} />
    </div>
  )
}

export default TicketOverviewCard
