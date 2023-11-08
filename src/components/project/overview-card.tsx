import IdSelector from '@/components/misc/id-selector'
import { projectStatusColors } from '@/helpers/default-colors'
import { coloredBoxStyles } from '@/lib/colors'
import { getFormattedDateDifference } from '@/lib/format'
import type { TProject } from '@/schemas/project'
import QuestionMarkCircleIcon from '@heroicons/react/24/outline/QuestionMarkCircleIcon'
import classNames from 'classnames'
import format from 'date-fns/format'
import fromUnixTime from 'date-fns/fromUnixTime'
import dynamic from 'next/dynamic'

const TagPill = dynamic(() => import('@/components/misc/tag-pill'))

type ProjectOverviewProps = {
  project: TProject
  onClick?: (projectId: Stratego.STS.Utils.UUID) => void
}

const ProjectOverviewCard = ({ project, onClick }: ProjectOverviewProps) => {
  return (
    <div
      className={classNames(
        'flex flex-col gap-4 rounded-lg shadow-md p-4 bg-white',
        'hover:shadow-xl transition-shadow duration-200 ease-in-out',
      )}
    >
      <div className="flex flex-col md:flex-row gap-4 md:items-center">
        <div
          className="inline-flex rounded-lg items-center h-fit w-fit px-5 py-3 md:py-3"
          style={coloredBoxStyles(project.icon?.color)}
        >
          <span className="font-mono text-5xl md:text-4xl">
            {project.name.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="flex flex-col gap-2 justify-center w-full">
          <div className="flex flex-col md:flex-row gap-y-4 justify-center md:justify-between">
            <section className="flex flex-col gap-2 lg:gap-1.5">
              <span className="text-2xl font-bold leading-5">
                {project.name}
              </span>

              <IdSelector id={project.id} label="ID" className="-my-0.5" />

              <span className="inline-flex flex-col sm:flex-row text-xs text-gray-500 gap-y-4 gap-x-2">
                <span>
                  Created at{' '}
                  {format(fromUnixTime(project.createdAt), 'MMMM dd, yyyy')}
                </span>

                <span className="hidden sm:inline-flex">&middot;</span>

                <span>
                  Last update:{' '}
                  {getFormattedDateDifference(
                    new Date(),
                    fromUnixTime(project.updatedAt),
                  )}
                </span>
              </span>
            </section>

            <section className="inline-flex items-center gap-2 text-sm">
              <TagPill
                className="font-bold"
                label="Status"
                value={project.status}
                color={projectStatusColors[project.status]}
              />

              <button
                className={classNames(
                  'inline-flex items-center align-middle rounded p-2 gap-1 bg-gray-500 text-gray-50',
                  'hover:shadow-md hover:bg-gray-700 transition duration-200 ease-in-out',
                )}
                onClick={() => onClick?.(project.id as Stratego.STS.Utils.UUID)}
              >
                <QuestionMarkCircleIcon
                  className="inline-flex h-5 w-5"
                  aria-hidden="true"
                />

                <span className="inline-flex">{project.tickets.length}</span>
              </button>

              <button
                className={classNames(
                  'inline-flex items-center align-middle rounded p-2 gap-1 bg-blue-600 text-gray-50',
                  'hover:shadow-md hover:bg-blue-500 transition duration-200 ease-in-out',
                )}
                onClick={() => onClick?.(project.id as Stratego.STS.Utils.UUID)}
              >
                See details
              </button>
            </section>
          </div>
        </div>
      </div>

      {project.description && (
        <div className="flex rounded p-4 ring-1 ring-gray-200 bg-gray-50">
          {project.description}
        </div>
      )}
    </div>
  )
}

export default ProjectOverviewCard
