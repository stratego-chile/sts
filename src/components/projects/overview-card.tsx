import { TicketIcon } from '@heroicons/react/24/outline'
import {
  coloredBoxStyles,
  getMonoContrast,
  projectStatusColors,
} from '@/lib/colors'
import { getFormattedDateDifference } from '@/lib/format'
import type { TProject } from '@/schemas/project'
import classNames from 'classnames'
import format from 'date-fns/format'
import fromUnixTime from 'date-fns/fromUnixTime'

type ProjectOverviewProps = {
  project: TProject
  onClick?: (projectId: Stratego.STS.Utils.UUID) => void
}

const ProjectOverviewCard: React.FC<ProjectOverviewProps> = ({
  project,
  onClick,
}) => {
  return (
    <div
      className={classNames(
        'flex flex-col gap-4 rounded-lg shadow-md p-4 cursor-pointer bg-white',
        'hover:shadow-xl transition-shadow duration-200 ease-in-out'
      )}
      onClick={() => onClick?.(project.id as Stratego.STS.Utils.UUID)}
    >
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
        <div
          className="inline-flex rounded-lg items-center h-fit w-fit px-5 py-3 lg:py-3"
          style={coloredBoxStyles(project.icon?.color)}
        >
          <span className="font-mono text-5xl lg:text-4xl">
            {project.name.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="flex flex-col gap-2 justify-center w-full">
          <div className="flex flex-col xl:flex-row gap-y-4 justify-center lg:justify-between">
            <span className="inline-flex flex-col gap-4 text-2xl font-bold leading-6 lg:leading-3">
              <span>{project.name}</span>

              <div className="inline-flex flex-col lg:flex-row text-sm text-gray-500 gap-y-4 gap-x-2">
                <span>
                  Created at{' '}
                  {format(fromUnixTime(project.createdAt), 'MMMM dd, yyyy')}
                </span>

                <span className="hidden lg:inline-flex">&middot;</span>

                <span>
                  Last update:{' '}
                  {getFormattedDateDifference(
                    Date.now(),
                    fromUnixTime(project.updatedAt)
                  )}
                </span>
              </div>
            </span>

            <span className="inline items-center space-x-2 text-sm">
              <span
                className="inline-block p-2 rounded capitalize align-middle"
                style={{
                  backgroundColor: projectStatusColors[project.status],
                  color: getMonoContrast(projectStatusColors[project.status]),
                }}
              >
                Status: {project.status}
              </span>

              <button
                className={classNames(
                  'inline-flex items-center align-middle rounded p-2 gap-1 bg-gray-500 text-gray-50',
                  'hover:shadow-md hover:bg-gray-700 transition duration-200 ease-in-out'
                )}
                onClick={() => onClick?.(project.id as Stratego.STS.Utils.UUID)}
              >
                <TicketIcon className="inline-flex h-5 w-5" />

                <span className="inline-flex">{project.tickets.length}</span>
              </button>
            </span>
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
