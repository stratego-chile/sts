'use client'

import Loading from '@/app/my/loading'
import {
  ticketPriorityColors,
  ticketStatusColors,
} from '@/helpers/default-colors'
import { fetcher } from '@/lib/fetcher'
import type { TProject } from '@/schemas/project'
import {
  TicketResponsibleType,
  TicketStatus,
  type TTicket,
} from '@/schemas/ticket'
import type { TEditableUser } from '@/schemas/user'
import ChevronRightIcon from '@heroicons/react/24/outline/ChevronRightIcon'
import secondsToMilliseconds from 'date-fns/secondsToMilliseconds'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Fragment, Suspense, useDeferredValue, useMemo } from 'react'
import useSWR from 'swr'
import type { Merge } from 'type-fest'

const IdSelector = dynamic(() => import('@/components/misc/id-selector'))

const TagPill = dynamic(() => import('@/components/misc/tag-pill'))

const TicketDetails = dynamic(() => import('@/components/ticket/details'))

const ActionMenu = dynamic(() => import('@/components/misc/action-menu'))

type TicketDetailsWrapperProps = {
  mode?: 'admin' | 'client'
}

const TicketDetailsWrapperPage = ({
  mode = 'client',
}: TicketDetailsWrapperProps) => {
  const params = useParams()

  const { data: project } = useSWR<TProject>(
    mode === 'client'
      ? `/api/projects/${params.projectId}`
      : `/api/projects/${params.projectId}?mode=admin`,
    fetcher,
  )

  const { data: ticket } = useSWR<TTicket>(
    mode === 'client'
      ? `/api/tickets/${params.ticketId}`
      : `/api/tickets/${params.ticketId}?mode=admin`,
    fetcher,
    {
      refreshInterval: secondsToMilliseconds(30),
    },
  )

  const lastVersion = useMemo(() => ticket?.versions.at(-1), [ticket])

  const ticketCreatorId = useDeferredValue(
    ticket?.responsibles.find(
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

  const currentUserRoleInTicket = useMemo(
    () => ticket?.responsibles.find(({ id }) => id === user?.id)?.type,
    [ticket, user?.id],
  )

  const isCurrentUserCreator = useMemo(
    () => ticketCreatorId === user?.id,
    [ticketCreatorId, user?.id],
  )

  const isCurrentUserResponsible = useMemo(
    () => currentUserRoleInTicket === TicketResponsibleType.Supporter,
    [currentUserRoleInTicket],
  )

  return (
    <div>
      {project && ticket && lastVersion && (
        <Fragment>
          <header className="lg:sticky lg:top-0 !z-10 bg-white border-b border-b-gray-200">
            <div className="flex flex-col gap-4 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <span className="flex flex-col md:flex-row justify-between gap-y-5">
                <span className="flex flex-col lg:flex-row gap-2 lg:items-center text-3xl font-bold tracking-tight">
                  {Array.of(
                    <Link
                      is="span"
                      href={
                        mode === 'client' ? '/my/projects' : '/admin/projects'
                      }
                      className="hidden lg:inline-flex text-gray-900 hover:text-blue-600 transition duration-200 ease-in-out"
                    >
                      Projects
                    </Link>,
                    <Link
                      is="span"
                      href={
                        mode === 'client'
                          ? `/my/projects/${params.projectId}`
                          : `/admin/projects/${params.projectId}`
                      }
                      className="text-gray-900 hover:text-blue-600 transition duration-200 ease-in-out"
                    >
                      {project?.name}
                    </Link>,
                    <Link
                      is="span"
                      href={
                        mode === 'client'
                          ? `/my/projects/${params.projectId}/tickets`
                          : `/admin/projects/${params.projectId}/tickets`
                      }
                      className="hidden lg:inline-flex text-gray-900 hover:text-blue-600 transition duration-200 ease-in-out"
                    >
                      Tickets
                    </Link>,
                    <span key="3" className="text-gray-900">
                      {lastVersion.title}
                    </span>,
                  )
                    .flatMap((fragment, key, fragments) =>
                      Array.of(
                        fragment,
                        key < fragments.length - 1 ? (
                          <ChevronRightIcon
                            className="h-5 w-5 text-gray-400 hidden lg:inline-block"
                            aria-hidden="true"
                          />
                        ) : null,
                      ),
                    )
                    .map((fragment, key) => (
                      <Fragment key={key}>{fragment}</Fragment>
                    ))}
                </span>

                <span className="inline-flex gap-x-2 text-sm font-bold">
                  <TagPill
                    color={ticketStatusColors[lastVersion.status]}
                    label="Status"
                    value={lastVersion.status}
                  />

                  {lastVersion.priority && (
                    <TagPill
                      color={ticketPriorityColors[lastVersion.priority]}
                      label="Priority"
                      value={lastVersion.priority}
                    />
                  )}

                  {lastVersion.status === TicketStatus.Open &&
                    (isCurrentUserCreator || isCurrentUserResponsible) && (
                      <ActionMenu
                        content={<span>Options</span>}
                        options={[
                          {
                            content: 'Mark ticket as resolved',
                            action: () => void 0,
                            roles: [
                              TicketResponsibleType.Creator,
                              TicketResponsibleType.Supporter,
                            ],
                            allowed: lastVersion.status === TicketStatus.Open,
                          },
                          {
                            content: 'Change priority',
                            action: () => void 0,
                            roles: [TicketResponsibleType.Supporter],
                          },
                          {
                            content: 'Close ticket',
                            action: () => void 0,
                            roles: [
                              TicketResponsibleType.Creator,
                              TicketResponsibleType.Supporter,
                            ],
                          },
                        ].filter(
                          ({ allowed, roles }) =>
                            currentUserRoleInTicket &&
                            roles.includes(currentUserRoleInTicket) &&
                            (typeof allowed === 'boolean' ? allowed : true),
                        )}
                      />
                    )}
                </span>
              </span>

              {ticket && <IdSelector label="Ticket ID" id={ticket.id} />}
            </div>
          </header>

          {project && ticket && (
            <Suspense fallback={<Loading />}>
              <TicketDetails
                projectId={project.id}
                owner={project.ownerId}
                ticket={ticket}
                lastVersion={lastVersion}
              />
            </Suspense>
          )}
        </Fragment>
      )}
    </div>
  )
}

export default TicketDetailsWrapperPage
