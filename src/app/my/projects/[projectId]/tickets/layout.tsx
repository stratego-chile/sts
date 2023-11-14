import { getPageTitle } from '@/lib/format'
import { Projects } from '@/models/projects'
import type { Metadata } from 'next'
import { Fragment } from 'react'

const getProjectName = async (projectId: Stratego.STS.Utils.UUID) => {
  const { name = '' } = (await Projects.getProjectById(projectId)) ?? {}

  return name
}

export const generateMetadata = async ({
  params,
}: {
  params: { projectId: Stratego.STS.Utils.UUID }
}): Promise<Metadata> => ({
  title: getPageTitle(
    `Project "${await getProjectName(params.projectId)}" Tickets`,
  ),
})

const ProjectTicketsLayout = async ({
  children,
}: React.PropsWithChildren<WithoutProps>) => {
  return <Fragment>{children}</Fragment>
}

export default ProjectTicketsLayout
