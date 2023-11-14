'use client'

import Loading from '@/app/admin/loading'
import Disclaimer from '@/components/misc/disclaimer'
import { maintainerRoles } from '@/helpers/roles'
import { fetcher } from '@/lib/fetcher'
import { ProjectStatus, type TProject } from '@/schemas/project'
import { TUser } from '@/schemas/user'
import classNames from 'classnames'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import useSWR from 'swr'

const Paginator = dynamic(() => import('@/components/misc/paginator'))

const StatusListSelect = dynamic(
  () => import('@/components/misc/status-list-select'),
)

const ProjectOverviewCard = dynamic(
  () => import('@/components/project/overview-card'),
)

type ProjectsListProps = {
  adminMode?: boolean
}

const ProjectsList = ({ adminMode = false }: ProjectsListProps) => {
  const router = useRouter()

  const searchParams = useSearchParams()

  const status = useMemo(() => searchParams.get('status'), [searchParams])

  const { data: rawProjects = [], isLoading } = useSWR<Array<TProject>>(
    `/api/projects`,
    fetcher,
  )

  const { data: user } = useSWR<TUser>('/api/session/user', fetcher)

  const projects = useMemo(
    () =>
      status
        ? rawProjects.filter((project) => project.status === status)
        : rawProjects,
    [rawProjects, status],
  )

  return (
    <div className="flex flex-col flex-grow">
      <header className="bg-white border-b border-b-gray-200">
        <div className="flex flex-col gap-4 mx-auto max-w-7xl p-6 lg:px-8">
          <span className="inline-flex flex-col sm:flex-row justify-between lg:items-center gap-y-5">
            <span className="text-3xl font-bold tracking-tight text-gray-900">
              Projects
            </span>

            <span className="inline-flex flex-wrap gap-2">
              <StatusListSelect statusType={ProjectStatus} />

              {user && maintainerRoles.includes(user.role) && (
                <button className="rounded p-2 bg-gray-800 text-gray-50 text-sm">
                  New Project
                </button>
              )}
            </span>
          </span>
        </div>
      </header>

      <main
        className={classNames(
          isLoading ? 'flex flex-col flex-grow' : 'grid w-full',
          'mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8',
        )}
      >
        <Paginator
          wrapperClassName="flex flex-col flex-grow gap-y-5"
          paginationControlPosition="bottom-center"
          paginationClassName="mt-5"
          placeholder={
            <span className="flex flex-col flex-grow justify-items-center justify-center align-middle gap-1">
              {isLoading ? (
                <Loading />
              ) : (
                <Disclaimer>
                  <span>
                    No {status && <strong>{status}</strong>} projects found
                  </span>
                </Disclaimer>
              )}
            </span>
          }
          items={projects.map((project, key) => (
            <ProjectOverviewCard
              key={key}
              project={project}
              onClick={(projectId) =>
                router.push(
                  adminMode
                    ? `/admin/projects/${projectId}/tickets`
                    : `/my/projects/${projectId}/tickets`,
                )
              }
            />
          ))}
          itemsPerPage={5}
        />
      </main>
    </div>
  )
}

export default ProjectsList
