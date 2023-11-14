import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const ProjectsList = dynamic(() => import('@/components/project/list'))

const ProjectsPage = () => {
  return (
    <Suspense>
      <ProjectsList adminMode />
    </Suspense>
  )
}

export default ProjectsPage
