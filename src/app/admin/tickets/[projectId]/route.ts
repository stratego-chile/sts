import { redirect } from 'next/navigation'

export const GET = (
  _request: Request,
  {
    params,
  }: {
    params: {
      projectId: Stratego.STS.Utils.UUID
    }
  },
) => redirect(`/admin/projects/${params.projectId}/tickets`)
