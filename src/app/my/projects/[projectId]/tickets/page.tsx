'use client'

import { fetcher } from '@/lib/fetcher'
import type { TProject } from '@/schemas/project'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

const ProjectTickets = dynamic(() => import('@/components/project/ticket-list'))

const ProjectPage = () => {
  const params = useParams()

  const { data: project, isLoading } = useSWR<TProject>(
    `/api/projects/${params.projectId}`,
    fetcher,
  )

  return <ProjectTickets project={project} fetchingData={isLoading} />
}

export default ProjectPage
