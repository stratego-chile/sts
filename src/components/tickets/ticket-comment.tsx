'use client'

import { AccountRole } from '@/lib/enumerators'
import { fetcher } from '@/lib/fetcher'
import { getFormattedDateDifference } from '@/lib/format'
import type { TTicket } from '@/schemas/ticket'
import { TUserProfile } from '@/schemas/user'
import capitalize from '@stdlib/string/capitalize'
import chroma from 'chroma-js'
import classNames from 'classnames'
import fromUnixTime from 'date-fns/fromUnixTime'
import dynamic from 'next/dynamic'
import { Suspense, useId } from 'react'
import useSWR from 'swr'

const UserIcon = dynamic(() => import('@/components/user/icon'))

const Editor = dynamic(() => import('@/components/misc/text-editor'))

type TicketCommentProps = {
  ticketId: string
  comment: UnpackedArray<TTicket['comments']>
}

const TicketComment = ({ ticketId, comment }: TicketCommentProps) => {
  const commentId = useId()

  const { data: commentAuthor } = useSWR<
    Readonly<
      Extend<
        TUserProfile,
        {
          role: AccountRole
        }
      >
    >
  >(`/api/tickets/${ticketId}/author/${comment.author}`, fetcher)

  return (
    <div
      className={classNames(
        'flex flex-col rounded-lg shadow-md gap-4 p-4 bg-white',
        'hover:shadow-lg transition-shadow duration-200 ease-in-out'
      )}
    >
      <span className="flex flex-row items-center justify-items-start gap-2 text-xs lg:text-sm text-gray-400">
        {commentAuthor && (
          <span className="inline-flex items-center gap-1">
            <span className="hidden lg:inline-flex">
              {commentAuthor.icon && (
                <UserIcon
                  icon={{
                    color:
                      commentAuthor.icon.color ?? chroma('lightgray').hex(),
                    ...commentAuthor.icon,
                  }}
                  userInitialLetter={commentAuthor?.firstName}
                />
              )}
            </span>

            <span>{commentAuthor?.firstName}</span>

            <span>{commentAuthor?.lastName}</span>

            {commentAuthor?.alias && <span>{`(${commentAuthor.alias})`}</span>}
          </span>
        )}

        {commentAuthor && [AccountRole.Admin].includes(commentAuthor.role) && (
          <span className="hidden lg:inline-flex px-1 py-0.5 rounded text-white bg-blue-400">
            {capitalize(commentAuthor.role)}
          </span>
        )}

        <span className="inline-flex">&middot;</span>

        <span className="inline-flex gap-1">
          <span>Commented</span>
          <span>
            {getFormattedDateDifference(
              Date.now(),
              fromUnixTime(comment.createdAt)
            )}
          </span>
        </span>
      </span>

      <Suspense>
        <Editor
          namespace={commentId}
          value={comment.content}
          editable={false}
          theme={{
            root: 'flex w-full border-l-2 border-l-gray-200 !shadow-none',
          }}
        />
      </Suspense>
    </div>
  )
}

export default TicketComment
