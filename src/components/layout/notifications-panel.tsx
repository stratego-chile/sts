'use client'

import { fetcher } from '@/lib/fetcher'
import { ContentRefPrefix, type ContentRef, type TEvent } from '@/schemas/event'
import EnvelopeIcon from '@heroicons/react/24/outline/EnvelopeIcon'
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon'
import capitalize from '@stdlib/string/capitalize'
import classNames from 'classnames'
import fromUnixTime from 'date-fns/fromUnixTime'
import { Fragment, useEffect, useMemo, useRef } from 'react'
import useKeyPressEvent from 'react-use/lib/useKeyPressEvent'
import useSWR from 'swr'

type NotificationsPanelProps = {
  open?: boolean
  onClose?: () => void
  onNotificationsStateUpdate?: (notifications: number) => void
}

function parseMessageContext(ref: ContentRef) {
  const [contentType, content] = ref.split('::') as [ContentRefPrefix, string]

  switch (contentType) {
    case ContentRefPrefix.Key:
      return capitalize(content)
    case ContentRefPrefix.Blob:
      return content
    case ContentRefPrefix.Raw:
      return content
    default:
      throw new TypeError('Malformed message format', {
        cause: new Error(
          `Unknown content type: ${ref}. Expected one of: ${Object.values(
            ContentRefPrefix,
          ).join(', ')}.`,
        ),
      })
  }
}

const NotificationsPanel = ({
  open,
  onClose,
  onNotificationsStateUpdate,
}: NotificationsPanelProps) => {
  const overlayRef = useRef<HTMLDivElement>(null)

  const { data } = useSWR<{ notifications: Array<TEvent> }>(
    '/api/session/user/notifications',
    fetcher,
  )

  const notifications = useMemo(() => data?.notifications ?? [], [data])

  useEffect(() => {
    onNotificationsStateUpdate?.(notifications.length)
  }, [notifications, onNotificationsStateUpdate])

  useEffect(() => {
    if (open) window.document.body.style.overflow = 'hidden'
    else window.document.body.style.overflow = 'auto'
  }, [open])

  useKeyPressEvent('Escape', () => onClose?.())

  useEffect(() => {
    const handleOverlayClick = (event: MouseEvent) => {
      if (event.target === overlayRef.current) onClose?.()
    }

    window.addEventListener('click', handleOverlayClick)

    return () => window.removeEventListener('click', handleOverlayClick)
  }, [onClose, overlayRef])

  return (
    <Fragment>
      <div
        ref={overlayRef}
        className={classNames(
          'fixed min-h-screen min-w-full top-0 z-[89] bg-gray-900 bg-opacity-25 backdrop-blur-lg',
          'transition-all',
          open && 'opacity-100 visible',
          !open && 'opacity-0 invisible',
        )}
      />

      <div
        id="notifications-panel"
        className={classNames(
          'fixed top-0 right-0 z-[99] bg-white shadow-lg border-l border-gray-100',
          'w-screen lg:max-w-sm h-screen py-6 flex flex-col overflow-y-hidden transition-transform',
          !open && 'translate-x-full',
        )}
        tabIndex={-1}
      >
        <div className="flex items-center justify-between px-4">
          <h5 className="inline-flex text-base font-semibold text-gray-600 gap-2">
            <span>Notifications</span>

            <span className="text-gray-400">
              {notifications.length > 0 && `(${notifications.length})`}
            </span>
          </h5>

          <button
            type="button"
            role="button"
            onClick={() => onClose?.()}
            className="inline-flex items-center p-1 rounded text-gray-400 hover:bg-gray-200 hover:text-gray-900"
          >
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />

            <span className="sr-only">Close panel</span>
          </button>
        </div>

        <div
          className={classNames(
            'flex flex-col overflow-y-scroll',
            notifications.length === 0 && 'flex-grow',
          )}
        >
          <div
            className={classNames(
              'flex flex-col',
              notifications.length === 0 && 'flex-grow items-center',
            )}
          >
            {notifications.length === 0 ? (
              <section className="inline-flex flex-grow items-center my-4 text-sm text-gray-600">
                <span className="inline-flex flex-col items-center gap-2">
                  No pending notifications
                </span>
              </section>
            ) : (
              <section className="flex flex-col gap-3 p-4">
                {notifications.map((notification, key) => (
                  <div
                    className="flex flex-col rounded overflow-hidden"
                    key={key}
                  >
                    <span className="inline-flex items-center justify-between px-2 py-1 bg-gray-200 text-sm">
                      <EnvelopeIcon className="h-5 w-5" />

                      <span>
                        {fromUnixTime(notification.createdAt).toLocaleString()}
                      </span>
                    </span>

                    <span className="inline-flex p-2 bg-gray-100 text-xs">
                      {parseMessageContext(notification.contentRef)}
                    </span>
                  </div>
                ))}
              </section>
            )}
          </div>
        </div>
      </div>
    </Fragment>
  )
}

export default NotificationsPanel
