'use client'

import Spinner from '@stratego-sts/components/misc/spinner'
import { ProjectStatus } from '@stratego-sts/lib/enumerators'
import { fetcher } from '@stratego-sts/lib/fetcher'
import type { TProject } from '@stratego-sts/schemas/project'
import classNames from 'classnames'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import useSWR from 'swr'

const Paginator = dynamic(
  () => import('@stratego-sts/components/misc/paginator')
)

const StatusListSelect = dynamic(
  () => import('@stratego-sts/components/misc/status-list-select')
)

const ProjectOverviewCard = dynamic(
  () => import('@stratego-sts/components/projects/overview-card')
)

const ProjectsPage = () => {
  const searchParams = useSearchParams()

  const status = useMemo(() => searchParams.get('status'), [searchParams])

  const { data: rawProjects = [], isLoading: isFetchingProjects } = useSWR<
    Array<TProject>
  >(`/api/projects`, fetcher)

  const projects = useMemo(
    () =>
      status
        ? rawProjects.filter((project) => project.status === status)
        : rawProjects,
    [rawProjects, status]
  )

  return (
    <div className="flex flex-col flex-grow">
      <header className="bg-white border-b-[1px] border-b-gray-200">
        <div className="flex flex-col gap-4 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <span className="flex flex-col md:flex-row justify-between gap-y-5">
            <span className="flex flex-col lg:flex-row lg:items-center">
              <span className="text-3xl font-bold tracking-tight text-gray-900">
                Projects
              </span>
            </span>

            <div>
              <StatusListSelect statusType={ProjectStatus} />
            </div>
          </span>
        </div>
      </header>

      <main
        className={classNames(
          isFetchingProjects ? 'flex flex-col flex-grow' : 'grid w-full',
          'mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'
        )}
      >
        <Paginator
          wrapperClassName="flex flex-col flex-grow gap-y-5"
          paginationControlPosition="bottom-center"
          paginationClassName="mt-5"
          placeholder={
            <span className="flex flex-col flex-grow justify-items-center justify-center align-middle gap-1">
              {isFetchingProjects ? (
                <Spinner />
              ) : (
                <span>
                  No {status && <strong>{status}</strong>} projects found
                </span>
              )}
            </span>
          }
          items={projects.map((project, key) => (
            <ProjectOverviewCard key={key} project={project} />
          ))}
          itemsPerPage={5}
        />
      </main>
    </div>
  )
}

export default ProjectsPage
